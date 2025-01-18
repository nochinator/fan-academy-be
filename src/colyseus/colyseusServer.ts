import { Server } from "colyseus";
import { createServer } from "http";
import { GameRoom } from "./gameRoom";

const httpServer = createServer();
const gameServer = new Server({ server: httpServer });

// Define a room for the game
gameServer.define("game_room", GameRoom);

export default gameServer;
