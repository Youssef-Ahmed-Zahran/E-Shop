import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetUserReviews,
  useDeleteReview,
} from "../../../profile/slice/reviewSlice";
import {
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

function MyReviews() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: reviewsData, isLoading } = useGetUserReviews({
    page: currentPage,
    limit,
  });

  const deleteReview = useDeleteReview();

  const reviews = reviewsData?.data || [];
  const pagination = reviewsData?.pagination || {};

  const handleDelete = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteReview.mutate(reviewId, {
        onSuccess: () => {
          toast.success("Review deleted successfully");
          if (reviews.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        },
        onError: () => {
          toast.error("Failed to delete review");
        },
      });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading reviews...
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No reviews yet</h2>
        <Link
          to="/shop"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="text-gray-600">
          {pagination.totalReviews || 0} total review
          {pagination.totalReviews !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const isProductDeleted = !review.product;

          return (
            <div
              key={review._id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                isProductDeleted ? "border-l-4 border-red-400" : ""
              }`}
            >
              <div className="flex gap-4">
                {/* Product Image */}
                {isProductDeleted ? (
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <AlertCircle className="text-gray-400" size={32} />
                  </div>
                ) : (
                  <Link to={`/product/${review.product._id}`}>
                    <img
                      src={review.product.images?.[0] || "/placeholder.png"}
                      alt={review.product.name || "Product"}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </Link>
                )}

                <div className="flex-1">
                  {/* Product Name */}
                  {isProductDeleted ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-500">
                        Product Removed
                      </h3>
                      <p className="text-sm text-red-600 mb-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        This product has been removed by the administrator
                      </p>
                    </div>
                  ) : (
                    <Link to={`/product/${review.product._id}`}>
                      <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
                        {review.product.name || "Product"}
                      </h3>
                    </Link>
                  )}

                  {/* Rating and Date */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Review Comment */}
                  <p className="text-gray-700 mb-2">{review.comment}</p>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        review.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>

                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={deleteReview.isPending}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination - same as before */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex gap-1">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                const showPage =
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                const showEllipsis =
                  (page === 2 && currentPage > 3) ||
                  (page === pagination.totalPages - 1 &&
                    currentPage < pagination.totalPages - 2);

                if (showEllipsis) {
                  return (
                    <span
                      key={page}
                      className="px-3 py-2 text-gray-500 text-sm"
                    >
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReviews;
