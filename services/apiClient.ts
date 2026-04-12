import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';
import api from './api';
import { extractFaqFromHtml, type FaqItem } from '@/lib/faq';
import { useAuthStore } from '@/store/authStore';

type ProfileTypeInterface = 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
export interface BankOption {
  name: string;
  country: string;
  currency: string;
  code: string;
}
export interface DesignMockInput {
  limitedStatus: boolean;
  imageUrl: string;
  availableQty: number;
  name: string;
  category: string;
  colours: string[];
}

export interface CreateDesignPayload {
  name: string;
  frontImageUrl: string;
  designImages: string[];
  description: string;

  openForCustomization: boolean;
  amount: number;
  mocks: DesignMockInput[];
  tags: string[];
  categories: string[];
}

// Safe non-reactive read for Zustand store outside of React components
const getProfileType = () => {
  const state = useAuthStore.getState();
  return state.role?.toUpperCase() || 'CUSTOMER';
};

class ApiService {
  // --- Auth Methods ---
  async login(email: string, password: string, profileType: string = 'CUSTOMER') {
    const payload = { 
      email: email.trim(),
      password, 
      rememberMe: true 
    };

    const response = await api.post('/auth/login', payload, {
      headers: { profileType: profileType.toUpperCase() }
    });

    const result = response.data;

    if (result.requestSuccessful && result.responseBody?.token) {
      await AsyncStorage.setItem('userToken', result.responseBody.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.responseBody.user));
      await AsyncStorage.setItem('profileType', profileType.toUpperCase());
    }
    
