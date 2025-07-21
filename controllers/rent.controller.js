import Rent from "../models/Rent.model.js";
import { errorHandler } from "../utils/error.js";

export const RentVehicle = async (req, res, next) => {
  const { userId, title, description, price, imageUrl, category, location } =
    req.body;
  try {
    const newRent = await Rent.create({
      user: userId,
      title,
      description,
      price,
      imageUrl,
      category,
      location,
    });

    if (!newRent) {
      return next(errorHandler(400, "Failed to create the rent"));
    }

    res.status(200).json({
      success: true,
      message: "Rent created successfully",
      rent: newRent,
    });
  } catch (error) {
    next(error);
  }
};

export const FetchAllRents = async (req, res, next) => {
  try {
    const rents = await Rent.find({
      status: "active",
    }).populate("user", "name email phone");
    res.status(200).json({
      success: true,
      message: "All rents fetched successfully",
      rents,
    });
  } catch (error) {
    next(error);
  }
};

export const FetchAllUserRents = async (req, res, next) => {
  const { id } = req.params;
  try {
    const rents = await Rent.find({
      user: id,
      status: "active",
    }).populate("user", "name email phone");
    res.status(200).json({
      success: true,
      message: "All rents fetched successfully",
      rents,
    });
  } catch (error) {
    next(error);
  }
};

export const FetchSingleRent = async (req, res, next) => {
  const { id } = req.params;
  try {
    const rent = await Rent.findOne({
      _id: id,
      status: "active",
    }).populate("user", "name email phone");
    res.status(200).json({
      success: true,
      message: "Rent fetched successfully",
      rent,
    });
  } catch (error) {
    next(error);
  }
};

export const DeleteRent = async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  console.log(req.body);
  try {
    const updateRentStatus = await Rent.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "inactive",
          reason,
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

export const UpdateRent = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, price, imageUrl, category, location } = req.body;
  try {
    const updatedRent = await Rent.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          description,
          price,
          imageUrl,
          category,
          location,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Rent updated successfully",
      updatedRent,
    });
  } catch (error) {
    next(error);
  }
};
