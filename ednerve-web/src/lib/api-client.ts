
import axios from "axios";
import { authToken } from "./auth-token";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Attach Sanctum Bearer Token to API requests.
apiClient.interceptors.request.use(
  (config) => {
    const token = authToken.get();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
