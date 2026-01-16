// admin/modules/supplier/slice/supplierSlice.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../../lib/axios";
import { QUERY_KEYS } from "../../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const createSupplier = async (data) => {
  const response = await axiosInstance.post("/suppliers", data);
  return response.data;
};

const getAllSuppliers = async ({ page = 1, limit = 10, isActive }) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (isActive !== undefined) params.append("isActive", isActive);

  const response = await axiosInstance.get(`/suppliers?${params.toString()}`);
  return response.data;
};

const getSupplierById = async (id) => {
  const response = await axiosInstance.get(`/suppliers/${id}`);
  return response.data;
};

const updateSupplier = async ({ id, data }) => {
  const response = await axiosInstance.put(`/suppliers/${id}`, data);
  return response.data;
};

const deleteSupplier = async (id) => {
  const response = await axiosInstance.delete(`/suppliers/${id}`);
  return response.data;
};

const toggleSupplierStatus = async (id) => {
  const response = await axiosInstance.patch(`/suppliers/${id}/toggle-status`);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
    },
  });
};

export const useGetAllSuppliers = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.SUPPLIERS, filters],
    queryFn: () => getAllSuppliers(filters),
    staleTime: 3 * 60 * 1000,
  });
};

export const useGetSupplierById = (id) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.SUPPLIER, id],
    queryFn: () => getSupplierById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.SUPPLIER, variables.id],
      });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
    },
  });
};

export const useToggleSupplierStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleSupplierStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
    },
  });
};
