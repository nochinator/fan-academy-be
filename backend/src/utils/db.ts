import mongoose from "mongoose";
import * as config from './config';

mongoose.set('strictQuery', false);

export async function databaseConnection() {
  let dbClient;
  let connection;
  try {
    connection = await mongoose.connect(config.MONGODB_URI!);
    dbClient = mongoose.connection.getClient();
    console.log('connected to MongoDB');
  } catch (error) {
    console.log('error connecting to MongoDB:', error);
  }

  return {
    dbClient,
    connection 
  };
};
