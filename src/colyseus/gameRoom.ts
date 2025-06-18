import { AuthContext, Client, Room } from "@colyseus/core";
import { Types } from "mongoose";
import { CustomError } from "../classes/customError";
import { EFaction, EGameStatus } from "../enums/game.enums";
import { IPlayerData, ITurnMessage } from "../interfaces/gameInterface";
import { verifySession } from "../middleware/socketSessions";
import Game from "../models/gameModel";
import GameService from "../services/gameService";

export class GameRoom extends Room {
  userId: Types.ObjectId;
  connectedClients: Set<string> = new Set();

  onInit(_options: any) {
    this.maxClients = 2; // FIXME: I can't get the room limit to work
  }

  async onCreate(options: {
    userId: string,
    faction: EFaction
    roomId?: string,
    opponentId?: string
    // boardState?: ITile[]
  }): Promise<void> {
    this.autoDispose = true;
    /**
     * onCreate can be called when:
     * -looking for a game.
     *    -checks for already opened rooms
     *      -if no room is found:
     *        -creates the room for the first time (no second player, room is disposed of immediatly), also no roomId (uuid) provided by the FE
     *        -creates the room, adds player1 data, sets the room status to 'searching'
     *
     *      -if a room is found, adds player2 data, sets room status to 'playing'
     *
     *      -update the game list
     *
     * -re-creating a room: the options parameter provides the roomId
     *    -checks if the user is one of the two players, then grants access and sends the state
     */
    const { faction, roomId, opponentId } = options;
    console.log('ON CREATE ROOM - ID AND FACTION NAME', roomId, faction);
    this.userId = new Types.ObjectId(options.userId);

    /**
     *
     * CREATING A ROOM FOR A GAME ALREADY IN PLAY
     *
     */
    if (roomId) {
      // get the game and check if the user is one of the players
      const game = await GameService.getColyseusRoom(roomId, options.userId);
      if (!game) console.log('Player not found in players array');

      console.log('CREATING A ROOM FOR A GAME ALREADY IN PLAY');

      this.roomId = roomId;
    }

    /**
     *
     * CREATING A ROOM FOR A NEW GAME
     *
     */
    if(!roomId) {
      // Check for games already looking for players
      const gameLookingForPlayers = await GameService.matchmaking(options.userId);

      console.log('CREATING A ROOM FOR A NEW GAME');

      if (gameLookingForPlayers) {
        console.log('Matchmaking found an open game');

        const updatedGame = await GameService.addPlayerTwo(gameLookingForPlayers, faction, this.userId);
        if (!updatedGame) throw new CustomError(24);

        this.roomId = updatedGame._id.toString();

        // Send a message to update the game list
        this.presence.publish("newGamePresence", {
          game: updatedGame,
          userIds: [options.userId, updatedGame.players[0].userData._id.toString()]
        });
      }

      // If there are no games looking for players, create one
      if(!gameLookingForPlayers) {
        const newGame = await GameService.createGame({
          userId: options.userId,
          faction,
          opponentId
        });
        console.log('NEWGAME', newGame);

        if (newGame) this.roomId = newGame._id.toString();

        // Send a message to update the game list
        this.presence.publish("newGamePresence", {
          game: newGame,
          userIds: [options.userId]
        });
      }
    }

    console.log("Game room created! ID -> ", this.roomId);

    this.onMessage("turnSent", async (client: Client, message: ITurnMessage) => {
      console.log(`Turn sent by client ${(client as any).userId}`);
      // TODO: data validation

      if (message.gameOver) {
        console.log('Game over!');
        await this.handleGameOver(message);
      } else {
        await this.handleTurn(message);
      }
    });
  }

