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
    },
    dropoff: {
      lat: Number,
      lng: Number,
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
    fare: {
      type: Number,
      required: true,
      default: 0,
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
