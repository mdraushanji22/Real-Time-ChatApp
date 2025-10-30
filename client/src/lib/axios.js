import axios from "axios";

// Updated to use deployed backend URL in production
const baseURL = import.meta.env.MODE === "development" 
  ? "http://localhost:4000/api/v1"
  : "https://real-time-chatapp-backend-foiz.onrender.com/api/v1";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to ensure credentials are sent
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);
    console.log("Request config:", config);
    // Ensure credentials are sent with every request
    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.config.url);
    console.log("Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.status, error.response?.config?.url);
    console.error("Error data:", error.response?.data);
    return Promise.reject(error);
  }
);