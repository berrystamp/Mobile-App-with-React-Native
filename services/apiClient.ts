import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';
import api from './api';

type ProfileType = 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
const ACTIVE_PROFILE_TYPE_KEY = 'activeProfileType';

class ApiService {
  private async persistUser(user: Record<string, unknown>, activeProfileType?: ProfileType) {
    const resolvedProfileType = (activeProfileType || user.profileType) as ProfileType | undefined;
    const nextUser = resolvedProfileType ? { ...user, profileType: resolvedProfileType } : user;
    await AsyncStorage.setItem('userData', JSON.stringify(nextUser));
    if (resolvedProfileType) {
      await AsyncStorage.setItem(ACTIVE_PROFILE_TYPE_KEY, resolvedProfileType);
    }
    return nextUser;
  }

  private sanitizeProfileImage(value: unknown) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed || ['string', 'null', 'undefined'].includes(trimmed)) return '';
    return trimmed;
  }

  private async getActiveProfileType(): Promise<ProfileType> {
    const currentUser = await this.getCurrentUser();
    const storedProfileType = await AsyncStorage.getItem(ACTIVE_PROFILE_TYPE_KEY);
    return (currentUser?.profileType as ProfileType) || (storedProfileType as ProfileType) || 'CUSTOMER';
  }

  private buildUserUpdatePayload(
    currentUser: any,
    payload: Record<string, unknown>,
    options?: { includeProfilePicture?: boolean },
  ) {
    const fullName =
      payload.name ||
      currentUser?.name ||
      currentUser?.customerProfile?.name ||
      currentUser?.designerProfile?.name ||
      currentUser?.printerProfile?.name ||
      [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() ||
      currentUser?.username ||
      currentUser?.customerProfile?.userName ||
      currentUser?.designerProfile?.userName ||
      currentUser?.printerProfile?.userName ||
      'User';

    const includeProfilePicture = options?.includeProfilePicture ?? true;
    const currentProfilePicture = this.sanitizeProfileImage(
      currentUser?.profilePicture ||
        currentUser?.profilePicturePath ||
        currentUser?.profileImage?.url ||
        currentUser?.profileImage ||
        currentUser?.customerProfile?.profilePic ||
        currentUser?.designerProfile?.profilePic ||
        currentUser?.printerProfile?.profilePic,
    );

    return {
      name: fullName,
      phoneNumber: currentUser?.phoneNumber || '',
      areaCode: currentUser?.areaCode || '',
      gender: currentUser?.gender || 'FEMALE',
      profileType: (payload.profileType as ProfileType) || currentUser?.profileType || 'CUSTOMER',
      address: currentUser?.address || '',
      city: currentUser?.city || '',
      state: currentUser?.state || '',
      postalCode: currentUser?.postalCode || '',
      longitude: currentUser?.longitude || 0,
      latitude: currentUser?.latitude || 0,
      ...(includeProfilePicture ? { profilePicture: currentProfilePicture } : {}),
      ...payload,
    };
  }

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
      await this.persistUser(result.responseBody.user, profileType as ProfileType);
    }
    
    return result;
  }

  async logout() {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem(ACTIVE_PROFILE_TYPE_KEY);
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

  async syncCurrentUserFromBackend() {
    const activeProfileType = await this.getActiveProfileType();
    const headers = { profileType: activeProfileType };
    const response = await api.get('/user', { headers });
    const body = response.data?.responseBody || response.data;
    if (body) {
      await this.persistUser(body, activeProfileType);
    }
    return {
      ...response.data,
      responseBody: {
        ...(body || {}),
        profileType: body?.profileType || activeProfileType,
      },
    };
  }

  async getMyProfile() {
    const activeProfileType = await this.getActiveProfileType();
    const headers = { profileType: activeProfileType };

      try {
        const response = await  api.get('/user', { headers });
        const body = response.data?.responseBody || response.data;
        if (body) {
          await this.persistUser(body, activeProfileType);
        }
        return {
          ...response.data,
          responseBody: {
            ...(body || {}),
            profileType: body?.profileType || activeProfileType,
          },
        };
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }

    const user = await this.getCurrentUser();
    return { responseBody: { ...(user || {}), profileType: user?.profileType || activeProfileType } };
  }

  async updateMyProfile(payload: Record<string, unknown>) {
    const activeProfileType = await this.getActiveProfileType();
    const headers = { profileType: activeProfileType };
    const currentUser = (await this.getCurrentUser()) || {};
    const requestPayload = this.buildUserUpdatePayload(currentUser, payload);

      try {
        const response = await api.put('/user', requestPayload, { headers });
        const body = response.data?.responseBody || response.data;
        if (body) {
          await this.persistUser(body, (requestPayload.profileType as ProfileType) || activeProfileType);
        }
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    

    const nextUser = { ...(currentUser || {}), ...requestPayload };
    await this.persistUser(nextUser, (requestPayload.profileType as ProfileType) || activeProfileType);
    return { requestSuccessful: true, responseBody: nextUser };
  }

  async setActiveProfileType(profileType: ProfileType) {
    const headers = { profileType: await this.getActiveProfileType() };
    const localUser = (await this.getCurrentUser()) || {};
    const hydratedProfile = await this.getMyProfile().catch(() => null);
    const hydratedBody = hydratedProfile?.responseBody || hydratedProfile || {};
    const currentUser = { ...localUser, ...hydratedBody };
    const requestPayload = this.buildUserUpdatePayload(currentUser, { profileType }, { includeProfilePicture: false });

    try {
      const response = await api.put('/user', requestPayload, { headers });
      const body = response.data?.responseBody || response.data;
      if (body) {
        await this.persistUser(body, profileType);
      }
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && error.response.status !== 404) {
        throw error;
      }
    }

    const synced = await this.syncCurrentUserFromBackend().catch(() => null);
    const nextUser = { ...(currentUser || {}), ...requestPayload };
    await this.persistUser(nextUser, profileType);
    return synced || { requestSuccessful: true, responseBody: nextUser };
  }

  async uploadProfileImage(imageUri: string) {
    const fileName = imageUri.split('/').pop() || `profile-${Date.now()}.jpg`;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const mimeType =
      fileExtension === 'png'
        ? 'image/png'
        : fileExtension === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await api.post('/files/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        profileType: await this.getActiveProfileType(),
      },
    });

    const body = response.data?.responseBody || response.data || {};
    return (
      body.url ||
      body.path ||
      body.originalUrl ||
      body.previewUrl ||
      body.thumbnailUrl ||
      body
    );
  }

  async updateProfileImage(imageUri: string) {
    const uploadedImage = await this.uploadProfileImage(imageUri);
    const imageString = this.sanitizeProfileImage(
      typeof uploadedImage === 'string' ? uploadedImage : uploadedImage?.url || uploadedImage?.path || '',
    );
    return this.updateMyProfile({
      profilePicture: imageString,
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
    const headers = { profileType: await this.getActiveProfileType() };
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
      headers,
    });
    const designs = fallbackResponse.data?.responseBody?.content || fallbackResponse.data?.content || [];
    const inferred = designs
      .flatMap((item: any) => [item?.category, ...(Array.isArray(item?.tags) ? item.tags : [])])
      .map((item: any) => String(item || '').trim())
      .filter(Boolean);

    return Array.from(new Set(inferred));
  }

  async getMyInterests() {
    const profileResponse = await this.getMyProfile();
    const body = profileResponse?.responseBody || profileResponse || {};
    const activeProfileType = (body?.profileType || (await this.getActiveProfileType())) as ProfileType;

    const profileByType =
      activeProfileType === 'DESIGNER'
        ? body.designerProfile
        : activeProfileType === 'PRINTER'
          ? body.printerProfile
          : body.customerProfile;

    const interests = profileByType?.categories || body.categories || body.interests || [];
    return Array.isArray(interests) ? interests.map((item: any) => String(item).trim()).filter(Boolean) : [];
  }

  async updateMyInterests(interests: string[]) {
    const cleanedInterests = Array.from(new Set(interests.map((item) => item.trim()).filter(Boolean)));
    const payload = { categories: cleanedInterests, interests: cleanedInterests };
    return this.updateMyProfile(payload);
  }

  async findOrderByTrackingNumber(trackingNumber: string) {
    const normalizedTrackingNumber = trackingNumber.trim();
    if (!normalizedTrackingNumber) return null;

    const headers = { profileType: await this.getActiveProfileType() };
    const encodedTrackingNumber = encodeURIComponent(normalizedTrackingNumber);
    const candidates = [
      () => api.get(`/orders/tracking/${encodedTrackingNumber}`, { headers }),
      () => api.get(`/orders/track/${encodedTrackingNumber}`, { headers }),
      () => api.get('/orders', { params: { trackingNumber: normalizedTrackingNumber, page: 0, size: 1, sort: 'id,desc' }, headers }),
      () => api.get('/orders', { params: { searchField: normalizedTrackingNumber, page: 0, size: 10, sort: 'id,desc' }, headers }),
      () => api.get('/orders', { params: { page: 0, size: 50, sort: 'id,desc' }, headers }),
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
    const headers = { profileType: await this.getActiveProfileType() };
    const candidates = [
      () => api.get('/payments/details', { headers }),
      () => api.get('/payment-details', { headers }),
      () => api.get('/berry/profiles/payment-details', { headers }),
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
    const headers = { profileType: await this.getActiveProfileType() };
    const candidates = [
      () => api.post('/payments/details', payload, { headers }),
      () => api.post('/payment-details', payload, { headers }),
      () => api.put('/berry/profiles/payment-details', payload, { headers }),
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
    const response = await api.get('/wallets', {
      headers: { profileType: await this.getActiveProfileType() },
    });
    return response.data;
  }

  async getWalletHistory(page: number = 0, size: number = 20) {
    const response = await api.get('/wallets/histories', {
      params: { page, size, sort: 'id,desc' },
      headers: { profileType: await this.getActiveProfileType() },
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
