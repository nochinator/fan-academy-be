import { Client, Room } from "@colyseus/core";
import { ObjectId, Types } from "mongoose";
import { EFaction } from "../enums/game.enums";
import IGame, { IGameState } from "../interfaces/gameInterface";
import GameService from "../services/gameService";
import { CustomError } from "../classes/customError";

export class Lobby extends Room {
  connectedClients: Set<Client> = new Set();

  // REVIEW: I'm using joinOrCreate in the FE, but have no requestJoin in the BE

  onJoin(client: Client, options: { userId: string }) {
    (client as any).userId = options.userId; // TypeScript workaround
    this.connectedClients.add(client);
    console.log(`[Lobby ${this.roomId}] Client joined: ${(client as any).userId}`);
    this.logConnectedClients();
  }

  onCreate(_options: { userId: string }): void {
    this.autoDispose = true;

    // Updating an existing game
    this.presence.subscribe('gameUpdatedPresence', (message: {
      gameId: ObjectId
      previousTurn: IGameState[],
      newActivePlayer: string,
      userIds: string[],
      turnNumber: number
    }) => {
      console.log(`[Lobby ${this.roomId}] Received subscribed gameUpdatedPresence message`);
      this.logConnectedClients();

      const clientsToExclude: Client[] = [];
      this.connectedClients.forEach(client => {
        if (!message.userIds.includes((client as any).userId)) clientsToExclude.push(client);
      });

      this.broadcast('gameListUpdate', message, { except: clientsToExclude });
    });

    // Updating with a new game (2 players) // REVIEW: Also using this for direct challenges
    this.presence.subscribe('newGamePresence', (message: {
      game: IGame,
      userIds: string[]
    }) => {
      // console.log('MESSAGE ->', message);
      console.log(`[Lobby ${this.roomId}] Received subscribed newGamePresence message`);
      this.logConnectedClients();

      const clientsToExclude: Client[] = [];
      this.connectedClients.forEach(client => {
        if (!message.userIds.includes((client as any).userId)) clientsToExclude.push(client);
      });

      this.broadcast('newGameListUpdate', message, { except: clientsToExclude });
    });

    // Updating on a game ending
    this.presence.subscribe('gameOverPresence', (message: {
      gameId: ObjectId,
      userIds: string[]
    }) => {
      // console.log('MESSAGE ->', message);
      console.log(`[Lobby ${this.roomId}] Received subscribed gameOverPresence message`);

      const clientsToExclude: Client[] = [];
      this.connectedClients.forEach(client => {
        if (!message.userIds.includes((client as any).userId)) clientsToExclude.push(client);
      });

      this.broadcast('gameOverUpdate', message, { except: clientsToExclude });
    });

    // Deleting a challenge
    this.presence.subscribe('gameDeletedPresence', (message: {
      gameId: ObjectId,
      userIds: string[]
    }) => {
      // console.log('MESSAGE ->', message);
      console.log(`[Lobby ${this.roomId}] Received subscribed gameDeletedPresence message`);

      const clientsToExclude: Client[] = [];
      this.connectedClients.forEach(client => {
        if (!message.userIds.includes((client as any).userId)) clientsToExclude.push(client);
      });

      this.broadcast('gameDeletedUpdate', message, { except: clientsToExclude });
    });

    this.onMessage("gameDeletedMessage", async (client: Client, message: {
      userId: string,
      gameId: string
    }) => {
      console.log('gameDeletedMessage logs', message);
      const result = await GameService.deleteGame(message.userId, message.gameId);

      this.presence.publish('gameDeletedPresence', {
        gameId: message.gameId,
        userIds: result
      });
    });

    this.onMessage("challengeAcceptedMessage", async (client: Client, message: {
      userId: string,
      gameId: string,
      faction: EFaction
    }) => {
      console.log('challengeAcceptedMessage logs', message);
      const userId = message.userId ;
      const gameId = message.gameId;
      const faction = message.faction as EFaction;

      if (!userId) throw new CustomError(23);
      const userObjectId = new Types.ObjectId(userId);

      const game = await GameService.getGame(userId, gameId);
      if (!game) throw new CustomError(24);

      const result = await GameService.addPlayerTwo(game, faction as EFaction, userObjectId);

      const userIds = result?.players.map(player => { return player.userData._id.toString();});
      this.presence.publish('newGamePresence', {
        game: result,
        userIds
      });
    });
  };

  // Handle client leaving
  onLeave(client: Client, _consented: boolean): void {
    this.connectedClients.delete((client as any).userId);
    console.log(`[Lobby ${this.roomId}] Client left: ${(client as any).userId}`);
    this.logConnectedClients();
  }

  // Handle lobby disposal
  onDispose(): void {
    console.log("[Lobby] Room disposed", this.roomId);
  }

  logConnectedClients() {
    const clients = Array.from(this.connectedClients).map(client => { return (client as any).userId; });

    console.log(`[Lobby ${this.roomId}] Connected clients: ${clients}`);
  }
}