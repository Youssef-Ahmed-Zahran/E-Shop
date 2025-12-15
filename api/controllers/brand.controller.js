import asyncHandler from "express-async-handler";
import { Brand } from "../models/brand.model.js";

/**
 *   @desc   Create Brand
 *   @route  /api/v1/brands
 *   @method  Post
 *   @access  private (Admin)
 */
export const createBrand = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    const brandExists = await Brand.findOne({ name });

    if (brandExists) {
      res.status(400);
      throw new Error("Brand already exists");
    }

    const brand = await Brand.create({ name });

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Error in createBrand controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get all brands
 *   @route  /api/v1/brands
 *   @method  Get
 *   @access  public
 */
export const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    console.error("Error in getAllBrands controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Get brand by ID
 *   @route  /api/brands/:id
 *   @method  Get
 *   @access  public
 */
export const getBrandById = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      res.status(404);
      throw new Error("Brand not found");
    }

    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error("Error in getBrandById controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Update brand by ID
 *   @route  /api/brands/:id
 *   @method  PUT
 *   @access  private (Admin)
 */
export const updateBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      res.status(404);
      throw new Error("Brand not found");
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    console.error("Error in updateBrand controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});

/**
 *   @desc   Delete brand
 *   @route  /api/brands/:id
 *   @method  DELETE
 *   @access  private (Admin)
 */
export const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      res.status(404);
      throw new Error("Brand not found");
    }

    await brand.deleteOne();

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteBrand controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
});
