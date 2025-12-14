import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";
import { data } from "react-router-dom";

/**
 *   @desc   Register New User
 *   @route  /api/v1/auth/register
 *   @method  Post
 *   @access  public
 */
export const register = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the inputs." });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });

    await user.save();

    if (user) {
      generateToken(res, user._id, user.role === "admin");

      res.status(201).json({ data: user });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    console.error("Error in register controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Login User
 *   @route  /api/v1/auth/login
 *   @method  POST
 *   @access  public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403);
      throw new Error("Account is deactivated. Please contact support");
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    generateToken(res, user._id, user.role === "admin");

    res.status(200).json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Logout User
 *   @route  /api/v1/auth/logout
 *   @method  POST
 *   @access  public
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 *   @desc   Get Current User
 *   @route  /api/v1/auth/me
 *   @method  GET
 *   @access  private (authenticated user)
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
