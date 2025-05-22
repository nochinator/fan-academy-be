import { Client, Room } from "@colyseus/core";
import { ObjectId } from "mongoose";
import IGame, { IGameState } from "../interfaces/gameInterface";

export class Lobby extends Room {
  onCreate(options: { userId: string }): void {
    this.presence.subscribe('gameUpdatedPresence', (message: {
      gameId: ObjectId
      previousTurn: IGameState[],
      newActivePlayer: string,
      userIds: string[]
    }) => {
      console.log('MESSAGE ->', message);

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
      console.log('MESSAGE ->', message);

      if (message.userIds.includes(options.userId)) {
        console.log('Received subscribed newGamePresence message');
        this.broadcast('newGameListUpdate', message);
      } else {
        console.log('Subscribed presence error - ids dont match');
      }
    });
  };

  // Handle client leaving
  onLeave(_client: Client, _consented: boolean): void {
    console.log('User disconnected from lobby');
    this.disconnect();
  }
}