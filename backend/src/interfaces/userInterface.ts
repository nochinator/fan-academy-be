import { ObjectId } from "mongoose";
import { EFaction, EWinConditions } from "../enums/game.enums";

interface IArchivedGame {
  gameId: string;
  playerFaction: EFaction;
  oponentId: string;
  oponentFaction: EFaction;
  startDate: Date;
  endDate: Date;
  won: boolean;
  winCondition: EWinConditions;
}

interface IUser {
  _id: ObjectId;
  username: string;
  email: string;
  password?: string;
  googleId?: string
  picture?: string;
  currentGames?: string[];
  gameHistory: IArchivedGame[]; // currentGames become archived here once finished
}

export default IUser;