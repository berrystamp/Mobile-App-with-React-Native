import { extractFaqFromHtml, type FaqItem } from '@/lib/faq';
import { useAuthStore } from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';
import api from './api';

type ProfileTypeInterface = 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
type OrderStatus = 
  | 'REVIEW' 
  | 'REJECTED' 
  | 'ACTIVE' 
  | 'CANCELLED' 
  | 'AWAITING_CONFIRMATION' 
  | 'COMPLETED' 
  | 'PICKUP_REQUESTED' 
  | 'DELIVER_REQUESTED';
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
  printerId?: number;
  openForCustomization: boolean;
  amount: number;
  mocks: DesignMockInput[];
  tags: string[];
  categories: string[];
}

export interface GetDesignsParams {
  page?: number;
  size?: number;
  designer?: number;
  tags?: string;
  designCategories?: string;
  mockName?: string;
  mockCategory?: string;
  upperPriceRange?: number;
  lowerPriceRange?: number;
  searchField?: string;
  sort?: string;
}

export interface CreateMockPayload {
  limitedStatus: boolean;
  imageUrl: string;
  availableQty: number;
  name: string;
  category: string;
  colours: string[];
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
    console.log(profileId)
    const response = await api.get(`/public/profile/${profileId}`);
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
    const response = await api.put('/profile', payload, {
      headers: { profileType },
    });
    const data = response.data;
    // Surface backend validation errors that come back as 200 with requestSuccessful: false
    if (data && data.requestSuccessful === false) {
      const msg =
        data.responseMessage ||
        data.message ||
        data.error ||
        'Profile update failed';
      const err: any = new Error(msg);
      err.response = { data };
      throw err;
    }
    return data;
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
      status?: OrderStatus | string; // Will be mapped to 'orderStatus'
      startDate?: string;            // Expected format: YYYY-MM-DD
      endDate?: string;              // Expected format: YYYY-MM-DD
    }) {
      const profileType = getProfileType();
      
      // The 'pageable' backend object is traditionally populated via flat query params
      const params: Record<string, unknown> = {
        page: options?.page ?? 0,
        size: options?.size ?? 50,
        sort: 'id,desc',
      };

      const normalizedSearch = options?.search?.trim();
      const normalizedStatus = options?.status?.trim();

      // Map legacy search if your backend still utilizes it alongside the new spec
      if (normalizedSearch) {
        params.search = normalizedSearch;
      }

      // Map to the required 'orderStatus' param
      if (normalizedStatus) {
        params.orderStatus = normalizedStatus.toUpperCase();
      }

      // Add date filters if provided
      if (options?.startDate) {
        params.startDate = options.startDate;
      }
      if (options?.endDate) {
        params.endDate = options.endDate;
      }

      const headers = { profileType };
     
      try {
        // Replaced the candidate loop with the exact endpoint provided
        const response = await api.get('/orders', { params, headers });
         console.log(response.data)
        return response.data;
      } catch (error: any) {
        // Ignore 404s and return empty content, but throw on other server errors
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
        return { responseBody: { content: [] } };
      }
    }

