import express from "express";
import {
  AdminLogin,
  CreateNewAdmin,
  DeleteRent,
  FetchAllAdmins,
  FetchAllDrivers,
  FetchAllRent,
  FetchAllRides,
  FetchAllUsers,
  FetchAllVerifications,
  UpdateVerificationStatus,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../utils/isAdmin.js";

const router = express.Router();

router.get("/fetch-all-users", isAdmin, FetchAllUsers);
router.get("/fetch-all-drivers", isAdmin, FetchAllDrivers);
router.get("/fetch-all-rides", isAdmin, FetchAllRides);
router.get("/fetch-all-rents", isAdmin, FetchAllRent);
router.delete("/delete-rent/:id", isAdmin, DeleteRent);
router.get("/fetch-all-admins", isAdmin, FetchAllAdmins);
router.post("/create-admin", isAdmin, CreateNewAdmin);
router.get("/fetch-all-verifications", isAdmin, FetchAllVerifications);
router.put("/update-user/:id", isAdmin, UpdateVerificationStatus);
router.post("/login", AdminLogin);

export default router;
