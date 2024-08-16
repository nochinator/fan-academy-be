import mongoose from "mongoose";
import IGame from "../interfaces/gameInterface";

const winnerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

const playerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  faction: {
    type: String, // EFaction
    required: true
  }
});

const gameSchema = new mongoose.Schema({
  player1: playerSchema,
  player2: playerSchema,
  winCondition: {
    type: String, // EWinConditions
    required: false
  },
  winner: {
    type: winnerSchema,
    required: false
  }
});

const Game = mongoose.model<IGame>('Game', gameSchema);

export default Game;