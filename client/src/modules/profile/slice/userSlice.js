import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

// Query Keys
export const USERS_QUERY_KEY = ["users"];
export const USER_QUERY_KEY = ["user"];

// *********************************** ((API Functions)) **************************************** //

const getAllUsers = async ({ page = 1, limit = 10, role, isActive }) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (role) params.append("role", role);
  if (isActive !== undefined) params.append("isActive", isActive);

  const response = await axiosInstance.get(`/users?${params.toString()}`);
  return response.data;
};

const getUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

const updateUser = async ({ id, data }) => {
  const response = await axiosInstance.put(`/users/${id}`, data);
  return response.data;
};

const updatePassword = async ({ id, data }) => {
  const response = await axiosInstance.patch(`/users/${id}/password`, data);
  return response.data;
};

const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

const toggleUserStatus = async (id) => {
  const response = await axiosInstance.patch(`/users/${id}/toggle-status`);
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useGetAllUsers = (filters = {}) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, filters],
    queryFn: () => getAllUsers(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetUserById = (id) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, id],
    queryFn: () => getUserById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...USER_QUERY_KEY, variables.id],
      });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updatePassword,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
