import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import asyncHandler from "express-async-handler";

export const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Read JWT from the 'jwt' cookie
    token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in verifyToken middleware:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Admin and user authorization
export const verifyTokenAndAuthorization = asyncHandler(
  async (req, res, next) => {
    // First verify the token (this will set req.user)
    await verifyToken(req, res, () => {
      // Check if user is accessing their own resource or is an admin
      if (
        req.user._id.toString() === req.params.id ||
        req.user.role === "admin"
      ) {
        next();
      } else {
        return res
          .status(403)
          .json({ error: "Forbidden - You can only access your own account." });
      }
    });
  }
);

// Admin only
export const verifyTokenAndAdmin = asyncHandler(async (req, res, next) => {
  // First verify the token (this will set req.user)
  await verifyToken(req, res, () => {
    // Check if user is an admin
    if (req.user.role === "admin") {
      next();
    } else {
      return res
        .status(403)
        .json({ error: "Forbidden - Admin access required." });
    }
  });
});
