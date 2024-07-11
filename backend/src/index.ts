import express, { Express, Request, Response } from "express";
import { PORT }  from './utils/config';
import userRouter from './controllers/userController';
import cors from "cors";
import { setSession } from "./utils/sessions";
import { databaseConnection } from "./utils/db";

const index = async () => {
  const app: Express = express();

  // Middleware // TODO: move to its own file
  app.use(express.json());
  app.use(cors());

  const { dbClient, connection } = await databaseConnection();

  app.use(setSession(dbClient));

  app.use('/user', userRouter);

  app.get("/", (_req: Request, res: Response) => {
    console.log(_req.session);
    res.send("Express + TypeScript Server :)");
  });

  // TODO: add error handler mw here

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
};

index();
