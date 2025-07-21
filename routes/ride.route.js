import express from "express";
import {
  AcceptRide,
  CheckRideStatus,
  RequestFare,
  RequestRide,
} from "../controllers/ride.controller.js";

const router = express.Router();

router.post("/request", RequestRide);
router.post("/ride-price-proposal", RequestFare);
router.post("/accept-fare-proposal", AcceptRide);
router.get("/check-ride-status", CheckRideStatus);

export default router;
