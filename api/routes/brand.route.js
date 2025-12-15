import express from "express";
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBrands);
router.get("/:id", getBrandById);

// Admin routes
router.post("/", verifyTokenAndAdmin, createBrand);
router.put("/:id", verifyTokenAndAdmin, updateBrand);
router.delete("/:id", verifyTokenAndAdmin, deleteBrand);

export default router;
