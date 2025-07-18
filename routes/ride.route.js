import express from "express";
import { RequestRide } from "../controllers/ride.controller.js";

const router = express.Router();

router.post("/request", RequestRide);

export default router;
