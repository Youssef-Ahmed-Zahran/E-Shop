import asyncHandler from "express-async-handler";
import { PurchaseInvoice } from "../models/purchaseInvoice.model.js";
import { Product } from "../models/product.model.js";
import { Supplier } from "../models/supplier.model.js";
import mongoose from "mongoose";

/**
 *   @desc   Create purchase invoice and update stock (Products MUST exist)
 *   @route  /api/v1/purchase-invoices
 *   @method  POST
 *   @access  private (Admin)
 */
export const createPurchaseInvoice = asyncHandler(async (req, res) => {
  const { supplierId, items, shippingCost, taxAmount } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items provided");
  }

  // Verify supplier exists
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    const processedItems = [];
    const notFoundProducts = [];

    // Process each item
    for (const item of items) {
      const { productId, quantity, unitPrice } = item;

      // Validate required fields
      if (!productId) {
        throw new Error("Product ID is required for all items");
      }

      if (!quantity || quantity < 1) {
        throw new Error("Valid quantity is required for all items");
      }

      if (!unitPrice || unitPrice < 0) {
        throw new Error("Valid unit price is required for all items");
      }

      // Check if product exists in store
      const product = await Product.findById(productId).session(session);

      if (!product) {
        notFoundProducts.push(productId);
        continue;
      }

      // Verify product belongs to this supplier (optional but recommended)
      if (product.supplier && product.supplier.toString() !== supplierId) {
        throw new Error(
          `Product "${product.name}" is not associated with this supplier`
        );
      }

      // Update stock - add received quantity
      product.stock += quantity;
      await product.save({ session });

      const totalPrice = quantity * unitPrice;
      subtotal += totalPrice;

      processedItems.push({
        product: product._id,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    // If any products were not found, abort transaction
    if (notFoundProducts.length > 0) {
      throw new Error(
        `The following products do not exist in store: ${notFoundProducts.join(
          ", "
        )}. Please add them to the store first.`
      );
    }

    // If no items were processed successfully
    if (processedItems.length === 0) {
      throw new Error("No valid products to process");
    }

    // Calculate total amount
    const totalAmount = subtotal + (shippingCost || 0) + (taxAmount || 0);

    // Create purchase invoice
    const purchaseInvoice = await PurchaseInvoice.create(
      [
        {
          supplier: supplierId,
          receivedBy: req.user._id,
          items: processedItems,
          subtotal,
          shippingCost: shippingCost || 0,
          taxAmount: taxAmount || 0,
          totalAmount,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Populate invoice details
    const populatedInvoice = await PurchaseInvoice.findById(
      purchaseInvoice[0]._id
    )
      .populate("supplier", "name email company")
      .populate("receivedBy", "name email")
      .populate("items.product", "name price stock");

    res.status(201).json({
      success: true,
      message: "Purchase invoice created and stock updated successfully",
      data: populatedInvoice,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createPurchaseInvoice:", error);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 *   @desc   Get all purchase invoices
 *   @route  /api/v1/purchase-invoices
 *   @method  GET
 *   @access  private (Admin)
 */
export const getAllPurchaseInvoices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const total = await PurchaseInvoice.countDocuments();
    const invoices = await PurchaseInvoice.find()
      .populate("supplier", "name email company")
      .populate("receivedBy", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllPurchaseInvoices:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get single purchase invoice
 *   @route  /api/v1/purchase-invoices/:id
 *   @method  GET
 *   @access  private (Admin)
 */
export const getPurchaseInvoiceById = asyncHandler(async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id)
      .populate("supplier", "name email phone company address")
      .populate("receivedBy", "name email")
      .populate("items.product", "name price stock brand category");

    if (!invoice) {
      res.status(404);
      throw new Error("Purchase invoice not found");
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error in getPurchaseInvoiceById:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get invoices by supplier
 *   @route  /api/v1/purchase-invoices/supplier/:supplierId
 *   @method  GET
 *   @access  private (Admin)
 */
export const getInvoicesBySupplier = asyncHandler(async (req, res) => {
  try {
    const invoices = await PurchaseInvoice.find({
      supplier: req.params.supplierId,
    })
      .populate("supplier", "name email company")
      .populate("receivedBy", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    console.error("Error in getInvoicesBySupplier:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Delete purchase invoice (WARNING: Does not restore stock)
 *   @route  /api/v1/purchase-invoices/:id
 *   @method  DELETE
 *   @access  private (Admin)
 */
export const deletePurchaseInvoice = asyncHandler(async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error("Purchase invoice not found");
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Purchase invoice deleted successfully. Note: Stock was not adjusted.",
    });
  } catch (error) {
    console.error("Error in deletePurchaseInvoice:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Cancel purchase invoice and restore stock
 *   @route  /api/v1/purchase-invoices/:id/cancel
 *   @method  PATCH
 *   @access  private (Admin)
 */
export const cancelPurchaseInvoice = asyncHandler(async (req, res) => {
  const invoice = await PurchaseInvoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error("Purchase invoice not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Restore product stock (subtract the received quantity)
    for (const item of invoice.items) {
      const product = await Product.findById(item.product).session(session);

      if (product) {
        // Make sure we don't go below 0
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save({ session });
      }
    }

    // Delete the invoice
    await invoice.deleteOne({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Purchase invoice cancelled and stock restored successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in cancelPurchaseInvoice:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 *   @desc   Validate products before creating invoice
 *   @route  /api/v1/purchase-invoices/validate-products
 *   @method  POST
 *   @access  private (Admin)
 */
export const validateProductsForInvoice = asyncHandler(async (req, res) => {
  const { supplierId, productIds } = req.body;

  if (!productIds || productIds.length === 0) {
    res.status(400);
    throw new Error("Product IDs are required");
  }

  try {
    const validProducts = [];
    const invalidProducts = [];

    for (const productId of productIds) {
      const product = await Product.findById(productId)
        .populate("supplier", "name")
        .populate("category", "name")
        .populate("brand", "name");

      if (!product) {
        invalidProducts.push({
          productId,
          reason: "Product not found in store",
        });
      } else if (
        supplierId &&
        product.supplier &&
        product.supplier._id.toString() !== supplierId
      ) {
        invalidProducts.push({
          productId,
          productName: product.name,
          reason: `Product belongs to supplier: ${product.supplier.name}`,
        });
      } else {
        validProducts.push({
          _id: product._id,
          name: product.name,
          currentStock: product.stock,
          price: product.price,
          category: product.category?.name,
          brand: product.brand?.name,
          supplier: product.supplier?.name,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        validProducts,
        invalidProducts,
        allValid: invalidProducts.length === 0,
      },
    });
  } catch (error) {
    console.error("Error in validateProductsForInvoice:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
