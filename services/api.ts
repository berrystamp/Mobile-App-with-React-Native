import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';


const API_BASE_URL = 'https://berrystamp-backend-dev-4cn29.ondigitalocean.app';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear storage and redirect to login
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userData');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  }

  async checkAuth() {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  }

  async getCurrentUser() {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  
  async getTopArtists(limit: number = 10) {
    const response = await this.api.get('/artists/top', {
      params: { limit },
    });
    return response.data;
  }

  async getTrendingDesigns(limit: number = 10) {
    const response = await this.api.get('/designs/trending', {
      params: { limit },
    });
    return response.data;
  }

  async getRecommendedDesigns(limit: number = 10) {
    const response = await this.api.get('/designs/recommended', {
      params: { limit },
    });
    return response.data;
  }

  async toggleFavorite(designId: string) {
    const response = await this.api.post(`/designs/${designId}/favorite`);
    return response.data;
  }

  async searchDesigns(query: string) {
    const response = await this.api.get('/designs/search', {
      params: { q: query },
    });
    return response.data;
  }

  // Generic request method
  async request(config: AxiosRequestConfig) {
    const response = await this.api.request(config);
    return response.data;
  }
}

export default new ApiService();