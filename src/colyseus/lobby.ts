import { Client, Room } from "@colyseus/core";
import { ObjectId } from "mongoose";
import IGame, { IGameState } from "../interfaces/gameInterface";

export class Lobby extends Room {
  connectedClients: Set<string> = new Set();

  // REVIEW: I'm using joinOrCreate in the FE, but have no requestJoin in the BE

  onJoin(client: Client, options: { userId: string }) {
    (client as any).userId = options.userId; // TypeScript workaround
    this.connectedClients.add((client as any).userId);
    console.log(`[Lobby] Client joined: ${(client as any).userId}`);
    this.logConnectedClients();
  }

  onCreate(options: { userId: string }): void {
    this.presence.subscribe('gameUpdatedPresence', (message: {
      gameId: ObjectId
      previousTurn: IGameState[],
      newActivePlayer: string,
      userIds: string[]
    }) => {
      if (message.userIds.includes(options.userId)) {
        console.log('Received subscribed gameUpdatedPresence message');

        this.broadcast('gameListUpdate', message);
      } else {
        console.log('Subscribed presence error - ids dont match');
      }
    });

    this.presence.subscribe('newGamePresence', (message: {
      game: IGame,
      userIds: string[]
    }) => {
      // console.log('MESSAGE ->', message);

      if (message.userIds.includes(options.userId)) {
        console.log('Received subscribed newGamePresence message');
        this.broadcast('newGameListUpdate', message);
      } else {
        console.log('Subscribed presence error - ids dont match');
      }
    });
  };

  // Handle client leaving
  onLeave(client: Client, _consented: boolean): void {
    this.connectedClients.delete((client as any).userId);
    console.log(`[Lobby] Client left: ${(client as any).userId}`);
    this.logConnectedClients();
  }

  logConnectedClients() {
    console.log(`[Lobby] Connected clients: ${Array.from(this.connectedClients).join(", ")}`);
  }
}