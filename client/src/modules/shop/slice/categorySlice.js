import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { QUERY_KEYS } from "../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const getAllCategories = async ({ page = 1, limit = 10, search = "" }) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (search) params.append("search", search);

  const response = await axiosInstance.get(`/categories?${params.toString()}`);
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

export const useGetAllCategories = ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CATEGORIES, { page, limit, search }],
    queryFn: () => getAllCategories({ page, limit, search }),
    staleTime: 10 * 60 * 1000,
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

export const useGetCategoryById = (id) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CATEGORY, id],
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.CATEGORY, variables.id],
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
    },
  });
};
