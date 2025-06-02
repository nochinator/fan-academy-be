import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import GameService from "../services/gameService";

const router = Router();

// Get user's ongoing games
router.get('/playing', isAuthenticated, async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
  const userId = req.query.userId?.toString();

  // TODO: throw error if no user Id

  const response = await GameService.getCurrentGames(userId!);

  return res.send(response);
});

// Get games looking for players
router.get('/open', isAuthenticated, async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
  return GameService.getOpenGames(res);
}); // REVIEW: not used at the moment (data included in /playing)

// Get the oldest game looking for a player, if any
router.get('/matchmaking', isAuthenticated, async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
  const playerId = req.query.userId?.toString();

  if (!playerId) return res.sendStatus(400);

  const response = await GameService.matchmaking(playerId);
  return res.send(response);
});

// Get a specific game
router.get('/get', isAuthenticated, async (req: Request, res: Response): Promise<Response> => {
  return GameService.getGame(req, res);
});

// Terminate a game - used for both conceding a game or cancelling a game searching for players
router.post('/delete', isAuthenticated,  async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
  // TODO: create a isAuthorized MW to check if a user can send moves / concede / cancel games
  const userId = req.query.userId?.toString();
  const gameId = req.query.gameId?.toString();

  const response = await GameService.deleteGame(userId, gameId);
  return res.send(response);
});

export default router;