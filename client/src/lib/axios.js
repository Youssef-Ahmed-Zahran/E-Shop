import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});
