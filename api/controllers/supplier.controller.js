import asyncHandler from "express-async-handler";
import { Supplier } from "../models/supplier.model.js";

/**
 *   @desc   Create new supplier
 *   @route  /api/v1/suppliers
 *   @method  POST
 *   @access  private (Admin)
 */
export const createSupplier = asyncHandler(async (req, res) => {
  const { name, email, phone, address, company } = req.body;

  try {
    // Check if supplier already exists
    const supplierExists = await Supplier.findOne({ email });

    if (supplierExists) {
      res.status(400);
      throw new Error("Supplier with this email already exists");
    }

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      company,
    });

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("Error in createSupplier:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get all suppliers
 *   @route  /api/v1/suppliers
 *   @method  GET
 *   @access  private (Admin)
 */
export const getAllSuppliers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  try {
    const total = await Supplier.countDocuments(filter);
    const suppliers = await Supplier.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: suppliers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllSuppliers:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get supplier by ID
 *   @route  /api/v1/suppliers/:id
 *   @method  GET
 *   @access  private (Admin)
 */
export const getSupplierById = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      res.status(404);
      throw new Error("Supplier not found");
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error("Error in getSupplierById:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Update supplier
 *   @route  /api/v1/suppliers/:id
 *   @method  PUT
 *   @access  private (Admin)
 */
export const updateSupplier = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      res.status(404);
      throw new Error("Supplier not found");
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: updatedSupplier,
    });
  } catch (error) {
    console.error("Error in updateSupplier:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Delete supplier
 *   @route  /api/v1/suppliers/:id
 *   @method  DELETE
 *   @access  private (Admin)
 */
export const deleteSupplier = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      res.status(404);
      throw new Error("Supplier not found");
    }

    await supplier.deleteOne();

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteSupplier:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Toggle supplier active status
 *   @route  /api/v1/suppliers/:id/toggle-status
 *   @method  PATCH
 *   @access  private (Admin)
 */
export const toggleSupplierStatus = asyncHandler(async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      res.status(404);
      throw new Error("Supplier not found");
    }

    supplier.isActive = !supplier.isActive;
    await supplier.save();

    res.status(200).json({
      success: true,
      message: `Supplier ${
        supplier.isActive ? "activated" : "deactivated"
      } successfully`,
      data: supplier,
    });
  } catch (error) {
    console.error("Error in toggleSupplierStatus:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
