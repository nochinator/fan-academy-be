import { Server } from "socket.io";
import  express, { Request } from 'express';
import http from 'http';
import User from "../models/userModel";

export const socketIo = (server: http.Server, sessionMiddleware: express.RequestHandler) => {
  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  });

  // Share session data with Socket.IO
  io.engine.use(sessionMiddleware);

  io.on("connection", async (socket) => {
    const request = socket.request as Request;

    if (request?.session?.passport?.user) {
      const userId = request.session.passport.user; // TODO: add typing to remove if statement

      await User.findByIdAndUpdate(userId, { $push: { socketSessions: { socketId: socket.id } } }); // TODO: could add error check

      const onlineUsers = await User.find({ "socketSessions.0": { $exists: true } }).select("username picture");

      console.log('User added to  online users ', onlineUsers);
      io.emit("update-online-users", onlineUsers);
    };

    socket.on("disconnect", async () => {
      if (request?.session?.passport?.user) {
        const userId = request.session.passport.user;
        await User.findByIdAndUpdate(userId, { $pull: { socketSessions: { socketId: socket.id } } }); // TODO: add removing by id

        const onlineUsers = await User.find({ "socketSessions.0": { $exists: true } }).select("username picture");

        console.log('User removed from online users ', onlineUsers);
        io.emit("update-online-users", onlineUsers);
      }
    });
  });
};