import mongoose from "mongoose";
import User from "../models/userModel";
import { faker } from '@faker-js/faker';
import * as config from '../config';

const createFakeUser = () => ({
  username: faker.internet.username({
    firstName: 'U',
    lastName: 'U'
  }),
  stats: {
    totalGames: faker.number.int({
      min: 10,
      max: 200
    }),
    totalWins: faker.number.int({
      min: 0,
      max: 150
    }),
    councilWins: faker.number.int({
      min: 0,
      max: 80
    }),
    elvesWins: faker.number.int({
      min: 0,
      max: 80
    })
  }
});

const seedUsers = async () => {
  await mongoose.connect(config.MONGODB_URI!);
  const NUM_USERS = 250;
  // await mongoose.connection.dropCollection('users').catch(() => {});
  const users = Array.from({ length: NUM_USERS }, createFakeUser);
  await User.insertMany(users);
  console.log(`${NUM_USERS} fake users added.`);
  mongoose.connection.close();
};

seedUsers();
