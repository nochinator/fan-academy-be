import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import UserService from "../services/userService";
import localStrategy from '../utils/passport';

const router = express.Router();

router.post('/login', passport.authenticate('local', localStrategy), async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserService.login(req);
  res.send(result);
});

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserService.signup(req.body);
  res.send(result);
});

router.post('/logout', passport.authenticate('local'), async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserService.logout(req, res);
  res.send(result);
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
});

router.get('/login' );

export default router;