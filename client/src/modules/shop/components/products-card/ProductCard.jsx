import { Link } from "react-router-dom";
import { useAddItemToCart } from "../../../cart/slice/cartSlice";
import {
  useAddToFavourites,
  useRemoveFromFavourites,
  useCheckFavourite,
} from "../../../favourites/slice/favouriteSlice";
import { ShoppingCart, Heart, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

// Define low stock threshold
const LOW_STOCK_THRESHOLD = 5;

function ProductCard({ product }) {
  const addToCart = useAddItemToCart();
  const addToFavourites = useAddToFavourites();
  const removeFromFavourites = useRemoveFromFavourites();
  const { data: favouriteCheck } = useCheckFavourite(product._id);

  const isFavourite = favouriteCheck?.data?.isFavourite;
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId: product._id, quantity: 1 },
      {
        onSuccess: () => {
          toast.success("Added to cart!");
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Failed to add to cart");
        },
      }
    );
  };

  const handleToggleFavourite = () => {
    if (isFavourite) {
      removeFromFavourites.mutate(product._id, {
        onSuccess: () => {
          toast.success("Removed from favourites");
        },
      });
    } else {
      addToFavourites.mutate(product._id, {
        onSuccess: () => {
          toast.success("Added to favourites!");
        },
      });
    }
  };

  // Function to render stock status
  const renderStockStatus = () => {
    if (isOutOfStock) {
      return (
        <span className="text-sm text-red-600 font-medium">Out of Stock</span>
      );
    }

    if (isLowStock) {
      return (
        <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
          <AlertTriangle size={16} />
          Only {product.stock} left!
        </span>
      );
    }

    return (
      <span className="text-sm text-green-600">Stock: {product.stock}</span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product._id}`} className="block relative">
        <img
          src={product.images[0] || "/placeholder.png"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded">
            Featured
          </span>
        )}
        {/* Low Stock Badge on Image */}
        {isLowStock && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
            <AlertTriangle size={12} />
            Low Stock
          </span>
        )}
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold mb-2 truncate hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          {renderStockStatus()}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addToCart.isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>

          <button
            onClick={handleToggleFavourite}
            className={`p-2 rounded-lg border ${
              isFavourite
                ? "bg-red-50 border-red-500 text-red-500"
                : "bg-gray-50 border-gray-300 text-gray-600"
            } hover:bg-red-100`}
          >
            <Heart size={18} fill={isFavourite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
