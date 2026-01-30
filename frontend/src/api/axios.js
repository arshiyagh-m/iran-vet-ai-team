import axios from 'axios';  // <--- حرف اول کوچک شد

// آدرس دقیق بک‌اند خودت را از داشبورد رندر چک کن (اگر اسم سرویس عوض شده، اینجا هم عوض کن)
const BASE_URL = 'https://iran-vet-ai-team.onrender.com/api'; 

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // این خط برای کوکی‌ها و لاگین معمولاً لازم است
});
