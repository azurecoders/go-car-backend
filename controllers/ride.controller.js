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
      status: "pending", // pending offers
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
  console.log("Active drivers", activeDrivers);
  console.log("Active users", activeUsers);
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

    console.log(user._id);
    console.log(activeUsers[user._id]);

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

export const AcceptRide = async (req, res, next) => {
  const { rideId, userId, driverId, fare } = req.body;
  console.log("Accept ride", req.body);
  console.log("Active users", activeUsers);
  console.log("Active drivers", activeDrivers);
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(errorHandler(400, "Ride not found"));
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return next(errorHandler(400, "Driver not found"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(400, "User not found"));
    }

    // if (ride.status !== "pending") {
    //   return next(errorHandler(400, "Ride is not pending"));
    // }

    ride.status = "in_progress";
    ride.driver = driverId;
    ride.fare = fare;
    await ride.save();

    driver.isAvailable = false;
    await driver.save();

    res.status(200).json({
      success: true,
      message: "Ride accepted",
      rideRoom: `ride_${rideId}`,
      rideId: rideId,
      pickupLocation: ride.pickup,
      dropoffLocation: ride.dropoff,
      userName: user.name,
      userPhone: user.phone,
      driverName: driver.name,
      driverPhone: driver.phone,
      licensePlate: driver.vehicleInfo.licensePlate,
      fare: fare,
    });

    io.to(activeDrivers[driverId])
      .to(`driver_${driverId}`)
      .emit("ride-accepted", {
        rideRoom: `ride_${rideId}`,
        rideId: rideId,
        pickupLocation: ride.pickup,
        dropoffLocation: ride.dropoff,
        userName: user.name,
        userPhone: user.phone,
        driverName: driver.name,
        driverPhone: driver.phone,
        licensePlate: driver.vehicleInfo.licensePlate,
        fare: fare,
      });
    console.log(
      `Emitted ride-accepted to driver socket: ${activeDrivers[driverId]} and room: driver_${driverId}`
    );
  } catch (error) {
    next(error);
  }
};

export const CheckRideStatus = async (req, res, next) => {
  const { driverId, rideId } = req.query;
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(errorHandler(400, "Ride not found"));
    }

    if (ride.driver?.toString() !== driverId) {
      return next(errorHandler(403, "Driver not assigned to this ride"));
    }

    const user = await User.findById(ride.user);
    const driver = await Driver.findById(ride.driver);

    res.status(200).json({
      success: true,
      status: ride.status,
      rideRoom: `ride_${rideId}`,
      rideId: rideId,
      pickupLocation: ride.pickup,
      dropoffLocation: ride.dropoff,
      userName: user?.name || "Unknown",
      userPhone: user?.phone || "N/A",
      driverName: driver?.name || "Unknown",
      driverPhone: driver?.phone || "N/A",
      licensePlate: driver?.vehicleInfo?.licensePlate || "Unknown",
      fare: ride.fare || 0,
    });
  } catch (error) {
    next(error);
  }
};
