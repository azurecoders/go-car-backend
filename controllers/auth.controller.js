import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../utils/env.js";
import Driver from "../models/Driver.model.js";
import User from "../models/User.model.js";

export const RegisterNewUser = async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  try {
    const userExists = await User.findOne({ email, phone });

    if (userExists) {
      return next(errorHandler(400, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    if (!newUser) {
      return next(errorHandler(400, "Failed to create the user"));
    }

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: "user",
      },
      env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        isStudent: newUser.isStudent,
        role: "user",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const LoginUser = async (req, res, next) => {
  const { phone, password } = req.body;
  try {
    const userExists = await User.findOne({
      phone,
    });

    if (!userExists) {
      return next(errorHandler(400, "Invalid credentials"));
    }

    const comparePassword = await bcrypt.compare(password, userExists.password);

    if (!comparePassword) {
      return next(errorHandler(400, "Invalid credentials"));
    }

    const token = jwt.sign(
      {
        id: userExists._id,
        email: userExists.email,
        name: userExists.name,
        role: "user",
      },
      env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: userExists._id,
        name: userExists.name,
        email: userExists.email,
        phone: userExists.phone,
        isStudent: userExists.isStudent,
        role: "user",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const ReigsterNewDriver = async (req, res, next) => {
  const { name, email, phone, password, vehicleInfo, gender } = req.body;
  try {
    const driverExists = await Driver.findOne({ email, phone });

    if (driverExists) {
      return next(errorHandler(400, "Driver already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDriver = await Driver.create({
      name,
      email,
      phone,
      password: hashedPassword,
      vehicleInfo,
      gender: gender.toLowerCase(),
      status: "online",
      isAvailable: true,
    });

    if (!newDriver) {
      return next(errorHandler(400, "Failed to create the driver"));
    }

    const token = jwt.sign(
      {
        id: newDriver._id,
        email: newDriver.email,
        name: newDriver.name,
        phone: newDriver.phone,
        vehicleInfo: newDriver.vehicleInfo,
        gender: newDriver.gender,
        role: "driver",
      },
      env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      token,
      user: {
        id: newDriver._id,
        name: newDriver.name,
        email: newDriver.email,
        role: "driver",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const LoginDriver = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const driverExists = await Driver.findOne({
      email,
    });

    if (!driverExists) {
      return next(errorHandler(400, "Driver does not exist"));
    }

    const comparePassword = await bcrypt.compare(
      password,
      driverExists.password
    );

    if (!comparePassword) {
      return next(errorHandler(400, "Invalid credentials"));
    }

    driverExists.isAvailable = true;
    await driverExists.save();

    const token = jwt.sign(
      {
        id: driverExists._id,
        email: driverExists.email,
        name: driverExists.name,
        role: "driver",
      },
      env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Driver logged in successfully",
      token,
      user: {
        id: driverExists._id,
        name: driverExists.name,
        email: driverExists.email,
        phone: driverExists.phone,
        vehicleInfo: driverExists.vehicleInfo,
        gender: driverExists.gender,
        role: "driver",
      },
    });
  } catch (error) {
    next(error);
  }
};
