import { NextFunction, Request, Response } from "express";
import Game from "../models/gameModel";
import { EGameStatus } from "../enums/game.enums";
import IGame from "../interfaces/gameInterface";
import { EmailService } from "../emails/emailService";
import { CustomError } from "../classes/customError";

const GameService = {
  // GET ACTIONS
  async getCurrentGames(req: Request, res: Response): Promise<Response> {
    // const result = await Game.find({ users: req.body.userId  });

    console.log('userId', req.query.userId);

    const result = await Game.aggregate([
      // Step 1: Match games where the userId matches the input
      { $match: { "users.userId": req.query.userId } },

      // Step 2: Convert users.userId to ObjectId for matching
      {
        $addFields: {
          converteduserIds: {
            $map: {
              input: "$users.userId",
              as: "userId",
              in: { $toObjectId: "$$userId" }
            }
          }
        }
      },

      // Step 3: Perform the lookup with the converted userId
      {
        $lookup: {
          from: "users", // The collection to join
          localField: "convertedUserIds", // The field in the current collection
          foreignField: "_id", // The field in the foreign collection
          as: "userDetails", // The output array
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                picture: 1
              }
            }
          ]
        }
      }
    ]);

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
    const { user1 } = req.body;
    const newGame = new Game({
      user1,
      status: EGameStatus.SEARCHING,
      users: [user1.userId]
    });

    const result = await newGame.save();
    if (!result) throw new CustomError(23);

    return res.send(result);
  },

  // async joinGame(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   const { gameId, user2 } = req.body;

  //   const game = await Game.findById(gameId);
  //   // Throw an error if the game no longer exists or if there is already a second user
  //   if (!game) throw new CustomError(24);
  //   if (game.user2) throw new CustomError(28);

  //   // Randomly select the first user and start the game
  //   const activeuser = Math.random() < 0.5 ? game.user1.userId : user2.userId;

  //   const result = await Game.findByIdAndUpdate(gameId, {
  //     user2,
  //     status: EGameStatus.PLAYING,
  //     activeuser,
  //     $push: { users: user2.userId }
  //   }, { new: true });
  //   if (!result) throw new CustomError(29);

  //   // Send notification to the first user
  //   // TODO: send in-app notification
  //   await UserService.turnNotification(activeuser, gameId, res, next);
  //   res.redirect(`/${gameId}`);
  // },

  // async sendTurn(req: Request, res: Response): Promise<Response> {
  //   const { userId,  gameId, turnNumber, boardState, actions } = req.body;

  //   // Check that the game exists
  //   const game = await Game.findById(req.body.gameId);
  //   if (!game) throw new CustomError(24);

  //   // Check that the user is the active user
  //   if (userId !== game!.activeuser) throw new CustomError(25);

  //   const result = await Game.findByIdAndUpdate( gameId, {
  //     $push: {
  //       turns: {
  //         turnNumber,
  //         boardState,
  //         actions
  //       }
  //     }
  //   },
  //   { new: true }
  //   ); // REVIEW: should I check here for a returned doc?

  //   return res.send(result);
  // },

  // async deleteGame(req: Request, res: Response): Promise<void> {
  //   const game: IGame | null = await Game.findById(req.params.id);
  //   if (!game) throw new CustomError(24);
  //   if (game!.status != EGameStatus.SEARCHING) throw new CustomError(27);

  //   const result = await Game.findByIdAndDelete(game._id);
  //   if (!result) throw new CustomError(24);
  //   // TODO: check what the result type of the query is (both on success and error)
  //   res.redirect('/');
  // },

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