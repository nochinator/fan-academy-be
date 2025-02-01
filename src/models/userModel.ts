import { model, Schema } from 'mongoose';
import IUser from '../interfaces/userInterface';

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
  picture: String,
  lastSeen: Date,
  preferences: preferencesSchema
});

const User = model<IUser>('User', userSchema);

export default User;
