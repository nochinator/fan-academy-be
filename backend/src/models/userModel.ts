import mongoose from 'mongoose';
import IUser from '../interfaces/userInterface';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 2,
    required: true
  },
  password: {
    type: String,
    minLength: 8,
    required: true
  },
  email: {
    type: String,
    match: [/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, 'Please fill in a valid email address']
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
