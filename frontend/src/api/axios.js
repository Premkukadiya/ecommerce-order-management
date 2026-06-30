import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — attach JWT token
API.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('bazaarhub_user');
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // Invalid stored data — ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth
      localStorage.removeItem('bazaarhub_user');
      // Optionally redirect
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
