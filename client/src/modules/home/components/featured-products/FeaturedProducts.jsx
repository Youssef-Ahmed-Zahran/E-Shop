// FeaturedProducts.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { useGetFeaturedProducts } from "../../../product/slice/productSlice";
import { useAddItemToCart } from "../../../cart/slice/cartSlice";
import {
  useGetUserFavourites,
  useAddToFavourites,
  useRemoveFromFavourites,
} from "../../../favourites/slice/favouriteSlice";
import { ShoppingCart, Heart, Star, Eye, Package, Tag } from "lucide-react";
import toast from "react-hot-toast";

function FeaturedProducts() {
  const { data, isLoading } = useGetFeaturedProducts();
  const { data: favouritesData } = useGetUserFavourites();
  const products = data?.data || [];
  const favouriteProducts = favouritesData?.data?.products || [];
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const addToCart = useAddItemToCart();
  const addToFavourites = useAddToFavourites();
  const removeFromFavourites = useRemoveFromFavourites();

  // Check if product is in favourites
  const isFavourite = (productId) => {
    return favouriteProducts.some((fav) => fav._id === productId);
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

  const handleToggleFavourite = (productId) => {
    if (isFavourite(productId)) {
      removeFromFavourites.mutate(productId, {
        onSuccess: () => toast.success("Removed from favourites"),
        onError: () => toast.error("Failed to remove from favourites"),
      });
    } else {
      addToFavourites.mutate(productId, {
        onSuccess: () => toast.success("Added to favourites!"),
        onError: (error) =>
          toast.error(
            error.response?.data?.message || "Failed to add to favourites"
          ),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg">
            Handpicked selection just for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="group relative"
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                {/* Product image */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  {/* Out of stock overlay */}
                  {Number(product.stock) === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div
                    className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
                      hoveredProduct === product._id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <button
                      onClick={() => handleToggleFavourite(product._id)}
                      className={`bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform ${
                        isFavourite(product._id) ? "bg-red-50" : ""
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavourite(product._id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                    <Link
                      to={`/product/${product._id}`}
                      className="bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Link>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {/* New badge */}
                    {product.isNew && (
                      <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        NEW
                      </div>
                    )}

                    {/* Discount badge */}
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % OFF
                        </div>
                      )}

                    {/* Low stock badge */}
                    {Number(product.stock) > 0 &&
                      Number(product.stock) <= 5 && (
                        <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Only {product.stock} left
                        </div>
                      )}
                  </div>
                </div>

                {/* Product info */}
                <div className="p-6">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Brand */}
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-2">
                      {typeof product.brand === "object"
                        ? product.brand.name
                        : product.brand}
                    </p>
                  )}

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">
                        ({Number(product.rating)?.toFixed(1)})
                      </span>
                    </div>
                  )}

                  {/* Stock status */}
                  {Number(product.stock) > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          Number(product.stock) <= 5
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          Number(product.stock) <= 5
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {Number(product.stock) <= 5
                          ? `Low Stock (${product.stock})`
                          : "In Stock"}
                      </span>
                    </div>
                  )}

                  {/* Price and add to cart */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ${Number(product.originalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product._id)}
                      disabled={Number(product.stock) === 0}
                      className={`p-3 rounded-xl transition-colors shadow-sm hover:shadow-md ${
                        Number(product.stock) > 0
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="font-semibold">View All Products</span>
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FeaturedProducts;
