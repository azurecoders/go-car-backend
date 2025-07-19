import jwt from "jsonwebtoken";
import { env } from "./env.js";
import Admin from "../models/Admin.model.js";

const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return false;
    } else {
      return decoded;
    }
  });
  if (decoded) {
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      const err = new Error("You are not an admin");
      next(err);
    }
    req.user = decoded;
    next();
  } else {
    const err = new Error("Token expired please login again");
    next(err);
  }
};

export { isAdmin };
