import { hash } from 'bcrypt';
import { Request, Response } from "express";
import { NextFunction } from 'express-serve-static-core';
import { EmailService } from '../emails/emailService';
import IGame from '../interfaces/gameInterface';
import IUser from "../interfaces/userInterface";
import Game from '../models/gameModel';
import User from "../models/userModel";

const UserService = {
  async signup(req: Request, res: Response, next: NextFunction){
    console.log('BODY', req.body); // TODO: remove
    const { username, email, password } = req.body; // TODO: sanitize fields

    // Check if the username or email are already in use
    const userAlreadyExists: IUser[] = await User.find({ $or: [ { username }, { email }] });
    if (userAlreadyExists.length) {
      return res.status(400).send('An account for this username or email already exists');
    }

    // If the user doesn't exist, create a new user with an encrypted password
    const hashedPassword = await hash(password, 10);
    try {
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });
      await newUser.save();

      // Send email confirmation email
      EmailService.sendAccountConfirmationEmail(username, email);

      // Login user
      return req.login(newUser, (err) => {
        if (err) { next(err); };
        res.redirect('/users/all');});
    }
    catch(error) {
      console.log(error); // TODO: add logger
      return res.status(400).send('An error ocurred while creating your account. Please, try again');
    }
  },

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

  async passwordReset(req: Request, res: Response) {
    const user: IUser | null = await User.findOne({ email: req.body.email  });
    if (user) await EmailService.sendPasswordResetEmail(user.email, user.username);
    res.send('A password recovery link has been sent to your email address. Please check your inbox and spam folders'); // Redirect to login
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedUser: IUser | undefined | null = await User.findOneAndDelete({ _id: req.body.userId });
      // TODO: Query the games collection removing the username and id from each game
      // either use a generic user id and username, or create a mock up one for each deleted user
      if (deletedUser) await EmailService.sendAccountDeletionEmail(deletedUser?.email);
      return req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out');
        } else {
          res.redirect('/users/login');
        }
      });
    } catch(err) {
      return res.send('Error deleting user');
      next(err);
    }
  },

  async turnNotification(userId: string, gameId: string, res: Response, next: NextFunction): Promise<void> {
    try {
      const user: IUser | null = await User.findById(userId); // TODO: check if we use id or username as param
      if (!user) next('Error sending turn notification');
      if (user) {await EmailService.sendTurnNotificationEmail(user.email, user.username, gameId);
        res.send('Notification sent!');
      }
    } catch(err) { console.log(err); res.send('Error sending turn notification');}
  },

  async gameEndNotification(gameId: string, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: create game interface and collection
      const game: IGame | null = await Game.findById(gameId); // TODO: check if we use id or username as param
      if (!game) next('Error sending end game notification - No game found');
      if (game) {await EmailService.sendGameEndEmail(game);
        res.send('Notification sent!');
      }
    } catch(err) { console.log(err); res.send('Error sending turn notification');}
  },

  async getUsers(): Promise<IUser[]> {
    // TODO: add auth
    return await User.find();
  },

  async createGame(req: Request, res: Response, next: NextFunction) {
    try {
      const newGame = new Game({
        player1: req.body.player1,
        player2: req.body.player2,
        winCondition: req.body.winCondition,
        winner: req.body.winner
      });

      await newGame.save();
      res.send('New Game created');
    } catch(err) {
      console.log('Error in createGame function');
      next(err);
    }
  }
};

export default UserService;