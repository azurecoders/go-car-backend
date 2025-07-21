import express from "express";
import {
  DeleteRent,
  FetchAllRents,
  FetchAllUserRents,
  FetchSingleRent,
  RentVehicle,
  UpdateRent,
} from "../controllers/rent.controller.js";

const router = express.Router();

router.post("/", RentVehicle);
router.get("/", FetchAllRents);
router.get("/:id", FetchSingleRent);
router.get("/user/:id", FetchAllUserRents);
router.put("/:id", UpdateRent);
router.post("/delete/:id", DeleteRent);

export default router;
