import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    pickup: {
      lat: Number,
      lng: Number,
      address: String,
    },
    dropoff: {
      lat: Number,
      lng: Number,
      address: String,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ["bike", "car"],
    },
    status: {
      type: String,
      required: true,
      enum: [
        "requested",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "pending",
      ],
    },
    cancelledBy: {
      type: String,
      enum: ["driver_cancelled", "passenger_cancelled"],
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    distance: {
      type: Number,
      default: 0,
    },
    fare: {
      type: Number,
      required: true,
      default: 0,
    },
    femaleDriverOnly: {
      type: Boolean,
      default: false,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
