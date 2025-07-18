import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
  isStudent: {
    type: Boolean,
    required: true,
    default: false,
  },
  role: {
    type: String,
    enum: ["user"],
    default: "user",
  },
  studentIdDocument: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
