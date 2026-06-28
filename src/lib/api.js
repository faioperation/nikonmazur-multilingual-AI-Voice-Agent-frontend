import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

// Request interceptor to automatically add the auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global 401 unauthorized errors if needed
    if (error.response && error.response.status === 401) {
      // You can trigger a local logout here if the token expires
      // Cookies.remove('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
