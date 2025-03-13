import { Server } from "socket.io";
import { registerSocket, logOutSocketId, sendMessage, jobApplication, kickUser } from "./Service/socket.service.js";

let io;

export const runIo = (httpServer) => {
  io = new Server(httpServer, { cors: "*" });
  io.on("connection", async (socket) => {
    await registerSocket(socket);
    await sendMessage(socket);
    await jobApplication(socket)
    await kickUser(socket)
    await logOutSocketId(socket);
  });
};

export const getIo = () => io;