    return result;
  }

  async logout() {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('profileType');
  }

  async activateAccount(otp: string, email: string) {
    const response = await api.patch(`/auth/activate/${encodeURIComponent(otp.trim())}`, {
      email: email.trim(),
    });
    return response.data;
  }

  async resendOtp(email: string, profileType?: string) {
    const response = await api.post(
      '/auth/resend-code',
      { email: email.trim() },
      profileType
        ? { headers: { profileType: profileType.toUpperCase() } }
        : undefined,
    );
    return response.data;
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
  
  async getTopArtists(size: number = 10, page: number = 0) {
    const profileType = getProfileType();
    const response = await api.get('/designs', {
      params: { page, size, sort: 'id,desc' }, 
      headers: {
        profileType 
      }
    });
    return response.data;
  }

  async toggleFavorite(designId: string) {
    const profileType = getProfileType();
    const response = await api.patch(`/designs/${designId}/likes`, {}, {
      headers: {
        profileType
      },
    });
    return response.data;
  }

  async getTrendingDesigns(size: number = 10, page: number = 0) {
    const profileType = getProfileType();
    const response = await api.get('/designs', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        profileType
      },
    });
    return response.data;
  }

  async getRecommendedDesigns(size: number = 10, page: number = 0) {
    const profileType = getProfileType();
    const response = await api.get('/designs', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        profileType
      }
    });
    return response.data;
  }

  async getRecentDesigns(size: number = 10, page: number = 0) {
    const profileType = getProfileType();
    const response = await api.get('/designs', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        profileType
      },
    });
    return response.data;
  }

  async getFeaturedDesigns(size: number = 10, page: number = 0) {
    const profileType = getProfileType();
    const response = await api.get('/designs', {
      params: { page, size, sort: 'id,desc' },
      headers: {
        profileType
      },
    });
    return response.data;
  }

  async getCurrentUser() {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  async syncCurrentUserFromBackend() {
    const response = await api.get('/user');
    const body = response.data?.responseBody || response.data;
    const profileType = getProfileType();

    return {
      ...response.data,
      responseBody: {
        ...(body || {}),
        profileType,
      },
    };
  }

  async getMyProfile() {
    try {
      const response = await api.get('/user');
      const body = response.data?.responseBody || response.data;
      const profileType = getProfileType();

      return {
        ...response.data,
        responseBody: {
          ...(body || {}),
          profileType,
        },
      };
    } catch (error: any) {
      if (error?.response?.status && error.response.status !== 404) {
        throw error;
      }
    }

    const user = await this.getCurrentUser();
    return { responseBody: { ...(user || {}), profileType: user?.profileType } };
  }

  async updateMyProfile(payload: Record<string, unknown>) {
    const profileType = getProfileType();
    console.log(profileType)
    console.log(payload)
    try {
      const response = await api.put('/profile', payload, {
        headers: {
          profileType
        },
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && error.response.status !== 404) {
        throw error;
      }
    }
  }

  async setActiveProfileType(profileType: ProfileTypeInterface) {
    await AsyncStorage.setItem('profileType', profileType);
    return { requestSuccessful: true };
  }

  async getManageOrders(options?: {
    profileType?: ProfileTypeInterface;
    page?: number;
    size?: number;
    search?: string;
    status?: string;
  }) {
    const profileType = getProfileType();
    const params: Record<string, unknown> = {
      page: options?.page ?? 0,
      size: options?.size ?? 50,
      sort: 'id,desc',
    };

    const normalizedSearch = options?.search?.trim();
    const normalizedStatus = options?.status?.trim();
    if (normalizedSearch) {
      params.search = normalizedSearch;
      params.query = normalizedSearch;
      params.searchField = normalizedSearch;
    }
    if (normalizedStatus) {
      params.status = normalizedStatus.toUpperCase();
    }

    const headers = { profileType };
    const candidates = [
      () => api.get('/orders', { params, headers }),
      () => api.get('/orders/manage', { params, headers }),
      () => api.get('/manage-orders', { params, headers }),
      () => api.get('/berry/orders', { params, headers }),
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

  async getManageOrderById(orderId: string | number, profileType?: ProfileTypeInterface) {
    const activeProfileType = profileType;
    const headers = { profileType: activeProfileType };
    const candidates = [
      () => api.get(`/orders/${orderId}`, { headers }),
      () => api.get(`/orders/details/${orderId}`, { headers }),
      () => api.get(`/manage-orders/${orderId}`, { headers }),
      () => api.get(`/berry/orders/${orderId}`, { headers }),
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

    return { responseBody: null };
  }

  async uploadSingleFile(fileUri: string, fieldName: string = 'file') {
    const fileName = fileUri.split('/').pop() || `upload-${Date.now()}.jpg`;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const mimeType =
      fileExtension === 'png'
        ? 'image/png'
        : fileExtension === 'webp'
          ? 'image/webp'
          : fileExtension === 'gif'
            ? 'image/gif'
            : 'image/jpeg';

    const formData = new FormData();
    formData.append(fieldName, {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await api.post('/files/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data?.responseBody || response.data || {};
  }

  async uploadMultipleFiles(fileUris: string[], fieldName: string = 'files') {
    const formData = new FormData();

    fileUris.forEach((fileUri, index) => {
      const fileName = fileUri.split('/').pop() || `upload-${Date.now()}-${index}.jpg`;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const mimeType =
        fileExtension === 'png'
          ? 'image/png'
          : fileExtension === 'webp'
            ? 'image/webp'
            : fileExtension === 'gif'
              ? 'image/gif'
              : 'image/jpeg';

      formData.append(fieldName, {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any);
    });

    const response = await api.post('/files/multi', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data?.responseBody || response.data || [];
  }

  async uploadProfileImage(imageUri: string) {
    const body = await this.uploadSingleFile(imageUri);
    return (
      body.path ||
      body.originalFilePath ||
      body.url ||
      body.originalUrl ||
      body.previewUrl ||
      body.thumbnailUrl ||
      body
    );
  }

  async updateProfileImage(imageUri: string) {
    const uploadedImage = await this.uploadProfileImage(imageUri);
    const imageString = String(uploadedImage || '').trim();
    return this.updateMyProfile({
      profilePic: imageString,
    });
  }

  async getNotifications(page: number = 0, size: number = 50) {
    const response = await api.get('/notifications', {
      params: { page, size, sort: 'id,desc' },
      headers: { profileType: 'CUSTOMER' },
    });
    return response.data;
  }

  async markNotificationAsRead(id: number) {
    const response = await api.patch(`/notifications/read/${id}`, {}, {
      headers: { profileType: 'CUSTOMER' },
    });
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await api.patch('/notifications/read', {}, {
      headers: { profileType: 'CUSTOMER' },
    });
    return response.data;
  }

  async getInterestOptions() {
    const taxonomy = await this.getDesignTaxonomy();
    const source = taxonomy?.responseBody || taxonomy || {};

    const buckets = [
      source.categories,
      source.interests,
      source.tags,
      source.content,
      source,
    ];

    const flattened = buckets
      .flatMap((bucket: any) => {
        if (Array.isArray(bucket)) return bucket;
        if (Array.isArray(bucket?.content)) return bucket.content;
        if (Array.isArray(bucket?.items)) return bucket.items;
        return [];
      })
      .map((item: any) => {
        if (typeof item === 'string') return item.trim();
        return String(item?.name || item?.label || item?.title || item?.value || '').trim();
      })
      .filter(Boolean);

    if (flattened.length) return Array.from(new Set(flattened));

    const fallbackResponse = await api.get('/designs', {
      params: { page: 0, size: 100, sort: 'id,desc' },
    });
    const designs = fallbackResponse.data?.responseBody?.content || fallbackResponse.data?.content || [];
    const inferred = designs
      .flatMap((item: any) => [item?.category, ...(Array.isArray(item?.tags) ? item.tags : [])])
      .map((item: any) => String(item || '').trim())
      .filter(Boolean);

    return Array.from(new Set(inferred));
  }

  async verifyBankAccount(payload: {
    accountNumber: string;
    bankCode: string;
  }) {
    const response = await api.post('/banks/verify', payload);
    return response.data;
  }

  async getBanks(): Promise<BankOption[]> {
    const response = await api.get('/banks');
    const body = response.data?.responseBody || response.data || [];
    const banks = Array.isArray(body) ? body : [];
    const seen = new Set<string>();

    return banks
      .map((bank: any) => ({
        name: String(bank?.name || '').trim(),
        country: String(bank?.country || '').trim(),
        currency: String(bank?.currency || '').trim().toUpperCase(),
        code: String(bank?.code || '').trim(),
      }))
      .filter((bank: BankOption) => {
        if (!bank.name || !bank.code) return false;

        const uniqueKey = `${bank.code}:${bank.name.toLowerCase()}`;
        if (seen.has(uniqueKey)) return false;
        seen.add(uniqueKey);
        return true;
      });
  }

  async getMyInterests() {
    try {
      const response = await api.get('/user/design-interest');
      const body = response.data?.responseBody || response.data || {};
      const interests = body.interests || body.categories || body.content || [];
      if (Array.isArray(interests)) {
        return interests.map((item: any) => String(item).trim()).filter(Boolean);
      }
    } catch (error: any) {
      if (error?.response?.status && error.response.status !== 404) {
        throw error;
      }
    }

    const profileResponse = await this.getMyProfile();
    const body = profileResponse?.responseBody || profileResponse || {};
    const profileType = getProfileType();
    
    const profileByType =
      profileType === 'DESIGNER'
        ? body.designerProfile
        : profileType === 'PRINTER'
          ? body.printerProfile
          : body.customerProfile;
          
    const interests = profileByType?.categories || body.categories || body.interests || [];
    return Array.isArray(interests) ? interests.map((item: any) => String(item).trim()).filter(Boolean) : [];
  }

  async updateMyInterests(interests: string[]) {
    const cleanedInterests = Array.from(new Set(interests.map((item) => item.trim()).filter(Boolean)));
    const response = await api.put('/user/design-interest', { interests: cleanedInterests });
    return response.data;
  }

  async findOrderByTrackingNumber(trackingNumber: string) {
    const normalizedTrackingNumber = trackingNumber.trim();
    if (!normalizedTrackingNumber) return null;

    const encodedTrackingNumber = encodeURIComponent(normalizedTrackingNumber);
    const candidates = [
      () => api.get(`/orders/tracking/${encodedTrackingNumber}`),
      () => api.get(`/orders/track/${encodedTrackingNumber}`),
      () => api.get('/orders', { params: { trackingNumber: normalizedTrackingNumber, page: 0, size: 1, sort: 'id,desc' } }),
      () => api.get('/orders', { params: { searchField: normalizedTrackingNumber, page: 0, size: 10, sort: 'id,desc' } }),
      () => api.get('/orders', { params: { page: 0, size: 50, sort: 'id,desc' } }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        const body = response.data?.responseBody || response.data || {};
        const list = Array.isArray(body)
          ? body
          : Array.isArray(body?.content)
            ? body.content
            : Array.isArray(body?.orders)
              ? body.orders
              : body
                ? [body]
                : [];

        const matched = list.find((item: any) => {
          const orderIdCandidates = [item?.orderNumber, item?.trackingNumber, item?.reference, item?.id]
            .map((value: any) => String(value || '').trim().toLowerCase())
            .filter(Boolean);
          return orderIdCandidates.includes(normalizedTrackingNumber.toLowerCase());
        });

        if (matched) return matched;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return null;
  }

  async getPaymentDetails() {
    const candidates = [
      () => api.get('/user/payment-detail'),
      () => api.get('/payments/details'),
      () => api.get('/payment-details'),
      () => api.get('/berry/profiles/payment-details'),
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

    return { responseBody: { bankName: '', accountNumber: '', accountName: '' } };
  }

  async savePaymentDetails(payload: Record<string, unknown>) {
    const candidates = [
      () => api.put('/user/payment-detail', payload),
      () => api.post('/payments/details', payload),
      () => api.post('/payment-details', payload),
      () => api.put('/berry/profiles/payment-details', payload),
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

    return { requestSuccessful: true, responseBody: payload };
  }

  async createDesign(payload: CreateDesignPayload) {
    const headers = { profileType: getProfileType() };
    const response = await api.post('/designs', payload, { headers });
    return response.data;
  }

  async followProfile(profileId: string | number) {
    const headers = { profileType: getProfileType() };
    const payload = { followingProfileId: Number(profileId) };
    const response = await api.post('/follow/add', payload, { headers });
    return response.data;
  }

  async unfollowProfile(profileId: string | number) {
    const headers = { profileType: getProfileType() };
    const payload = { followingProfileId: Number(profileId) };
    const response = await api.post('/follow/remove', payload, { headers });
    return response.data;
  }
  async getDesigner(id: string | number) {
     const profileType = getProfileType();
    const response = await api.get(`/designs/${id}`,{
      headers: {
        designId: id,
        profileType: profileType,
      },
    });
    return response.data;
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

  async addOrUpdateCartItem(
    designId: number,
    mockId: number,
    payload?: { quantity?: number; colour?: string; size?: string },
  ) {
    const response = await this.getCartItems();
    const items = response?.responseBody || response?.data || response || [];
    const list = Array.isArray(items) ? items : [];
    const existing = list.find(
      (item: any) => Number(item.designId || item.design?.id) === Number(designId) && Number(item.mock?.id) === Number(mockId),
    );

    if (existing) {
      return this.updateCartQuantity(
        String(designId),
        String(mockId),
        Number(existing.quantity || 0) + Number(payload?.quantity || 1),
        payload?.colour || existing.colour || '',
        payload?.size || existing.size || '',
      );
    }

    return this.addToCart(designId, mockId, payload);
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

      try {
        const response = await api.get('/designs/all/likes', { params: { page, size, sort: 'id,desc' }, headers });
        return response.data;
      } catch (error: any) {
      console.log(JSON.stringify(error));
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
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

  async getCustomDesigns(page: number = 0, size: number = 20) {
    const headers = { profileType: 'CUSTOMER' };

    const candidates = [
      () => api.get('/custom-designs', { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/designs/custom', { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/designs', { params: { page, size, sort: 'id,desc', mine: true }, headers }),
      () => api.get('/designs', { params: { page, size, sort: 'id,desc' }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![404, 400].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async getMyCollections(page: number = 0, size: number = 20) {
    const headers = { profileType: getProfileType() };

    const candidates = [
      () => api.get('/collections/mine', { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/collections', { params: { page, size, sort: 'id,desc', mine: true }, headers }),
      () => api.get('/public/collections', { params: { page, size, sort: 'id,desc' } }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async getCollections(profileId?: string | number, page: number = 0, size: number = 20) {
    if (!profileId) {
      return this.getMyCollections(page, size);
    }

    const headers = { profileType: getProfileType() };
    const normalizedProfileId = Number(profileId);
    const candidates = [
      () => api.get(`/public/collections/profile/${normalizedProfileId}`, { params: { page, size, sort: 'id,desc' } }),
      () => api.get(`/collections/profile/${normalizedProfileId}`, { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/collections', { params: { page, size, sort: 'id,desc', profileId: normalizedProfileId }, headers }),
      () => api.get('/public/collections', { params: { page, size, sort: 'id,desc', profileId: normalizedProfileId } }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async getShopReviews(profileId?: string | number, page: number = 0, size: number = 20) {
    const headers = { profileType: getProfileType() };

    const candidates = [
      () => (profileId ? api.get(`/public/reviews/profile/${profileId}`, { params: { page, size, sort: 'id,desc' } }) : Promise.reject({ response: { status: 404 } })),
      () => (profileId ? api.get(`/reviews/profile/${profileId}`, { params: { page, size, sort: 'id,desc' }, headers }) : Promise.reject({ response: { status: 404 } })),
      () => api.get('/reviews', { params: { page, size, sort: 'id,desc' }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async getFollowers(profileId?: string | number, page: number = 0, size: number = 50) {
    const headers = { profileType: getProfileType() };

    const candidates = [
      () => (profileId ? api.get(`/public/follows/follower/${profileId}`, { params: { page, size, sort: 'id,desc' } }) : Promise.reject({ response: { status: 404 } })),
      () => api.get('/berry/profiles/follower', { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/profiles/follower', { params: { page, size, sort: 'id,desc' }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async getFollowing(profileId?: string | number, page: number = 0, size: number = 50) {
    const headers = { profileType: getProfileType() };

    const candidates = [
      () => (profileId ? api.get(`/public/follows/following/${profileId}`, { params: { page, size, sort: 'id,desc' } }) : Promise.reject({ response: { status: 404 } })),
      () => api.get('/berry/profiles/following', { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/profiles/following', { params: { page, size, sort: 'id,desc' }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return { responseBody: { content: [] } };
  }

  async deleteCustomDesign(designId: string | number) {
    const headers = { profileType: 'CUSTOMER' };

    const candidates = [
      () => api.delete(`/custom-designs/${designId}`, { headers }),
      () => api.delete(`/designs/custom/${designId}`, { headers }),
      () => api.delete(`/designs/${designId}`, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![404, 400].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return { requestSuccessful: false };
  }

  async getPrintableItems() {
    const headers = { profileType: 'CUSTOMER' };
    const candidates = [
      () => api.get('/catalog/items', { headers }),
      () => api.get('/print-items', { headers }),
      () => api.get('/design-catalog/items', { headers }),
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

    return { responseBody: [] };
  }

  async getDesignTaxonomy() {
    const headers = { profileType: 'CUSTOMER' };

    const candidates = [
      () => api.get('/designs/taxonomy', { headers }),
      () => api.get('/design-taxonomy', { headers }),
      () => api.get('/designs/meta', { headers }),
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

    return { responseBody: {} };
  }

  async getPrinters(page: number = 0, size: number = 50) {
    const headers = { profileType: 'CUSTOMER' };

    const candidates = [
      () => api.get('/berry/profiles', { params: { profileType: 'PRINTER', page, size, sort: 'id,desc' }, headers }),
      () => api.get('/profiles', { params: { profileType: 'PRINTER', page, size, sort: 'id,desc' }, headers }),
      () => api.get('/printers', { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get('/berry/profiles/following', { params: { page, size, sort: 'id,desc' }, headers }),
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

  async getWallet() {
    const response = await api.get('/wallets');
    return response.data;
  }

  async getWalletHistory(page: number = 0, size: number = 20) {
    const response = await api.get('/wallets/histories', {
      params: { page, size, sort: 'id,desc' }
    });
    return response.data;
  }

  async getFaqItems(): Promise<FaqItem[]> {
    const endpointCandidates = [
      () => api.get('/faqs'),
      () => api.get('/faq'),
      () => api.get('/contents/faqs'),
    ];

    for (const request of endpointCandidates) {
      try {
        const response = await request();
        const body = response.data?.responseBody || response.data || {};
        const list = Array.isArray(body)
          ? body
          : Array.isArray(body?.content)
            ? body.content
            : Array.isArray(body?.items)
              ? body.items
              : [];

        const items = list
          .map((item: any, index: number) => ({
            id: String(item?.id || item?.faqId || index + 1),
            question: String(item?.question || item?.title || '').trim(),
            answer: String(item?.answer || item?.description || '').trim(),
          }))
          .filter((item: FaqItem) => item.question && item.answer);

        if (items.length) return items;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) throw error;
      }
    }

    const pageResponse = await fetch('https://berrystamp.com/faq');
    const html = await pageResponse.text();
    return extractFaqFromHtml(html);
  }

  async getReferralSummary() {
    const candidates = [
      () => api.get('/referrals/summary'),
      () => api.get('/referrals'),
      () => api.get('/referral/summary'),
      () => api.get('/referral'),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data?.responseBody || response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) throw error;
      }
    }

    return {};
  }

  async getReferralHistory(page: number = 0, size: number = 20) {
    const candidates = [
      () => api.get('/referrals/histories', { params: { page, size, sort: 'id,desc' } }),
      () => api.get('/referrals/history', { params: { page, size, sort: 'id,desc' } }),
      () => api.get('/referrals', { params: { page, size, sort: 'id,desc' } }), () => api.get('/referral', { params: { page, size, sort: 'id,desc' } }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) throw error;
      }
    }

    return { responseBody: { content: [] } };
  }

  async redeemReferralReward(payload: { amount?: number; mode: 'WALLET' | 'CASH'; bankName?: string; accountNumber?: string }) {
    const candidates = [
      () => api.post('/referrals/redeem', payload),
      () => api.post('/referral/redeem', payload),
      () => api.post('/wallets/referrals/redeem', payload),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) throw error;
      }
    }

    return { requestSuccessful: false, responseMessage: 'Redeem endpoint unavailable.' };
  }



  async createCollection(payload: { name: string; description?: string; imagePath?: string }) {
    const headers = { profileType: getProfileType() };
    const candidates = [
      () => api.post('/collections', payload, { headers }),
      () => api.post('/collections/create', payload, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { requestSuccessful: false };
  }

  async updateCollection(collectionId: string | number, payload: { name?: string; description?: string; imagePath?: string }) {
    const headers = { profileType: getProfileType() };
    const candidates = [
      () => api.put(`/collections/${collectionId}`, payload, { headers }),
      () => api.patch(`/collections/${collectionId}`, payload, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { requestSuccessful: false };
  }

  async deleteCollection(collectionId: string | number) {
    const headers = { profileType: getProfileType() };
    const candidates = [
      () => api.delete(`/collections/${collectionId}`, { headers }),
      () => api.delete(`/collections/remove/${collectionId}`, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { requestSuccessful: false };
  }

  async createCustomDesign(payload: Record<string, unknown>) {
    const headers = { profileType: getProfileType() };
    const candidates = [
      () => api.post('/designs', payload, { headers }),
      () => api.post('/custom-designs', payload, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { requestSuccessful: false };
  }

  async updateCustomDesign(designId: string | number, payload: Record<string, unknown>) {
    const headers = { profileType: getProfileType() };
    const candidates = [
      () => api.put(`/designs/${designId}`, payload, { headers }),
      () => api.patch(`/designs/${designId}`, payload, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { requestSuccessful: false };
  }

  async addDesignToCollection(payload: { designId: string | number; collectionId: string | number }) {
    const headers = { profileType: getProfileType() };
    const body = { designId: Number(payload.designId), collectionId: Number(payload.collectionId) };
    const candidates = [
      () => api.post('/collections/designs', body, { headers }),
      () => api.post(`/collections/${payload.collectionId}/designs/${payload.designId}`, {}, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { requestSuccessful: false };
  }

  async getDesignInsights(designId: string | number) {
    const headers = { profileType: getProfileType() };
    const candidates = [
      () => api.get(`/designs/${designId}/insights`, { headers }),
      () => api.get(`/designs/insights/${designId}`, { headers }),
      () => api.get(`/analytics/designs/${designId}`, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { responseBody: {} };
  }

  // Generic request method
  async request(config: AxiosRequestConfig) {
    const response = await api.request(config);
    return response.data;
  }
}

export default new ApiService();
