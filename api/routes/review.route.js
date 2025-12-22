import express from "express";
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  toggleReviewApproval,
  getAllReviews,
} from "../controllers/review.controller.js";
import {
  verifyToken,
  verifyTokenAndAdmin,
} from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Private routes
router.post("/product/:productId", verifyToken, createReview);
router.get("/my-reviews", verifyToken, getUserReviews);
router.put("/:id", verifyToken, updateReview);
router.delete("/:id", verifyToken, deleteReview);

// Admin routes
router.get("/admin/all", verifyTokenAndAdmin, getAllReviews);
router.patch("/:id/approve", verifyTokenAndAdmin, toggleReviewApproval);

export default router;
