import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getFeaturedProducts,
  checkProductStock,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);
router.get("/:id/check-stock", checkProductStock);

// Admin routes
router.post("/", verifyTokenAndAdmin, createProduct);
router.put("/:id", verifyTokenAndAdmin, updateProduct);
router.delete("/:id", verifyTokenAndAdmin, deleteProduct);
router.patch("/:id/stock", verifyTokenAndAdmin, updateProductStock);
router.patch("/:id/feature", verifyTokenAndAdmin, toggleFeaturedProduct);

export default router;
