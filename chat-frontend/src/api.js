// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://live-chat-app-vw20.onrender.com/api', // ✅ no double /api/api issue
  withCredentials: true, // optional if you're using cookies/auth
});

export default api;
