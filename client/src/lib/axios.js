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
    console.log("=== AXIOS REQUEST ===");
    console.log("Method:", config.method);
    console.log("URL:", config.url);
    console.log("Base URL:", config.baseURL);
    console.log("Full URL:", config.baseURL + config.url);
    console.log("Headers:", config.headers);
    console.log("With credentials:", config.withCredentials);
    
    // Check if token exists in localStorage and add to headers
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and store token
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("=== AXIOS RESPONSE ===");
    console.log("Status:", response.status);
    console.log("URL:", response.config.url);
    console.log("Response data:", response.data);
    
    // Store token if it exists in response
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    return response;
  },
  (error) => {
    // Log error details for debugging
    console.error("=== AXIOS ERROR ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
      console.error("Error response headers:", error.response.headers);
    }
    
    // If 401 error, remove token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login page (this would be handled by the app component)
    }
    
    return Promise.reject(error);
  }
);