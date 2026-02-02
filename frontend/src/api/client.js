import axios from 'axios';

const client = axios.create({
  // آدرس سرور بک‌اند (اگر روی سیستم خودت ران کردی)
  baseURL: 'http://localhost:5000/api', 
});

// این تیکه کد، توکن رو خودکار به هدر تمام درخواست‌ها اضافه می‌کنه
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

