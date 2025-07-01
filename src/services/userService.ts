import { hash } from 'bcrypt';
import { Request, Response } from "express";
import { NextFunction } from 'express-serve-static-core';
import { Session } from 'express-session';
import { CustomError } from '../classes/customError';
import { EmailService } from '../emails/emailService';
import { IPopulatedUserData } from '../interfaces/gameInterface';
import IUser from "../interfaces/userInterface";
import Game from "../models/gameModel";
import User from "../models/userModel";
import { EGameStatus } from '../enums/game.enums';
import { matchMaker } from '@colyseus/core';

const UserService = {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void>{
    const { username, email, password } = req.body;

    // Check if the username or email are already in use
    const userAlreadyExists: IUser[] = await User.find({ $or: [ { username }, { email }] });
    if (userAlreadyExists.length) throw new CustomError(12);

    // If the user doesn't exist, create a new user with an encrypted password
    try {
      const hashedPassword = await hash(password, 10);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        picture: '/assets/images/profilePics/crystalIcon.jpg',
        currentGames: [],
        gameHistory: [],
        preferences: {},
        stats: {}
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
    } catch(err: any) {
      console.log('Error', err);
      next(err.message);
    }
  },

  async updateProfile(req: Request, res: Response): Promise<Response>{
    const user = req.user as IUser; // User data is populated by Passport
    const { email, password, picture, emailNotifications, chat } = req.body;

    const updateFields: any = {};

    // Top-level fields
    if (email) {
      updateFields.email = email;
      // Check if the email is already in use
      const emailAlreadyExists: IUser | null = await User.findOne({ email });
      if (emailAlreadyExists) throw new CustomError(12);
    }

    if (password) updateFields.password = password;
    if (picture) updateFields.picture = picture;

    // Nested preferences
    if (emailNotifications || chat) {
      updateFields.preferences = {};
      if (emailNotifications) updateFields.preferences.emailNotifications = emailNotifications;
      if (chat) updateFields.preferences.chat = chat;
    }

    const result = await User.findByIdAndUpdate(user._id, updateFields, { new: true });

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

  async deleteUser(user: IUser, next: NextFunction): Promise<void> {
    try {
      // Send email to user
      // await EmailService.sendAccountDeletionEmail(user.email, next); // REVIEW:

      console.log('UUUUSER', user);

      // Find and remove open games / and challenges, and inform the other players
      const userIdsToUpdate = new Set<string>();
      const userEmailsToUpdate = new Set<string>();
      const gamesToDelete = new Set<string>();
      const affectedGames = await Game.find({ 'players.userData': user._id }).populate('players.userData', "email");

      console.log('AFFECTED GAMES', affectedGames);

      if (affectedGames.length) {
        affectedGames.forEach(game => {
          if (game.status === EGameStatus.SEARCHING || game.status === EGameStatus.FINISHED) return;

          console.log('AFFECTED GAME PLAYERS', game.players);

          gamesToDelete.add(game._id.toString());

          const opponent = game.players.find(player => player.userData._id.toString() !== user._id.toString() )?.userData as unknown as IPopulatedUserData;
          console.log('OPPONENT EMAIL', opponent);

          if (opponent?.email) userEmailsToUpdate.add(opponent.email);
          if (opponent?._id) userIdsToUpdate.add(opponent._id.toString());
        });

        await Game.deleteMany({ 'players.userData': user._id });
      }

      const deletedUser: IUser | undefined | null = await User.findOneAndDelete({ _id: user._id });
      if (!deletedUser) throw new CustomError(40);

      console.log('DELETED USER', deletedUser);

      console.log('USERS TO UPDATE AND SIZE', userIdsToUpdate, userIdsToUpdate.size);
      if (userIdsToUpdate.size > 0) {
        console.log('OPPONENTS', userIdsToUpdate);
        // TODO: send emails to other people playing with him, if they have a confirmed email

        // Send a message to update the game list of the affected players
        matchMaker.presence.publish('userDeletedPresence', {
          userIds: [...userIdsToUpdate],
          gameIds: [...gamesToDelete]
        });
      }
    } catch(err) {
      console.log(err);
      next(err);
    }
  },

  // async getUsers(userIds?: ObjectId[]): Promise<IUser[]> {
  //   const query = userIds ? { _id: { $in: userIds } } : {};
  //   return await User.find(query);
  // },

  async getLeaderboard(page: number): Promise<{
    players: IUser[],
    totalPages: number,
    currentPage: number
  }> {
    const limit = 12;
    const skip = (page - 1) * limit;

    const players =  await User.find({}, {
      username: 1,
      picture: 1,
      stats: 1
    }).sort({
      'stats.totalWins': -1,
      'stats.totalGames': 1
    }).skip(skip).limit(limit);

    const totalPlayers = await User.countDocuments();

    return {
      players,
      totalPages: Math.ceil(totalPlayers / limit),
      currentPage: page
    };
  },

  async getProfile(req: Request, res: Response): Promise<Response> {
    const user = req.user as IUser; // User data is populated by Passport
    // console.log('UUUUUUSER', user);
    if (!user._id) { throw new CustomError(10); }

    const result = await User.findById(user._id, { password: 0 });
    if (!result) { throw new CustomError(40); }

    return res.send(result);
  }
};

export default UserService;