async getManageOrderById(orderId: string | number, profileType?: ProfileTypeInterface) {
  const activeProfileType = profileType;
  const headers = { profileType: activeProfileType };

  try {
    const response = await api.get(`/orders/${orderId}`, { headers });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status && error.response.status !== 404) {
      throw error;
    }
    return { responseBody: null };
  }
}

  async getOrderById(orderId: string | number) {
    console.log(orderId)
    const headers = { profileType: getProfileType() };
    const response = await api.get(`/orders/${orderId}`, { headers });
    return response.data;
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
    const profileType = getProfileType();
    const response = await api.get('/notifications', {
      params: { page, size, sort: 'id,desc' },
      headers: { profileType },
    });
    return response.data;
  }

  async markNotificationAsRead(id: number) {
    const profileType = getProfileType();
    const response = await api.post(`/notifications/read/${id}`, {}, {
      headers: { profileType},
    });
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const profileType = getProfileType();
    const response = await api.post('/notifications/read', {}, {
      headers: { profileType},
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
      try {
        const response = await api.get('/user/payment-detail')
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }
      }

    return { responseBody: { bankName: '', accountNumber: '', accountName: '' } };
  }

  async savePaymentDetails(payload: Record<string, unknown>) {
 
     try {
        const response = await api.put('/user/payment-detail', payload)
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && error.response.status !== 404) {
          throw error;
        }

      }

    return { requestSuccessful: true, responseBody: payload };
  }

  async createDesign(payload: CreateDesignPayload) {
    const response = await api.post('/designs', payload );
    return response.data;
  }

  async uploadDesignAsset(designId: string | number, imagePath: string) {
    const headers = { profileType: getProfileType() };
    const response = await api.post(
      `/designs/${designId}/design-uploads`,
      { imagePath },
      { headers },
    );
    return response.data;
  }

  async addDesignMock(designId: string | number, payload: CreateMockPayload) {
    const headers = { profileType: getProfileType() };
    const response = await api.post(`/designs/${designId}/mock`, payload, { headers });
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

  async getPublicProfiles(profile: 'CUSTOMER' | 'DESIGNER' | 'PRINTER', page: number = 0, size: number = 60) {
    const response = await api.get('/public/profile', {
      params: {
        profile,
        page,
        size,
      },
    });
    return response.data;
  }

  async getDesigns(filters: GetDesignsParams = {}) {
    const profileType = getProfileType();
    const response = await api.get('/designs', {
      params: {
        page: filters.page ?? 0,
        size: filters.size ?? 20,
        designer: filters.designer,
        tags: filters.tags,
        designCategories: filters.designCategories,
        mockName: filters.mockName,
        mockCategory: filters.mockCategory,
        upperPriceRange: filters.upperPriceRange,
        lowerPriceRange: filters.lowerPriceRange,
        searchField: filters.searchField,
        sort: filters.sort ?? 'id,desc',
      },
      headers: {
        profileType,
      },
    });
    return response.data;
  }

  async fetchDesignById(designId: number) {
    const profileType = getProfileType();
    const response = await api.get(`/designs/${designId}`, {
      headers: {
        profileType,
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
    const profileType = getProfileType();
    const response = await api.get('/conversations', {
      params: { page, size },
      headers: {
        profileType
      }
    });
    return response.data;
  }

  async getConversationMessages(conversationId: string, page: number = 0, size: number = 100) {
    const profileType = getProfileType();
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, size, sort: 'createdAt,asc' },
      headers: { profileType },
    });

    return response.data;
  }

  async sendMessage(payload: { toProfileId: number; content: string; caption?: string; chatType?: string }) {
    const profileType = getProfileType();
    console.log(payload)
    const response = await api.post(
      '/messages/send',
      payload,
      {
        headers: { profileType },
      },
    );

    return response.data;
  }

  async sendOrderMessage(
    orderId: string | number,
    payload: { toProfileId: number; content: string; caption?: string; chatType?: string },
  ) {
    const profileType = getProfileType();
    const response = await api.post(`/messages/send/order/${orderId}`, payload, {
      headers: { profileType },
    });

    return response.data;
  }

  async getConversationMessagesByProfile(profileId: string | number, page: number = 0, size: number = 100) {
    const profileType = getProfileType();
    const response = await api.get(`/conversations/profiles/${profileId}/messages`, {
      params: { page, size, sort: 'createdAt,asc' },
      headers: { profileType },
    });
    return response.data;
  }

  async getOrderConversationMessages(orderId: string | number, page: number = 0, size: number = 100) {
    const profileType = getProfileType();
    const response = await api.get(`/conversations/order/${orderId}/messages`, {
      params: { page, size, sort: 'createdAt,asc' },
      headers: { profileType },
    });
    return response.data;
  }

  async createOrder(payload: {
    orderRequestId: number;
    title: string;
    description: string;
    amount: number;
    deliveryAmount?: number;
    itemPickupAmount?: number;
    itemProvidedByCustomer?: boolean;
    deliveryDate: string;
  }) {
    const profileType = getProfileType();
    const response = await api.post('/orders', payload, {
      headers: { profileType },
    });
    return response.data;
  }

  async payForOrder(orderId: string | number, payload: { callback: string; orderId: number }) {
    const profileType = getProfileType();
    const response = await api.post(`/orders/${orderId}`, payload, {
      headers: { profileType },
    });
    return response.data;
  }

  async uploadOrderDesign(orderId: string | number, imagePath: string) {
    const profileType = getProfileType();
    const response = await api.post(`/orders/${orderId}/design-upload`, { imagePath }, {
      headers: { profileType },
    });
    return response.data;
  }

  async deliverOrder(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.patch(`/orders/${orderId}/deliver`, {}, {
      headers: { profileType },
    });
    return response.data;
  }

  async declineOrder(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.patch(`/orders/${orderId}/decline`, {}, {
      headers: { profileType },
    });
    return response.data;
  }

  async cancelOrderByCustomer(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.patch(`/orders/${orderId}/customer/cancel`, {}, {
      headers: { profileType },
    });
    return response.data;
  }

  async confirmOrder(orderId: string | number) {
    const response = await api.patch(`/orders/${orderId}/confirm`);
    return response.data;
  }

  async cancelOrderByProvider(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.patch(`/orders/${orderId}/cancel`, {}, {
      headers: { profileType },
    });
    return response.data;
  }

  async getOrderRequestById(orderRequestId: string | number) {
    const profileType = getProfileType();
    const response = await api.get(`/orders-request/${orderRequestId}`, {
      headers: { profileType },
    });
    return response.data;
  }

  async createCustomizationOrderRequest(payload: {
    designId: number;
    designerId: number;
    dateOfDelivery: string;
    estimatedAmount: number;
    mockTypes: string[];
    purpose: string;
    theme: string;
  }) {
    const profileType = getProfileType();
    const response = await api.post('/orders-request/customization', payload, {
      headers: { profileType },
    });
    return response.data;
  }
  async createCustomizeDesign(payload: {
    designId?: number;
    designerId: number;
    dateOfDelivery: string;
    estimatedAmount: number;
    mockTypes: string[];
    purpose: string;
    theme: string;
  }) {
    // Map the payload to exactly what your backend JSON expects
    const requestBody = {
      designerProfileId: payload.designerId,
      mockTypes: payload.mockTypes,
      purpose: payload.purpose,
      theme: payload.theme,
      dateOfDelivery: payload.dateOfDelivery,
      estimatedAmount: payload.estimatedAmount,
    };

    const profileType = getProfileType(); // Assuming you have this helper in your file
    const response = await api.post('orders-request/design', requestBody, {
      headers: { profileType },
    });
    return response.data;
  }
  async createOrderRequest(payload: Record<string, unknown>) {
    const profileType = getProfileType();
    const candidates = [
      () => api.post('/order-requests', payload, { headers: { profileType } }),
      () => api.post('/orders/requests', payload, { headers: { profileType } }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404, 405].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return { requestSuccessful: false };
  }

  async markMessageAsRead(messageId: string) {
    const profileType = getProfileType();
    const response = await api.patch(
      `/messages/send/${messageId}/read`,
      {
        headers: { profileType },
      },
    );

    return response.data;
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

  // Fetch all users filtered by profileType (PRINTER, DESIGNER, CUSTOMER)
  async getUsers(profileType: 'PRINTER' | 'DESIGNER' | 'CUSTOMER' = 'PRINTER', page: number = 0, size: number = 60) {
    const headers = { profileType: 'CUSTOMER' };
    try {
      const response = await api.get('/users', {
        params: { profileType, page, size, sort: 'id,desc' },
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && error.response.status !== 404) {
        throw error;
      }
    }
    // Fallback to public profiles endpoint
    return this.getPublicProfiles(profileType, page, size);
  }

  async getWallet() {
    const profileType = getProfileType();
    const response = await api.get('/wallets', {
      headers: { profileType },
    });
    console.log(`Responnse for wallet ${JSON.stringify(response.data)}`);
    return response.data;
  }

  async getWalletHistory(
    page: number = 0,
    size: number = 20,
    status?: 'SUCCESS' | 'FAILED' | 'PENDING',
  ) {
    const profileType = getProfileType();
    const params: Record<string, unknown> = { page, size, sort: 'id,desc' };
    if (status) params.status = status;
    const response = await api.get('/wallets/histories', {
      params,
      headers: { profileType },
    });
    return response.data;
  }

  async withdrawFromWallet(amount: number) {
    const profileType = getProfileType();
    const response = await api.post(
      '/wallets/withdraw',
      { amount },
      { headers: { profileType } },
    );
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



  async createCollection(payload: { name: string; description?: string; picture?: string }) {
    const headers = { profileType: getProfileType() };
    const candidates = [
      () => api.post('/collections', payload, { headers }),
      
    ];
    console.log(payload)
    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404, 405].includes(error.response.status)) throw error;
      }
    }

    return { requestSuccessful: false };
  }

  async updateCollection(collectionId: string | number, payload: { name?: string; description?: string; picture?: string }) {
    const headers = { profileType: getProfileType() };
    const response = await api.put(`/collections/${collectionId}`, payload, { headers });
    return response.data;
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
    // const headers = { profileType: getProfileType() };
      try {
        const response = await api.get('/orders-request/design')
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404, 405].includes(error.response.status)) throw error;
      }
    

    return { requestSuccessful: false };
  }

  async updateCustomDesign(designId: string | number, payload: Record<string, unknown>) {
    const headers = { profileType: getProfileType() }
    const candidates = [
      () => api.put(`/designs/${designId}`, payload, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        console.log(JSON.stringify(response))
        return response.data;
      } catch (error: any) {
        console.log("Error",error)
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { requestSuccessful: false };
  }

  async getCollectionDesigns(collectionId: string | number, page: number = 0, size: number = 40) {
    const headers = { profileType: getProfileType() };
    const id = Number(collectionId);
    const candidates = [
      () => api.get(`/collections/${id}/designs`, { params: { page, size, sort: 'id,desc' }, headers }),
      () => api.get(`/public/collections/${id}/designs`, { params: { page, size, sort: 'id,desc' } }),
      () => api.get('/designs', { params: { page, size, collectionId: id, sort: 'id,desc' }, headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      }
    }

    return { responseBody: { content: [] } };
  }

  async addDesignToCollection(payload: { designId: string | number; collectionId: string | number }) {
    const headers = { profileType: getProfileType() };
    const body = { designs: [Number(payload.designId)] };
    const candidates = [
      () => api.put(`/collections/${payload.collectionId}/designs/add`, body, { headers }),
      () => api.post('/collections/designs', { designId: Number(payload.designId), collectionId: Number(payload.collectionId) }, { headers }),
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

  async moveDesignToCollection(payload: { designIds: (string | number)[]; fromCollectionId: string | number; newCollectionId: string | number }) {
    const headers = { profileType: getProfileType() };
    const body = { designs: payload.designIds.map(Number), newCollection: Number(payload.newCollectionId) };
    const response = await api.put(`/collections/${payload.fromCollectionId}/designs/move`, body, { headers });
    return response.data;
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

  // ─── Settings: Mail / Email notifications ──────────────────────────────────
  async getMailSettings() {
    const response = await api.get('/user/mail-setting');
    return response.data;
  }

  async updateMailSettings(payload: {
    supportEmail: boolean;
    orderEmail: boolean;
    newsEmail: boolean;
    otherEmail: boolean;
    promotionEmail: boolean;
  }) {
    const response = await api.put('/user/mail-setting', payload);
    return response.data;
  }

  // ─── Settings: Change password ─────────────────────────────────────────────
  async changePassword(payload: { oldPassword: string; newPassword: string }) {
    const response = await api.patch('/user/password', payload);
    return response.data;
  }

  // ─── Settings: Change email (request OTP + verify) ─────────────────────────
  async requestEmailChange(newEmail: string) {
    const response = await api.post('/user/change-email', { email: newEmail });
    return response.data;
  }

  async verifyEmailChange(newEmail: string, otp: string) {
    const response = await api.post('/user/change-email/verify', { email: newEmail, otp });
    return response.data;
  }

  // ─── Insights ──────────────────────────────────────────────────────────────
  async getProfileInsights(profileId: string | number) {
    const response = await api.get(`/insights/profile/${profileId}`);
    return response.data;
  }

  async getActivityPieChart() {
    const response = await api.get('/insights/activity-pie-chart');
    return response.data;
  }

  async getActivityBarGraph(interval: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'MONTHLY') {
    const response = await api.get('/insights/activity-bar-graph', {
      params: { interval },
    });
    return response.data;
  }
}

export default new ApiService();
