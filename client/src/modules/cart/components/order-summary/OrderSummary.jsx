import { Link } from "react-router-dom";
import { CreditCard, Shield, Truck, Package } from "lucide-react";

function OrderSummary({ cart }) {
  if (!cart) {
    return null;
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </h2>
          </div>
          <p className="text-sm text-gray-300">Review total and proceed</p>
        </div>

        <div className="p-6">
          {/* Price Breakdown */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">
                ${cart.totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping
              </span>
              <span className="text-sm text-gray-600">
                Calculated at checkout
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <p className="text-sm text-gray-500">Including all charges</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    ${cart.totalPrice.toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-500">USD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            to="/order"
            className="block w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-lg hover:shadow-xl text-center mb-4 group"
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              Proceed to Checkout
              <Shield className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </div>
          </Link>

          {/* Continue Shopping */}
          <Link
            to="/shop"
            className="block w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-center font-medium"
          >
            Continue Shopping
          </Link>

          {/* Security Info */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Shield className="h-4 w-4 text-green-500" />
              <span>🔒 Secure checkout</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Truck className="h-4 w-4 text-blue-500" />
              <span>🚚 Free shipping on orders over $50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
