import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router"; // Added for automatic redirection

const API_BASE_URL = 'https://berrystamp-backend-dev-4cn29.ondigitalocean.app/api/v1';

export interface DesignQueryOptions {
  page?: number;
  size?: number;
  sort?: string;
  designer?: number;
  tags?: string;
  designCategories?: string;
  mockName?: string;
  mockCategory?: string;
  upperPriceRange?: number;
  lowerPriceRange?: number;
  searchField?: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const [token, legacyToken, profileType] = await Promise.all([
          AsyncStorage.getItem('idToken'),
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('profileType'),
        ]);

        const resolvedToken = token || legacyToken;
        if (resolvedToken) {
          config.headers.Authorization = `Bearer ${resolvedToken}`;
        }

        config.headers.profileType = profileType || 'CUSTOMER';
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await Promise.all([
            AsyncStorage.removeItem('authToken'),
            AsyncStorage.removeItem('idToken'),
            AsyncStorage.removeItem('userData'),
          ]);
        }
        return Promise.reject(error);
      },
    );
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password }, {
      headers: {
        profileType: 'CUSTOMER',
      },
    });

    const token = response.data.token || response.data.idToken;
    if (token) {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('idToken', token);
      await AsyncStorage.setItem('profileType', 'CUSTOMER');
      if (response.data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
    }

    return response.data;
  }
);

  async logout() {
    await Promise.all([
      AsyncStorage.removeItem('authToken'),
      AsyncStorage.removeItem('idToken'),
      AsyncStorage.removeItem('userData'),
      AsyncStorage.removeItem('profileType'),
    ]);
  }

  async checkAuth() {
    const [token, legacyToken] = await Promise.all([
      AsyncStorage.getItem('idToken'),
      AsyncStorage.getItem('authToken'),
    ]);
    return !!(token || legacyToken);
  }

  async getCurrentUser() {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  async getTopArtists(size: number = 10, page: number = 0) {
    const response = await this.api.get('/designs', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async getTrendingDesigns(size: number = 10, page: number = 0) {
    const response = await this.api.get('/designs/all/designer', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async getRecommendedDesigns(size: number = 10, page: number = 0) {
    const response = await this.api.get('/designs', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async getDesigns(filters: DesignQueryOptions = {}) {
    const response = await this.api.get('/designs', {
      params: {
        page: 0,
        size: 20,
        sort: 'id,desc',
        ...filters,
      },
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async fetchDesignById(designId: number) {
    const response = await this.api.get(`/designs/${designId}`, {
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async addToCart(
    designId: number,
    mockId: number,
    payload?: { quantity?: number; colour?: string; size?: string },
  ) {
    const response = await this.api.post(`/cart-items/${designId}/${mockId}`, payload || {}, {
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async toggleFavorite(designId: string) {
    const response = await this.api.patch(`/designs/${designId}/likes`, {}, {
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async searchDesigns(filters: string | DesignQueryOptions) {
    const params =
      typeof filters === 'string'
        ? { searchField: filters, page: 0, size: 20, sort: 'id,desc' }
        : { page: 0, size: 20, sort: 'id,desc', ...filters };

    const response = await this.api.get('/designs', {
      params,
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async request(config: AxiosRequestConfig) {
    const response = await this.api.request(config);
    return response.data;
  }
}

export default new ApiService();
