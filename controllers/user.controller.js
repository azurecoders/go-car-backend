import User from "../models/User.model.js";
import { errorHandler } from "../utils/error.js";

export const FetchUserProfile = async (req, res, next) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(errorHandler(400, "User does not exist"));
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    next(errorHandler);
  }
};
