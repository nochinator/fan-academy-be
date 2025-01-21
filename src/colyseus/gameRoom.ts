import { Room, Client } from "colyseus";
import { IncomingMessage } from "http";
import { verifySession } from "../middleware/socketSessions";

export class GameRoom extends Room {
  // Define room options
  onCreate(options: any): void {
    this.maxClients = 2; // number of players
    this.autoDispose = false; // keeps the room alive even if both players leave

    console.log("Game room created!", options);

    this.onMessage("turn", (client, message) => {
      console.log(`Turn sent by client ${client.sessionId}:`, message);

      // Broadcast movement to all connected clients
      this.broadcast("turnPlayed", {
        sessionId: client.sessionId,
        turnMoves: message.turnMoves
      });
    });
  }

  // Handle client joining
  onJoin(client: Client, _options: any, _auth: any): void {
    console.log(`Client ${client.sessionId} joined the room`);
  }

  // Handle client leaving
  onLeave(client: Client, _consented: boolean): void {
    console.log(`Client ${client.sessionId} left the room`);
    if (this.clients.length === 0) { setTimeout(()=> {
      /** TODO:
       * I don't need to pause, since each turn is saved into the db, and I can set the room id, I can save both to a rooms collection, alongside the user ids.
       * Then destroy the room if there are no players online, and recreate it with the saved state once someone joins
       * For the game list on the main menu, I use the room list
       * I just need the game schema
       */
      console.log('Removing room due to inactivity');
      this.disconnect();}, 259200000); }
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
