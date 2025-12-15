import asyncHandler from "express-async-handler";
import { Favourite } from "../models/favourite.model.js";
import { Product } from "../models/product.model.js";

/**
 *   @desc   Get user favourites
 *   @route  /api/v1/favourites
 *   @method  GET
 *   @access  private
 */
export const getUserFavourites = asyncHandler(async (req, res) => {
  try {
    let favourites = await Favourite.findOne({ user: req.user._id }).populate(
      "products",
      "name price images rating numReviews brand category"
    );

    if (!favourites) {
      favourites = await Favourite.create({
        user: req.user._id,
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      count: favourites.products.length,
      data: favourites,
    });
  } catch (error) {
    console.error("Error in getUserFavourites controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Add product to favourites
 *   @route  /api/v1/favourites/:productId
 *   @method  POST
 *   @access  private
 */
export const addToFavourites = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  try {
    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    let favourites = await Favourite.findOne({ user: req.user._id });

    if (!favourites) {
      favourites = await Favourite.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      // Check if product already in favourites
      if (favourites.products.includes(productId)) {
        res.status(400);
        throw new Error("Product already in favourites");
      }

      favourites.products.push(productId);
      await favourites.save();
    }

    // Populate and return
    favourites = await Favourite.findById(favourites._id).populate(
      "products",
      "name price images rating numReviews brand category"
    );

    res.status(200).json({
      success: true,
      message: "Product added to favourites",
      data: favourites,
    });
  } catch (error) {
    console.error("Error in addToFavourites controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Remove product from favourites
 *   @route  /api/v1/favourites/:productId
 *   @method  DELETE
 *   @access  private
 */
export const removeFromFavourites = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  try {
    const favourites = await Favourite.findOne({ user: req.user._id });

    if (!favourites) {
      res.status(404);
      throw new Error("Favourites not found");
    }

    // Check if product exists in favourites
    if (!favourites.products.includes(productId)) {
      res.status(404);
      throw new Error("Product not in favourites");
    }

    favourites.products = favourites.products.filter(
      (id) => id.toString() !== productId
    );

    await favourites.save();

    const populatedFavourites = await Favourite.findById(
      favourites._id
    ).populate(
      "products",
      "name price images rating numReviews brand category"
    );

    res.status(200).json({
      success: true,
      message: "Product removed from favourites",
      data: populatedFavourites,
    });
  } catch (error) {
    console.error("Error in removeFromFavourites controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Clear all favourites
 *   @route  /api/v1/favourites
 *   @method  DELETE
 *   @access  private
 */
export const clearFavourites = asyncHandler(async (req, res) => {
  try {
    const favourites = await Favourite.findOne({ user: req.user._id });

    if (!favourites) {
      res.status(404);
      throw new Error("Favourites not found");
    }

    favourites.products = [];
    await favourites.save();

    res.status(200).json({
      success: true,
      message: "Favourites cleared",
      data: favourites,
    });
  } catch (error) {
    console.error("Error in clearFavourites controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Check if product is in favourites
 *   @route  /api/v1/favourites/check/:productId
 *   @method  GET
 *   @access  private
 */
// ❤️ Highlight the heart icon
// 🔘 Disable “Add to favourites” button
// 🔁 Toggle between “Add” / “Remove”
// 🚫 Avoid calling addToFavourites unnecessarily
export const checkFavourite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    const favourites = await Favourite.findOne({ user: req.user._id });

    const isFavourite = favourites
      ? favourites.products.includes(productId)
      : false;

    res.status(200).json({
      success: true,
      data: { isFavourite },
    });
  } catch (error) {
    console.error("Error in checkFavourite controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
