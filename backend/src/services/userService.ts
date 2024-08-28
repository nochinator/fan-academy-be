import { hash } from 'bcrypt';
import { Request, Response } from "express";
import { NextFunction } from 'express-serve-static-core';
import { EmailService } from '../emails/emailService';
import IGame from '../interfaces/gameInterface';
import IUser from "../interfaces/userInterface";
import Game from '../models/gameModel';
import User from "../models/userModel";
import { CustomError } from '../classes/customError';

const UserService = {
  async signup(req: Request, res: Response, next: NextFunction){
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
      picture: '123', // TODO: link to default profile pic
      currentGames: [],
      gameHistory: [],
      preferences: {
        emailNotifications: true,
        sound: true,
        chat: true
      }
    });
    const result =  await newUser.save();
    if (!result) throw new CustomError(30);

    // Send email confirmation email
    await EmailService.sendAccountConfirmationEmail(username, email, next);

    // Login user
    return req.login(newUser, (err) => {
      if (err) { next(err); };
      res.redirect('/users/all');});
  },

  async logout(req: Request, res: Response) {
    if (!req.session) return res.end();

    return req.session.destroy(err => {
      if (err) {
        throw new CustomError(13);
      } else {
        res.redirect('/users/login');
      }
    });
  },

  async passwordReset(req: Request, res: Response, next: NextFunction) {
    const user: IUser | null = await User.findOne({ email: req.body.email  });

    if (!user) throw new CustomError(40);

    await EmailService.sendPasswordResetEmail(user.email, user.username, next);

    res.send('A password recovery link has been sent to your email address. Please check your inbox and spam folders'); // REVIEW: Redirect to login?
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const deletedUser: IUser | undefined | null = await User.findOneAndDelete({ _id: req.body.userId });
    // TODO: Query the games collection removing the username and id from each game
    // either use a generic user id and username, or create a mock up one for each deleted user
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

  async gameEndNotification(gameId: string, res: Response, next: NextFunction): Promise<void> {
    // TODO: create game interface and collection
    const game: IGame | null = await Game.findById(gameId); // TODO: check if we use id or username as param
    if (!game) throw new CustomError(24); // TODO: add check for games that are already finished

    await EmailService.sendGameEndEmail(game, next);
    res.send('Notification sent!');
  },

  async getUsers(): Promise<IUser[]> {
    // TODO: add auth
    return await User.find();
  }
};

export default UserService;