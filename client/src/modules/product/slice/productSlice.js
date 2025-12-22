import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const PRODUCTS_QUERY_KEY = ["products"];
export const PRODUCT_QUERY_KEY = ["product"];
export const FEATURED_PRODUCTS_QUERY_KEY = ["featuredProducts"];

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
    queryKey: [...PRODUCTS_QUERY_KEY, filters],
    queryFn: () => getAllProducts(filters),
    staleTime: 3 * 60 * 1000,
  });
};

export const useGetProductById = (id) => {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEY, id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
};

export const useGetFeaturedProducts = () => {
  return useQuery({
    queryKey: FEATURED_PRODUCTS_QUERY_KEY,
    queryFn: getFeaturedProducts,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckProductStock = (id, quantity) => {
  return useQuery({
    queryKey: ["productStock", id, quantity],
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
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEATURED_PRODUCTS_QUERY_KEY });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PRODUCT_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: FEATURED_PRODUCTS_QUERY_KEY });
    },
  });
};

export const useToggleFeaturedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFeaturedProduct,
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PRODUCT_QUERY_KEY, productId],
      });
      queryClient.invalidateQueries({ queryKey: FEATURED_PRODUCTS_QUERY_KEY });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEATURED_PRODUCTS_QUERY_KEY });
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductStock,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PRODUCT_QUERY_KEY, variables.id],
      });
    },
  });
};
