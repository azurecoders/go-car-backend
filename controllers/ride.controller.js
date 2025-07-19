import Driver from "../models/Driver.model.js";
import Ride from "../models/Ride.model.js";
import User from "../models/User.model.js";
import { activeDrivers, activeUsers, io } from "../server.js";
import { errorHandler } from "../utils/error.js";

export const RequestRide = async (req, res, next) => {
  const {
    userId,
    pickup,
    dropoff,
    vehicleType,
    femaleDriverOnly = false,
    fare,
  } = req.body;

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
        address: pickup.address,
      },
      dropoff: {
        lat: dropoff.latitude,
        lng: dropoff.longitude,
        address: dropoff.address,
      },
      vehicleType,
      status: "in_progress", // pending offers
      fare: 0,
      femaleDriverOnly,
    });

    await ride.save();

    // ✅ Notify all matching drivers
    drivers.forEach((driver) => {
      const driverSocketId = activeDrivers[driver._id];
      if (driverSocketId) {
        io.to(driverSocketId).emit("ride-request", {
          proposalId: Math.random().toString(36).substring(2, 9),
          rideId: ride._id,
          driverId: driver._id,
          pickupLocation: ride.pickup,
          dropoffLocation: ride.dropoff,
          userName: userIdExist.name,
          userPhone: userIdExist.phone,
          femaleDriverOnly,
          driverGender: driver.gender,
          fare,
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

export const RequestFare = async (req, res, next) => {
  const { rideId, driverId, fare } = req.body;
  console.log("Req fare", req.body);
  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return next(errorHandler(400, "Ride not found"));
    }

    const user = await User.findById(ride.user);

    if (!user) {
      return next(errorHandler(400, "User not found"));
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return next(errorHandler(400, "Driver not found"));
    }

    if (ride.status !== "in_progress") {
      return next(errorHandler(400, "Ride is not in progress"));
    }

    if (ride.driver) {
      return next(errorHandler(400, "Ride already has a driver"));
    }

    if (ride.fare > 0) {
      return next(errorHandler(400, "Ride already has a fare"));
    }

    io.to(activeUsers[user._id]).emit("fare-proposal", {
      proposalId: Math.random().toString(36).substring(2, 9),
      driverId,
      driverName: driver.name,
      driverPhone: driver.phone,
      vehicleInfo: driver.vehicleInfo.licensePlate,
      rideId,
      proposedFare: fare,
    });

    res.status(200).json({
      success: true,
      message: "Fare proposal sent to User",
    });
  } catch (error) {
    next(error);
  }
};
