import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import UserService from "../services/userService";
import { Session } from "express-session";
import { CustomError } from "../classes/customError";
import IUser from "../interfaces/userInterface";

const router = Router();

// GET USERS
router.get('/leaderboard', async (req: Request, res: Response) => {
  const rawPage = parseInt(req.query.page as string) || 1;
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const result = await UserService.getLeaderboard(page);
  res.send(result);
}); // NOTE: removed isAuthenticated // FIXME:

router.get('/find/:id', async (req: Request, res: Response) => {
  return await UserService.getUser(req, res);
}); // NOTE: removed isAuthenticated

router.get('/profile', async (req: Request, res: Response) => {
  return await UserService.getProfile(req, res);
});

// SIGN UP
router.post('/signup', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await UserService.signup(req, res, next);
});

// LOGIN

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: Express.User | false, _info?: { message?: string }): void => {
    try {
      if (err) { throw new CustomError(1); }

      // Manually log in the user
      req.login(user, (loginErr: any) => {
        if (loginErr) { return next(loginErr); }

        res.status(200).json({
          message: "Login successful",
          user
        });
      });
    } catch(err) {
      console.log(err);
      next(err);
    }
  })(req, res, next);
});

// LOGOUT
router.get('/logout', async (req: Request, res: Response): Promise<Response | Session> => {
  return await UserService.logout(req, res);
});

// PROFILE UPDATE
router.post('/update', async (req: Request, res: Response): Promise<Response> => {
  return await UserService.updateProfile(req, res);
});

// ACCOUNT DELETION
router.post('/delete', async (req: Request, res: Response, next: NextFunction): Promise<Session> => {
  const user = req.user as IUser;
  if (!user) throw new CustomError(26);

  await UserService.deleteUser(user, next); // REVIEW:

  return req.session.destroy(err => {
    if (err) {
      next(err);
    } else {
      res.send({ deleted: true });
    }
  });
});

// EMAIL RECOVERY
router.post('/password-reset', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await UserService.passwordReset(req, res, next);
});

// NOTIFICATIONS
router.get('/turn-notification', async(_req: Request, res: Response, next: NextFunction) => {
  return await UserService.turnNotification('66bba04c412d8d4987d52c9b', '123', res, next);
}); // TODO: remove when done testing

export default router;