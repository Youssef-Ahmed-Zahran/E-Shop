import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";

/**
 *   @desc   Register New User
 *   @route  /api/v1/auth/register
 *   @method  Post
 *   @access  public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the inputs." });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
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
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in register controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

/**
 *   @desc   Login User
 *   @route  /api/v1/auth/login
 *   @method  POST
 *   @access  public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil(
        (user.lockUntil - Date.now()) / 1000 / 60
      );
      return res.status(423).json({
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated. Please contact support",
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      // Increment failed login attempts
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        await user.save();
        return res.status(423).json({
          message:
            "Account locked due to multiple failed login attempts. Please try again in 30 minutes.",
        });
      }

      await user.save();

      const attemptsLeft = 5 - user.loginAttempts;
      return res.status(401).json({
        message: `Invalid email or password. ${attemptsLeft} attempt(s) remaining.`,
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
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
};

/**
 *   @desc   Logout User
 *   @route  /api/v1/auth/logout
 *   @method  POST
 *   @access  public
 */
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

/**
 *   @desc   Get Current User
 *   @route  /api/v1/auth/me
 *   @method  GET
 *   @access  private (authenticated user)
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
