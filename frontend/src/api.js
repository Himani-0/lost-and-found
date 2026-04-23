import axios from 'axios';

// In development, proxy in package.json sends /api → localhost:5000
// In production on Render, REACT_APP_API_URL must be set to backend URL
const BASE_URL = process.env.REACT_APP_API_URL || '';

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default API;
