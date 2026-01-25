import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: true,
      refetchOnReconnect: "always",
      networkMode: "online",
      structuralSharing: true, // Prevent unnecessary re-renders
      // Use infinite query default for pagination
      keepPreviousData: true, // Smooth pagination transitions
    },
    mutations: {
      retry: 0,
      networkMode: "online",
    },
  },
});
