import { NextFunction, Request, Response } from "express";
import Game from "../models/gameModel";
import { EGameStatus } from "../enums/game.enums";
import IGame, { IFaction, ITile } from "../interfaces/gameInterface";
import { EmailService } from "../emails/emailService";
import { CustomError } from "../classes/customError";
import mongoose, { Types } from "mongoose";

const GameService = {
  // GET ACTIONS
  async getCurrentGames(userId: string): Promise<IGame[] | null> {
    // const result = await Game.find({ users: req.body.userId  });
    const userObjectId = new Types.ObjectId(userId);
    console.log('userId', userId);

    const result = await Game.find({ 'players.userData': userObjectId }).populate('players.userData', "username picture");

    return result;
  },

  async getOpenGames(res: Response): Promise<Response> {
    const result = await Game.find({ status: EGameStatus.SEARCHING  });

    return res.send(result);
  },

  async matchmaking(playerId: string): Promise<(mongoose.Document<unknown, unknown, IGame> & IGame & { _id: Types.ObjectId; } & { __v: number; }) | null> {
    const userId = new Types.ObjectId(playerId);

    const result = await Game.findOne({
      players: { $elemMatch: { userData: { $ne: userId } } },
      status: EGameStatus.SEARCHING
    }).sort({ createdAt: 1 }).populate('players.userData', "username picture");

    console.log('MATCHMAKING RESULT', JSON.stringify(result?._id));

    return result; // TODO: should return just the roomId
  },

  async getGame(req: Request, res: Response): Promise<Response> {
    const userId = new Types.ObjectId(req.query.userId?.toString());
    const roomId = new Types.ObjectId(req.query.roomId?.toString());
    const result = await Game.findOne({
      _id: roomId,
      "players.userData": userId
    });
    // if (!result) throw new CustomError(24); // REVIEW: do we need to throw here? I should just pass it to the FE
    return res.send(result);
  },

  // POST ACTIONS
  async createGame(options: {
    userId: string,
    faction: IFaction
    boardState: ITile[]
  }): Promise<IGame | null> {
    const { userId, faction, boardState } = options;

    const userData = new Types.ObjectId(userId);
    const gameId = new Types.ObjectId();
    const newGame = new Game({
      _id: gameId,
      players: [{
        faction: faction.factionName,
        userData
      }],
      gameState: [{
        player1: {
          playerId: userId,
          factionData: faction
        },
        boardState
      }],
      status: EGameStatus.SEARCHING,
      createdAt: new Date()
    });

    const result = await newGame.save();
    if (!result) throw new CustomError(23);

    return result;
  },

  async getColyseusRoom(roomId: string, userId: string): Promise<IGame | null> {
    console.log('getColyseusRoom gameId and userdata', roomId, userId);
    const gameId = new Types.ObjectId(roomId);
    const userData = new Types.ObjectId(userId);

    console.log('GAME ID and USER DATA', gameId, userData);
    const result = await Game.findOne({
      _id: gameId,
      'players.userData': userData
    }).populate('players.userData', "email picture");

    console.log('Result', result?._id);
    return result;
  },

  async deleteGame(userId: string | undefined, gameId: string | undefined): Promise<IGame | null> {
    const gameObjectId = new Types.ObjectId(gameId);
    const userObjectId = new Types.ObjectId(userId);

    const game: IGame | null = await Game.findOne({
      _id: gameObjectId,
      players: { $elemMatch: { userData: { $eq: userObjectId } } },
      status: EGameStatus.SEARCHING
    });

    if (!game) throw new CustomError(24);

    const result = await Game.findByIdAndDelete(game._id);
    if (!result) throw new CustomError(24);

    return result;
  },

  async endGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { gameId, winner, winCondition, lastTurn } = req.body;

    const update: any = {
      winner,
      winCondition,
      gameStatus: EGameStatus.FINISHED
    };

    if (lastTurn) {
      update.$push = { gameState: lastTurn };
      update.currentTurn = lastTurn;
    }

    // Update game document
    const game: IGame | null = await Game.findOneAndUpdate({ filter: { _id: gameId } }, { update });
    if (!game) throw new CustomError(24);

    // Send end game notificaton emails
    await EmailService.sendGameEndEmail(game, next);

    res.redirect('/');
  }
};

export default GameService;