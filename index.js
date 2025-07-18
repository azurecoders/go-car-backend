import express from "express";
import dotenv from "dotenv";
import { env } from "./utils/env.js";
import connectDB from "./config/db.js";
import errorHandlerMiddleware from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import requestRoutes from "./routes/ride.route.js";
import rentRoutes from "./routes/rent.route.js";
import { app, server } from "./server.js";

dotenv.config();

await connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rides", requestRoutes);
app.use("/api/rent", rentRoutes);

const PORT = env.PORT || 8000;

server.listen(PORT, () => console.log("Server is running on port", PORT));

app.use(errorHandlerMiddleware);
