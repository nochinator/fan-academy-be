import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import UserService from "../services/userService";
import { Session } from "express-session";
import { CustomError } from "../classes/customError";

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

// router.get('/me', async (req: Request, res: Response) => {
//   return await UserService.getMe(req, res);
// });

// SIGN UP
router.post('/signup', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await UserService.signup(req, res, next);
});

// LOGIN
router.get('/login/google',
  passport.authenticate('google', {
    failureRedirect: '/users/login',
    scope: [ 'email', 'profile' ]
  }));

router.get('/login/google/callback',
  passport.authenticate('google', {
    successRedirect: '/users/all',
    failureRedirect: '/users/login'
  })); // TODO: Am I using this in the end?

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
router.post('/update/:id', async (req: Request, res: Response): Promise<Response> => {
  return await UserService.updateProfile(req, res);
});

// ACCOUNT DELETION // TODO: add popup asking user to type 'delete' in the FE in order for this to be called
router.get('/delete', async (req: Request, res: Response) => {
  const form = `<div class="delete-container">
  <h2>Delete account</h2>
  <form action="/users/delete" method="POST">
      <label for="userId">UserId:</label>
      <input type="text" id="userId" name="userId" required>

      <button type="submit">Delete</button>
  </form>
</div>`;

  res.send(form);
});

router.post('/delete', async (req: Request, res: Response, next: NextFunction): Promise<Session> => {
  return await UserService.deleteUser(req, res, next);
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