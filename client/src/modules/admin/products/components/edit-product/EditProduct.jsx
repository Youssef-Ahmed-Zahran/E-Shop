import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetProductById,
  useUpdateProduct,
} from "../../../../product/slice/productSlice";
import { useGetAllCategories } from "../../../../shop/slice/categorySlice";
import { useGetAllBrands } from "../../../../shop/slice/brandSlice";
import Sidebar from "../../../components/sidebar/Sidebar";
import toast from "react-hot-toast";
import { X, Upload, Image as ImageIcon } from "lucide-react";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useGetProductById(id);
  const updateProduct = useUpdateProduct();
  const { data: categories } = useGetAllCategories();
  const { data: brands } = useGetAllBrands();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    isFeatured: false,
    isActive: true,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  useEffect(() => {
    if (product?.data) {
      console.log("Product data loaded:", product.data);

      setFormData({
        name: product.data.name || "",
        description: product.data.description || "",
        price: product.data.price || "",
        category: product.data.category?._id || "",
        brand: product.data.brand?._id || "",
        stock: product.data.stock || "",
        isFeatured: product.data.isFeatured || false,
        isActive:
          product.data.isActive !== undefined ? product.data.isActive : true,
      });

      // Set existing images
      let images = [];
      if (product.data.images && Array.isArray(product.data.images)) {
        images = product.data.images;
      } else if (product.data.images) {
        images = [product.data.images];
      } else if (product.data.image) {
        images = [product.data.image];
      }

      console.log("Existing images:", images);
      setExistingImages(images);
    }
  }, [product]);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log("Files selected:", files);

    if (files.length === 0) return;

    // Validate file types and size
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
      }

      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs for new files
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    console.log("New previews created:", newPreviews);

    setNewImageFiles((prev) => {
      const updated = [...prev, ...validFiles];
      console.log("Updated new image files:", updated);
      return updated;
    });

    setImagePreviewUrls((prev) => {
      const updated = [...prev, ...newPreviews];
      console.log("Updated preview URLs:", updated);
      return updated;
    });

    toast.success(`${validFiles.length} image(s) added`);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = (imageUrl) => {
    console.log("Removing existing image:", imageUrl);

    setExistingImages((prev) => {
      const updated = prev.filter((img) => img !== imageUrl);
      console.log("Updated existing images:", updated);
      return updated;
    });

    toast.success("Image removed");
  };

  const removeNewImage = (index) => {
    console.log("Removing new image at index:", index);

    // Revoke the object URL to avoid memory leaks
    if (imagePreviewUrls[index]) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }

    setNewImageFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      console.log("Updated new image files:", updated);
      return updated;
    });

    setImagePreviewUrls((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      console.log("Updated preview URLs:", updated);
      return updated;
    });

    toast.success("New image removed");
  };

  const handleSubmit = async () => {
    console.log("=== FORM SUBMISSION STARTED ===");

    // Check if at least one image exists
    const totalImages = existingImages.length + newImageFiles.length;
    console.log("Total images:", totalImages);

    if (totalImages === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    try {
      // Convert new image files to base64
      console.log("Converting new images to base64...");
      const newImagesBase64 = await Promise.all(
        newImageFiles.map((file) => fileToBase64(file))
      );
      console.log(
        "Base64 conversion complete:",
        newImagesBase64.length,
        "images"
      );

      // Combine existing images with new base64 images
      const allImages = [...existingImages, ...newImagesBase64];
      console.log("Total images to send:", allImages.length);

      // Create the update payload
      const submitData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        brand: formData.brand,
        stock: formData.stock,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        images: allImages, // Array of URLs and base64 strings
      };

      console.log("Submitting data:", {
        ...submitData,
        images: `${allImages.length} images (${existingImages.length} existing + ${newImagesBase64.length} new)`,
      });

      updateProduct.mutate(
        { id, data: submitData },
        {
          onSuccess: (response) => {
            console.log("Update success:", response);
            toast.success("Product updated successfully!");

            // Clean up preview URLs
            imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

            navigate("/admin/products");
          },
          onError: (error) => {
            console.error("=== UPDATE ERROR ===");
            console.error("Error object:", error);
            console.error("Error response:", error.response);
            console.error("Error message:", error.message);

            toast.error(
              error.response?.data?.message ||
                error.message ||
                "Failed to update product"
            );
          },
        }
      );
    } catch (error) {
      console.error("Error converting images:", error);
      toast.error("Failed to process images");
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up preview URLs");
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

        <div className="max-w-2xl bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {/* Product Images Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Images
              </label>

              {/* File Input */}
              <div className="mb-4">
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-gray-100">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Count */}
              <div className="text-sm text-gray-600 mb-2">
                Total Images: {existingImages.length + imagePreviewUrls.length}
                {(existingImages.length > 0 || imagePreviewUrls.length > 0) &&
                  ` (${existingImages.length} existing, ${imagePreviewUrls.length} new)`}
              </div>

              {/* Image Previews Grid */}
              {(existingImages.length > 0 || imagePreviewUrls.length > 0) && (
                <div className="grid grid-cols-4 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((imageUrl, index) => (
                    <div
                      key={`existing-${index}-${imageUrl}`}
                      className="relative group"
                    >
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-blue-200"
                        onError={(e) => {
                          console.error("Image load error:", imageUrl);
                          e.target.src =
                            "https://via.placeholder.com/150?text=Error";
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeExistingImage(imageUrl);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all z-10"
                        title="Remove this image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded shadow">
                        Current
                      </div>
                    </div>
                  ))}

                  {/* New Image Previews */}
                  {imagePreviewUrls.map((previewUrl, index) => (
                    <div
                      key={`new-${index}-${previewUrl}`}
                      className="relative group"
                    >
                      <img
                        src={previewUrl}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-300"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeNewImage(index);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all z-10"
                        title="Remove this image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded shadow">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {existingImages.length === 0 && imagePreviewUrls.length === 0 && (
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                    <p className="text-sm">No images uploaded</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Brand</option>
                  {brands?.data?.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor="featured"
                  className="text-sm font-medium cursor-pointer"
                >
                  Featured Product
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium cursor-pointer"
                >
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={updateProduct.isPending}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {updateProduct.isPending ? "Updating..." : "Update Product"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
