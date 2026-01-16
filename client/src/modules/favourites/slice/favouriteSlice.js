// favourites/slice/favouriteSlice.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { QUERY_KEYS } from "../../../lib/queryKeys";

// *********************************** ((API Functions)) **************************************** //

const getUserFavourites = async () => {
  const response = await axiosInstance.get("/favourites");
  return response.data;
};

const checkFavourite = async (productId) => {
  const response = await axiosInstance.get(`/favourites/check/${productId}`);
  return response.data;
};

const addToFavourites = async (productId) => {
  const response = await axiosInstance.post(`/favourites/${productId}`);
  return response.data;
};

const removeFromFavourites = async (productId) => {
  const response = await axiosInstance.delete(`/favourites/${productId}`);
  return response.data;
};

const clearFavourites = async () => {
  const response = await axiosInstance.delete("/favourites");
  return response.data;
};

// *********************************** ((React-Query Hooks)) **************************************** //

export const useGetUserFavourites = () => {
  return useQuery({
    queryKey: QUERY_KEYS.FAVOURITES,
    queryFn: getUserFavourites,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCheckFavourite = (productId) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CHECK_FAVOURITE, productId],
    queryFn: () => checkFavourite(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAddToFavourites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToFavourites,
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAVOURITES });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.CHECK_FAVOURITE, productId],
      });
    },
  });
};

export const useRemoveFromFavourites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromFavourites,
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAVOURITES });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.CHECK_FAVOURITE, productId],
      });
    },
  });
};

export const useClearFavourites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearFavourites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAVOURITES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHECK_FAVOURITE });
    },
  });
};
