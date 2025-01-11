import { model, Schema } from 'mongoose';
import IUser from '../interfaces/userInterface';

const currentGameSchema = new Schema({
  gameId: String,
  activePlayer: Boolean
});

const gameHistorySchema = new Schema({
  gameId: String,
  playerFaction: String,
  oponentId: String,
  oponentFaction: String,
  startDate: Date,
  endDate: Date,
  won: Boolean,
  winCondition: String
});

const preferencesSchema = new Schema({
  emailNotifications: Boolean,
  sound: Boolean,
  chat: Boolean
});

const userSchema = new Schema({
  username: {
    type: String,
    minLength: 2,
    maxLength: 10,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  email: {
    type: String,
    match: [/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, 'Please fill in a valid email address']
  },
  googleId: {
    type: String,
    required: false
  },
  picture: String,
  lastSeen: Date,
  socketSessions: {
    type: [{ socketId: String }],
    required: false
  },
  currentGames: [currentGameSchema],
  gameHistory: [gameHistorySchema],
  preferences: preferencesSchema
});

const User = model<IUser>('User', userSchema);

export default User;
