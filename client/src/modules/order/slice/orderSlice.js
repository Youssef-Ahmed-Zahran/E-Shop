import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { QUERY_KEYS } from "../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const createOrder = async (data) => {
  const response = await axiosInstance.post("/orders", data);
  return response.data;
};

const getOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

const getMyOrders = async ({ page = 1, limit = 10 }) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);

  const response = await axiosInstance.get(
    `/orders/myorders?${params.toString()}`
  );
  return response.data;
};

const getAllOrders = async ({ page = 1, limit = 10, status }) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (status) params.append("status", status);

  const response = await axiosInstance.get(`/orders?${params.toString()}`);
  return response.data;
};

const updateOrderStatus = async ({ id, status }) => {
  const response = await axiosInstance.patch(`/orders/${id}/status`, {
    status,
  });
  return response.data;
};

const updateOrderToPaid = async ({ id, paymentResult }) => {
  const response = await axiosInstance.patch(
    `/orders/${id}/pay`,
    paymentResult
  );
  return response.data;
};

const cancelOrder = async (id) => {
  const response = await axiosInstance.patch(`/orders/${id}/cancel`);
  return response.data;
};

const getPayPalClientId = async () => {
  const response = await axiosInstance.get("/config/paypal");
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });

      // Invalidate products and refresh product stock
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_STOCK });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
    },
  });
};

export const useGetOrderById = (id) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDER, id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useGetMyOrders = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.MY_ORDERS, filters],
    queryFn: () => getMyOrders(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetAllOrders = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, filters],
    queryFn: () => getAllOrders(filters),
    staleTime: 1 * 60 * 1000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ORDER, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_ORDERS });

      // Invalidate products when order is cancelled (stock changes)
      if (variables.status === "cancelled") {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT });
      }
    },
  });
};

export const useUpdateOrderToPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderToPaid,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.ORDER, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_ORDERS });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ORDER, id] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_ORDERS });

      // Invalidate products when order is cancelled (stock restored)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT });
    },
  });
};

export const useGetPayPalClientId = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PAYPAL_CONFIG,
    queryFn: getPayPalClientId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
