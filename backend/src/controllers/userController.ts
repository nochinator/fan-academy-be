import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import UserService from "../services/userService";

const router = express.Router();

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

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  return await UserService.signup(req, res, next);
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

router.post('/login', passport.authenticate('local', {
  successRedirect: '/users/all',
  failureRedirect: '/users/login',
  failureMessage: 'Error 4'
}));

// LOGOUT
router.get('/logout', async (req: Request, res: Response) => {
  return await UserService.logout(req, res);
});

// EMAIL RECOVERY
router.get('/password-reset', async (_req: Request, res: Response) => {
  const form = `<div class="password-reset-container">
  <h2>Password recovery</h2>
  <form action="/users/password-reset" method="POST">
      <label for="email">Email:</label>
      <input type="text" id="email" name="email" required>

      <button type="submit">Login</button>
  </form>
</div>`;

  res.send(form);
});

router.post('/password-reset', async (req: Request, res: Response) => {
  await UserService.passwordReset(req, res);
});

// PROTECTED ROUTE
router.get('/all', async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const result = await UserService.getUsers();
    res.send(result);
  } else {
    res.send('Error, you are not authenticated');
  }
});

// NOTIFICATIONS
router.get('/turn-notification', async(_req: Request, res: Response, next: NextFunction) => {
  return await UserService.turnNotification('66bba04c412d8d4987d52c9b', '123', res, next);
}); // TODO: remove when done testing

export default router;