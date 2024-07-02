import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import * as config from './utils/config'

const app: Express = express();
const port = config.PORT || 3003;

mongoose.set('strictQuery', false)

const database = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI!);
    console.log('connected to MongoDB');
  } catch (error) {
    console.log('error connecting to MongoDB:', error);
  }
}

database();

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript Server :)")
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});