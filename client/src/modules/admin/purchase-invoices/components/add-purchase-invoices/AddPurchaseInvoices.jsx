// admin/modules/purchaseInvoices/components/AddPurchaseInvoices.js
import { useState, useEffect } from "react";
import {
  useCreatePurchaseInvoice,
  useValidateProductsForInvoice,
} from "../../slice/purchaseInvoiceSlice";
// ✅ Changed: Import useGetActiveSuppliers instead of useGetAllSuppliers
import { useGetActiveSuppliers } from "../../../suppliers/slice/supplierSlice";
import { useGetAllProducts } from "../../../../product/slice/productSlice";
import { Plus, AlertCircle, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";

function AddPurchaseInvoices({ showModal, setShowModal, onSuccess }) {
  // ✅ Changed: Use useGetActiveSuppliers - only active suppliers will appear
  const { data: suppliers, isLoading: suppliersLoading } =
    useGetActiveSuppliers();
  const { data: products } = useGetAllProducts({ limit: 100 });
  const createInvoice = useCreatePurchaseInvoice();
  const validateProducts = useValidateProductsForInvoice();

  const [formData, setFormData] = useState({
    supplierId: "",
    items: [],
    shippingCost: "",
    taxAmount: "",
  });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemData, setItemData] = useState({ quantity: 1, unitPrice: "" });
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Validation logic (commented out as per original)
  }, [formData.items, formData.supplierId]);

  const validateProductsOnChange = async () => {
    setIsValidating(true);
    try {
      const payload = {
        supplierId: formData.supplierId,
        items: formData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const result = await validateProducts.mutateAsync(payload);
      setValidationResults(result.data);

      if (result.data?.isValid === false) {
        toast.error("Some products have validation issues", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Failed to validate products");
      setValidationResults(null);
    } finally {
      setIsValidating(false);
    }
  };

  // ✅ NEW: Handler to auto-populate unit price when product is selected
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);

    if (productId) {
      const product = products?.data?.find((p) => p._id === productId);
      if (product) {
        // Get price from product (the field name is 'price' based on your schema)
        const unitPrice = product.price || "";

        console.log("Selected product:", product); // For debugging
        console.log("Unit price:", unitPrice); // For debugging

        setItemData({
          ...itemData,
          unitPrice: unitPrice,
        });
      }
    } else {
      setItemData({ quantity: 1, unitPrice: "" });
    }
  };

  const addItem = () => {
    const product = products?.data?.find((p) => p._id === selectedProduct);
    if (!product) {
      toast.error("Please select a product");
      return;
    }

    if (!itemData.quantity || itemData.quantity < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!itemData.unitPrice || itemData.unitPrice < 0) {
      toast.error("Please enter a valid unit price");
      return;
    }

    // ✅ Updated to match backend schema (uses 'product' not 'productId')
    const newItem = {
      product: product._id, // Backend expects 'product'
      productId: product._id, // Keep for frontend validation
      productName: product.name,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      totalPrice: itemData.quantity * itemData.unitPrice, // Calculate total
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    setSelectedProduct("");
    setItemData({ quantity: 1, unitPrice: "" });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (!formData.supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (validationResults?.isValid === false) {
      const hasCriticalErrors = validationResults.invalidItems?.some(
        (item) => item.isCritical === true
      );

      if (hasCriticalErrors) {
        toast.error(
          "Please fix critical validation errors before creating invoice"
        );
        return;
      }

      const confirm = window.confirm(
        "Some products have validation warnings. Do you want to proceed anyway?"
      );
      if (!confirm) {
        return;
      }
    }

    // ✅ Prepare payload to match backend schema
    const invoicePayload = {
      supplier: formData.supplierId, // Backend expects 'supplier'
      items: formData.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      shippingCost: formData.shippingCost,
      taxAmount: formData.taxAmount,
      subtotal: formData.items.reduce((sum, item) => sum + item.totalPrice, 0),
      totalAmount: calculateTotal(),
    };

    createInvoice.mutate(invoicePayload, {
      onSuccess: () => {
        toast.success("Purchase invoice created successfully!");
        resetForm();
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to create invoice"
        );
      },
    });
  };

  const resetForm = () => {
    setShowModal(false);
    setFormData({
      supplierId: "",
      items: [],
      shippingCost: "",
      taxAmount: "",
    });
    setValidationResults(null);
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    return (
      subtotal +
      parseFloat(formData.shippingCost || 0) +
      parseFloat(formData.taxAmount || 0)
    );
  };

  const getProductValidationStatus = (productId) => {
    if (!validationResults?.items) return null;
    return validationResults.items.find((item) => item.productId === productId);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Purchase Invoice
          </h2>
          <button
            onClick={resetForm}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Supplier dropdown - Only shows ACTIVE suppliers */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) =>
                setFormData({ ...formData, supplierId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
              disabled={suppliersLoading}
            >
              <option value="">
                {suppliersLoading ? "Loading suppliers..." : "Select Supplier"}
              </option>
              {suppliers?.data?.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name} {supplier.company && `- ${supplier.company}`}
                </option>
              ))}
            </select>
            {/* ✅ Show warning if no active suppliers */}
            {!suppliersLoading && suppliers?.data?.length === 0 && (
              <div className="flex items-center gap-2 mt-2 text-amber-600">
                <AlertCircle size={16} />
                <span className="text-sm">
                  No active suppliers available. Please activate a supplier
                  first.
                </span>
              </div>
            )}
          </div>

          {/* Validation Status */}
          {validationResults && (
            <div
              className={`p-3 rounded-lg ${
                validationResults.isValid
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {validationResults.isValid ? (
                  <>
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="font-medium text-green-700">
                      All products validated successfully
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-yellow-500" size={20} />
                    <span className="font-medium text-yellow-700">
                      Validation warnings found
                    </span>
                  </>
                )}
              </div>
              {validationResults.message && (
                <p className="text-sm">{validationResults.message}</p>
              )}
              {validationResults.invalidItems?.map((item, index) => (
                <div key={index} className="text-sm mt-1 pl-6">
                  <span className="font-medium">{item.productName}:</span>{" "}
                  <span
                    className={
                      item.isCritical ? "text-red-600" : "text-yellow-600"
                    }
                  >
                    {item.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add Products */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Add Products</h3>
              {isValidating && (
                <span className="text-sm text-gray-500">Validating...</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Product</option>
                  {products?.data?.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} (Stock: {product.stock}) - ${product.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 50"
                  value={itemData.quantity}
                  onChange={(e) =>
                    setItemData({
                      ...itemData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={itemData.unitPrice || ""}
                  onChange={(e) =>
                    setItemData({
                      ...itemData,
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addItem}
              disabled={!selectedProduct || !itemData.quantity}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              Add Product
            </button>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="mt-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Product</th>
                      <th className="text-left py-2 px-3">Quantity</th>
                      <th className="text-left py-2 px-3">Unit Price</th>
                      <th className="text-left py-2 px-3">Total</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const validation = getProductValidationStatus(
                        item.productId
                      );
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-3">{item.productName}</td>
                          <td className="py-2 px-3">{item.quantity}</td>
                          <td className="py-2 px-3">
                            ${item.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-2 px-3">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-2 px-3">
                            {validation ? (
                              validation.isValid ? (
                                <CheckCircle
                                  className="text-green-500"
                                  size={16}
                                />
                              ) : (
                                <AlertCircle
                                  className={
                                    validation.isCritical
                                      ? "text-red-500"
                                      : "text-yellow-500"
                                  }
                                  size={16}
                                />
                              )
                            ) : (
                              <span className="text-gray-400 text-sm">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Additional Costs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Shipping Cost ($)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.shippingCost || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingCost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tax Amount ($)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.taxAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Summary */}
          {formData.items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-bold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={
                createInvoice.isPending ||
                isValidating ||
                suppliers?.data?.length === 0
              }
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {createInvoice.isPending ? "Creating..." : "Create Invoice"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPurchaseInvoices;
