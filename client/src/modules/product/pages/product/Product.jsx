import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetProductById } from "../../../product/slice/productSlice";
import { useAddItemToCart } from "../../../cart/slice/cartSlice";
import {
  useAddToFavourites,
  useRemoveFromFavourites,
  useCheckFavourite,
} from "../../../favourites/slice/favouriteSlice";
import {
  useGetProductReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from "../../../profile/slice/reviewSlice";
import { useCurrentUser } from "../../../auth/slice/authSlice";
import ProductReviews from "../../components/product-reviews/ProductReviews";
import {
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Share2,
  Package,
  Shield,
  Truck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Tag,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Product states
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Data fetching
  const { data: userData } = useCurrentUser();
  const user = userData?.data;

  const { data: product, isLoading, error } = useGetProductById(id);
  const productData = product?.data;

  const { data: reviewsData } = useGetProductReviews(id, { isApproved: true });
  const reviews = reviewsData?.data || [];

  const { data: favouriteCheck } = useCheckFavourite(id);
  const isFavourite = favouriteCheck?.data?.isFavourite;

  // Mutations
  const addToCart = useAddItemToCart();
  const addToFavourites = useAddToFavourites();
  const removeFromFavourites = useRemoveFromFavourites();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  // Memoized values
  const productImages = useMemo(() => productData?.images || [], [productData]);

  const discountPercentage = useMemo(() => {
    if (productData?.originalPrice && productData?.price) {
      const discount =
        ((productData.originalPrice - productData.price) /
          productData.originalPrice) *
        100;
      return Math.round(discount);
    }
    return null;
  }, [productData]);

  // Zoom handler without debounce for smoother experience
  const handleImageMove = (e) => {
    if (!isZoomed || !productImages[selectedImage]) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setZoomPosition({ x: clampedX, y: clampedY });
  };

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!productImages.length) return;

      if (e.key === "ArrowLeft") {
        setSelectedImage((prev) =>
          prev > 0 ? prev - 1 : productImages.length - 1
        );
      } else if (e.key === "ArrowRight") {
        setSelectedImage((prev) =>
          prev < productImages.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "Escape" && isZoomed) {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [productImages, isZoomed]);

  // Handlers
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productData?.name,
          text: `Check out ${
            productData?.name
          } - ${productData?.description?.substring(0, 100)}...`,
          url: window.location.href,
        });
        toast.success("Product shared successfully!");
      } catch (error) {
        console.log("Sharing cancelled:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleAddToCart = useCallback(() => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    addToCart.mutate(
      { productId: id, quantity },
      {
        onSuccess: () => {
          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Added to cart successfully!
            </div>
          );
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Failed to add to cart");
        },
      }
    );
  }, [user, id, quantity, addToCart, navigate]);

  const handleToggleFavourite = useCallback(() => {
    if (!user) {
      toast.error("Please login to add to favourites");
      navigate("/login");
      return;
    }

    if (isFavourite) {
      removeFromFavourites.mutate(id, {
        onSuccess: () => toast.success("Removed from favourites"),
      });
    } else {
      addToFavourites.mutate(id, {
        onSuccess: () => toast.success("Added to favourites!"),
      });
    }
  }, [user, isFavourite, id, addToFavourites, removeFromFavourites, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"
        />
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  // Error state
  if (error || !productData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </button>

        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-600 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <span className="mx-2">•</span>
        <button
          onClick={() => navigate("/products")}
          className="hover:text-blue-600 transition"
        >
          Products
        </button>
        <span className="mx-2">•</span>
        <button
          onClick={() => navigate(`/category/${productData.category?._id}`)}
          className="hover:text-blue-600 transition"
        >
          {productData.category?.name}
        </button>
        <span className="mx-2">•</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">
          {productData.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images Section - FIXED */}
        <div className="space-y-4">
          {/* Main Image with Zoom */}
          <div
            className="relative rounded-2xl overflow-hidden bg-gray-100 group aspect-square"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleImageMove}
          >
            {discountPercentage && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  -{discountPercentage}%
                </span>
              </div>
            )}

            <img
              src={productImages[selectedImage] || "/placeholder.png"}
              alt={productData.name}
              className="w-full h-full object-contain p-4 cursor-zoom-in transition-transform duration-200"
              style={{
                transform: isZoomed ? "scale(1.5)" : "scale(1)",
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
              loading="lazy"
            />

            {/* Image Navigation Arrows */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev > 0 ? prev - 1 : productImages.length - 1
                    )
                  }
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev < productImages.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleToggleFavourite}
                className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition"
                aria-label={
                  isFavourite ? "Remove from favourites" : "Add to favourites"
                }
              >
                <Heart
                  className={`h-6 w-6 transition ${
                    isFavourite
                      ? "fill-red-500 text-red-500"
                      : "text-gray-700 hover:text-red-500"
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition"
                aria-label="Share product"
              >
                <Share2 className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {productImages.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-blue-600 ring-2 ring-blue-600 ring-opacity-30"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${productData.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {productData.name}
            </h1>
            <p className="text-gray-600 mb-2">{productData.brand?.name}</p>

            {/* Rating and SKU */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(productData.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-blue-700">
                    {productData.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-600 text-sm">
                  ({productData.numReviews} reviews)
                </span>
              </div>
              {productData.sku && (
                <div className="text-sm text-gray-500">
                  SKU: {productData.sku}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-gray-900">
              ${productData.price.toFixed(2)}
            </span>
            {productData.originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                ${productData.originalPrice.toFixed(2)}
              </span>
            )}
            {discountPercentage && (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                Save {discountPercentage}%
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {productData.description}
            </p>
          </div>

          {/* Key Features */}
          {productData.features && productData.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Key Features
              </h3>
              <ul className="space-y-2">
                {productData.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust Signals */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Free Shipping
                </p>
                <p className="text-xs text-gray-600">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Easy Returns
                </p>
                <p className="text-xs text-gray-600">30-day policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Warranty</p>
                <p className="text-xs text-gray-600">2 years included</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Delivery</p>
                <p className="text-xs text-gray-600">2-3 business days</p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Quantity</span>
              <span className="text-sm text-gray-600">
                Max: {productData.stock} units
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-3 border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="px-6 py-3 border-y border-gray-300 min-w-[60px] text-center">
                <span className="font-medium">{quantity}</span>
              </div>
              <button
                onClick={() =>
                  setQuantity(Math.min(productData.stock, quantity + 1))
                }
                disabled={quantity >= productData.stock}
                className="p-3 border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="pt-4">
            <button
              onClick={handleAddToCart}
              disabled={productData.stock === 0 || addToCart.isPending}
              className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {addToCart.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              {addToCart.isPending ? "Adding..." : "Add to Cart"}
              {productData.stock === 0 && " (Out of Stock)"}
            </button>
          </div>

          {/* Stock Warning */}
          {productData.stock < 10 && productData.stock > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Only {productData.stock} left in stock! Order soon.
              </p>
            </div>
          )}

          {/* Category Tags */}
          <div className="pt-4">
            <div className="flex flex-wrap gap-2">
              {productData.category?.name && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Tag className="h-3 w-3" />
                  {productData.category.name}
                </span>
              )}
              {productData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews
        productId={id}
        reviews={reviews}
        averageRating={productData.rating}
        user={user}
        createReview={createReview}
        updateReview={updateReview}
        deleteReview={deleteReview}
      />
    </div>
  );
}

export default Product;
