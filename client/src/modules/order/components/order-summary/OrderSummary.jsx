import { ShoppingCart, CheckCircle } from "lucide-react";

function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
  onSubmit,
  isSubmitting,
  submitButtonText = "Place Order",
  showSubmitButton = true,
  isCompact = false,
}) {
  if (isCompact) {
    // Compact version for payment step
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Order Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Shipping:</span>
            <span className="font-semibold">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax:</span>
            <span className="font-semibold">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-3 mt-3">
            <span className="text-gray-900">Total Amount:</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Full version for checkout step
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 sticky top-24">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </h2>
      </div>

      <div className="p-6">
        {/* Items List */}
        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item._id || item.product?._id}
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <img
                src={item.product?.images?.[0] || item.image}
                alt={item.product?.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {item.product?.name || "Product"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ${((item.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 py-4 border-y border-gray-200">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="font-medium">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (10%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mt-4 mb-6">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-blue-600">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Submit Button */}
        {showSubmitButton && (
          <>
            <button
              type="submit"
              onClick={onSubmit}
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  {submitButtonText}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Secure checkout • Your data is protected
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderSummary;
