import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

/**
 *   @desc   Get All User
 *   @route  /api/v1/users
 *   @method  Get
 *   @access  private (only admin)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get User By Id
 *   @route  /api/users/:id
 *   @method  Get
 *   @access  private (Admin or Own Profile)
 */
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error in getUserById controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Update User By Id
 *   @route  /api/users/profile
 *   @method  PUT
 *   @access  private (User himself)
 */
export const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Don't allow password update through this route
    if (req.body.password) {
      delete req.body.password;
    }

    // Remove role from update - no one can change it via this route
    if (req.body.role) {
      delete req.body.role;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUser controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Update password
 *   @route  /api/v1/users/:id/password
 *   @method  PATCH
 *   @access  private (Own Profile)
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Please provide current and new password");
    }

    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Verify current password
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatch) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in updatePassword controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Delete user By Id
 *   @route  /api/users/:id
 *   @method  DELETE
 *   @access  private (Admin)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in updatePassword controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Toggle user active status
 *   @route  /api/users/:id/toggle-status
 *   @method  PATCH
 *   @access  private (Admin)
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: user,
  });
});
