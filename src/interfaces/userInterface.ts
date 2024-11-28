import { ObjectId } from "mongoose";
import { EFaction, EWinConditions } from "../enums/game.enums";

interface IUserPreferences {
  emailNotifications: boolean;
  sound: boolean;
  chat: boolean;
}

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

interface IActiveGame {
  gameId: string;
  activePlayer: boolean
}

interface IUser extends Express.User {
  _id: ObjectId;
  username: string;
  email: string;
  password?: string;
  googleId?: string
  picture?: string;
  currentGames: IActiveGame[];
  gameHistory: IArchivedGame[]; // currentGames become archived here once finished
  preferences: IUserPreferences;
}

export default IUser;