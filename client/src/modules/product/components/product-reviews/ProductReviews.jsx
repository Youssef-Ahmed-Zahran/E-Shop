import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Loader2, Edit2, Trash2, X, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ProductReviews({
  productId,
  reviews,
  averageRating,
  user,
  createReview,
  updateReview,
  deleteReview,
}) {
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editData, setEditData] = useState({ rating: 5, comment: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  const isOwnReview = (review) => user && review.user?._id === user._id;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    createReview.mutate(
      { productId, data: reviewData },
      {
        onSuccess: () => {
          setShowReviewForm(false);
          setReviewData({ rating: 5, comment: "" });
        },
      }
    );
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);
    setEditData({ rating: review.rating, comment: review.comment });
    setOpenMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditData({ rating: 5, comment: "" });
  };

  // Updated: Now passes productId along with other data
  const handleUpdateReview = (e) => {
    e.preventDefault();
    updateReview.mutate(
      {
        id: editingReviewId,
        data: editData,
        productId, // Pass productId for cache invalidation
      },
      {
        onSuccess: () => {
          setEditingReviewId(null);
          setEditData({ rating: 5, comment: "" });
        },
      }
    );
  };

  // Updated: Now passes both reviewId and productId
  const handleDeleteReview = (reviewId) => {
    deleteReview.mutate(
      {
        reviewId,
        productId, // Pass productId for cache invalidation
      },
      {
        onSuccess: () => setDeleteConfirmId(null),
      }
    );
  };

  const handleToggleMenu = (e, reviewId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === reviewId ? null : reviewId);
  };

  return (
    <div className="border-t pt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Customer Reviews
          </h2>
          <p className="text-gray-600">
            Average rating: {averageRating?.toFixed(1) || "0.0"} out of 5
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitReview}
            className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl mb-8 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Share Your Experience
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating
              </label>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setReviewData({ ...reviewData, rating: i + 1 })
                    }
                    className="transform hover:scale-110 transition"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        i < reviewData.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-4 text-lg font-medium">
                  {reviewData.rating}/5
                </span>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Review
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Share your experience..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewData({ rating: 5, comment: "" });
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createReview.isPending}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {createReview.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Delete Review
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReview(deleteConfirmId)}
                  disabled={deleteReview.isPending}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {deleteReview.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Star className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.slice(0, 4).map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
            >
              {editingReviewId === review._id ? (
                // Edit Mode
                <form onSubmit={handleUpdateReview}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Edit Your Review</h4>
                    <button type="button" onClick={handleCancelEdit}>
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setEditData({ ...editData, rating: i + 1 })
                          }
                        >
                          <Star
                            className={`h-8 w-8 ${
                              i < editData.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={editData.comment}
                    onChange={(e) =>
                      setEditData({ ...editData, comment: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateReview.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center"
                    >
                      {updateReview.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Update
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="font-semibold text-blue-700">
                          {review.user?.name?.charAt(0).toUpperCase() || "A"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {review.user?.name || "Anonymous"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {isOwnReview(review) && (
                        <div className="relative">
                          <button
                            onClick={(e) => handleToggleMenu(e, review._id)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-500" />
                          </button>

                          <AnimatePresence>
                            {openMenuId === review._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[120px] z-10"
                              >
                                <button
                                  onClick={() => handleStartEdit(review)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteConfirmId(review._id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  {review.updatedAt !== review.createdAt && (
                    <p className="text-xs text-gray-400 mt-3">(edited)</p>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {reviews.length > 4 && (
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(`/product/${productId}/reviews`)}
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50"
          >
            View All Reviews ({reviews.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductReviews;
