import express from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
  cancelOrder,
} from "../controllers/order.controller.js";
import {
  verifyToken,
  verifyTokenAndAdmin,
} from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// User routes
router.post("/", verifyToken, createOrder);
router.get("/myorders", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);
router.patch("/:id/pay", verifyToken, updateOrderToPaid);
router.patch("/:id/cancel", verifyToken, cancelOrder);

// Admin routes
router.get("/", verifyTokenAndAdmin, getAllOrders);
router.patch("/:id/status", verifyTokenAndAdmin, updateOrderStatus);

export default router;
