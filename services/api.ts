import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router"; // Added for automatic redirection

const API_BASE_URL = 'https://berrystamp-backend-dev-4cn29.ondigitalocean.app';

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
  const profileType = await AsyncStorage.getItem("profileType");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (profileType && !config.headers.profileType) {
    config.headers.profileType = profileType;
  }
  return config;
});

// Response interceptor: Listen for expired tokens (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

    // If an authenticated request says our token is invalid/expired
    if (error.response && error.response.status === 401 && hadAuthHeader) {
      console.warn("Token expired or invalid, redirecting to login...");
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('profileType');
      
      // Automatically redirect to login
      // Adjust path if your login screen is named differently
      router.replace('/(auth)/login'); 
    }
    return Promise.reject(error);
  },
);

export default api;
