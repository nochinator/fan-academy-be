import { Server } from "colyseus";
import { createServer } from "http";
import { GameRoom } from "./gameRoom";
import { Lobby } from "./lobby";
import { WebSocketTransport } from "@colyseus/ws-transport";

const httpServer = createServer();
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
    maxPayload: 1024 * 1024 * 2
  })
});

// Define lobby room for real time game updates
gameServer.define("lobby", Lobby);

// Define a room for the game
gameServer.define("game_room", GameRoom);

export default gameServer;
