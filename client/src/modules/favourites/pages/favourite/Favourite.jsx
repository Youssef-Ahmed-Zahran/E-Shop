import { Link } from "react-router-dom";
import {
  useGetUserFavourites,
  useRemoveFromFavourites,
} from "../../slice/favouriteSlice";
import { useAddItemToCart } from "../../../cart/slice/cartSlice";
import { ShoppingCart, Heart, Package } from "lucide-react";
import toast from "react-hot-toast";

function Favourite() {
  const { data: favourites, isLoading } = useGetUserFavourites();
  const removeFromFavourites = useRemoveFromFavourites();
  const addToCart = useAddItemToCart();

  // Filter out any null/undefined products (deleted ones)
  const products = (favourites?.data?.products || []).filter(
    (product) => product && product._id
  );

  const handleRemove = (productId) => {
    removeFromFavourites.mutate(productId, {
      onSuccess: () => toast.success("Removed from favourites"),
      onError: () => toast.error("Failed to remove from favourites"),
    });
  };

  const handleAddToCart = (productId) => {
    addToCart.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart!"),
        onError: (error) =>
          toast.error(error.response?.data?.message || "Failed to add to cart"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading favourites...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-10 w-36 h-36 mx-auto mb-6 flex items-center justify-center">
            <Heart className="h-16 w-16 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Save items you love by clicking the heart icon.
          </p>
          <Link
            to="/shop"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg"
          >
            <Package className="inline-block h-5 w-5 mr-2" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">My Favourites</h1>
          </div>
          <p className="text-gray-600">
            You have {products.length} saved item{products.length !== 1 && "s"}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
            >
              {/* Remove Button */}
              <button
                onClick={() => handleRemove(product._id)}
                className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
              >
                <Heart className="h-5 w-5 text-red-500 fill-red-500 hover:fill-red-600" />
              </button>

              {/* Product Image */}
              <Link to={`/product/${product._id}`}>
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {Number(product.stock) === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-medium bg-red-500 px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-5">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xl font-bold text-blue-700">
                      ${product.price?.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${product.originalPrice?.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      Number(product.stock) > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {Number(product.stock) > 0
                      ? `${product.stock} left`
                      : "Sold Out"}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product._id)}
                  disabled={Number(product.stock) === 0}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    Number(product.stock) > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="inline-block h-5 w-5 mr-2" />
                  {Number(product.stock) > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-blue-200">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-full">
              <Heart className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">
                You've saved {products.length} item
                {products.length !== 1 && "s"}
              </span>
            </div>
            <p className="text-gray-600 mt-4">
              Add these items to your cart when you're ready to purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Favourite;
