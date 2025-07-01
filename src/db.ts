import mongoose from "mongoose";

mongoose.set('strictQuery', false);

export async function databaseConnection() {
  let dbClient;
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    dbClient = mongoose.connection.getClient();
    console.log('connected to MongoDB');
  } catch (error) {
    console.log('error connecting to MongoDB:', error);
  }

  return dbClient;
};
