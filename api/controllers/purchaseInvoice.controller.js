import asyncHandler from "express-async-handler";
import { PurchaseInvoice } from "../models/purchaseInvoice.model.js";
import { Product } from "../models/product.model.js";
import { Supplier } from "../models/supplier.model.js";
import mongoose from "mongoose";

/**
 *   @desc   Create purchase invoice and update stock
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

    // Process each item
    for (const item of items) {
      const { productId, productName, quantity, unitPrice, category, brand } =
        item;

      let product;

      // Check if product exists
      if (productId) {
        product = await Product.findById(productId).session(session);
      } else if (productName) {
        // Try to find by name and supplier
        product = await Product.findOne({
          name: productName,
          supplier: supplierId,
        }).session(session);
      }

      // If product doesn't exist, create it
      if (!product) {
        if (!productName || !category || !brand) {
          throw new Error(
            "Product name, category, and brand are required for new products"
          );
        }

        product = await Product.create(
          [
            {
              name: productName,
              description: `Product from ${supplier.name}`,
              price: unitPrice * 1.3, // Add 30% markup as selling price
              category,
              brand,
              supplier: supplierId,
              stock: 0,
              isActive: true,
            },
          ],
          { session }
        );
        product = product[0];
      }

      // Update stock
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
      .json({ message: "Internal server error.", error: error.message });
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
 *   @desc   Delete purchase invoice
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
      message: "Purchase invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error in deletePurchaseInvoice:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
