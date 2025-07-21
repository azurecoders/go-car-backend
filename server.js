import express from "express";
import http from "http";
import { Server } from "socket.io";
import Ride from "./models/Ride.model.js";
import Driver from "./models/Driver.model.js";

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

  socket.on("driver-join", ({ driverId }) => {
    activeDrivers[driverId] = socket.id;
    socket.join(`driver_${driverId}`);
    console.log(`Driver ${driverId} registered with socket ${socket.id}`);
  });

  socket.on("user-join", ({ userId }) => {
    activeUsers[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("join-ride-room-server", ({ rideId }) => {
    socket.join(rideId);
    console.log(`Joined ride room: ${rideId}`);
  });

  socket.on("share-driver-location", ({ rideRoom, latitude, longitude }) => {
    console.log(`Driver location for ${rideRoom}:`, latitude, longitude);
    io.to(rideRoom).emit("driver-location-update", {
      latitude,
      longitude,
    });
  });

  socket.on("cancel-ride", async ({ rideId, userId, reason }) => {
    try {
      const ride = await Ride.findById(rideId.replace("ride_", ""));
      if (!ride) {
        console.log(`Ride ${rideId} not found`);
        return;
      }

      ride.status = "cancelled";
      ride.cancelledBy = reason; // Store who cancelled (driver_cancelled or passenger_cancelled)
      await ride.save();

      // If driver cancelled, make them available again
      if (reason === "driver_cancelled" && ride.driver) {
        const driver = await Driver.findById(ride.driver);
        if (driver) {
          driver.isAvailable = true;
          await driver.save();
        }
      }

      // Notify both driver and passenger
      io.to(rideId).emit("ride-cancelled", {
        rideId,
        reason,
        status: "cancelled",
      });
      console.log(
        `Emitted ride-cancelled to room: ${rideId}, reason: ${reason}`
      );
    } catch (error) {
      console.error("Error cancelling ride:", error);
    }
  });

  // Inside io.on("connection", (socket) => {...})
  socket.on("start-ride", async ({ rideId, userId, startTime }) => {
    try {
      const ride = await Ride.findById(rideId.replace("ride_", ""));
      if (!ride) {
        console.log(`Ride ${rideId} not found`);
        return;
      }
      ride.status = "in_progress";
      ride.startTime = new Date(startTime);
      await ride.save();
      io.to(rideId).emit("ride-started", {
        rideId,
        startTime,
        status: "Ride in Progress",
      });
      console.log(`Emitted ride-started to room: ${rideId}`);
    } catch (error) {
      console.error("Error starting ride:", error);
    }
  });

  socket.on("stop-ride", async ({ rideId, userId, endTime, duration }) => {
    try {
      const ride = await Ride.findById(rideId.replace("ride_", ""));
      if (!ride) {
        console.log(`Ride ${rideId} not found`);
        return;
      }
      ride.status = "completed";
      ride.endTime = new Date(endTime);
      ride.duration = duration;
      if (ride.driver) {
        const driver = await Driver.findById(ride.driver);
        if (driver) {
          driver.isAvailable = true;
          await driver.save();
        }
      }
      await ride.save();
      io.to(rideId).emit("ride-stopped", {
        rideId,
        endTime,
        duration,
        status: "Ride Completed",
      });
      console.log(
        `Emitted ride-stopped to room: ${rideId}, duration: ${duration} minutes`
      );
    } catch (error) {
      console.error("Error stopping ride:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (const driverId in activeDrivers) {
      if (activeDrivers[driverId] === socket.id) {
        delete activeDrivers[driverId];
        console.log(`Removed driver ${driverId} from activeDrivers`);
      }
    }
    for (const userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
        console.log(`Removed user ${userId} from activeUsers`);
      }
    }
  });

  socket.on("connect_error", (error) => {
    console.log("Socket connection error:", error.message);
  });
});

export { io, server, app };
