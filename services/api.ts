import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { toProfileType, useAuthStore } from '@/store/authStore';
import { router } from "expo-router"; // Added for automatic redirection

const API_BASE_URL = 'https://berrystamp-backend-production.up.railway.app/api/v1';

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
  const profileType = useAuthStore.getState().isHydrated
    ? toProfileType(useAuthStore.getState().role)
    : await AsyncStorage.getItem("profileType");
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
  (response) => {
    if (response.data?.requestSuccessful === false) {
      throw Object.assign(new Error(response.data.responseMessage || response.data.message || 'Request failed'), {
        response,
        config: response.config,
      });
    }
    return response;
  },
  async (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

    // If an authenticated request says our token is invalid/expired
    if (error.response && error.response.status === 401 && hadAuthHeader) {
      console.warn("Token expired or invalid, redirecting to login...");
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('profileType');
      useAuthStore.getState().logout();
      
      // Automatically redirect to login
      // Adjust path if your login screen is named differently
      router.replace('/(auth)/login'); 
    }
    return Promise.reject(error);
  },
);

export default api;
