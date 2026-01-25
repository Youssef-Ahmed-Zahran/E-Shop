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

// ✅ Standard cart query with proper caching
export const useGetUserCart = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CART,
    queryFn: getUserCart,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ✅ Optimized add to cart with optimistic updates
export const useAddItemToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addItemToCart,
    // ✅ Optimistic update - update UI immediately before API responds
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CART });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(QUERY_KEYS.CART);

      // Optimistically update to the new value
      queryClient.setQueryData(QUERY_KEYS.CART, (old) => {
        if (!old) return old;

        const existingItem = old.data?.items?.find(
          (item) => item.product._id === newItem.productId
        );

        if (existingItem) {
          // Update quantity if item exists
          return {
            ...old,
            data: {
              ...old.data,
              items: old.data.items.map((item) =>
                item.product._id === newItem.productId
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            },
          };
        } else {
          // Note: We can't add the full product details optimistically
          // So we'll just invalidate after success
          return old;
        }
      });

      // Return context with the snapshot
      return { previousCart };
    },
    // ✅ On success, update with actual server response
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.CART, data);
    },
    // ✅ On error, rollback to previous state
    onError: (err, newItem, context) => {
      queryClient.setQueryData(QUERY_KEYS.CART, context.previousCart);
    },
    // ✅ Always refetch after error or success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
  });
};

// ✅ Optimized update cart item with optimistic updates
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
    onMutate: async ({ productId, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CART });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(QUERY_KEYS.CART);

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.CART, (old) => {
        if (!old) return old;

        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item) =>
              item.product._id === productId ? { ...item, quantity } : item
            ),
            // Recalculate total price optimistically
            totalPrice: old.data.items.reduce((total, item) => {
              const itemQuantity =
                item.product._id === productId ? quantity : item.quantity;
              return total + item.price * itemQuantity;
            }, 0),
          },
        };
      });

      return { previousCart };
    },
    onSuccess: (data) => {
      // Update with actual server response
      queryClient.setQueryData(QUERY_KEYS.CART, data);
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(QUERY_KEYS.CART, context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
  });
};

// ✅ Optimized remove item with optimistic updates
export const useRemoveItemFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeItemFromCart,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CART });

      const previousCart = queryClient.getQueryData(QUERY_KEYS.CART);

      // Optimistically remove item
      queryClient.setQueryData(QUERY_KEYS.CART, (old) => {
        if (!old) return old;

        const removedItem = old.data.items.find(
          (item) => item.product._id === productId
        );

        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter(
              (item) => item.product._id !== productId
            ),
            // Recalculate total price
            totalPrice:
              old.data.totalPrice -
              (removedItem ? removedItem.price * removedItem.quantity : 0),
          },
        };
      });

      return { previousCart };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.CART, data);
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(QUERY_KEYS.CART, context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
  });
};

// ✅ Clear cart - no optimistic update needed (destructive action)
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      // Clear the cart data immediately
      queryClient.setQueryData(QUERY_KEYS.CART, null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
  });
};
