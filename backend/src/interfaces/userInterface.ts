import { ObjectId } from "mongoose";

interface IUser {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
}

export default IUser;