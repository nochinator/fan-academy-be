import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import UserService from "../services/userService";

const router = express.Router();

router.post('/login', passport.authenticate('local', {
  successRedirect: '/users/all',
  failureRedirect: '/users/login',
  failureMessage: 'Incorrect username or password'
// }), async (req: Request, res: Response, next: NextFunction) => {
//   const result = await UserService.login(req);
//   res.send(result);
//   next();
}));

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserService.signup(req.body);
  res.send(result);
  next();
});

router.get('/logout', async (req: Request, res: Response, next: NextFunction) => {
  return await UserService.logout(req, res);
  next();
});

router.get('/login', async (_req: Request, res: Response, next: NextFunction) => {
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
  next();
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

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    const result = await UserService.getUsers();
    res.send(result);
  } else {
    res.send('Error, you are not authenticated');
  }
  next();
});

export default router;