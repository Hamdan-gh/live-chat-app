// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ✅ no double /api/api issue
  withCredentials: true, // optional if you're using cookies/auth
});

export default api;
