import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import passport from "passport";

import { googleStrategy, localStrategy } from "./auth/passport";
import { setSession } from "./auth/sessions";
import { PORT } from './config';
import userRouter from './controllers/userController';
import { databaseConnection } from "./db";

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

  app.use((req, _res, next) => { // TODO: logging purposes. To be removed
    console.log('SESSION => ', req.session);
    console.log('USER => ', req.user);
    next();
  });

  app.use('/users', userRouter);
  app.get("/", (_req: Request, res: Response) => {
    console.log(_req.session);
    res.send("Express + TypeScript Server :)");
  });

  // TODO: add error handler mw here

  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
};

index();
