import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import GameService from "../services/gameService";
import { EGameTermination } from "../enums/game.enums";
// import passport from "passport";
// import UserService from "../services/userService";

const router = Router();

// Get user's ongoing games
router.get('/playing', isAuthenticated, async (req: Request, res: Response, _next: NextFunction) => {
  return GameService.getCurrentGames(req, res);
});

// Get games looking for players
router.get('/open', isAuthenticated, async (req: Request, res: Response, _next: NextFunction) => {
  return GameService.getOpenGames(res);
});

// Get a specific game
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  return GameService.getGame(req, res);
});

// Send turn for a game
router.post('/:id/new-turn', isAuthenticated, async (req: Request, res: Response)=> {
  // TODO: create a isAuthorized MW to check if a user can send moves / concede / cancel games
  return GameService.sendTurn(req, res);
});

// Create a new game
router.post('/new-game', async(req: Request, res: Response)=> {
  return await GameService.createGame(req, res); // REVIEW: there is no user related data validation
});

// Terminate a game - used for both conceding a game or cancelling a game searching for players
router.post('/:id/terminate', isAuthenticated,  async (req: Request, res: Response, next: NextFunction)=> {
  // TODO: create a isAuthorized MW to check if a user can send moves / concede / cancel games
  const { reason } = req.body;
  if (reason == EGameTermination.CANCELED) {
    await GameService.deleteGame(req.params.id);
    res.sendStatus(201);
  };
  if (reason == EGameTermination.CONCEDED) {
    await GameService.endGame(req, res, next);
    res.sendStatus(201);
  }
});

export default router;