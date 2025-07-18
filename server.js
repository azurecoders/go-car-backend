import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

export const activeUsers = {}; // userId: socket.id
export const activeDrivers = {}; // driverId: socket.id

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("user-join", ({ userId }) => {
    activeUsers[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // ✅ Driver joins
  socket.on("driver-join", ({ driverId }) => {
    activeDrivers[driverId] = socket.id;
    console.log(`Driver ${driverId} registered with socket ${socket.id}`);
  });

  socket.on("send-location", (data) => {
    console.log("Location received:", data);
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

export { io, server, app };
