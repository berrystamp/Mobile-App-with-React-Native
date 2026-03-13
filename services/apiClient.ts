import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';
import api from './api'; // Import the instance from above

class ApiService {
  // Auth methods
  async login(email: string, password: string, profileType: string = 'CUSTOMER') {
    const payload = { 
      email: email.trim(), 
      password, 
      rememberMe: true 
    };

    // Note: profileType is required as a header per your backend specs
    const response = await api.post('/auth/login', payload, {
      headers: { profileType }
    });

    const result = response.data;

    // Based on your response: result.responseBody contains { token, user }
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

  // --- Cart Methods ---
  async getCartItems() {
    const response = await api.get('/cart-items');
    return response.data; // Axios returns data in the .data property
  }

  async deleteCartItem(itemId: string) {
    return await api.delete(`/cart-items/${itemId}`);
  }

  async clearCart() {
    return await api.delete('/cart-items');
  }

  async updateCartQuantity(designId: string, mockId: string, quantity: number, colour: string, size: string) {
    return await api.post(`/cart-items/${designId}/${mockId}`, {
      quantity,
      colour,
      size
    });
  }
  async getTopArtists(limit: number = 10) {
    const response = await api.get('/artists/top', {
      params: { limit },
    });
    return response.data;
  }

  async getTrendingDesigns(limit: number = 10) {
    const response = await api.get('/designs', {
      params: { limit },
    });
    return response.data;
  }

  async getRecommendedDesigns(limit: number = 10) {
    const response = await api.get('/designs', {
      params: { limit },
    });
    return response.data;
  }

  async toggleFavorite(designId: string) {
    const response = await api.post(`/designs/${designId}/likes`);
    return response.data;
  }

  async searchDesigns(query: string) {
    const response = await api.get('/designs/search', {
      params: { q: query },
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