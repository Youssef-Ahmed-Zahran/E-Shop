import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, Star, X } from "lucide-react";

function ProductList({ cart, handleUpdateQuantity, handleRemoveItem }) {
  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {cart.items.map((item) => (
        <div
          key={item.product._id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Product Image */}
              <div className="relative">
                <Link to={`/product/${item.product._id}`}>
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                  />
                </Link>
                {item.quantity > 1 && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                    {item.quantity}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product._id}`}
                      className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>

                    {item.product.rating && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(item.product.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({item.product.rating?.toFixed(1)})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-2xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} each
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg self-start"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-xl">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product._id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="p-3 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-xl"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-6 py-2 border-x border-gray-300 font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product._id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="p-3 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-r-xl"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {item.product.stock <= 10 && item.product.stock > 0 && (
                      <span className="text-sm text-orange-600 font-medium">
                        Only {item.product.stock} left in stock
                      </span>
                    )}
                  </div>

                  {/* Stock Info */}
                  <div className="text-sm text-gray-500">
                    Stock: {item.product.stock} available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
