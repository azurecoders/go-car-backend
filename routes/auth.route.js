import express from "express";
import {
  LoginDriver,
  LoginUser,
  RegisterNewUser,
  ReigsterNewDriver,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", RegisterNewUser);
router.post("/login", LoginUser);

router.post("/driver/register", ReigsterNewDriver);
router.post("/driver/login", LoginDriver);

export default router;
