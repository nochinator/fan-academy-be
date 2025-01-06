import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { isAuthenticated } from "../middleware/isAuthenticated";
import UserService from "../services/userService";
import { Session } from "express-session";
import { CustomError } from "../classes/customError";

const router = Router();

// SIGN UP
router.get('/signup', async (_req: Request, res: Response) => {
  const form = `<div class="signup-container">
        <h2>Signup</h2>
        <form action="/users/signup" method="POST">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>

            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>

            <button type="submit">Signup</button>
        </form>
    </div>`;

  res.send(form);
});

router.post('/signup', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await UserService.signup(req, res, next);
});

// LOGIN
router.get('/login', async (_req: Request, res: Response) => {
  const form = `<div class="login-container">
        <h2>Login</h2>
        <form action="/users/login" method="POST">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>

            <button type="submit">Login</button>
        </form>
    </div>`;

  res.send(form);
});

router.get('/login/google',
  passport.authenticate('google', {
    failureRedirect: '/users/login',
    scope: [ 'email', 'profile' ]
  }));

router.get('/login/google/callback',
  passport.authenticate('google', {
    successRedirect: '/users/all',
    failureRedirect: '/users/login'
  }));

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
router.post('/:id/update', async (req: Request, res: Response): Promise<Response> => {
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
router.get('/password-reset', async (_req: Request, res: Response) => {
  const form = `<div class="password-reset-container">
  <h2>Password recovery</h2>
  <form action="/users/password-reset" method="POST">
      <label for="email">Email:</label>
      <input type="text" id="email" name="email" required>

      <button type="submit">Send email</button>
  </form>
</div>`;

  res.send(form);
});

router.post('/password-reset', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await UserService.passwordReset(req, res, next);
});

// PROTECTED ROUTE
// TODO: add isAuthenticated to the other routes to protect them
router.get('/all', isAuthenticated, async (req: Request, res: Response) => {
  const result = await UserService.getUsers();
  res.send(result);
});

// NOTIFICATIONS
router.get('/turn-notification', async(_req: Request, res: Response, next: NextFunction) => {
  return await UserService.turnNotification('66bba04c412d8d4987d52c9b', '123', res, next);
}); // TODO: remove when done testing

router.get('/game-end-notification', async(req: Request, res: Response, next: NextFunction) => {
  return await UserService.gameEndNotification(req.body.gameId, res, next);
}); // TODO: remove when done testing

export default router;