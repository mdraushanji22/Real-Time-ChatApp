import axios from "axios";

// Updated to use deployed backend URL in production
const baseURL = import.meta.env.MODE === "development" 
  ? "http://localhost:4000/api/v1"
  : "https://real-time-chatapp-backend-foiz.onrender.com/api/v1";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
