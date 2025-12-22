import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const PRODUCT_REVIEWS_QUERY_KEY = ["productReviews"];
export const MY_REVIEWS_QUERY_KEY = ["myReviews"];
export const ALL_REVIEWS_QUERY_KEY = ["allReviews"];

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

const getUserReviews = async () => {
  const response = await axiosInstance.get("/reviews/my-reviews");
  return response.data;
};

// New: Get all reviews for admin dashboard
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
  if (userId) params.append("userId", userId);

  const response = await axiosInstance.get(
    `/reviews/admin/all?${params.toString()}`
  );
  return response.data;
};

const updateReview = async ({ id, data }) => {
  const response = await axiosInstance.put(`/reviews/${id}`, data);
  return response.data;
};

const deleteReview = async (id) => {
  const response = await axiosInstance.delete(`/reviews/${id}`);
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
      queryClient.invalidateQueries({
        queryKey: [...PRODUCT_REVIEWS_QUERY_KEY, variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: MY_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_REVIEWS_QUERY_KEY });
    },
  });
};

export const useGetProductReviews = (productId, filters = {}) => {
  return useQuery({
    queryKey: [...PRODUCT_REVIEWS_QUERY_KEY, productId, filters],
    queryFn: () => getProductReviews({ productId, ...filters }),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetUserReviews = () => {
  return useQuery({
    queryKey: MY_REVIEWS_QUERY_KEY,
    queryFn: getUserReviews,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetAllReviews = (filters = {}) => {
  return useQuery({
    queryKey: [...ALL_REVIEWS_QUERY_KEY, filters],
    queryFn: () => getAllReviews(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_REVIEWS_QUERY_KEY });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_REVIEWS_QUERY_KEY });
    },
  });
};

export const useToggleReviewApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleReviewApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_REVIEWS_QUERY_KEY });
    },
  });
};

export const useBulkApproveReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkApproveReviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
