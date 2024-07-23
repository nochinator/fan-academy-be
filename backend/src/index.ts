import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import passport from "passport";

import userRouter from './controllers/userController';
import { PORT } from './utils/config';
import { databaseConnection } from "./utils/db";
import { localStrategy } from "./utils/passport";
import { setSession } from "./utils/sessions";

const index = async () => {
  const app: Express = express();

  // Middleware // TODO: move to its own file
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  const { dbClient } = await databaseConnection();

  app.use(setSession(dbClient));
  app.use(passport.initialize()); // deprecated?
  app.use(passport.session());
  passport.use(localStrategy);

  // Augment express-session with a custom SessionData object

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
