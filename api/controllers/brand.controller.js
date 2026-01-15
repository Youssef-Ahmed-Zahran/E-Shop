import { Brand } from "../models/brand.model.js";

/**
 *   @desc   Create Brand
 *   @route  /api/v1/brands
 *   @method  Post
 *   @access  private (Admin)
 */
export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    const brandExists = await Brand.findOne({ name });

    if (brandExists) {
      return res.status(400).json({ message: "Brand already exists" });
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
};

/**
 *   @desc   Get all brands with pagination
 *   @route  /api/v1/brands
 *   @method  Get
 *   @access  public
 *   @query   page, limit, search, sortBy, sortOrder
 */
export const getAllBrands = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "name";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    // Build sort object
    const sortObject = { [sortBy]: sortOrder };

    // Get total count for pagination info
    const totalBrands = await Brand.countDocuments(searchFilter);

    // Get paginated brands
    const brands = await Brand.find(searchFilter)
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalBrands / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: brands,
      pagination: {
        currentPage: page,
        totalPages,
        totalBrands,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    });
  } catch (error) {
    console.error("Error in getAllBrands controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

/**
 *   @desc   Get brand by ID
 *   @route  /api/brands/:id
 *   @method  Get
 *   @access  public
 */
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
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
};

/**
 *   @desc   Update brand by ID
 *   @route  /api/brands/:id
 *   @method  PUT
 *   @access  private (Admin)
 */
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
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
};

/**
 *   @desc   Delete brand
 *   @route  /api/brands/:id
 *   @method  DELETE
 *   @access  private (Admin)
 */
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
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
};
