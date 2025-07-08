import { compare } from 'bcrypt';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy, VerifyFunction } from 'passport-local';
import IUser from '../interfaces/userInterface';
import User from '../models/userModel';

const localVerifyCallback: VerifyFunction = async (username, password, cb): Promise<void> => {
  try {
    const user: IUser | null = await User.findOne({ username });

    if (user && user.password) {
      const passwordCheck = await compare(password, user.password);
      if (!passwordCheck) return cb(null, false);
      cb(null, user);
    } else {
      cb(null, false);
    }
  } catch (err) {
    cb(err);
  }
};

const localStrategy = new LocalStrategy(localVerifyCallback);

// JWT STRATEGY
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET! // make sure it's set
};

const jwtVerify = async (payload: any, done: any) => {
  try {
    const user = await User.findById(payload._id);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    done(err, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export { jwtStrategy, localStrategy };
