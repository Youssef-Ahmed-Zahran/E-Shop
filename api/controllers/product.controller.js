import asyncHandler from "express-async-handler";
import { Product } from "../models/product.model.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../utils/cloudinaryUpload.js";

/**
 *   @desc   Get All Products
 *   @route  /api/v1/products
 *   @method  Get
 *   @access  public
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const filter = { isActive: true, ...keyword };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("brand", "name")
      .populate("supplier", "name company")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllProducts controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get single product
 *   @route  /api/v1/products/:id
 *   @method  Get
 *   @access  public
 */
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("brand", "name")
      .populate("supplier", "name email company");

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.status(200).json({ data: product });
  } catch (error) {
    console.error("Error in getProductById controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Add Product
 *   @route  /api/v1/products
 *   @method  Post
 *   @access  private (Admin)
 */
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      supplier,
      stock,
      images, // ← Array of base64 strings from frontend
      isFeatured,
    } = req.body;

    // Step 1: Validate required fields
    if (!name || !description || !price || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Step 2: Validate images
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one image",
      });
    }

    // Step 3: Upload images to Cloudinary
    console.log("Uploading images to Cloudinary...");
    const uploadedImages = await uploadMultipleToCloudinary(images, "products");
    console.log("Uploaded image URLs:", uploadedImages);

    // Step 4: Create product with Cloudinary URLs
    const product = await Product.create({
      user: req.user._id,
      name,
      description,
      price,
      category,
      brand,
      supplier,
      stock: stock || 0,
      images: uploadedImages,
      isFeatured: isFeatured || false,
    });

    // Step 5: Populate and return
    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("brand", "name");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: populatedProduct,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
});

/**
 *   @desc   Update Product
 *   @route  /api/v1/products/:id
 *   @method  Put
 *   @access  private (Admin)
 */
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("category", "name")
      .populate("brand", "name")
      .populate("supplier", "name company");

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Toggle product featured status
 *   @route  /api/v1/products/:id/feature
 *   @method  PATCH
 *   @access  private (Admin)
 */
export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Toggle the featured status
    product.isFeatured = !product.isFeatured;
    await product.save();

    // Populate and return updated product
    const updatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("brand", "name");

    res.status(200).json({
      success: true,
      message: `Product ${
        product.isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in toggleFeaturedProduct controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
});

/**
 *   @desc   Delete Product
 *   @route  /api/products/:id
 *   @method  Delete
 *   @access  private (Admin)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary using helper function
    if (product.images && product.images.length > 0) {
      await deleteMultipleFromCloudinary(product.images);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProduct controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
});

/**
 *   @desc   Update product stock
 *   @route  /api/products/:id/stock
 *   @method  PATCH
 *   @access  private (Admin)
 */
// *** For manual corrections, damages, returns, etc. ***
export const updateProductStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body;

  try {
    if (!quantity || !operation) {
      res.status(400);
      throw new Error("Quantity and operation are required");
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (operation === "add") {
      product.stock += quantity;
    } else if (operation === "subtract") {
      if (product.stock < quantity) {
        res.status(400);
        throw new Error("Insufficient stock");
      }
      product.stock -= quantity;
    } else {
      res.status(400);
      throw new Error("Invalid operation. Use 'add' or 'subtract'");
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error in updateProductStock controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get featured products
 *   @route  /api/products/featured
 *   @method  GET
 *   @access  public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate("category", "name")
      .populate("brand", "name")
      .limit(8);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error in getFeaturedProducts controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get featured products
 *   @route  /api/products/:id/check-stock
 *   @method  GET
 *   @access  public
 */
export const checkProductStock = asyncHandler(async (req, res) => {
  const { quantity } = req.query;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const requestedQty = parseInt(quantity) || 1;
    const available = product.stock >= requestedQty;

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        productName: product.name,
        currentStock: product.stock,
        requestedQuantity: requestedQty,
        available,
        message: available
          ? "Product is in stock"
          : `Only ${product.stock} items available`,
      },
    });
  } catch (error) {
    console.error("Error in checkProductStock controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
