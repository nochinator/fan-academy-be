import { NextFunction, Request, Response } from "express";
import Game from "../models/gameModel";
import { EGameStatus } from "../enums/game.enums";
import IGame from "../interfaces/gameInterface";
import { EmailService } from "../emails/emailService";

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
      const { userId,  gameId, turnNumber, boardState, actions } = req.body;

      // Check that the game exists
      const game = await Game.findById(req.body.gameId);
      if (!game) { next('sendTurn error - Game not found');}

      // Check that the player is the active player
      if (userId !== game!.activePlayer) { next('sendTurn - player is not the active player');}

      await Game.findOneAndUpdate(
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
        }); // REVIEW: should I check here for a returned doc?
    } catch(err) {
      next(err);
    }
  },

  async deleteGame(gameId: string, userId: string, next: NextFunction): Promise<void> {
    try {
      const game: IGame | null = await Game.findById(gameId);
      if (!game) {next('deleteGame - 404 game not found');}

      if (game!.status && game?.players.includes(userId)) {
        const result = await Game.findByIdAndDelete(gameId);
        if (!result) next('deleteGame - error deleting game'); // TODO: check what the result type of the query is (both on success and error)
      }
    } catch(err) { next(err);}
  },

  async endGame(req: Request, res: Response, next: NextFunction) {
    const { gameId, winner, winCondition, lastTurn } = req.body;

    // Update game document
    try {
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
        }); // REVIEW: should I check here for a returned doc?

      if (!game) { next('endGame - 404 game not found');}

      // Send end game notificaton emails
      await EmailService.sendGameEndEmail(game!);
    } catch(err) { next(err);}

    res.statusMessage = 'Operation succeded';
    res.sendStatus(201);
  }
};

export default GameService;