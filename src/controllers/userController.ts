import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { CustomError } from "../classes/customError";
import IUser from "../interfaces/userInterface";
import { generateToken, isAuthenticated } from "../middleware/jwt";
import UserService from "../services/userService";

const router = Router();

// GET USERS
router.get('/leaderboard', isAuthenticated, async (req: Request, res: Response) => {
  const rawPage = parseInt(req.query.page as string) || 1;
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const result = await UserService.getLeaderboard(page);
  res.send(result);
});

router.get('/profile', isAuthenticated, async (req: Request, res: Response) => {
  return await UserService.getProfile(req, res);
});

// SIGN UP
router.post('/signup', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await UserService.signup(req, res, next);
});

// LOGIN
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", { session: false }, (err: any, user: Express.User | false, _info?: { message?: string }) => {
    if (err || !user) {
      return res.status(401).json({ error: "Invalid login" });
    }

    console.log('USER', user);

    try {
      const typedUser = user as IUser;
      const token = generateToken({
        _id: typedUser._id.toString(),
        username: typedUser.username
      });

      res.send({
        token,
        userId: typedUser._id
      });
    } catch (err) {
      console.error("Token generation error:", err);
      return next(err);
    }
  })(req, res, next);
});

// PROFILE UPDATE
router.post('/update', isAuthenticated, async (req: Request, res: Response): Promise<Response> => {
  return await UserService.updateProfile(req, res);
});

// ACCOUNT DELETION
router.post('/delete', isAuthenticated, async (req: Request, res: Response, next: NextFunction): Promise<boolean> => {
  const user = req.user as IUser;
  if (!user) throw new CustomError(26);

  await UserService.deleteUser(user, next);

  return true;
});

export default router;