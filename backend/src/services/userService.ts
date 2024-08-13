import { Request, Response } from "express";
import IUser from "../interfaces/userInterface";
import User from "../models/userModel";
import { generatePassword } from "../utils/passwords";

const UserService = {
  async signup(body: {
    username: string,
    email: string,
    password: string
  }): Promise<string> {
    console.log('BODY', body);
    const { username, email, password } = body; // TODO: sanitize fields

    // Check if the username or email are already in use
    const userAlreadyExists: IUser[] = await User.find({ $or: [ { username }, { email }] });

    if (userAlreadyExists.length) {
      return 'An account for this username or email already exists';
    }

    const hashedPassword = await generatePassword(password);

    try {
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });
      await newUser.save();
    }
    catch(error) {
      console.log(error);
      if (error instanceof Error){ return error.message;}
    }

    // TODO: send confirmation email
    // TODO: redirect to login page
    return 'New user created';
  },

  // async login(req: Request): Promise<{
  //   user: ObjectId;
  //   message: string;
  // } | string> {
  //   const { username, password } = req.body;

  //   const user: IUser | null = await User.findOne({ username }); // TODO: make the query case insensitive
  //   if (!user) {return 'Incorrect username or password';}

  //   const passwordCheck = await validatePassword(password, user.password);
  //   if (!passwordCheck) {return 'Incorrect username or password';} // TODO: create error file

  //   return {
  //     user: user._id,
  //     message: 'You are now logged in!'
  //   };
  // },

  async logout(req: Request, res: Response) {
    if (!req.session) {return res.end();}

    return req.session.destroy(err => {
      if (err) {
        res.status(400).send('Unable to log out');
      } else {
        res.redirect('/users/login');
      }
    });
  },

  async getUsers(): Promise<IUser[]> {
    // TODO: add auth
    return await User.find();
  }
};

export default UserService;