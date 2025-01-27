import { ObjectId } from "mongoose";

interface IUserPreferences {
  emailNotifications: boolean;
  sound: boolean;
  chat: boolean;
}

interface IUser extends Express.User {
  _id: ObjectId;
  username: string;
  email: string;
  password?: string;
  picture?: string;
  preferences: IUserPreferences;
}

export default IUser;