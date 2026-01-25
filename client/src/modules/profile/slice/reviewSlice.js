// profile/slice/reviewSlice.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { QUERY_KEYS } from "../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const createReview = async ({ productId, data }) => {
  const response = await axiosInstance.post(
    `/reviews/product/${productId}`,
    data
  );
  return response.data;
};

const getProductReviews = async ({
  productId,
  page = 1,
  limit = 10,
  isApproved,
}) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (isApproved !== undefined) params.append("isApproved", isApproved);

  const response = await axiosInstance.get(
    `/reviews/product/${productId}?${params.toString()}`
  );
  return response.data;
};

const getUserReviews = async ({ page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  const response = await axiosInstance.get(
    `/reviews/my-reviews?${params.toString()}`
  );
  return response.data;
};

const getAllReviews = async ({
  page = 1,
  limit = 10,
  isApproved,
  productId,
  userId,
}) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (isApproved !== undefined) params.append("isApproved", isApproved);
  if (productId) params.append("productId", productId);
  if (userId) params.append("userId", viserId);

  const response = await axiosInstance.get(
    `/reviews/admin/all?${params.toString()}`
  );
  return response.data;
};

const updateReview = async ({ id, data }) => {
  const response = await axiosInstance.put(`/reviews/${id}`, data);
  return response.data;
};

// Updated: Now accepts an object with reviewId
const deleteReview = async ({ reviewId }) => {
  const response = await axiosInstance.delete(`/reviews/${reviewId}`);
  return response.data;
};

const toggleReviewApproval = async (id) => {
  const response = await axiosInstance.patch(`/reviews/${id}/approve`);
  return response.data;
};

const bulkApproveReviews = async (reviewIds) => {
  const response = await axiosInstance.patch("/reviews/admin/bulk-approve", {
    reviewIds,
  });
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (data, variables) => {
      // Invalidate review queries
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCT_REVIEWS, variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_REVIEWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_REVIEWS });

      // Invalidate product queries to update rating
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCT, variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
    },
  });
};

export const useGetProductReviews = (productId, filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCT_REVIEWS, productId, filters],
    queryFn: () => getProductReviews({ productId, ...filters }),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetUserReviews = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.MY_REVIEWS, filters],
    queryFn: () => getUserReviews(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetAllReviews = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ALL_REVIEWS, filters],
    queryFn: () => getAllReviews(filters),
    staleTime: 2 * 60 * 1000,
  });
};

// Updated: Now uses productId from variables
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateReview({ id, data }),
    onSuccess: (data, variables) => {
      // Invalidate review queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_REVIEWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_REVIEWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_REVIEWS });

      // Get productId from variables (passed when calling mutate) or from response
      const productId = variables.productId || data?.data?.product;
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.PRODUCT, productId],
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
    },
  });
};

// Updated: Now accepts object with reviewId and productId
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }) => deleteReview({ reviewId }),
    onSuccess: (data, variables) => {
      // Invalidate review queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_REVIEWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_REVIEWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_REVIEWS });

      // Get productId from variables (passed when calling mutate)
      const productId = variables.productId;
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.PRODUCT, productId],
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
    },
  });
};

export const useToggleReviewApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleReviewApproval,
    onSuccess: (data) => {
      // Invalidate review queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_REVIEWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_REVIEWS });

      const productId = data?.data?.product;
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.PRODUCT, productId],
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
    },
  });
};

export const useBulkApproveReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkApproveReviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_REVIEWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_REVIEWS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
    },
  });
};
