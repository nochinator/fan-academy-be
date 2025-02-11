import { Client, Room } from "colyseus";
import GameService from "../services/gameService";
import { Types } from "mongoose";

export class Lobby extends Room{
  onCreate(options: { userId: string }): void {
    const userId = new Types.ObjectId(options.userId);
    console.log('onCreateLobbyUserId', options.userId);

    this.presence.subscribe('turnPlayedPresence', async (message: string[]) => {
      if (message.includes(userId.toString())) { // FIXME: need strings to be able to compare them
        console.log('Received subscribed presence message');
        const colyseusGameList = await GameService.getCurrentGames(options.userId);
        this.broadcast('gameListUpdate', { colyseusGameList });
      } else {
        console.log('Subscribed presence error - ids dont match');
      }
    });
  };

  // Handle client leaving
  onLeave(_client: Client, _consented: boolean): void {
    console.log('User disconnected from lobby');
    this.disconnect(); }
}