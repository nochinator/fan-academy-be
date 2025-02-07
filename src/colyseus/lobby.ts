import { Client, Room } from "colyseus";
import GameService from "../services/gameService";
import { Types } from "mongoose";

export class Lobby extends Room{
  onInit(_options: any) {}

  onCreate(options: { userId: string }): void {
    const userId = new Types.ObjectId(options.userId);

    this.presence.subscribe('turnPlayedPresence', async (message: { userIds: Types.ObjectId[] }) => {
      if (message.userIds.includes(userId)) {
        const currentGameList = await GameService.getCurrentGames(options.userId);
        this.broadcast('gameListUpdate', { currentGameList });
      }
    });
  };

  // Handle client leaving
  onLeave(_client: Client, _consented: boolean): void {
    this.disconnect(); }
}