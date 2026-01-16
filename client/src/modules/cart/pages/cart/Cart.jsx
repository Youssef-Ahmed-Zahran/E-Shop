import { Link } from "react-router-dom";
import {
  useGetUserCart,
  useUpdateCartItem,
  useRemoveItemFromCart,
  useClearCart,
} from "../../slice/cartSlice";
import { ShoppingBag, ShoppingCart, Trash2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import ProductList from "../../components/products-list/ProductsList";
import OrderSummary from "../../components/order-summary/OrderSummary";

function Cart() {
  const { data, isLoading } = useGetUserCart();
  const cart = data?.data;

  const updateCartMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveItemFromCart();
  const clearCartMutation = useClearCart();

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await updateCartMutation.mutateAsync({ productId, quantity });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeItemMutation.mutateAsync(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item" + error.response?.data?.message);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      await clearCartMutation.mutateAsync();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart" + error.response?.data?.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <ShoppingCart className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading your cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-blue-500" />
            </div>
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
              0
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet. Let's find
            something amazing!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl group"
            >
              <ShoppingCart className="h-5 w-5" />
              Browse Products
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold border border-gray-200 hover:border-gray-300"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-gray-600">
            Review and manage your items before checkout
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Items</h2>
              <button
                onClick={handleClearCart}
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </button>
            </div>

            <ProductList
              cart={cart}
              handleUpdateQuantity={handleUpdateQuantity}
              handleRemoveItem={handleRemoveItem}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
