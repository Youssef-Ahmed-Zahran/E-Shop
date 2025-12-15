import asyncHandler from "express-async-handler";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

/**
 *   @desc   Get user cart
 *   @route  /api/v1/cart
 *   @method  GET
 *   @access  private
 */
export const getUserCart = asyncHandler(async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock isActive"
    );

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error in getUserCart controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Add item to cart
 *   @route  /api/v1/cart/items
 *   @method  POST
 *   @access  private
 */
export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    if (!productId || !quantity) {
      res.status(400);
      throw new Error("Product ID and quantity are required");
    }

    // Check product exists and is active
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      res.status(400);
      throw new Error("Product is not available");
    }

    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (product.stock < newQuantity) {
        res.status(400);
        throw new Error(`Only ${product.stock} items available in stock`);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    // Calculate total
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    // Populate and return
    cart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock"
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Error in addItemToCart controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Update cart item quantity
 *   @route  /api/v1/cart/items/:productId
 *   @method  PATCH
 *   @access  private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Valid quantity is required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} items available in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  cart.items[itemIndex].quantity = quantity;

  // Recalculate total
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  cart = await Cart.findById(cart._id).populate(
    "items.product",
    "name price images stock"
  );

  res.status(200).json({
    success: true,
    message: "Cart updated",
    data: cart,
  });
});

/**
 *   @desc   Remove item from cart
 *   @route  /api/v1/cart/items/:productId
 *   @method  DELETE
 *   @access  private
 */
export const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    // Recalculate total
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock"
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Error in removeItemFromCart controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Clear cart
 *   @route  /api/v1/cart
 *   @method  DELETE
 *   @access  private
 */
export const clearCart = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: cart,
    });
  } catch (error) {
    console.error("Error in clearCart controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
