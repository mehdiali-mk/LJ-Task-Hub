import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8099/api-v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token ?? ""}`;
  }
  return config;
});

// Add a global handler for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network/connection errors
    if (!error.response) {
      if (error.code === 'ERR_NETWORK') {
        console.warn('Network error - please check your connection or if the server is running');
      } else if (error.code === 'ECONNABORTED') {
        console.warn('Request timeout - server may be slow or unresponsive');
      } else {
        console.warn('Request failed:', error.message);
      }
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized - trigger logout
    if (error.response.status === 401) {
      window.dispatchEvent(new Event("force-logout"));
    }
    
    // Handle other common errors
    if (error.response.status === 403) {
      console.warn('Access denied - you may not have permission for this action');
    } else if (error.response.status === 404) {
      console.warn('Resource not found:', error.config?.url);
    } else if (error.response.status >= 500) {
      console.warn('Server error - please try again later');
    }
    
    return Promise.reject(error);
  }
);

const postData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.post(url, data);

  return response.data;
};

const updateData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.put(url, data);

  return response.data;
};

const fetchData = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);

  return response.data;
};

const deleteData = async <T>(url: string): Promise<T> => {
  const response = await api.delete(url);

  return response.data;
};

const patchData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.patch(url, data);

  return response.data;
};

const putData = updateData;
export { postData, fetchData, updateData, deleteData, putData, patchData };
