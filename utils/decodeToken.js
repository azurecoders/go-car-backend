import jwt from "jsonwebtoken";
import { env } from "./env.js";

const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return false;
    } else {
      return decoded;
    }
  });
  if (decoded) {
    req.user = decoded;
    next();
  } else {
    const err = new Error("Token expired please login again");
    next(err);
  }
};

export { isAuthenticated };
