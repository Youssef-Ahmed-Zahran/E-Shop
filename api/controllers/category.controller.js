import { Category } from "../models/category.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";

/**
 *   @desc   Create Category
 *   @route  /api/v1/categories
 *   @method  Post
 *   @access  private (Admin)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      return res.status(400).json({ error: "Category already exists" });
    }

    let imageUrl = "";

    // Only upload if image is provided and it's a base64 string
    if (image && image.startsWith("data:image")) {
      try {
        imageUrl = await uploadToCloudinary(image, "categories");
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          error: "Failed to upload image",
          message: uploadError.message,
        });
      }
    }

    const category = await Category.create({
      name,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error in createCategory controller:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

/**
 *   @desc   Get All Category
 *   @route  /api/category/categories
 *   @method  Get
 *   @access  public
 */
export const getAllCategories = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get search query if provided
    const searchQuery = req.query.search || "";

    // Build filter
    const filter = searchQuery
      ? { name: { $regex: searchQuery, $options: "i" } }
      : {};

    // Get total count for pagination
    const totalCategories = await Category.countDocuments(filter);

    // Get paginated categories
    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: categories.length,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      data: categories,
    });
  } catch (error) {
    console.error("Error in getAllCategories controller:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

/**
 *   @desc   Get Category By Id
 *   @route  /api/categories/:id
 *   @method  Get
 *   @access  public
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error in getCategoryById controller:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

/**
 *   @desc   Update Category
 *   @route  /api/categories/:id
 *   @method  Put
 *   @access  private (Admin)
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    let updateData = {};

    // Update name if provided
    if (name) {
      updateData.name = name;
    }

    // Handle image update
    if (image !== undefined) {
      // If image is provided and it's a new base64 image
      if (image && image.startsWith("data:image")) {
        try {
          // Delete old image if exists
          if (category.image) {
            await deleteFromCloudinary(category.image);
          }
          // Upload new image
          updateData.image = await uploadToCloudinary(image, "categories");
        } catch (uploadError) {
          console.error("Image update error:", uploadError);
          return res.status(500).json({
            error: "Failed to update image",
            message: uploadError.message,
          });
        }
      }
      // If image is empty string (user removed the image)
      else if (image === "") {
        if (category.image) {
          await deleteFromCloudinary(category.image);
        }
        updateData.image = "";
      }
      // If image is an existing URL, keep it
      else if (image.startsWith("http")) {
        updateData.image = image;
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error in updateCategory controller:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

/**
 *   @desc   Delete Category
 *   @route  /api/category/:id
 *   @method  Delete
 *   @access  private (Admin)
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete image from cloudinary if exists
    if (category.image) {
      try {
        await deleteFromCloudinary(category.image);
      } catch (deleteError) {
        console.error("Error deleting image from Cloudinary:", deleteError);
        // Continue with category deletion even if image deletion fails
      }
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCategory controller:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};
