import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import * as config from './utils/config';
import userRouter from './controllers/userController';
import cors from "cors";

const app: Express = express();

// Middleware // TODO: move to its own file
app.use(express.json());
app.use(cors());

const port = config.PORT || 3003;

mongoose.set('strictQuery', false);
const database = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI!);
    console.log('connected to MongoDB');
  } catch (error) {
    console.log('error connecting to MongoDB:', error);
  }
};

database();

app.use('/user', userRouter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript Server :)");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});