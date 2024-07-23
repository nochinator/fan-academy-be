import { compare } from 'bcrypt';
import passport from 'passport';
import { Strategy, VerifyFunction } from 'passport-local';
import IUser from '../interfaces/userInterface';
import User from '../models/userModel';

const verifyCallback: VerifyFunction = async (username, password, cb): Promise<void> => {
  try{
    console.log('VERIFYCALLBACK');
    const user: IUser | null = await User.findOne({ username });

    if (user) {
      const passwordCheck = await compare(password, user.password);
      if (!passwordCheck) { return cb(null, false, { message: 'Incorrect username or password.' }); }
      cb(null, user);
    } else {
      cb(null, false, { message: 'Incorrect username or password.' });
    }
  } catch(err) {
    cb(err);
  }
};

const localStrategy = new Strategy(verifyCallback);

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
  } catch(err) {
    cb(err);
  }
});

export { localStrategy };
