import express, { Request, Response } from "express";
import UserService from "../services/userService";

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  const result = await UserService.login(req.body);
  res.send(result);
});

router.post('/signup', async (req: Request, res: Response) => {
  const result = await UserService.signup(req.body);
  res.send(result);
});

router.post('/logout', async (req: Request, res: Response) => {
  const result = await UserService.logout(req, res);
  res.send(result);
});

export default router;