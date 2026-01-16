import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { QUERY_KEYS } from "../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const getAllBrands = async ({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "name",
  sortOrder = "asc",
}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    sortBy,
    sortOrder,
  });

  const response = await axiosInstance.get(`/brands?${params.toString()}`);
  return response.data;
};

const getBrandById = async (id) => {
  const response = await axiosInstance.get(`/brands/${id}`);
  return response.data;
};

const createBrand = async (data) => {
  const response = await axiosInstance.post("/brands", data);
  return response.data;
};

const updateBrand = async ({ id, data }) => {
  const response = await axiosInstance.put(`/brands/${id}`, data);
  return response.data;
};

const deleteBrand = async (id) => {
  const response = await axiosInstance.delete(`/brands/${id}`);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useGetAllBrands = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = params;

  return useQuery({
    queryKey: [
      ...QUERY_KEYS.BRANDS,
      { page, limit, search, sortBy, sortOrder },
    ],
    queryFn: () => getAllBrands({ page, limit, search, sortBy, sortOrder }),
    staleTime: 10 * 60 * 1000,
    keepPreviousData: true, // Smooth pagination transitions
  });
};

export const useGetBrandById = (id) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.BRAND, id],
    queryFn: () => getBrandById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANDS });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBrand,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANDS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.BRAND, variables.id],
      });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANDS });
    },
  });
};
