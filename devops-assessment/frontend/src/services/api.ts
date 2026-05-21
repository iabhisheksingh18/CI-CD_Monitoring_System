import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Automatically inject JWT tokens into the Authorization header of every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
