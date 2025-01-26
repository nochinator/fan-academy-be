import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import passport from "passport";
import "express-async-errors"; // Error MW patch
import { googleStrategy, localStrategy } from "./middleware/passport";
import { PORT } from './config';
import userRouter from './controllers/userController';
import gameRouter from './controllers/gameController';
import AppErrorHandler from "./middleware/errorHandler";
import IUser from "./interfaces/userInterface";
import http from 'http';
import gameServer from "./colyseus/colyseusServer";
import { sessionMiddleware } from "./middleware/sessions";
import { databaseConnection } from "./db";

declare module "express-session" {
  interface SessionData { passport: { user: string };}
} // TODO: move this to its own file

const index = async () => {
  const app: Express = express();
  const server = http.createServer(app);

  // Middleware // TODO: move to its own file
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  }));

  const dbClient = await databaseConnection();
  app.use(sessionMiddleware(dbClient));
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
    if (user?._id) {
      console.log('AUTH-CHECK - User Id ->', user._id);
      res.send(user._id);
    } else {
      res.sendStatus(401);
    }
  });

  // Routes
  app.use('/users', userRouter);
  app.use('/games', gameRouter);
  app.get("/", (_req: Request, res: Response) => {
    res.send('Welcome to FA');
  }); // TODO: no longer needed as next renders the page directly

  // Attach the Colyseus serverto the HTTP server
  gameServer.attach({ server });
  // gameServer;

  // Error handler
  app.use(AppErrorHandler);

  server.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
};

index();
