import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
};

export { env };
