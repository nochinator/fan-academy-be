import MongoStore from 'connect-mongo';
import session from 'express-session';
import { MongoClient } from 'mongodb';

export function sessionMiddleware(dbClient: MongoClient | undefined) {
  const maxAge = 1000 * 60 * 60 * 24;
  const expires = new Date(+new Date + maxAge);
  return session( {
    secret: process.env.SECRET!,
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