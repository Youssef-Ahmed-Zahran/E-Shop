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
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod, shippingCost, taxAmount } =
      req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

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
  } finally {
    session.endSession();
  }
};

/**
 *   @desc   Get order by ID
 *   @route  /api/v1/orders/:id
 *   @method  GET
 *   @access  private
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name price brand images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
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
};

/**
 *   @desc   Get logged in user orders
 *   @route  /api/v1/orders/myorders
 *   @method  GET
 *   @access  private
 */
export const getMyOrders = async (req, res) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalOrders = await Order.countDocuments({ user: req.user._id });

    // Get paginated orders
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

/**
 *   @desc   Get all orders
 *   @route  /api/v1/orders
 *   @method  GET
 *   @access  private (admin)
 */
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

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
};

/**
 *   @desc   Update order status
 *   @route  /api/v1/orders/:id/status
 *   @method  PATCH
 *   @access  private (admin)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent status change if order is already delivered
    if (order.orderStatus === "delivered" && status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Cannot change status of delivered order" });
    }

    // Prevent status change if order is already cancelled
    if (order.orderStatus === "cancelled" && status !== "cancelled") {
      return res
        .status(400)
        .json({ message: "Cannot change status of cancelled order" });
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
        order.isCancelled = true;
        order.cancelledAt = Date.now();
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
};

/**
 *   @desc   Update order to paid
 *   @route  /api/v1/orders/:id/pay
 *   @method  PATCH
 *   @access  private
 */
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
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
};

/**
 *   @desc   Cancel order
 *   @route  /api/v1/orders/:id/cancel
 *   @method  PATCH
 *   @access  private
 */
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled
    if (order.orderStatus === "delivered") {
      return res.status(400).json({ message: "Cannot cancel delivered order" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Prevent cancellation if already shipped (optional - remove if you want to allow)
    if (order.orderStatus === "shipped") {
      return res.status(400).json({
        message: "Cannot cancel shipped order. Please contact support.",
      });
    }

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
  } finally {
    session.endSession();
  }
};
