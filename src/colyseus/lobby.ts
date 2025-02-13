import { Client, Room } from "colyseus";
import GameService from "../services/gameService";

export class Lobby extends Room{
  onCreate(options: { userId: string }): void {
    this.presence.subscribe('gameUpdatedPresence', async (message: string[]) => {
      console.log('MESSAGE ->', message);

      if (message.includes(options.userId)) {
        console.log('Received subscribed presence message');

        const colyseusGameList = await GameService.getCurrentGames(options.userId);

        this.broadcast('gameListUpdate', colyseusGameList);
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