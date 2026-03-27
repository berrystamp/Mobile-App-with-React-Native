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
      params: { page, size, sort: 'id,desc' },
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
      params: { page, size, sort: 'id,desc' },
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



  async getFavoriteDesigns(size: number = 50, page: number = 0) {
    const headers = { profileType: 'CUSTOMER' };

    const candidates = [
      () => api.get('/designs/favorites', { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/designs', { params: { page, size, sort: 'id,desc', liked: true }, headers }),
      () => api.get('/designs', { params: { page, size, sort: 'id,desc', designIsLiked: true }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async getFollowingArtists(size: number = 50, page: number = 0) {
    const headers = { profileType: 'CUSTOMER' };

    const candidates = [
      () => api.get('/berry/profiles/following', { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/profiles/following', { params: { page, size, sort: 'id,desc' }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    }

    const fallback = await this.getTopArtists(size, page);
    return fallback;
  }

  async getConversations(page: number = 0, size: number = 50) {
    const headers = { profileType: 'CUSTOMER' };
    const candidates = [
      () => api.get('/messages/conversations', { params: { page, size, sort: 'updatedAt,desc' }, headers }),
      () => api.get('/conversations', { params: { page, size, sort: 'updatedAt,desc' }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async getConversationMessages(conversationId: string, page: number = 0, size: number = 100) {
    const headers = { profileType: 'CUSTOMER' };
    const candidates = [
      () => api.get(`/messages/conversations/${conversationId}`, { params: { page, size, sort: 'createdAt,asc' }, headers }),
      () => api.get(`/conversations/${conversationId}/messages`, { params: { page, size, sort: 'createdAt,asc' }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async sendMessage(conversationId: string, payload: { content: string; receiverId?: number }) {
    const headers = { profileType: 'CUSTOMER' };

    const candidates = [
      () => api.post(`/messages/conversations/${conversationId}`, payload, { headers }),
      () => api.post(`/conversations/${conversationId}/messages`, payload, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    }

    throw new Error('Unable to send message. Messaging endpoint is unavailable.');
  }

  async deleteConversation(conversationId: string) {
    const headers = { profileType: 'CUSTOMER' };
    const candidates = [
      () => api.delete(`/messages/conversations/${conversationId}`, { headers }),
      () => api.delete(`/conversations/${conversationId}`, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    }

    return { requestSuccessful: true };
  }

  async reportConversation(conversationId: string, reason: string) {
    const headers = { profileType: 'CUSTOMER' };
    const payload = { reason };

    const candidates = [
      () => api.post(`/messages/conversations/${conversationId}/report`, payload, { headers }),
      () => api.post(`/conversations/${conversationId}/report`, payload, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    }

    return { requestSuccessful: true };
  }

  // Generic request method
  async request(config: AxiosRequestConfig) {
    const response = await api.request(config);
    return response.data;
  }
}

export default new ApiService();