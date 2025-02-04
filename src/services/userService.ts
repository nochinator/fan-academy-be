import { hash } from 'bcrypt';
import { Request, Response } from "express";
import { NextFunction } from 'express-serve-static-core';
import { EmailService } from '../emails/emailService';
import IUser from "../interfaces/userInterface";
import User from "../models/userModel";
import { CustomError } from '../classes/customError';
import { Session } from 'express-session';
import { ObjectId } from 'mongoose';

const UserService = {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void>{
    console.log('BODY', req.body); // TODO: remove
    const { username, email, password } = req.body; // TODO: sanitize fields

    // Check if the username or email are already in use
    const userAlreadyExists: IUser[] = await User.find({ $or: [ { username }, { email }] });
    if (userAlreadyExists.length) throw new CustomError(12);

    // If the user doesn't exist, create a new user with an encrypted password
    const hashedPassword = await hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      picture: '/assets/images/profilePics/Avatar_1stGame-hd.jpg', // TODO: link to default profile pic
      currentGames: [],
      gameHistory: [],
      preferences: {
        emailNotifications: true,
        sound: true,
        chat: true
      }
    });
    const user =  await newUser.save();
    if (!user) throw new CustomError(30);

    // Send email confirmation email
    await EmailService.sendAccountConfirmationEmail(username, email, next);

    // Manually log in the user
    req.login(user, (loginErr: any) => {
      if (loginErr) { return next(loginErr); }

      res.status(200).json({
        message: "Login successful",
        user
      });});
  },

  async updateProfile(req: Request, res: Response): Promise<Response>{
    const { id } = req.params;
    const { username, email, password, picture, preferences } = req.body;

    const result = await User.findByIdAndUpdate(id, {
      username,
      email,
      password,
      picture,
      preferences
    }, { new: true });
    if (!result) throw new CustomError(41);

    return res.send(result);
  },

  async logout(req: Request, res: Response): Promise<Response | Session> {
    if (!req.session)  throw new CustomError(10);

    return req.session.destroy(err => {
      if (err) { throw new CustomError(13); }
      res.status(200).json({ message: "Logout successful" });
    });
  },

  async passwordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user: IUser | null = await User.findOne({ email: req.body.email  });
    if (!user) throw new CustomError(40);

    await EmailService.sendPasswordResetEmail(user.email, user.username, next);
    res.redirect('/users/login');
  },

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<Session> {
    const deletedUser: IUser | undefined | null = await User.findOneAndDelete({ _id: req.body.userId });
    if (!deletedUser) throw new CustomError(40);

    await EmailService.sendAccountDeletionEmail(deletedUser?.email, next);
    return req.session.destroy(err => {
      if (err) {
        next(err);
      } else {
        res.redirect('/users/login');
      }
    });
  },

  async turnNotification(userId: string, gameId: string, res: Response, next: NextFunction): Promise<void> {
    const user: IUser | null = await User.findById(userId); // TODO: check if we use id or username as param
    if (!user) throw new CustomError(40);

    if (user.preferences.emailNotifications) await EmailService.sendTurnNotificationEmail(user.email, user.username, gameId, next);

    res.send('Notification sent!');
  },

  // FIXME: query duplicated on gameService
  // async gameEndNotification(gameId: string, res: Response, next: NextFunction): Promise<void> {
  //   // TODO: create game interface and collection
  //   const game: IGame | null = await Game.findById(gameId); // TODO: check if we use id or username as param
  //   if (!game) throw new CustomError(24); // TODO: add check for games that are already finished

  //   await EmailService.sendGameEndEmail(game, next);
  //   res.send('Notification sent!');
  // },

  async getUsers(userIds?: ObjectId[]): Promise<IUser[]> {
    const query = userIds ? { _id: { $in: userIds } } : {};
    return await User.find(query);
  },

  async getUser(req: Request, res: Response): Promise<Response> {
    const { userId } = req.body; // FIXME: I have req.params somewhere, choose one

    const user =  await User.findById(userId);
    if (!user) throw new CustomError(40);

    return res.send(user);
  }

  // async getMe(req: Request, res: Response): Promise<Response> {
  //   const user = req.user as IUser;
  //   console.log('UUUUUUSER', user);
  //   if (!user._id) { throw new CustomError(10); }

  //   const result = await User.findById(user._id);
  //   if (!result) { throw new CustomError(40); }

  //   return res.send(result);
  // }
};

export default UserService;