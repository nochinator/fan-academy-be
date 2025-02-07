import { Server } from "colyseus";
import { createServer } from "http";
import { GameRoom } from "./gameRoom";
import { Lobby } from "./lobby";

const httpServer = createServer();
const gameServer = new Server({ server: httpServer });

// Define lobby room for real time game updates
gameServer.define("lobby", Lobby);

// Define a room for the game
gameServer.define("game_room", GameRoom);

export default gameServer;
