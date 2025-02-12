import { Room, Client } from "colyseus";
import { IncomingMessage } from "http";
import { verifySession } from "../middleware/socketSessions";
import GameService from "../services/gameService";
import { Types } from "mongoose";
import { EGameStatus } from "../enums/game.enums";
import { TurnAction, User } from "../interfaces/gameInterface";
import Game from "../models/gameModel";
import { CustomError } from "../classes/customError";

export class GameRoom extends Room {
  userId: Types.ObjectId;

  onInit(_options: any) {
    this.maxClients = 2;
  }
  async onCreate(options: {
    roomId?: string,
    faction?: string,
    userId: string
  }): Promise<void> {
    /**
     * On create can be:
     * -looking for a game.
     *    -checks for already open rooms
     *      -if no room found:
     *        -creates the room for the first time (no second player, dispose inmediatly), also no roomId uuid provided from the FE
     *        -create the room, add player1 data, set to searching
     *
     *      -if room found, add player2 data, set room to full // FIXME: I can't get the room limit to work
     *
     *      -update the game list
     * -re-creating a room: provides the roomId
     *    -check if the user is one of the two players, grant access and show the state // REVIEW:
     */
    const factionName = options.faction;
    const roomId = options.roomId;
    console.log('ON CREATE ROOM ID AND FACTION NAME', roomId, factionName);
    this.userId = new Types.ObjectId(options.userId);

    /**
     *
     * CREATING A ROOM FOR A GAME ALREADY IN PLAY
     *
     */
    if (roomId) {
      // get the game and check if the user is one of the players
      // TODO: should also check which player?
      const game = await GameService.getColyseusRoom(roomId, options.userId);
      if (!game) console.log('No game found error here1');

      this.roomId = roomId; // FIXME:
    }

    /**
     *
     * CREATING A ROOM FOR A NEW GAME
     *
     */
    if(!roomId && factionName) {
      // Check for games already looking for players
      const gameLookingForPlayers = await GameService.matchmaking(options.userId);

      if (gameLookingForPlayers) {
        // Add player to the game and remove SEARCHING status
        gameLookingForPlayers.players.push({
          userData: this.userId,
          faction: { factionName }
        });
        gameLookingForPlayers.status = EGameStatus.PLAYING;

        // Randomly select the first player
        const playerIds = gameLookingForPlayers.players.map((player: User) => player.userData);
        gameLookingForPlayers.activePlayer = Math.random() > 0.5 ? playerIds[0] : playerIds[1];

        await gameLookingForPlayers.save();
        // TODO: The return of this function should trigger the beginning of a game
        console.log('Matchmaking found an open game');
        this.roomId = gameLookingForPlayers._id.toString();

        this.presence.publish("gameUpdatedPresence", [options.userId, gameLookingForPlayers.players[0].userData._id.toString()]);
      }

      // If there are no games looking for players, create one
      if(!gameLookingForPlayers) {
        const newGame = await GameService.createGame({
          userId: options.userId,
          factionName
        });
        console.log('NEWGAME', newGame);

        if (newGame) this.roomId = newGame._id.toString();

        this.presence.publish("gameUpdatedPresence", [options.userId]);
      }
    }

    // this.setState({}); // REVIEW: ?

    console.log("Game room created! ID -> ", this.roomId);

    this.onMessage("turnSent", async (client, message: {
      _id: Types.ObjectId,
      newTurn: TurnAction[],
      newActivePlayer: Types.ObjectId // REVIEW:
    }) => {
      console.log(`Turn sent by client ${client.sessionId}:`, message);
      // TODO: data validation for correct message

      // Update game document in the db with the new turn
      console.log('UPDATE message -> ', message);

      const updatedGame = await Game.findByIdAndUpdate(message._id, {
        $push: { gameState: message.newTurn },
        activePlayer: message.newActivePlayer
      }); // This update is only for turns. For an end of game update we will use a different message with extra fields like victory condition // TODO:
      console.log('UPDATED GAME -> ', updatedGame);
      if (!updatedGame) throw new CustomError(24);

      // Broadcast movement to all connected clients
      this.broadcast("turnPlayed", {
        sessionId: client.sessionId,
        game: updatedGame // TODO: unpack the moves on the FE
      });

      // Retrieve user ids and publish update the users' game lists
      const userIds = updatedGame.players.map((player: User) =>  player.userData.toString());
      this.presence.publish("gameUpdatedPresence", userIds); // TODO: make sure that we sent the whole game
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
  async onAuth(client: Client, _options: any, req: IncomingMessage): Promise<boolean>  {
    const session =  await verifySession(req);

    if (session) {
      console.log(`User authenticated`);
      return true; // Allow access to the room
    }

    console.log('Authentication failed');
    return false; // Deny access
  }
}
