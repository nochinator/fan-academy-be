import { Room, Client } from "colyseus";

export class GameRoom extends Room {
  // Define room options
  onCreate(options: any): void {
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
  onJoin(client: Client, _options: any): void {
    console.log(`Client ${client.sessionId} joined the room`);
  }

  // Handle client leaving
  onLeave(client: Client, _consented: boolean): void {
    console.log(`Client ${client.sessionId} left the room`);
  }

  // Handle room disposal
  onDispose(): void {
    console.log("Room disposed");
  }
}
