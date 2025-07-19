import express from "express";
import { CreateNewVerification } from "../controllers/verification.controller.js";

const router = express.Router();

router.post("/", CreateNewVerification);

export default router;
