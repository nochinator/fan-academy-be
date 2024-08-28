import { model, Schema } from "mongoose";
import IGame from "../interfaces/gameInterface";

const winnerSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

const playerSchema = new Schema({
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

const gameUnitSchema = new Schema({
  unitId: Number,
  isPlayerOne: Boolean
});

const boardStateSchema = new Schema({
  // TODO: find a way to add the board state
  playerOneDeck: [gameUnitSchema],
  playerOneDiscard: [gameUnitSchema],
  playerTwoDeck: [gameUnitSchema],
  playerTwoDiscard: [gameUnitSchema]
});

const gameActionSchema = new Schema({});

const gameTurnSchema = new Schema({
  turNumber: Number,
  boardState: boardStateSchema,
  actions: [gameActionSchema]
});

const gameSchema = new Schema({
  player1: playerSchema,
  player2: {
    type: playerSchema,
    required: false
  },
  winCondition: {
    type: String, // EWinConditions
    required: false
  },
  winner: {
    type: winnerSchema,
    required: false
  },
  turnNumber: {
    type: Number,
    required: false
  },
  turns: [gameTurnSchema]

});

const Game = model<IGame>('Game', gameSchema);

export default Game;