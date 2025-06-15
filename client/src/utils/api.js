import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL || 'http://localhost:4000/api',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // Use sessionStorage here
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;