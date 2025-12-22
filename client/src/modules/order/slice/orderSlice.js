import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const ORDERS_QUERY_KEY = ["orders"];
export const ORDER_QUERY_KEY = ["order"];
export const MY_ORDERS_QUERY_KEY = ["myOrders"];

// *********************************** ((API Functions)) **************************************** //

const createOrder = async (data) => {
  const response = await axiosInstance.post("/orders", data);
  return response.data;
};

const getOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

const getMyOrders = async () => {
  const response = await axiosInstance.get("/orders/myorders");
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

// *********************************** ((React-Query Hooks)) **************************************** //

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
};

export const useGetOrderById = (id) => {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useGetMyOrders = () => {
  return useQuery({
    queryKey: MY_ORDERS_QUERY_KEY,
    queryFn: getMyOrders,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetAllOrders = (filters = {}) => {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, filters],
    queryFn: () => getAllOrders(filters),
    staleTime: 1 * 60 * 1000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ORDER_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
    },
  });
};

export const useUpdateOrderToPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderToPaid,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...ORDER_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDER_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
    },
  });
};
