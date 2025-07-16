import { Types } from "mongoose";

export interface IUserPreferences {
  emailNotifications: boolean;
  chat: boolean;
}

export interface IUserStats {
  totalGames: number;
  totalWins: number;
  councilWins: number;
  elvesWins: number;
}

interface IUser extends Express.User {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  picture?: string;
  preferences: IUserPreferences;
  stats: IUserStats;
  emailConfirmationLink: string;
  confirmedEmail: boolean;
}

export default IUser;