  async handleGameOver(message: ITurnMessage): Promise<void>{
    const finishedAt = new Date();
    const { winCondition, winner } = message.gameOver!;

    const updatedGame = await Game.findByIdAndUpdate(message._id, {
      previousTurn: message.currentTurn,
      turnNumber: message.turnNumber,
      gameOver: message.gameOver,
      status: EGameStatus.FINISHED,
      lastPlayedAt: finishedAt,
      finishedAt
    }, { new: true }).populate('players.userData', "username picture");

    if (!updatedGame) throw new CustomError(24);

    // Retrieve user ids and publish update the users' game lists
    const userIds = updatedGame.players.map((player: IPlayerData) =>  player.userData._id.toString());
    this.presence.publish("gameOverPresence", {
      gameId: message._id,
      userIds
    });

    // Broadcast movement to all connected clients
    this.broadcast("lastTurnPlayed", {
      roomId: this.roomId,
      previousTurn: message.currentTurn,
      turnNumber: message.turnNumber,
      finishedAt,
      winCondition,
      winner,
      userIds
    });
  }

  async handleTurn(message: ITurnMessage): Promise<void> {
    const lastPlayedAt = new Date();
    const updatedGame = await Game.findByIdAndUpdate(message._id, {
      previousTurn: message.currentTurn,
      turnNumber: message.turnNumber,
      activePlayer: message.newActivePlayer,
      lastPlayedAt
    }, { new: true }).populate('players.userData', "username picture");

    if (!updatedGame) throw new CustomError(24);

    // Retrieve user ids and publish update the users' game lists
    const userIds = updatedGame.players.map((player: IPlayerData) =>  player.userData._id.toString());
    this.presence.publish("gameUpdatedPresence", {
      gameId: message._id,
      previousTurn: message.currentTurn,
      turnNumber: message.turnNumber,
      newActivePlayer: message.newActivePlayer.toString(),
      lastPlayedAt,
      userIds
    });

    // Broadcast movement to all connected clients
    this.broadcast("turnPlayed", {
      roomId: this.roomId,
      previousTurn: message.currentTurn,
      turnNumber: message.turnNumber,
      newActivePlayer: message.newActivePlayer,
      lastPlayedAt
    });
  }

  // Handle client joining
  async onJoin(client: Client, options: {
    roomId: string,
    userId: string
  }, _auth: any): Promise<void> {
    (client as any).userId = options.userId; // TypeScript workaround
    this.connectedClients.add((client as any).userId);

    console.log(`[Game] Client joined room: ${client.sessionId} - ${(client as any).userId} - ${this.roomId}`);
    this.logConnectedClients();
  }

  async requestJoin(options: any, _client: Client): Promise<boolean> {
    const { roomId, userId } = options;

    if (!roomId || !userId) {
      console.warn("Missing roomId or userId in join request.");
      return false;
    }

    try {
    // Verify the game exists and the user is a participant
      const game = await GameService.getColyseusRoom(roomId, userId);

      if (!game) {
        console.warn(`No matching game found for roomId=${roomId} and userId=${userId}`);
        return false;
      }

      const isPlayer = game.players.some(p => p.userData.toString() === userId);

      if (!isPlayer) {
        console.warn(`User ${userId} is not a player in game ${roomId}`);
        return false;
      }

      // Optional: Reject if room is already full
      if (this.clients.length >= this.maxClients) {
        console.warn(`Room ${roomId} is full.`);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in requestJoin:", err);
      return false;
    }
  }

  // Handle client leaving
  onLeave(client: Client, _consented: boolean): void {
    this.connectedClients.delete((client as any).userId);
    console.log(`[Game] Client left room: ${client.sessionId} ${(client as any).userId}`);
    this.logConnectedClients();
  }

  // Handle room disposal
  onDispose(): void {
    console.log("Room disposed", this.roomId);
  }

  // Room auth
  async onAuth(client: Client, _options: any, authContext: AuthContext): Promise<boolean>  {
    const session =  await verifySession(authContext);

    if (session) {
      console.log(`User authenticated`);
      return true; // Allow access to the room
    }

    console.log('Authentication failed');
    return false; // Deny access
  }

  logConnectedClients(): void {
    console.log(`[Game] Connected clients: ${Array.from(this.connectedClients).join(", ")}`);
  }
}
