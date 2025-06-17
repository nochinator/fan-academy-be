import { NextFunction, Request, Response } from "express";
import { HydratedDocument, Types } from "mongoose";
import { CustomError } from "../classes/customError";
import { EmailService } from "../emails/emailService";
import { EFaction, EGameStatus } from "../enums/game.enums";
import IGame, { IPlayerData } from "../interfaces/gameInterface";
import Game from "../models/gameModel";
import { createNewGameBoardState, createNewGameFactionState } from "../utils/newGameData";
import { matchMaker } from "@colyseus/core";

const GameService = {
  // GET ACTIONS
  async getCurrentGames(userId: string): Promise<IGame[] | null> {
    // const result = await Game.find({ users: req.body.userId  });
    const userObjectId = new Types.ObjectId(userId);
    console.log('userId', userId);

    const result = await Game.find({ 'players.userData': userObjectId }, { gameState: 0 }).populate('players.userData', "username picture");

    return result;
  },

  async getOpenGames(res: Response): Promise<Response> {
    const result = await Game.find({ status: EGameStatus.SEARCHING  });

    return res.send(result);
  },

  async matchmaking(playerId: string): Promise<HydratedDocument<IGame> | null> {
    const userId = new Types.ObjectId(playerId);

    const result = await Game.findOne({
      players: { $elemMatch: { userData: { $ne: userId } } },
      status: EGameStatus.SEARCHING
    }).sort({ createdAt: 1 }).populate('players.userData', "username picture");

    console.log('MATCHMAKING RESULT', JSON.stringify(result?._id));

    return result;
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
  async createGame(params: {
    userId: string,
    faction: EFaction,
    opponentId?: string
  }): Promise<HydratedDocument<IGame>> {
    const { userId, faction, opponentId } = params;

    const userObjId = new Types.ObjectId(userId);
    const gameId = new Types.ObjectId();

    const newGame = new Game({
      _id: gameId,
      players: [
        {
          faction,
          userData: userObjId
        },
        ...opponentId ? [{ userData: new Types.ObjectId(opponentId) }] : []
      ],
      turnNumber: 0,
      status: opponentId ? EGameStatus.CHALLENGE : EGameStatus.SEARCHING,
      createdAt: new Date()
    });

    const result = await newGame.save();
    await result.populate('players.userData', "username picture");
    if (!result) throw new CustomError(23);

    if (result.status === EGameStatus.CHALLENGE) {
      matchMaker.presence.publish('newGamePresence', {
        game: result,
        userIds: [userId, opponentId]
      });
    }
    return result;
  },

  async addPlayerTwo(gameLookingForPlayers: HydratedDocument<IGame>, faction: EFaction, userId: Types.ObjectId): Promise<HydratedDocument<IGame> | null> {
    gameLookingForPlayers.players.push({
      userData: userId,
      faction
    });
    gameLookingForPlayers.previousTurn.push({});

    // Create the player decks
    gameLookingForPlayers.players.forEach((player, index) => {
      const playerFaction = createNewGameFactionState(player.userData.toString(), player.faction!);

      if (index === 1) {
        playerFaction.unitsInDeck.forEach(unit => unit.belongsTo = 2);
        playerFaction.unitsInHand.forEach(unit => unit.belongsTo = 2);

        gameLookingForPlayers.previousTurn[0].player2 = {
          playerId: userId,
          factionData: { ...playerFaction }
        };
      } else {
        gameLookingForPlayers.previousTurn[0].player1 = {
          playerId: userId,
          factionData: { ...playerFaction }
        };
      }
    });

    gameLookingForPlayers.previousTurn[0].boardState = createNewGameBoardState();

    gameLookingForPlayers.status = EGameStatus.PLAYING;

    // Randomly select the starting player
    const playerIds = gameLookingForPlayers.players.map((player: IPlayerData) => player.userData._id);
    gameLookingForPlayers.activePlayer = Math.random() > 0.5 ? playerIds[0] : playerIds[1];

    // Add date for display order in FE
    gameLookingForPlayers.lastPlayedAt = new Date(); // TODO: need to send this with every turn

    await gameLookingForPlayers.save();
    const game = await gameLookingForPlayers.populate('players.userData', "username picture");

    return game;
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

  async deleteGame(userId: string, gameId: string): Promise<string[]> {
    const gameObjectId = new Types.ObjectId(gameId);
    const userObjectId = new Types.ObjectId(userId);

    const game: IGame | null = await Game.findOne({
      _id: gameObjectId,
      players: { $elemMatch: { userData: { $eq: userObjectId } } },
      $or: [
        { status: EGameStatus.SEARCHING },
        { status: EGameStatus.CHALLENGE }
      ]
    });

    if (!game) throw new CustomError(24);
    const deletedGame = await Game.findByIdAndDelete(game._id);
    if (!deletedGame) throw new CustomError(24); // REVIEW

    const result = deletedGame.players.map(player => { return player.userData.toString() ;});
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
