// import { NextFunction, Request, Response } from "express";
// import Game from "../models/gameModel";

// export async function isAuthorized(req: Request, res: Response, next: NextFunction): Promise<void> {
//   // Check if the game exists
//   const game = Game.findById(req.body.gameId);
//   if (!game) { next('isAuthorized error - Game not found');}

//   // Verify that the player is the active player
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     next('Authentication failed');
//   }
// }

/*
TODO: We'll need a function like in the future I guess. To check if the user can send the turn or concede a game or delete a game that's searching for players. Also to check if the user can see their profile
*/
