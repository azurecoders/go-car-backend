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
    const rents = await Rent.find({}).populate("user", "name email phone");
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
    const rent = await Rent.findById(id).populate("user", "name email phone");
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
  try {
    const deletedRent = await Rent.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Rent deleted successfully",
      deletedRent,
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
