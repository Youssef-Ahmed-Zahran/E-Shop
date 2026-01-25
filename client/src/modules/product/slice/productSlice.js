import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { QUERY_KEYS } from "../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const getAllProducts = async ({
  page = 1,
  limit = 12,
  keyword,
  category,
  brand,
}) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (keyword) params.append("keyword", keyword);
  if (category) params.append("category", category);
  if (brand) params.append("brand", brand);

  const response = await axiosInstance.get(`/products?${params.toString()}`);
  return response.data;
};

const getProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

const getFeaturedProducts = async () => {
  const response = await axiosInstance.get("/products/featured");
  return response.data;
};

const checkProductStock = async ({ id, quantity }) => {
  const response = await axiosInstance.get(
    `/products/${id}/check-stock?quantity=${quantity}`
  );
  return response.data;
};

const createProduct = async (data) => {
  // Detect if data is FormData (for file uploads)
  const config =
    data instanceof FormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : {};

  const response = await axiosInstance.post("/products", data, config);
  return response.data;
};

const updateProduct = async ({ id, data }) => {
  console.log("updateProduct API called with:", { id, data });

  // Detect if data is FormData (for file uploads)
  const config =
    data instanceof FormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : {};

  console.log("Request config:", config);

  const response = await axiosInstance.put(`/products/${id}`, data, config);
  console.log("Update response:", response.data);

  return response.data;
};

const toggleFeaturedProduct = async (id) => {
  const response = await axiosInstance.patch(`/products/${id}/feature`);
  return response.data;
};

const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

const updateProductStock = async ({ id, data }) => {
  const response = await axiosInstance.patch(`/products/${id}/stock`, data);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useGetAllProducts = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, filters],
    queryFn: () => getAllProducts(filters),
    staleTime: 3 * 60 * 1000,
  });
};

export const useGetProductById = (id) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCT, id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
};

export const useGetFeaturedProducts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.FEATURED_PRODUCTS,
    queryFn: getFeaturedProducts,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckProductStock = (id, quantity) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCT_STOCK, id, quantity],
    queryFn: () => checkProductStock({ id, quantity }),
    enabled: !!id && !!quantity,
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });

      // Optionally refetch immediately
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data, variables) => {
      console.log("Update mutation success, invalidating queries...");

      // Invalidate all product lists (with all filter combinations)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS,
        refetchType: "all", // This ensures all matching queries are refetched
      });

      // Invalidate the specific product
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCT, variables.id],
      });

      // Invalidate featured products
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.FEATURED_PRODUCTS,
      });

      // Force immediate refetch of product lists
      queryClient.refetchQueries({
        queryKey: QUERY_KEYS.PRODUCTS,
        type: "active",
      });

      console.log("Query invalidation complete");
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
    },
  });
};

export const useToggleFeaturedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFeaturedProduct,
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCT, productId],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });

      // Refetch immediately
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAVOURITES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_ORDERS });

      // Refetch immediately
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductStock,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCT, variables.id],
      });

      // Refetch immediately
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },
  });
};
