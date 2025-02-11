import { Room, Client } from "colyseus";
import { IncomingMessage } from "http";
import { verifySession } from "../middleware/socketSessions";
import GameService from "../services/gameService";
import { Types } from "mongoose";
import { EGameStatus } from "../enums/game.enums";

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
     *      -if not, creates the room for the first time (no second player, dispose inmediatly), also no uuid provided from the FE
     *      -create the room, add player1 data, set to searching
     *
     *      -if room, add player2 data, set room to full
     *
     *      -update the game list
     * -re-creating a room: provides the roomid
     *    -check if the user is one of the two players, grant access and show the state
     */
    const factionName = options.faction;
    const roomId = options.roomId;
    console.log('ON CREATE ROOM ID', roomId);
    this.userId = new Types.ObjectId(options.userId);

    if (roomId) {
      // RoomId provided means creating a room for a game already in play
      // get the game and check if the user is one of the players
      // TODO: should also check which player?
      const game = await GameService.getColyseusRoom(roomId, options.userId);
      if (!game) console.log('No game found error here1');

      // TODO: send state and show game in the fe
      this.roomId = roomId;
    }

    if(!roomId && factionName) {
      // No roomId means user is looking to start a game
      // Check for games already looking for players
      const gameLookingForPlayers = await GameService.matchmaking(options.userId);

      if (gameLookingForPlayers) {
        // Add player to the game and remove SEARCHING status
        gameLookingForPlayers.players.push({
          userData: this.userId,
          faction: { factionName }
        });

        gameLookingForPlayers.status = EGameStatus.PLAYING;

        await gameLookingForPlayers.save();
        // TODO: get the state from the game and send it to the user?
        // the return of this function should trigger and gamelist update
        console.log(JSON.stringify(gameLookingForPlayers));
        this.roomId = gameLookingForPlayers._id.toString();
        console.log('THIS ROOM', this.roomId);
      }

      // If there are no open games, create one
      if(!gameLookingForPlayers) {
        const newGame = await GameService.createGame({
          userId: options.userId,
          factionName
        });
        console.log('NEWGAME', newGame);
        /**
         * here we should return something that triggers the gamelist update
         * should also not join the room, but disconnect inmediately ?
         */
        if (newGame) this.roomId = newGame._id.toString();
      }
    }

    // this.setState({}); // REVIEW: ?
    console.log("Game room created! ID -> ", this.roomId);

    // FIXME: do we need a message on game created

    this.onMessage("turnSent", (client, message: any) => {
      console.log(`Turn sent by client ${client.sessionId}:`, message);

      // Broadcast movement to all connected clients
      this.broadcast("turnPlayed", {
        sessionId: client.sessionId,
        turnMoves: message // TODO: unpack the moves on the FE
      });

      this.presence.publish("turnPlayedPresence", message); // TODO: make sure that we sent the whole game
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
    const roomId = this.roomId ? this.roomId : options.roomId; // REVIEW:
    const game = await GameService.getColyseusRoom(roomId, options.userId);
    if (!game) console.log('No game found error here2');

    // TODO: send state and show game in the fe
    console.log(`Client ${client.sessionId} joined the room`);
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
