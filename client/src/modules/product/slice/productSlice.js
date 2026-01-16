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
  const response = await axiosInstance.post("/products", data);
  return response.data;
};

const updateProduct = async ({ id, data }) => {
  const response = await axiosInstance.put(`/products/${id}`, data);
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCT, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEATURED_PRODUCTS });
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
    },
  });
};
