import { compare } from 'bcrypt';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as LocalStrategy, VerifyFunction } from 'passport-local';
import IUser from '../interfaces/userInterface';
import User from '../models/userModel';
import { GOOGLE_CLIENT_ID, GOOGLE_SECRET } from './config';

// LOCAL STRATEGY
const localVerifyCallback: VerifyFunction = async (username, password, cb): Promise<void> => {
  try {
    const user: IUser | null = await User.findOne({ username });

    if (user && user.password) {
      const passwordCheck = await compare(password, user.password);
      // TODO: Change the errors to redirect to login again, and share the error text
      if (!passwordCheck) { return cb('Incorrect username or password.', false); }
      cb(null, user);
    } else {
      cb('Incorrect username or password.', false);
    }
  } catch (err) {
    cb(err);
  }
};

const localStrategy = new LocalStrategy(localVerifyCallback);

// GOOGLE OAUTH STRATEGY
const googleVerifyCallback = async (req: Express.Request, accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback): Promise<void> => {
  try {
    // console.log('profile => ', profile);

    const user: IUser | null = await User.findOne({ googleId: profile.id });
    console.log('userG =>', user);
    if (user) {
      cb(null, user);
    } else {
      // If no user is found, create one using the Google account email and display name
      console.log('this shouldnt log');
      const newUser = new User({
        username: profile.displayName,
        email: profile._json.email,
        googleId: profile.id,
        picture: profile._json.picture
      });
      const currentUser: IUser = await newUser.save();
      cb(null, currentUser);
    }
  } catch (err) {
    cb(err);
  }
};

const googleStrategy = new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID!,
  clientSecret: GOOGLE_SECRET!,
  callbackURL: 'http://localhost:3003/users/login/google/callback',
  passReqToCallback: true
}, googleVerifyCallback);

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

export { googleStrategy, localStrategy };
