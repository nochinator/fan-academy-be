import { Request, Response } from "express";
import Game from "../models/gameModel";
import { EGameStatus } from "../enums/game.enums";
import IGame from "../interfaces/gameInterface";
import { EmailService } from "../emails/emailService";
import { CustomError } from "../classes/customError";

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

  async getGame(req: Request, res: Response) {
    const result = await Game.findById(req.params.id);
    if (result) {
      res.send(result);
    } else {
      res.statusMessage = 'Game not found';
      res.status(404); // REVIEW: handle with error handler?
    }
  },

  // POST ACTIONS
  async createGame(req: Request, res: Response) {
    const newGame = new Game({
      player1: req.body.player1,
      player2: req.body.player2,
      winCondition: req.body.winCondition,
      winner: req.body.winner
    });

    const result = await newGame.save();
    if (!result) throw new CustomError(23);

    res.send(`New Game created: ${result._id}`);
    console.log('Error in createGame function');
  },

  async sendTurn(req: Request, res: Response) {
    const { userId,  gameId, turnNumber, boardState, actions } = req.body;

    // Check that the game exists
    const game = await Game.findById(req.body.gameId);
    if (!game) throw new CustomError(24);

    // Check that the player is the active player
    if (userId !== game!.activePlayer) throw new CustomError(25);

    const result = await Game.findOneAndUpdate(
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

    res.send(result);
  },

  async deleteGame(gameId: string): Promise<void> {
    const game: IGame | null = await Game.findById(gameId);
    if (!game) throw new CustomError(24);

    if (game!.status != EGameStatus.SEARCHING) throw new CustomError(27);

    const result = await Game.findByIdAndDelete(gameId);
    if (!result) throw new CustomError(24);
    // TODO: check what the result type of the query is (both on success and error)
  },

  async endGame(req: Request, res: Response) {
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
      }); // REVIEW: should I check here for a returned doc?

    if (!game) throw new CustomError(24);

    // Send end game notificaton emails
    await EmailService.sendGameEndEmail(game!);

    res.statusMessage = 'Operation succeded';
    res.sendStatus(201);
  }
};

export default GameService;