import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Using your dedicated DigitalOcean backend URL
const API_BASE_URL = 'https://berrystamp-backend-dev-4cn29.ondigitalocean.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Always attach the latest token from storage
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});



export default api;