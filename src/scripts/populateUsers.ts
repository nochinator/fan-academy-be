import mongoose from "mongoose";
import User from "../models/userModel";
import { faker } from '@faker-js/faker';
import * as config from '../config';
import { hash } from "bcrypt";

const createFakeUser = (password: string) => ({
  username: faker.internet.username({
    firstName: 'U',
    lastName: 'U'
  }),
  email: faker.internet.email(),
  password,
  picture: '/assets/images/profilePics/crystalIcon.jpg',
  preferences: {
    emailNotifications: true,
    sound: true,
    chat: true
  },
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
  const hashedPassword = await hash(config.FAKE_PASSWORD!, 10);
  await mongoose.connect(config.MONGODB_URI!);
  const NUM_USERS = 10;
  await mongoose.connection.dropCollection('users').catch(() => {});
  const users = Array.from({ length: NUM_USERS }, ()=> createFakeUser(hashedPassword));
  await User.insertMany(users);
  console.log(`${NUM_USERS} fake users added.`);
  mongoose.connection.close();
};

seedUsers();
