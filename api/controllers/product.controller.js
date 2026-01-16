import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
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
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

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
};

/**
 *   @desc   Get single product
 *   @route  /api/v1/products/:id
 *   @method  Get
 *   @access  public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("brand", "name")
      .populate("supplier", "name email company");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ data: product });
  } catch (error) {
    console.error("Error in getProductById controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

/**
 *   @desc   Add Product
 *   @route  /api/v1/products
 *   @method  Post
 *   @access  private (Admin)
 */
export const createProduct = async (req, res) => {
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
};

/**
 *   @desc   Update Product
 *   @route  /api/v1/products/:id
 *   @method  Put
 *   @access  private (Admin)
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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
};

/**
 *   @desc   Toggle product featured status
 *   @route  /api/v1/products/:id/feature
 *   @method  PATCH
 *   @access  private (Admin)
 */
export const toggleFeaturedProduct = async (req, res) => {
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
};

/**
 *   @desc   Delete Product
 *   @route  /api/products/:id
 *   @method  Delete
 *   @access  private (Admin)
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is already deleted
    if (product.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Product is already deleted",
      });
    }

    // Check if product is in any active orders
    const activeOrders = await Order.countDocuments({
      "items.product": product._id,
      orderStatus: { $in: ["pending", "processing", "shipped"] },
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product. It's currently part of ${activeOrders} active order(s). Products can only be deleted after all associated orders are delivered or cancelled.`,
      });
    }

    // Optional: Delete images from Cloudinary only if no orders reference this product at all
    const anyOrders = await Order.countDocuments({
      "items.product": product._id,
    });

    if (anyOrders === 0 && product.images && product.images.length > 0) {
      // Safe to delete images - no order history references this product
      await deleteMultipleFromCloudinary(product.images);
    }

    // Soft delete
    product.isDeleted = true;
    product.isActive = false;
    product.deletedAt = Date.now();
    await product.save();

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
};

/**
 *   @desc   Update product stock
 *   @route  /api/products/:id/stock
 *   @method  PATCH
 *   @access  private (Admin)
 */
// *** For manual corrections, damages, returns, etc. ***
export const updateProductStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body;

    if (!quantity || !operation) {
      return res
        .status(400)
        .json({ message: "Quantity and operation are required" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (operation === "add") {
      product.stock += quantity;
    } else if (operation === "subtract") {
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      product.stock -= quantity;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid operation. Use 'add' or 'subtract'" });
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
};

/**
 *   @desc   Get featured products
 *   @route  /api/products/featured
 *   @method  GET
 *   @access  public
 */
export const getFeaturedProducts = async (req, res) => {
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
};

/**
 *   @desc   Get featured products
 *   @route  /api/products/:id/check-stock
 *   @method  GET
 *   @access  public
 */
export const checkProductStock = async (req, res) => {
  try {
    const { quantity } = req.query;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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
};
