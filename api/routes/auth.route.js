import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";
const router = express.Router();
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import {
  loginLimiter,
  registerLimiter,
} from "../middlewares/rateLimiter.middleware.js";

// Routes
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", verifyToken, getCurrentUser);

export default router;
