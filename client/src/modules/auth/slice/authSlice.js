import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../lib/axios.js";

// Query Keys
export const AUTHUSER_QUERY_KEY = ["authUser"];

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
    queryKey: AUTHUSER_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false, // Don't retry if request fails
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
  });
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTHUSER_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: AUTHUSER_QUERY_KEY });
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTHUSER_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: AUTHUSER_QUERY_KEY });
    },
  });
};

export const useLogoutUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(AUTHUSER_QUERY_KEY, null);
      queryClient.clear();
    },
  });
};
