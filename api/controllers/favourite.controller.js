import { Favourite } from "../models/favourite.model.js";
import { Product } from "../models/product.model.js";

/**
 *   @desc   Get user favourites
 *   @route  /api/v1/favourites
 *   @method  GET
 *   @access  private
 */
export const getUserFavourites = async (req, res) => {
  try {
    let favourites = await Favourite.findOne({ user: req.user._id }).populate(
      "products",
      "name price images rating numReviews brand category stock"
    );

    if (!favourites) {
      favourites = await Favourite.create({
        user: req.user._id,
        products: [],
      });

      // populate الجديد
      favourites = await Favourite.findById(favourites._id).populate(
        "products",
        "name price images rating numReviews brand category stock"
      );
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
};

/**
 *   @desc   Add product to favourites
 *   @route  /api/v1/favourites/:productId
 *   @method  POST
 *   @access  private
 */
export const addToFavourites = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let favourites = await Favourite.findOne({ user: req.user._id });

    if (!favourites) {
      favourites = await Favourite.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      if (favourites.products.includes(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Product already in favourites" });
      }
      favourites.products.push(productId);
      await favourites.save();
    }

    const populated = await Favourite.findById(favourites._id).populate(
      "products",
      "name price images rating numReviews brand category stock"
    );

    res.status(200).json({
      success: true,
      message: "Product added to favourites",
      data: populated,
    });
  } catch (error) {
    console.error("Error in addToFavourites controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

/**
 *   @desc   Remove product from favourites
 *   @route  /api/v1/favourites/:productId
 *   @method  DELETE
 *   @access  private
 */
export const removeFromFavourites = async (req, res) => {
  try {
    const { productId } = req.params;

    const favourites = await Favourite.findOne({ user: req.user._id });

    if (!favourites) {
      return res
        .status(404)
        .json({ success: false, message: "No favourites found for user" });
    }

    if (!favourites.products.includes(productId)) {
      return res
        .status(404)
        .json({ success: false, message: "Product not in favourites" });
    }

    favourites.products = favourites.products.filter(
      (id) => id.toString() !== productId
    );
    await favourites.save();

    const populated = await Favourite.findById(favourites._id).populate(
      "products",
      "name price images rating numReviews brand category stock"
    );

    res.status(200).json({
      success: true,
      message: "Product removed from favourites",
      data: populated,
    });
  } catch (error) {
    console.error("Error in removeFromFavourites controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

/**
 *   @desc   Clear all favourites
 *   @route  /api/v1/favourites
 *   @method  DELETE
 *   @access  private
 */
export const clearFavourites = async (req, res) => {
  try {
    const favourites = await Favourite.findOne({ user: req.user._id });

    if (!favourites) {
      return res.status(404).json({ message: "Favourites not found" });
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
};

/**
 *   @desc   Check if product is in favourites
 *   @route  /api/v1/favourites/check/:productId
 *   @method  GET
 *   @access  private
 */
// ❤️ Highlight the heart icon
// 🔘 Disable "Add to favourites" button
// 🔁 Toggle between "Add" / "Remove"
// 🚫 Avoid calling addToFavourites unnecessarily
export const checkFavourite = async (req, res) => {
  try {
    const { productId } = req.params;

    // تحقق بسيط من صحة الـ productId (اختياري لكن مفيد)
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

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
};
