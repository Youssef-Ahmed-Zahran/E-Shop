import asyncHandler from "express-async-handler";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    // Get all approved reviews for this product
    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    });

    const numReviews = reviews.length;

    // Calculate average rating
    const rating =
      numReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / numReviews
        : 0;

    // Update product with new rating and review count
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
      data: numReviews,
    });

    console.log(`✅ Product rating updated: ${rating} (${numReviews} reviews)`);
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

/**
 *   @desc   Create product review
 *   @route  /api/v1/reviews/product/:productId
 *   @method  POST
 *   @access  private
 */
export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  try {
    if (!rating || !comment) {
      res.status(400);
      throw new Error("Please provide rating and comment");
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if product exists
    const productExists = await Product.findById(productId);

    if (!productExists) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("You have already reviewed this product");
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    });

    // ✅ UPDATE PRODUCT RATING AUTOMATICALLY
    await updateProductRating(productId);

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("product", "name");

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: populatedReview,
    });
  } catch (error) {
    console.error("Error in createReview:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get reviews for a product
 *   @route  /api/v1/reviews/product/:productId
 *   @method  GET
 *   @access  public
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { product: productId };

  try {
    if (req.query.isApproved !== undefined) {
      filter.isApproved = req.query.isApproved === "true";
    } else {
      filter.isApproved = true; // Default: show only approved reviews
    }

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getProductReviews:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get user's reviews
 *   @route  /api/v1/reviews/my-reviews
 *   @method  GET
 *   @access  private
 */
export const getUserReviews = asyncHandler(async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("product", "name images price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Error in getUserReviews:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Update review
 *   @route  /api/v1/reviews/:id
 *   @method  PUT
 *   @access  private
 */
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  try {
    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this review");
    }

    const { rating, comment } = req.body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    // ✅ UPDATE PRODUCT RATING AUTOMATICALLY
    await updateProductRating(review.product);

    const updatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("product", "name");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error in updateReview:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Delete review
 *   @route  /api/v1/reviews/:id
 *   @method  DELETE
 *   @access  private
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  try {
    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    // Check if user owns this review or is admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to delete this review");
    }

    const productId = review.product;
    await review.deleteOne();

    // ✅ UPDATE PRODUCT RATING AUTOMATICALLY
    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Toggle review approval
 *   @route  /api/v1/reviews/:id/approve
 *   @method  PATCH
 *   @access  private (Admin)
 */
export const toggleReviewApproval = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    review.isApproved = !review.isApproved;
    await review.save();

    // ✅ UPDATE PRODUCT RATING AUTOMATICALLY
    // (This matters because only approved reviews count toward rating)
    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: `Review ${review.isApproved ? "approved" : "unapproved"}`,
      data: review,
    });
  } catch (error) {
    console.error("Error in toggleReviewApproval:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get all reviews
 *   @route  /api/v1/reviews/admin/all
 *   @method  GET
 *   @access  private (Admin)
 */
export const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    // Filter by approval status if provided
    if (req.query.isApproved !== undefined) {
      filter.isApproved = req.query.isApproved === "true";
    }

    // Filter by product if provided
    if (req.query.productId) {
      filter.product = req.query.productId;
    }

    // Filter by user if provided
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    // Get total count
    const total = await Review.countDocuments(filter);

    // Get reviews with populated fields
    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "name images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
