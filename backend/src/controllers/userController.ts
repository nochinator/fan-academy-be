import express, { Request, Response } from "express";
import User from '../models/userModel';
import IUser from "../interfaces/userInterface";
import UserService from "../services/userService";

const router = express.Router();

router.post('/login', (_req: Request, res: Response) => {
  res.send('Login details sent');
});

router.post('/signup', async (req: Request, res: Response) => {
  const { username, email } = req.body;

  const userAlreadyExists: IUser[] = await User.find({ $or: [ { username }, { email }] });

  if (userAlreadyExists.length) {
    res.send('An account for this username or email already exists');
    return;
  }

  const result = await UserService.signup(req.body);
  res.send(result);

  // TODO: send confirmation email
});

export default router;