import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';
import api from './api';

class ApiService {
  // --- Auth Methods ---
  async login(email: string, password: string, profileType: string = 'CUSTOMER') {
    const payload = { 
      email: email.trim(), 
      password, 
      rememberMe: true 
    };

    const response = await api.post('/auth/login', payload, {
      headers: { profileType }
    });

    const result = response.data;

    if (result.requestSuccessful && result.responseBody?.token) {
      await AsyncStorage.setItem('userToken', result.responseBody.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.responseBody.user));
    }
    
    return result;
  }

  async logout() {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  }
  async getUserProfile(profileId: string | number) {
    const response = await api.get(`/berry/profiles/${profileId}`);
    return response.data;
  }

  // --- Cart Methods ---
  async getCartItems() {
    const response = await api.get('/cart-items');
    return response.data; 
  }

  async deleteCartItem(itemId: string) {
    const response = await api.delete(`/cart-items/${itemId}`);
    return response.data;
  }

  async clearCart() {
    const response = await api.delete('/cart-items');
    return response.data;
  }

  async updateCartQuantity(designId: string, mockId: string, quantity: number, colour: string, size: string) {
    const response = await api.post(`/cart-items/${designId}/${mockId}`, {
      quantity, colour, size
    });
    return response.data;
  }

  // --- Data Fetching Methods ---
  // Notice the params object now perfectly matches the Spring Boot Pageable expectation
  
  async getTopArtists(size: number = 10, page: number = 0) {
    const response = await api.get('/designs', {
      params: { page, size, sort: 'id,desc' }, 
      headers: {
        'profileType': 'CUSTOMER' 
      }
    });
    return response.data;
  }
  async toggleFavorite(designId: string) {
    const response = await api.patch(`/designs/${designId}/likes`, {}, {
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async getTrendingDesigns(size: number = 10, page: number = 0) {
    const response = await api.get('/designs', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        'profileType': 'CUSTOMER' 
      }
    });
    return response.data;
  }

  async getRecommendedDesigns(size: number = 10, page: number = 0) {
    const response = await api.get('/designs', {
      params: { page, size, sort: 'likes,desc' },
      headers: {
        'profileType': 'CUSTOMER' 
      }
    });
    return response.data;
  }

  async getRecentDesigns(size: number = 10, page: number = 0) {
    const response = await api.get('/designs', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async getFeaturedDesigns(size: number = 10, page: number = 0) {
    const response = await api.get('/designs', {
      params: { page, size, sort: 'likes,desc' },
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  async getCurrentUser() {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  async getDesigns(filters:any = {}) {
    const response = await api.get('/designs', {
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
    const response = await api.get(`/designs/${designId}`, {
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
    const response = await api.post(`/cart-items/${designId}/${mockId}`, payload || {}, {
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }


   async searchDesigns(filters: string | object) {
    const params =
      typeof filters === 'string'
        ? { searchField: filters, page: 0, size: 20, sort: 'id,desc' }
        : { page: 0, size: 20, sort: 'id,desc', ...filters };

    const response = await api.get('/designs', {
      params,
      headers: {
        profileType: 'CUSTOMER',
      },
    });
    return response.data;
  }

  // Generic request method
  async request(config: AxiosRequestConfig) {
    const response = await api.request(config);
    return response.data;
  }
}

export default new ApiService();