import { NextFunction, Request, Response } from "express";
import Game from "../models/gameModel";
import { EGameStatus, EGameTermination } from "../enums/game.enums";
import IGame from "../interfaces/gameInterface";

const GameService = {
  // GET ACTIONS
  async getActiveGames(req: Request, res: Response): Promise<Response | void> {
    const result = await Game.find({ players: req.body.userId  });

    res.send(result); // TODO: check if it is an empty array if no games are found
  },

  async getOpenGames(res: Response): Promise<Response | void> {
    const result = await Game.find({ status: EGameStatus.SEARCHING  });

    res.send(result); // TODO: check if it is an empty array if no games are found
  },

  async getGame(req: Request, res: Response, _next: NextFunction) {
    const result = await Game.findById(req.params.id);
    if (result) {
      res.send(result);
    } else {
      res.statusMessage = 'Game not found';
      res.status(404); // REVIEW: handle with error handler?
    }
  },

  // POST ACTIONS
  async sendTurn(req: Request, res: Response, next: NextFunction) {
    try {
      const { gameId, turnNumber, boardState, actions } = req.body;

      const game: IGame | null = await Game.findOneAndUpdate(
        { filter: { _id: gameId } }, {
          upate: {
            $push: {
              turns: {
                turnNumber,
                boardState,
                actions
              }
            }
          }
        });

      if (!game) next('Error sending turn - No game found');
    } catch(err) {
      next(err);
    }
  },

  async deleteGame(gameId: string, next: NextFunction): Promise<void> {
    try {
      const result = await Game.findByIdAndDelete(gameId);
      if (!result) next('deleteGame - error deleting game'); // TODO: check the result type of the query (both on success and error)
    } catch(err) { next(err);}
  },

  async endGame(req: Request, res: Response, next: NextFunction) {
    /* TODO: add logic that triggers when the game ends
    includes checking the vitory condition and sending the end of game emails to the players
    */
  }
};

export default GameService;