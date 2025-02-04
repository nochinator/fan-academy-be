import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import GameService from "../services/gameService";

const router = Router();

// Get user's ongoing games
router.get('/playing', isAuthenticated, async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
  return GameService.getCurrentGames(req, res);
});

// Get games looking for players
router.get('/open', isAuthenticated, async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
  return GameService.getOpenGames(res);
}); // REVIEW: not used at the moment (data included in /playing)

// Get the oldest game looking for a player, if any
router.get('/matchmaking', isAuthenticated, async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
  const playerId = req.query.userId?.toString();

  if (!playerId) return res.sendStatus(400);

  const response = GameService.matchmaking(playerId);
  return res.send(response);
});

// Get a specific game
router.get('/get', isAuthenticated, async (req: Request, res: Response): Promise<Response> => {
  return GameService.getGame(req, res);
});

// Send turn for a game
// router.post('/:id/new-turn', isAuthenticated, async (req: Request, res: Response): Promise<Response> => {
//   // TODO: create a isAuthorized MW to check if a user can send moves / concede / cancel games
//   return GameService.sendTurn(req, res);
// });

// Create a new game
router.post('/new-game', isAuthenticated, async(req: Request, res: Response): Promise<Response> => {
  const userId = req.query.userId?.toString();
  const factionName = req.query.faction?.toString();

  if (!userId || !factionName) return res.sendStatus(400);

  const result = await GameService.createGame({
    userId,
    factionName
  });

  return res.send(result);
});

// Terminate a game - used for both conceding a game or cancelling a game searching for players
// router.post('/:id/terminate', isAuthenticated,  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   // TODO: create a isAuthorized MW to check if a user can send moves / concede / cancel games
//   const { reason } = req.body;
//   if (reason == EGameTermination.CANCELED) {
//     await GameService.deleteGame(req, res);
//   };
//   if (reason == EGameTermination.CONCEDED) {
//     await GameService.endGame(req, res, next);
//   }
// });

export default router;