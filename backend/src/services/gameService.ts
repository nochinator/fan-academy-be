import { NextFunction, Request, Response } from "express";
import Game from "../models/gameModel";
import { EGameStatus } from "../enums/game.enums";
import IGame from "../interfaces/gameInterface";
import { EmailService } from "../emails/emailService";
import { CustomError } from "../classes/customError";
import UserService from "./userService";

const GameService = {
  // GET ACTIONS
  async getCurrentGames(req: Request, res: Response): Promise<Response> {
    const result = await Game.find({ players: req.body.userId  });

    return res.send(result); // TODO: check if it is an empty array if no games are found
  },

  async getOpenGames(res: Response): Promise<Response> {
    const result = await Game.find({ status: EGameStatus.SEARCHING  });

    return res.send(result); // TODO: check if it is an empty array if no games are found
  },

  async getGame(req: Request, res: Response): Promise<Response> {
    const result = await Game.findById(req.params.id);
    if (!result) throw new CustomError(24);
    return res.send(result);
  },

  // POST ACTIONS
  async createGame(req: Request, res: Response): Promise<Response> {
    const { player1 } = req.body;
    const newGame = new Game({
      player1,
      status: EGameStatus.SEARCHING,
      players: [player1.userId]
    });

    const result = await newGame.save();
    if (!result) throw new CustomError(23);

    return res.send(result);
  },

  async joinGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { gameId, player2 } = req.body;

    const game = await Game.findById(gameId);
    // Throw an error if the game no longer exists or if there is already a second player
    if (!game) throw new CustomError(24);
    if (game.player2) throw new CustomError(28);

    // Randomly select the first player and start the game
    const activePlayer = Math.random() < 0.5 ? game.player1.userId : player2.userId;

    const result = await Game.findByIdAndUpdate(gameId, {
      player2,
      status: EGameStatus.PLAYING,
      activePlayer,
      $push: { players: player2.userId }
    }, { new: true });
    if (!result) throw new CustomError(29);

    // Send notification to the first player
    // TODO: send in-app notification
    await UserService.turnNotification(activePlayer, gameId, res, next);
    res.redirect(`/${gameId}`);
  },

  async sendTurn(req: Request, res: Response): Promise<Response> {
    const { userId,  gameId, turnNumber, boardState, actions } = req.body;

    // Check that the game exists
    const game = await Game.findById(req.body.gameId);
    if (!game) throw new CustomError(24);

    // Check that the player is the active player
    if (userId !== game!.activePlayer) throw new CustomError(25);

    const result = await Game.findByIdAndUpdate( gameId, {
      $push: {
        turns: {
          turnNumber,
          boardState,
          actions
        }
      }
    },
    { new: true }
    ); // REVIEW: should I check here for a returned doc?

    return res.send(result);
  },

  async deleteGame(req: Request, res: Response): Promise<void> {
    const game: IGame | null = await Game.findById(req.params.id);
    if (!game) throw new CustomError(24);
    if (game!.status != EGameStatus.SEARCHING) throw new CustomError(27);

    const result = await Game.findByIdAndDelete(game._id);
    if (!result) throw new CustomError(24);
    // TODO: check what the result type of the query is (both on success and error)
    res.redirect('/');
  },

  async endGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { gameId, winner, winCondition, lastTurn } = req.body;

    // Update game document
    const game: IGame | null = await Game.findOneAndUpdate(
      { filter: { _id: gameId } }, {
        upate: {
          ...lastTurn ? {
            $push: {
              turns: {
                turnNumber: lastTurn.turnNumber,
                boardState: lastTurn.boardState,
                actions: lastTurn.actions
              }
            }
          } : {},
          winner,
          winCondition,
          gameStatus: EGameStatus.FINISHED
        }
      });
    if (!game) throw new CustomError(24);

    // Send end game notificaton emails
    await EmailService.sendGameEndEmail(game, next);

    res.redirect('/');
  }
};

export default GameService;