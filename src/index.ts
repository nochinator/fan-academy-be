import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import passport from "passport";
import "express-async-errors"; // Error MW patch
import { googleStrategy, localStrategy } from "./auth/passport";
import { PORT, SECRET } from './config';
import userRouter from './controllers/userController';
import gameRouter from './controllers/gameController';
import { databaseConnection } from "./db";
import AppErrorHandler from "./middleware/errorHandler";
import IUser from "./interfaces/userInterface";
import http from 'http';
import session from "express-session";
import MongoStore from "connect-mongo";
import { socketIo } from "./middleware/websockets";

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
    origin: 'http://localhost:3000',
    credentials: true
  }));

  const { dbClient } = await databaseConnection();

  const sessionMiddleware: express.RequestHandler = session( {
    secret: SECRET!,
    store: MongoStore.create({
      client: dbClient,
      touchAfter: 300 // Time in seconds
    }),
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      expires: new Date(+new Date + 1000 * 60 * 60 * 24)
    }
  });

  app.use(sessionMiddleware);
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
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  });

  // Setting websockets
  socketIo(server, sessionMiddleware);

  // Routes
  app.use('/users', userRouter);
  app.use('/games', gameRouter);
  app.get("/", (_req: Request, res: Response) => {
    res.send('Welcome to FA');
  }); // TODO: no longer needed as next renders the page directly

  // Error handler
  app.use(AppErrorHandler);

  server.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
};

index();
