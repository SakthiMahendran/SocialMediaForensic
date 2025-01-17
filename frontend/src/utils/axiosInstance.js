import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000", // Replace with your backend URL
  timeout: 5000, // Request timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor to attach authorization tokens if needed
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
