import { hash } from 'bcrypt';
import { Request, Response } from "express";
import { NextFunction } from 'express-serve-static-core';
import { EmailService } from '../emails/emailService';
import IUser from "../interfaces/userInterface";
import User from "../models/userModel";

const UserService = {
  async signup(req: Request, res: Response, next: NextFunction){
    console.log('BODY', req.body); // TODO: remove
    const { username, email, password } = req.body; // TODO: sanitize fields

    // Check if the username or email are already in use
    const userAlreadyExists: IUser[] = await User.find({ $or: [ { username }, { email }] });
    if (userAlreadyExists.length) {
      res.status(400).send('An account for this username or email already exists');
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
      req.login(newUser, (err) => {
        if (err) { next(err); };
        res.redirect('/users/all');});
    }
    catch(error) {
      console.log(error); // TODO: add logger
      res.status(400).send('An error ocurred while creating your account. Please, try again');
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

  async turnNotification(userId: string, gameId: string, res: Response, next: NextFunction): Promise<void> {
    try {
      const user: IUser | null = await User.findById(userId); // TODO: check if we use id or username as param
      if (!user) next('Error sending turn notification');
      if (user) {await EmailService.sendTurnNotificationEmail(user.email, user.username, gameId);
        res.send('Notification sent!');
      }
    } catch(err) { console.log(err); res.send('Error sending turn notification');}
  },

  async getUsers(): Promise<IUser[]> {
    // TODO: add auth
    return await User.find();
  }
};

export default UserService;