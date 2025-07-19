import Driver from "../models/Driver.model.js";
import Ride from "../models/Ride.model.js";
import User from "../models/User.model.js";
import { activeDrivers, activeUsers, io } from "../server.js";
import { errorHandler } from "../utils/error.js";

export const RequestRide = async (req, res, next) => {
  const { userId, pickup, dropoff, vehicleType } = req.body;

  try {
    const drivers = await Driver.find({
      isAvailable: true,
      "vehicleInfo.vehicleType": vehicleType,
    });

    const userIdExist = await User.findById(userId);

    if (!userIdExist) {
      return next(errorHandler(400, "User not found"));
    }

    if (!drivers.length) {
      const userSocketId = activeUsers[userId];
      if (userSocketId) {
        io.to(userSocketId).emit(
          "no-drivers-available",
          "No drivers available right now"
        );
      }
      return next(errorHandler(400, "No drivers available right now"));
    }

    // ✅ Create a ride without a driver yet
    const ride = new Ride({
      user: userId,
      pickup: {
        lat: pickup.latitude,
        lng: pickup.longitude,
      },
      dropoff: {
        lat: dropoff.latitude,
        lng: dropoff.longitude,
      },
      vehicleType,
      status: "in_progress", // pending offers
      fare: 0,
    });

    await ride.save();

    // ✅ Notify all matching drivers
    drivers.forEach((driver) => {
      const driverSocketId = activeDrivers[driver._id];
      if (driverSocketId) {
        console.log({
          rideId: ride._id,
          driverId: driver._id,
          pickupLocation: ride.pickup,
          dropoffLocation: ride.dropoff,
          userName: userIdExist.name,
          userPhone: userIdExist.phone,
        });
        io.to(driverSocketId).emit("ride-request", {
          rideId: ride._id,
          driverId: driver._id,
          pickupLocation: ride.pickup,
          dropoffLocation: ride.dropoff,
          userName: userIdExist.name,
          userPhone: userIdExist.phone,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Ride request sent to drivers",
      rideId: ride._id,
    });
  } catch (error) {
    next(error);
  }
};

// export const RequestFare = async (req,res,next) => {
//   const {}
// }
