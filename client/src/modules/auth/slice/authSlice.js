// auth/slice/authSlice.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios.js";
import { QUERY_KEYS } from "../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const getCurrentUser = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

const registerUser = async (data) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

const loginUser = async (data) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

const logoutUser = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useCurrentUser = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH_USER,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.AUTH_USER, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_USER });
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.AUTH_USER, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_USER });
    },
  });
};

export const useLogoutUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(QUERY_KEYS.AUTH_USER, null);
      queryClient.clear();
    },
  });
};
