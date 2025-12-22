import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const CATEGORIES_QUERY_KEY = ["categories"];
export const CATEGORY_QUERY_KEY = ["category"];

// *********************************** ((API Functions)) **************************************** //

const getAllCategories = async () => {
  const response = await axiosInstance.get("/categories");
  return response.data;
};

const getCategoryById = async (id) => {
  const response = await axiosInstance.get(`/categories/${id}`);
  return response.data;
};

const createCategory = async (data) => {
  const response = await axiosInstance.post("/categories", data);
  return response.data;
};

const updateCategory = async ({ id, data }) => {
  const response = await axiosInstance.put(`/categories/${id}`, data);
  return response.data;
};

const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/categories/${id}`);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useGetAllCategories = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getAllCategories,
    staleTime: 10 * 60 * 1000,
  });
};

export const useGetCategoryById = (id) => {
  return useQuery({
    queryKey: [...CATEGORY_QUERY_KEY, id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CATEGORY_QUERY_KEY, variables.id],
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};
