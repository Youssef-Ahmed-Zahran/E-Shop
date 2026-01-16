// cart/slice/cartSlice.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { QUERY_KEYS } from "../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const getUserCart = async () => {
  const response = await axiosInstance.get("/carts");
  return response.data;
};

const addItemToCart = async (data) => {
  const response = await axiosInstance.post("/carts/items", data);
  return response.data;
};

const updateCartItem = async ({ productId, quantity }) => {
  const response = await axiosInstance.patch(`/carts/items/${productId}`, {
    quantity,
  });
  return response.data;
};

const removeItemFromCart = async (productId) => {
  const response = await axiosInstance.delete(`/carts/items/${productId}`);
  return response.data;
};

const clearCart = async () => {
  const response = await axiosInstance.delete("/carts");
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useGetUserCart = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CART,
    queryFn: getUserCart,
    staleTime: 1 * 60 * 1000,
  });
};

export const useAddItemToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addItemToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
  });
};

export const useRemoveItemFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeItemFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
  });
};
