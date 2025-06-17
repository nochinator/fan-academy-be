import { Types } from "mongoose";

interface IUserPreferences {
  emailNotifications: boolean;
  sound: boolean;
  chat: boolean;
}

interface IUserStats {
  totalGames: number,
  totalWins: number,
  councilWins: number,
  elvesWins: number
}

interface IUser extends Express.User {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  picture?: string;
  preferences: IUserPreferences;
  stats: IUserStats
}

export default IUser;