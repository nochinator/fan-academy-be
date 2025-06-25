import { compare } from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy, VerifyFunction } from 'passport-local';
import IUser from '../interfaces/userInterface';
import User from '../models/userModel';

// LOCAL STRATEGY
const localVerifyCallback: VerifyFunction = async (username, password, cb): Promise<void> => {
  console.log('LOCAL_VERIFY', username, password);
  try {
    const user: IUser | null = await User.findOne({ username });

    if (user && user.password) {
      const passwordCheck = await compare(password, user.password);
      // TODO: Change the errors to redirect to login again, and share the error text
      if (!passwordCheck) { return cb('Error1.', false); }
      cb(null, user);
    } else {
      cb('Error2', false);
    }
  } catch (err) {
    cb(err);
  }
};

const localStrategy = new LocalStrategy(localVerifyCallback);

// USER SERIALIZATION
passport.serializeUser((user, cb) => {
  console.log('SERIALIZE', user); // TODO: remove
  const typedUser = user as IUser;
  cb(null, typedUser._id);
});

passport.deserializeUser(async (userId, cb) => {
  try {
    console.log('DESERIALIZE', userId); // TODO: remove
    const user = await User.findById(userId);
    cb(null, user); // REVIEW: does it need a check for !user ?
  } catch (err) {
    cb(err);
  }
});

export { localStrategy };
