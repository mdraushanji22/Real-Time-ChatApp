import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:4000/api/v1"
      : "https://real-time-chatapp-backend-foiz.onrender.com/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to ensure credentials are sent
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure credentials are sent with every request
    config.withCredentials = true;
    console.log("Making request:", config.method, config.url);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    // Log error details for debugging
    console.error("Axios error:", error);
    console.error("Error response:", error.response);
    return Promise.reject(error);
  }
);