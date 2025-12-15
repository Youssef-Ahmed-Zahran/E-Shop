import express from "express";
import {
  getUserCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

router.get("/", getUserCart);
router.post("/items", addItemToCart);
router.patch("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeItemFromCart);
router.delete("/", clearCart);

export default router;
