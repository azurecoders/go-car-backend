import express from "express";
import { isAuthenticated } from "../utils/decodeToken.js";
import { FetchUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", isAuthenticated, FetchUserProfile);

export default router;
