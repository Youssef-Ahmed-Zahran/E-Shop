import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  toggleUserStatus,
} from "../controllers/user.controller.js";
import {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Admin routes
router.get("/", verifyTokenAndAdmin, getAllUsers);
router.delete("/:id", verifyTokenAndAdmin, deleteUser);
router.patch("/:id/toggle-status", verifyTokenAndAdmin, toggleUserStatus);

// User or Admin routes
router.get("/:id", verifyTokenAndAuthorization, getUserById);
router.put("/:id", verifyTokenAndAuthorization, updateUser);
router.patch("/:id/password", verifyTokenAndAuthorization, updatePassword);

export default router;
