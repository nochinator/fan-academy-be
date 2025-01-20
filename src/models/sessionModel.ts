import { model, Schema } from "mongoose";
import ISession from "../interfaces/sessionInterface";

const sessionSchema = new Schema({
  _id: String,
  expires: Date,
  lastModified: Date,
  session: String
});

const Session = model<ISession>('Session', sessionSchema);

export default Session;