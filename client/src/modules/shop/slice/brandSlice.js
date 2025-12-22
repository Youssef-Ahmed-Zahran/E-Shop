import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const BRANDS_QUERY_KEY = ["brands"];
export const BRAND_QUERY_KEY = ["brand"];

// *********************************** ((API Functions)) **************************************** //

const getAllBrands = async () => {
  const response = await axiosInstance.get("/brands");
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

export const useGetAllBrands = () => {
  return useQuery({
    queryKey: BRANDS_QUERY_KEY,
    queryFn: getAllBrands,
    staleTime: 10 * 60 * 1000,
  });
};

export const useGetBrandById = (id) => {
  return useQuery({
    queryKey: [...BRAND_QUERY_KEY, id],
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
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBrand,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...BRAND_QUERY_KEY, variables.id],
      });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
    },
  });
};
