import axios from 'axios';

const client = axios.create({
  // ⚠️ نکته مهم: آخرش حتماً باید /api داشته باشه
  // ⚠️ نکته مهم ۲: حتماً باید https باشه
  baseURL: 'https://vet-ai-api.onrender.com/api', 
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
