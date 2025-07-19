import express from "express";
import { RequestFare, RequestRide } from "../controllers/ride.controller.js";

const router = express.Router();

router.post("/request", RequestRide);
router.post("/ride-price-proposal", RequestFare);

export default router;
