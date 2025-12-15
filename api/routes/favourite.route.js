import express from "express";
import {
  getUserFavourites,
  addToFavourites,
  removeFromFavourites,
  clearFavourites,
  checkFavourite,
} from "../controllers/favourite.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// All favourite routes require authentication
router.use(verifyToken);

router.get("/", getUserFavourites);
router.get("/check/:productId", checkFavourite);
router.post("/:productId", addToFavourites);
router.delete("/:productId", removeFromFavourites);
router.delete("/", clearFavourites);

export default router;
