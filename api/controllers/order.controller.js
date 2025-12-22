import asyncHandler from "express-async-handler";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import mongoose from "mongoose";

/**
 *   @desc   Create new order
 *   @route  /api/v1/orders
 *   @method  POST
 *   @access  private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingCost, taxAmount } =
    req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    const orderItems = [];

    // Validate and process each item
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      if (!product.isActive) {
        throw new Error(`Product is not available: ${product.name}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save({ session });

      const totalPrice = product.price * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product: product._id,
        image: product.images[0] || "",
        quantity: item.quantity,
        price: product.price,
        totalPrice,
      });
    }

    const totalAmount = subtotal + (shippingCost || 0) + (taxAmount || 0);

    // Create order
    const order = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          subtotal,
          shippingCost: shippingCost || 0,
          taxAmount: taxAmount || 0,
          totalAmount,
        },
      ],
      { session }
    );

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalPrice: 0 },
      { session }
    );

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order[0]._id)
      .populate("user", "name email")
      .populate("items.product", "name price brand");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createOrder:", error);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 *   @desc   Get order by ID
 *   @route  /api/v1/orders/:id
 *   @method  GET
 *   @access  private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name price brand images");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Check if user owns this order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get logged in user orders
 *   @route  /api/v1/orders/myorders
 *   @method  GET
 *   @access  private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get all orders
 *   @route  /api/v1/orders
 *   @method  GET
 *   @access  private (admin)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }

  try {
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Update order status
 *   @route  /api/v1/orders/:id/status
 *   @method  PATCH
 *   @access  private (admin)
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  try {
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid order status");
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Prevent status change if order is already delivered
    if (order.orderStatus === "delivered" && status !== "delivered") {
      res.status(400);
      throw new Error("Cannot change status of delivered order");
    }

    // Check if order is being cancelled and wasn't already cancelled
    if (status === "cancelled" && order.orderStatus !== "cancelled") {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Restore products to stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }

        order.orderStatus = status;
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } else {
      // Regular status update (no stock changes)
      order.orderStatus = status;

      if (status === "delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
});

/**
 *   @desc   Update order to paid
 *   @route  /api/v1/orders/:id/pay
 *   @method  PATCH
 *   @access  private
 */
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Check if user owns this order or is admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to update this order");
    }

    if (order.isPaid) {
      res.status(400);
      throw new Error("Order is already paid");
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    // Automatically update order status to processing when paid
    if (order.orderStatus === "pending") {
      order.orderStatus = "processing";
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order marked as paid",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in updateOrderToPaid:", error);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
});

/**
 *   @desc   Cancel order
 *   @route  /api/v1/orders/:id/cancel
 *   @method  PATCH
 *   @access  private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check authorization
  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to cancel this order");
  }

  // Check if order can be cancelled
  if (order.orderStatus === "delivered") {
    res.status(400);
    throw new Error("Cannot cancel delivered order");
  }

  if (order.orderStatus === "cancelled") {
    res.status(400);
    throw new Error("Order is already cancelled");
  }

  // Prevent cancellation if already shipped (optional - remove if you want to allow)
  if (order.orderStatus === "shipped") {
    res.status(400);
    throw new Error("Cannot cancel shipped order. Please contact support.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    order.orderStatus = "cancelled";
    await order.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully and stock restored",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in cancelOrder:", error);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
    throw error;
  } finally {
    session.endSession();
  }
});
