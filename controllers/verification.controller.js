import Verification from "../models/Verification.model.js";
import { errorHandler } from "../utils/error.js";

export const CreateNewVerification = async (req, res, next) => {
  const { userId, docsUrl } = req.body;
  try {
    const verificationExist = await Verification.findOne({
      user: userId,
      status: "pending",
    });

    if (verificationExist) {
      return next(
        errorHandler(
          400,
          "You have already submitted a verification request. Please wait for it to be processed."
        )
      );
    }

    const verification = await Verification.create({ user: userId, docsUrl });

    if (!verification) {
      return next(errorHandler(400, "Failed to create the verification"));
    }

    res.status(200).json({
      success: true,
      message: "Verification created successfully",
      verification,
    });
  } catch (error) {
    next(error);
  }
};
