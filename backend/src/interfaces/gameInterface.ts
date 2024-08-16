import { ObjectId } from "mongoose";
import { EFaction } from "../enums/factions.enum";
import { EWinConditions } from "../enums/winConditions.enum";

interface IGame {
  _id: ObjectId;
  player1: {
    userId: string,
    username: string,
    email: string,
    faction: EFaction
  }
  player2: {
    userId: string,
    username: string,
    email: string,
    faction: EFaction
  }
  winCondition: EWinConditions,
  winner: {
    userId: string,
    username: string
  }
}

export default IGame;