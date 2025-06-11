import { Client, Room } from "@colyseus/core";
import { ObjectId } from "mongoose";
import IGame, { IGameState } from "../interfaces/gameInterface";

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