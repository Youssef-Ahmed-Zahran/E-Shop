import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProduct } from "../../../../product/slice/productSlice";
import { useGetAllCategories } from "../../../../shop/slice/categorySlice";
import { useGetAllBrands } from "../../../../shop/slice/brandSlice";
import { useGetAllSuppliers } from "../../../suppliers/slice/supplierSlice";
import Sidebar from "../../../components/sidebar/Sidebar";
import toast from "react-hot-toast";

function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "", // Brand field
    supplier: "", // Supplier field (optional)
    stock: "",
    images: [],
    isFeatured: false,
  });

  const [uploading, setUploading] = useState(false);

  const createProduct = useCreateProduct();
  const { data: categories } = useGetAllCategories();
  const { data: brands } = useGetAllBrands();
  const { data: suppliers } = useGetAllSuppliers();

  // Convert files to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  // Handle multiple image upload (APPEND mode)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalAfterUpload = formData.images.length + files.length;
    if (totalAfterUpload > 10) {
      toast.error(`Max 10 images. You have ${formData.images.length}`);
      return;
    }

    setUploading(true);

    try {
      const base64Images = await Promise.all(
        files.map(async (file) => {
          if (!file.type.startsWith("image/"))
            throw new Error(`${file.name} is not an image`);
          if (file.size > 20 * 1024 * 1024)
            throw new Error(`${file.name} exceeds 20MB`);
          return await fileToBase64(file);
        })
      );

      // Append new images to existing ones
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...base64Images],
      }));

      toast.success(
        `${files.length} image(s) added. Total: ${totalAfterUpload}`
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      fileInputRef.current.value = ""; // Reset input
    }
  };

  // Remove single image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    toast.success("Image removed");
  };

  // Clear all images
  const clearAllImages = () => {
    if (formData.images.length === 0) return;
    if (window.confirm(`Remove all ${formData.images.length} images?`)) {
      setFormData((prev) => ({ ...prev, images: [] }));
      toast.success("All images removed");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quick validation
    const errors = [];
    if (!formData.name) errors.push("Product name");
    if (!formData.description) errors.push("Description");
    if (!formData.price || formData.price <= 0) errors.push("Valid price");
    if (!formData.category) errors.push("Category");
    if (!formData.brand) errors.push("Brand");
    if (formData.images.length === 0) errors.push("At least one image");

    if (errors.length > 0) {
      toast.error(`Required: ${errors.join(", ")}`);
      return;
    }

    // Prepare data
    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      brand: formData.brand,
      supplier: formData.supplier || undefined, // Optional
      stock: parseInt(formData.stock) || 0,
      images: formData.images, // Base64 array
      isFeatured: Boolean(formData.isFeatured),
    };

    createProduct.mutate(productData, {
      onSuccess: () => {
        toast.success("Product created!");
        navigate("/admin/products");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Creation failed");
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Product
            </h1>
            <p className="text-gray-600 mt-1">
              Add a new product to your store with multiple images
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Basic Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter product name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter detailed product description"
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Pricing & Inventory
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Categories & Brand Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Categories & Brand
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block mb-2 font-medium">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div>
                  <label className="block mb-2 font-medium">
                    Supplier (Optional)
                  </label>
                  <select
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Supplier (Optional)</option>
                    {suppliers?.data?.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Images Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Product Images
              </h2>

              <div className="mb-6">
                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="space-y-3">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-700 font-medium">
                      Click to upload multiple images
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 20MB each (Max 10 images)
                    </p>
                    <p className="text-sm text-gray-500">
                      Images will be automatically compressed
                    </p>
                    <p className="text-sm text-gray-500">
                      Hold Ctrl/Cmd to select multiple images
                    </p>
                  </div>

                  {uploading && (
                    <p className="mt-4 text-blue-600 font-medium">
                      Uploading...
                    </p>
                  )}
                </div>
              </div>

              {/* Image Thumbnails Grid */}
              {formData.images.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      {formData.images.length} image(s) uploaded
                    </p>
                    <button
                      type="button"
                      onClick={clearAllImages}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          ×
                        </button>
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Featured Product Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-3 text-gray-900">
                  Featured Product
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2 ml-7">
                Featured products will be highlighted on the homepage
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-8 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProduct.isPending || uploading}
                className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
