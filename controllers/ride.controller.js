import Driver from "../models/Driver.model.js";
import Ride from "../models/Ride.model.js";
import { activeDrivers, activeUsers, io } from "../server.js";
import { errorHandler } from "../utils/error.js";

export const RequestRide = async (req, res, next) => {
  const { userId, pickup, dropoff, vehicleType } = req.body;
  console.log(req.body);

  console.log("activeUsers", activeUsers);
  console.log("activeDrivers", activeDrivers);

  try {
    const driver = await Driver.findOne({
      isAvailable: true,
      vehicleType,
    });

    if (!driver) {
      const userSocketId = activeUsers[userId];
      if (userSocketId) {
        io.emit("no-drivers-available", "No drivers available right now");
        io.to(userSocketId).emit("ride-request", "No driver available");
      }
      return next(errorHandler(400, "No drivers available right now"));
    }

    const ride = await Ride.create({
      user: userId,
      driver: driver._id,
      pickup: {
        lat: pickup.latitude,
        lng: pickup.longitude,
      },
      dropoff: {
        lat: dropoff.latitude,
        lng: dropoff.longitude,
      },
      vehicleType,
      status: "requested",
      fare: 0,
    });

    // 3️⃣ Mark driver unavailable
    driver.isAvailable = false;
    await driver.save();

    const driverSocketId = activeDrivers[driver._id];
    console.log("driverSocketId", driverSocketId);
    io.emit("new-ride", {
      rideId: ride._id,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      userId: userId,
    });
    if (driverSocketId) {
      io.to(driverSocketId).emit("new-ride", {
        rideId: ride._id,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        userId: userId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Ride created and driver notified",
      ride,
    });
  } catch (error) {
    next(error);
  }
};
