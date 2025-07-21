import Admin from "../models/Admin.model.js";
import Driver from "../models/Driver.model.js";
import Rent from "../models/Rent.model.js";
import Ride from "../models/Ride.model.js";
import User from "../models/User.model.js";
import Verification from "../models/Verification.model.js";
import { env } from "../utils/env.js";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const FetchAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    if (!users || users.length === 0) {
      return next(errorHandler(400, "No users found"));
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const FetchAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({});
    if (!drivers || drivers.length === 0) {
      return next(errorHandler(400, "No users found"));
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      drivers,
    });
  } catch (error) {
    next(error);
  }
};

export const FetchAllRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({}).populate("user").populate("driver");
    if (!rides || rides.length === 0) {
      return next(errorHandler(400, "No users found"));
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      rides,
    });
  } catch (error) {
    next(error);
  }
};

export const FetchAllRent = async (req, res, next) => {
  try {
    const rents = await Rent.find({}).populate("user");
    if (!rents || rents.length === 0) {
      return next(errorHandler(400, "No rentals found"));
    }

    res.status(200).json({
      success: true,
      message: "All rentals fetched successfully",
      rents,
    });
  } catch (error) {
    next(error);
  }
};

export const DeleteRent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateRentStatus = await Rent.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "inactive",
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Rent deleted successfully",
      updateRentStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const FetchAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find({});
    if (!admins || admins.length === 0) {
      return next(errorHandler(400, "No users found"));
    }

    res.status(200).json({
      success: true,
      message: "All admins fetched successfully",
      admins,
    });
  } catch (error) {
    next(error);
  }
};

export const CreateNewAdmin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return next(errorHandler(400, "Admin already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ email, password: hashedPassword });
    res.status(200).json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const FetchAllVerifications = async (req, res, next) => {
  try {
    const verifications = await Verification.find({}).populate("user");
    if (!verifications || verifications.length === 0) {
      return next(errorHandler(400, "No users found"));
    }

    res.status(200).json({
      success: true,
      message: "All verifications fetched successfully",
      verifications,
    });
  } catch (error) {
    next(error);
  }
};

export const UpdateVerificationStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const fetchVerification = await Verification.findById(id);
    if (!fetchVerification) {
      return next(errorHandler(400, "Verification not found"));
    }

    await User.findByIdAndUpdate(
      fetchVerification.user,
      {
        $set: {
          isStudent: status,
        },
      },
      { new: true }
    );

    fetchVerification.status = status ? "approved" : "pending";
    await fetchVerification.save();

    res.status(200).json({
      success: true,
      message: "Verification status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const AdminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const adminExists = await Admin.findOne({ email });

    if (!adminExists) {
      return next(errorHandler(400, "Admin does not exist"));
    }

    const comparePassword = await bcrypt.compare(
      password,
      adminExists.password
    );

    if (!comparePassword) {
      return next(errorHandler(400, "Invalid credentials"));
    }

    const token = jwt.sign(
      {
        id: adminExists._id,
        email: adminExists.email,
        name: adminExists.name,
        role: "admin",
      },
      env.JWT_SECRET,
      {
        expiresIn: "365d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
};
