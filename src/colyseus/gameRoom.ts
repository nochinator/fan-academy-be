import GameService from "../services/gameService";
import { Types } from "mongoose";
import { EGameStatus } from "../enums/game.enums";
import { IPlayerData, IFaction, IGameState, ITile } from "../interfaces/gameInterface";
import Game from "../models/gameModel";
import { CustomError } from "../classes/customError";
import { AuthContext, Client, Room } from "@colyseus/core";
import { verifySession } from "../middleware/socketSessions";

export class GameRoom extends Room {
  userId: Types.ObjectId;
  connectedClients: Set<string> = new Set();

  onInit(_options: any) {
    this.maxClients = 2; // FIXME: I can't get the room limit to work
  }

  async onCreate(options: {
    userId: string,
    roomId?: string,
    faction?: IFaction
    boardState?: ITile[]
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
    const { faction, roomId, boardState } = options;
    console.log('ON CREATE ROOM ID AND FACTION NAME', roomId, faction?.factionName);
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
    if(!roomId && faction && boardState) {
      // Check for games already looking for players
      const gameLookingForPlayers = await GameService.matchmaking(options.userId);

      console.log('CREATING A ROOM FOR A NEW GAME');

      if (gameLookingForPlayers) {
        // Add player to the players array and game state, create a board (tiles and crystals), update units to belong to player 2, set the current state and remove SEARCHING status
        gameLookingForPlayers.players.push({
          userData: this.userId,
          faction: faction.factionName
        });

        faction.unitsInDeck.forEach(unit => unit.belongsTo = 2);
        faction.unitsInHand.forEach(unit => unit.belongsTo = 2);

        gameLookingForPlayers.gameState[0][0].player2 = {
          playerId: this.userId,
          factionData: faction
        };

        // Map and hands setup as previous turn. Needed to start the game
        gameLookingForPlayers.previousTurn = gameLookingForPlayers.gameState[0];

        gameLookingForPlayers.status = EGameStatus.PLAYING;

        // Randomly select the starting player
        const playerIds = gameLookingForPlayers.players.map((player: IPlayerData) => player.userData._id);
        gameLookingForPlayers.activePlayer = Math.random() > 0.5 ? playerIds[0] : playerIds[1];

        await gameLookingForPlayers.save();
        console.log('Check if game is populated', gameLookingForPlayers.players[1].userData);
        const game = await gameLookingForPlayers.populate('players.userData', "username picture");

        console.log('Matchmaking found an open game');
        this.roomId = gameLookingForPlayers._id.toString();

        // Send a message to update the game list
        this.presence.publish("newGamePresence", {
          game,
          userIds: [options.userId, game.players[0].userData._id.toString()]
        });
      }

      // If there are no games looking for players, create one
      if(!gameLookingForPlayers) {
        const newGame = await GameService.createGame({
          userId: options.userId,
          faction,
          boardState
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

    this.onMessage("turnSent", async (client: Client, message: {
      _id: Types.ObjectId,
      turn: IGameState[],
      newActivePlayer: Types.ObjectId
    }) => {
      console.log(`Turn sent by client ${client.sessionId}:`, message);
      // TODO: data validation

      // Update game document in the db with the new turn
      // TODO: This update is only for turns. For an end of game update we will use a different message with extra fields like victory condition
      console.log('UPDATE message -> ', message);

      const updatedGame = await Game.findByIdAndUpdate(message._id, {
        $push: { gameState: message.turn },
        previousTurn: message.turn,
        currentState: [],
        activePlayer: message.newActivePlayer
      }, { new: true }).populate('players.userData', "username picture");

      // console.log('UPDATED GAME -> ', updatedGame);

      if (!updatedGame) throw new CustomError(24);

      // Retrieve user ids and publish update the users' game lists
      const userIds = updatedGame.players.map((player: IPlayerData) =>  player.userData._id.toString());
      this.presence.publish("gameUpdatedPresence", {
        gameId: message._id,
        previousTurn: message.turn,
        newActivePlayer: message.newActivePlayer.toString(),
        userIds
      });

      // Broadcast movement to all connected clients
      this.broadcast("turnPlayed", {
        // roomId: message._id.toString(), // REVIEW: in some cases, class roomId is undefined
        roomId: this.roomId,
        previousTurn: message.turn, // Sending only the latest turn played instead of the whole game
        newActivePlayer: message.newActivePlayer
      });
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

  logConnectedClients() {
    console.log(`[Game] Connected clients: ${Array.from(this.connectedClients).join(", ")}`);
  }
}
