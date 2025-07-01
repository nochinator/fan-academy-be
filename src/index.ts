import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import "express-async-errors"; // Error MW patch
import http from 'http';
import passport from "passport";
import { GameRoom } from "./colyseus/gameRoom";
import { Lobby } from "./colyseus/lobby";
import gameRouter from './controllers/gameController';
import userRouter from './controllers/userController';
import { databaseConnection } from "./db";
import IUser from "./interfaces/userInterface";
import AppErrorHandler from "./middleware/errorHandler";
import { localStrategy } from "./middleware/passport";
import { sessionMiddleware } from "./middleware/sessions";
import { sanitizeInput } from "./middleware/sanitizeInput";

declare module "express-session" {
  interface SessionData { passport: { user: string };}
}

const index = async () => {
  console.log('SECRET', process.env.secret);
  const app: Express = express();
  const server = http.createServer(app);

  const colyseusServer = new Server({  transport: new WebSocketTransport() });
  colyseusServer.attach({
    transport: new WebSocketTransport({
      server,
      maxPayload: 1024 * 1024 * 1
    })
  });

  // Define lobby room for real time game updates
  colyseusServer.define('lobby', Lobby);

  // Define a room for the game
  colyseusServer.define('game_room', GameRoom);

  // Middleware
  app.use(express.json());
  app.use(sanitizeInput);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors({
    origin: [process.env.LOCALHOST_BE!, process.env.LOCALHOST_FE!, process.env.FE_URL!],
    credentials: true
  }));

  const dbClient = await databaseConnection();

  app.use(sessionMiddleware(dbClient));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(localStrategy);

  app.get('/auth-check', async (req: Request, res: Response) => {
    const user = req.user as IUser;
    if (user?._id) {
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
  });

  // Error handler
  app.use(AppErrorHandler);

  server.listen(process.env.PORT || '3003', () => {
    console.log(`[server]: Server is running`);
  });
};

index();
