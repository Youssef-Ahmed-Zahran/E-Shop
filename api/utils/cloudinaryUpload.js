import cloudinary from "../lib/cloudinary.js";
/**
 * Upload single base64 image to Cloudinary
 */
export const uploadToCloudinary = async (base64Image, folder = "products") => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
};

/**
 * Upload multiple base64 images to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
  base64Images,
  folder = "products"
) => {
  try {
    const uploadPromises = base64Images.map((image) =>
      uploadToCloudinary(image, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL");
    }

    // Get everything after 'upload/v123456789/'
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExtension.substring(
      0,
      publicIdWithExtension.lastIndexOf(".")
    );

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

/**
 * Delete multiple images from Cloudinary
 */
export const deleteMultipleFromCloudinary = async (imageUrls) => {
  try {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return;
    }

    const deletePromises = imageUrls.map((url) => deleteFromCloudinary(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple images:", error);
    throw error;
  }
};
