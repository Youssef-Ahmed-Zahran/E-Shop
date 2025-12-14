import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";
const router = express.Router();
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
// Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, getCurrentUser);

export default router;
