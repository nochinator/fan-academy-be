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

  onInit(_options: any) {
    this.maxClients = 2; // FIXME: I can't get the room limit to work
  }

  async onCreate(options: {
    userId: string,
    roomId?: string,
    faction?: IFaction
    boardState?: ITile[]
  }): Promise<void> {
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
     *    -checks if the user is one of the two players, then grants access and shows the state // REVIEW:
     */
    const faction = options.faction;
    const roomId = options.roomId;
    const boardState = options.boardState;
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

        gameLookingForPlayers.status = EGameStatus.PLAYING;

        // Randomly select the starting player
        const playerIds = gameLookingForPlayers.players.map((player: IPlayerData) => player.userData._id);
        gameLookingForPlayers.activePlayer = Math.random() > 0.5 ? playerIds[0] : playerIds[1];

        await gameLookingForPlayers.save();
        // TODO: The return of this function should trigger the beginning of a game
        console.log('Matchmaking found an open game');
        this.roomId = gameLookingForPlayers._id.toString();

        // Send a message to update the game list
        this.presence.publish("gameUpdatedPresence", [options.userId, gameLookingForPlayers.players[0].userData._id.toString()]);
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

        this.presence.publish("gameUpdatedPresence", [options.userId]);
      }
    }

    console.log("Game room created! ID -> ", this.roomId);

    this.onMessage("turnSent", async (client: Client, message: {
      _id: Types.ObjectId,
      newTurn: IGameState[],
      newActivePlayer: Types.ObjectId
    }) => {
      console.log(`Turn sent by client ${client.sessionId}:`, message);
      // TODO: data validation

      // Update game document in the db with the new turn
      // This update is only for turns. For an end of game update we will use a different message with extra fields like victory condition // TODO:
      console.log('UPDATE message -> ', message);
      const updatedGame = await Game.findByIdAndUpdate(message._id, {
        $push: { gameState: message.newTurn },
        currentState: [],
        activePlayer: message.newActivePlayer
      }, { new: true });
      console.log('UPDATED GAME -> ', updatedGame);
      if (!updatedGame) throw new CustomError(24);

      // Broadcast movement to all connected clients
      this.broadcast("turnPlayed", {
        // roomId: message._id.toString(), // REVIEW: in some cases, class roomId is undefined
        roomId: this.roomId,
        game: updatedGame, // TODO: unpack the moves on the FE
        newActivePlayer: message.newActivePlayer
      }, { except: client }); // broadcast to opponent only // REVIEW:

      // Retrieve user ids and publish update the users' game lists
      const userIds = updatedGame.players.map((player: IPlayerData) =>  player.userData._id.toString());
      this.presence.publish("gameUpdatedPresence", userIds); // TODO: make sure that we sent the whole game // REVIEW: still needed?
    });
  }

  // Handle client joining
  async onJoin(client: Client, options: {
    roomId: string,
    userId: string
  }, _auth: any): Promise<void> {
    /**
     * check if the user is one of the two players, grant access and send newest state in the db. once connected, the 'sendTurn' or equivalent function should also broadcast the moves after the turn is sent
     */
    console.log('ONJOIN', this.roomId, options.roomId);
    // console.log('onjoin_options', options);

    const roomId = this.roomId ? this.roomId : options.roomId;
    if (!roomId) throw new CustomError(24);

    const game = await GameService.getColyseusRoom(roomId, options.userId);
    if (!game) console.log('No game found error here2');

    console.log(`Client ${client.sessionId} joined the room`);
    // REVIEW: we don't need to send anything in this case, the FE can display the last game state from the db. Since it is connected it will get any new updates
  }

  // Handle client leaving
  onLeave(client: Client, _consented: boolean): void {
    console.log(`Client ${client.sessionId} left the room`);
    if (this.clients.length === 0) {
      console.log('Removing room due to inactivity');
      this.disconnect(); }
  }

  // Handle room disposal
  onDispose(): void {
    console.log("Room disposed");
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
}
