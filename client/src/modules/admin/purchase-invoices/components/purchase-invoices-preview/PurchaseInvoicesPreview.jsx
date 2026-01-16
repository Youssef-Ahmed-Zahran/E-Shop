import { X } from "lucide-react";

function PurchaseInvoicesPreview({
  showPreviewModal,
  setShowPreviewModal,
  selectedInvoice,
  setSelectedInvoice,
}) {
  const handleClose = () => {
    setShowPreviewModal(false);
    setSelectedInvoice(null);
  };

  if (!showPreviewModal || !selectedInvoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Invoice Details</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Invoice Number</p>
              <p className="font-semibold text-lg">
                {selectedInvoice.invoiceNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  selectedInvoice.status === "validated"
                    ? "bg-green-100 text-green-800"
                    : selectedInvoice.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : selectedInvoice.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedInvoice.status || "pending"}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Supplier</p>
              <p className="font-semibold">{selectedInvoice.supplier?.name}</p>
              <p className="text-sm text-gray-500">
                {selectedInvoice.supplier?.company}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">
                {new Date(selectedInvoice.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-right py-3 px-4">Quantity</th>
                    <th className="text-right py-3 px-4">Unit Price</th>
                    <th className="text-right py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-3 px-4">
                        {item.product?.name || item.productName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    $
                    {selectedInvoice.items
                      ?.reduce(
                        (sum, item) => sum + item.quantity * item.unitPrice,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
                {selectedInvoice.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      ${selectedInvoice.shippingCost.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedInvoice.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">
                      ${selectedInvoice.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {selectedInvoice.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Notes</h3>
              <p className="text-gray-700 p-3 bg-gray-50 rounded">
                {selectedInvoice.notes}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={handleClose}
              className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseInvoicesPreview;
