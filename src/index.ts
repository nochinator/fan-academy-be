import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import passport from "passport";
import "express-async-errors"; // Error MW patch
import { googleStrategy, localStrategy } from "./auth/passport";
import { setSession } from "./auth/sessions";
import { PORT } from './config';
import userRouter from './controllers/userController';
import gameRouter from './controllers/gameController';
import { databaseConnection } from "./db";
import AppErrorHandler from "./middleware/errorHandler";
import IUser from "./interfaces/userInterface";

const index = async () => {
  const app: Express = express();

  // Middleware // TODO: move to its own file
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  const { dbClient } = await databaseConnection();

  app.use(setSession(dbClient));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(localStrategy);
  passport.use(googleStrategy);

  app.use((req: Request, _res: Response, next: NextFunction) => { // TODO: logging purposes. To be removed
    console.log('SESSION => ', req.session);
    console.log('USER => ', req.user);
    next();
  });

  app.get('/auth-check', async (req: Request, res: Response) => {
    const user = req.user as IUser;
    if (user._id) {
      console.log('AUTH-CHECK - User Id ->', user._id);
      res.send({ userId: user._id });
    } else {
      res.sendStatus(401);
    }
  });

  app.use('/users', userRouter);
  app.use('/games', gameRouter);
  app.get("/", (_req: Request, res: Response) => {
    res.send('Welcome to FA');
  }); // TODO: no longer needed as next renders the page directly

  app.use(AppErrorHandler);

  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
};

index();
