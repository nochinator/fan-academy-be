import bodyParser from "body-parser";
import { createServer } from 'http';
import cors from "cors";
import express, { Express, Request, Response } from "express";
import passport from "passport";
import "express-async-errors"; // Error MW patch
import { googleStrategy, localStrategy } from "./auth/passport";
import { setSession } from "./auth/sessions";
import { PORT } from './config';
import userRouter from './controllers/userController';
import gameRouter from './controllers/gameController';
import { databaseConnection } from "./db";
import AppErrorHandler from "./middleware/errorHandler";
import { Server as SocketIOServer } from "socket.io";

const index = async () => {
  const app: Express = express();
  const server = createServer(app);
  const io = new SocketIOServer(server);

  // Middleware // TODO: move to its own file
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  const { dbClient } = await databaseConnection();

  app.use(setSession(dbClient));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(localStrategy);
  passport.use(googleStrategy);

  // Expose the node_modules folder as static resources (to access socket.io.js in the browser)
  app.use('/static', express.static('../../node_modules'));

  // Handle connection // TODO: move to it's own mw
  io.on('connection', (socket) => {
    console.log("Connected succesfully to the socket ...");

    // Join a room based on URL (/games/:id/chat) // REVIEW: do we move this logic to the games' controller? Actually, this will just part of the the normal :id url, no need for /chat
    socket.on('joinRoom', (room) => {
      socket.join(room);
      io.to(room).emit('userConnected', socket.id);

      // Notify everyone in the room about the user list
      // const clients = io.sockets.adapter.rooms.get(room) || new Set();
      // io.to(room).emit('updateUserList', Array.from(clients));
    });

    // Listen for chat messages and broadcast them to the room
    socket.on('chatMessage', ({ room, message }) => {
      io.to(room).emit('message', {
        id: socket.id,
        message
      });
      // TODO: add chat message to chatlogs collection
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      io.emit('userDisconnected', socket.id);
    });

    // Socket testing TODO: remove alongisde index.html
    const news = [
      {
        title: 'The cure of the Sadness is to play Videogames',
        date: '04.10.2016'
      },
      {
        title: 'Batman saves Racoon City, the Joker is infected once again',
        date: '05.10.2016'
      },
      {
        title: "Deadpool doesn't want to do a third part of the franchise",
        date: '05.10.2016'
      },
      {
        title: 'Quicksilver demand Warner Bros. due to plagiarism with Speedy Gonzales',
        date: '04.10.2016'
      }
    ];

    // Send news on the socket
    socket.emit('news', news);

    socket.on('my other event', (data) => {
      console.log(data);
    });
  });

  app.use((req, _res, next) => { // TODO: logging purposes. To be removed
    console.log('SESSION => ', req.session);
    console.log('USER => ', req.user);
    next();
  });

  app.use('/users', userRouter);
  app.use('/games', gameRouter);
  app.get("/", (_req: Request, res: Response) => {
    res.sendFile(__dirname + '/index.html');
  });

  app.use(AppErrorHandler);

  server.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
};

index();
