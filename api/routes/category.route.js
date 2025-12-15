import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", verifyTokenAndAdmin, createCategory);
router.put("/:id", verifyTokenAndAdmin, updateCategory);
router.delete("/:id", verifyTokenAndAdmin, deleteCategory);

export default router;
