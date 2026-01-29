import axios from 'axios';

// در پروداکشن آدرس لیارا را قرار دهید
const BASE_URL = 'https://iran-vet-ai-team.onrender.com/api'; 

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

