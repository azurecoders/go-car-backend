import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  vehicleInfo: {
    vehicleType: String,
    licensePlate: String,
    docsURL: String,
  },
  status: {
    type: String,
    enum: ["online", "offline", "busy"],
    default: "online",
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  role: {
    type: String,
    enum: ["driver"],
    default: "driver",
  },
});

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;
