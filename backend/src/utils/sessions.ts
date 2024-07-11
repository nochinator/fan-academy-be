import session from 'express-session';
import MongoStore from 'connect-mongo';
import { MongoClient } from 'mongodb';
import { SECRET } from './config';

export function setSession(dbClient: MongoClient | undefined) {
  const maxAge = 1000 * 60 * 60 * 24;
  const expires = new Date(+new Date + maxAge);
  return session( {
    secret: SECRET!,
    store: MongoStore.create({
      client: dbClient,
      touchAfter: 300 // Time in seconds
    }),
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      maxAge,
      expires
    }
  });
}