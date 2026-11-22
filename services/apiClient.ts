import { Platform } from 'react-native';
import { extractFaqFromHtml, type FaqItem } from '@/lib/faq';
import { toAccountType, toProfileType, useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';
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

/** Payload shape for a single item in a print order request. */
export interface PrintOrderPayloadItem {
  designId: number;
  colour: string;
  quantity: number;
  size: string;
  mockItemId: number;
  customDesign: boolean;
  /** "From Customer" when hasOwnItem is true, "From Printer" when false */
  sourceOfItem: string;
  estimatedAmount: string | number;
  dateOfDelivery: string;
  deliveryAddress: {
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    country?: string;
  };
  printerId: number;
}

// Safe non-reactive read for Zustand store outside of React components
const getProfileType = () => {
  const state = useAuthStore.getState();
  return toProfileType(state.role);
};

class ApiService {
  async removeFromCart(id: string) {
    return this.deleteCartItem(id);
  }
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
    useAuthStore.getState().logout();
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
    const profileType = getProfileType();
    const response = await api.get('/user', { headers: { profileType } });
    const body = response.data?.responseBody || response.data;
    if (body && typeof body === 'object') {
      await AsyncStorage.setItem('userData', JSON.stringify(body)).catch(() => {});
    }

    return {
      ...response.data,
      responseBody: {
        ...(body || {}),
        profileType,
      },
    };
  }

  async getMyProfile() {
    const profileType = getProfileType();
    try {
      const response = await api.get('/user', { headers: { profileType } });
      const body = response.data?.responseBody || response.data;
      if (body && typeof body === 'object') {
        await AsyncStorage.setItem('userData', JSON.stringify(body)).catch(() => {});
      }

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
    return { responseBody: { ...(user || {}), profileType } };
  }

  async updateMyProfile(payload: Record<string, unknown>) {

    const profileType = getProfileType();
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

  async addProfile(payload: {
    profile: 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
    name: string;
    phoneNumber?: string;
    address?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      longitude?: number;
      latitude?: number;
    };
  }) {
    const response = await api.post('/profile', payload);
    const data = response.data;
    if (data && data.requestSuccessful === false) {
      const msg =
        data.responseMessage ||
        data.message ||
        data.error ||
        'Profile creation failed';
      const err: any = new Error(msg);
      err.response = { data };
      throw err;
    }
    const body = data?.responseBody || data;
    if (body && typeof body === 'object' && (body.id || body.email || body.designerProfile || body.printerProfile)) {
      await AsyncStorage.setItem('userData', JSON.stringify(body)).catch(() => {});
    }
    return data;
  }

  async setActiveProfileType(profileType: ProfileTypeInterface) {
    await AsyncStorage.setItem('profileType', profileType);
    useAuthStore.getState().setAccountType(toAccountType(profileType));
    // Drop cached cross-account conversation snapshots so they cannot leak across roles.
    useConversationStore.getState().setResponse(null);
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
    const profileType = options?.profileType || getProfileType();

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
    
      return response.data;
    } catch (error: any) {
      // Do not disguise a missing/failed orders endpoint as a genuinely empty order list.
      throw error;
    }
  }

  async getManageOrderById(orderId: string | number, profileType?: ProfileTypeInterface) {
    const activeProfileType = profileType || getProfileType();
    const headers = { profileType: activeProfileType };

    const response = await api.get(`/orders/${orderId}`, { headers });
    return response.data;
  }

  // ─── Influencer Merch order management (printer flow) ───────────────────
  // Instant-checkout orders are grouped by design instead of listed
  // one-by-one, since there's no printer negotiation step for them.
  async getInfluencerMerchDesigns(options?: {
    page?: number;
    size?: number;
    search?: string;
    startDate?: string; // Expected format: YYYY-MM-DD
    endDate?: string;   // Expected format: YYYY-MM-DD
  }) {
    const profileType = getProfileType();
    const params: Record<string, unknown> = {
      page: options?.page ?? 0,
      size: options?.size ?? 50,
    };
    const search = options?.search?.trim();
    if (search) params.search = search;
    if (options?.startDate) params.startDate = options.startDate;
    if (options?.endDate) params.endDate = options.endDate;

    try {
      const response = await api.get('/orders/influencer-merch/designs', {
        params,
        headers: { profileType },
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && error.response.status !== 404) {
        throw error;
      }
      return { responseBody: { content: [] } };
    }
  }

  async getInfluencerMerchDesignOrders(
    designId: string | number,
    options?: { page?: number; size?: number; search?: string }
  ) {
    const profileType = getProfileType();
    const params: Record<string, unknown> = {
      page: options?.page ?? 0,
      size: options?.size ?? 50,
    };
    const search = options?.search?.trim();
    if (search) params.search = search;

    try {
      const response = await api.get(
        `/orders/influencer-merch/designs/${designId}`,
        { params, headers: { profileType } }
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && error.response.status !== 404) {
        throw error;
      }
      return { responseBody: { content: [] } };
    }
  }

  async getInfluencerMerchOrderById(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.get(`/orders/influencer-merch/${orderId}`, {
      headers: { profileType },
    });
    return response.data;
  }

  async deliverInfluencerMerchOrder(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.patch(
      `/orders/influencer-merch/${orderId}/deliver`,
      {},
      { headers: { profileType } }
    );
    return response.data;
  }

  async cancelInfluencerMerchOrder(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.patch(
      `/orders/influencer-merch/${orderId}/cancel`,
      {},
      { headers: { profileType } }
    );
    return response.data;
  }

  async getOrderById(orderId: string | number) {
    
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
      headers: { profileType },
    });
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const profileType = getProfileType();
    const response = await api.post('/notifications/read', {}, {
      headers: { profileType },
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

  async getMyInterests(): Promise<string[]> {
    const response = await api.get('/user');
    const body = response.data?.responseBody || response.data || {};

    const rawInterests =
      body.designInterests ??
      body.customerProfile?.designInterests ??
      body.designerProfile?.designInterests ??
      body.printerProfile?.designInterests ??
      [];

    if (!Array.isArray(rawInterests)) return [];

    return rawInterests
      .map((item: any) => this.extractInterestLabel(item))
      .filter(Boolean);
  }

  // Helper: safely turn a string OR object into a trimmed label.
  private extractInterestLabel(item: any): string {
    if (item == null) return '';
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'number') return String(item);
    if (typeof item === 'object') {
      const label =
        item.name ??
        item.interest ??
        item.interestName ??
        item.label ??
        item.title ??
        item.value ??
        '';
      return String(label).trim();
    }
    return '';
  }

  async updateMyInterests(interests: string[]) {
    const cleanedInterests = Array.from(new Set(interests.map((item) => item.trim()).filter(Boolean)));
    const response = await api.put('/user/design-interest', { interests: cleanedInterests });
    return response.data;
  }

  async findOrderByTrackingNumber(trackingNumber: string) {
    const normalizedTrackingNumber = trackingNumber.trim();
    if (!normalizedTrackingNumber) return null;

    const profileType = getProfileType();
    const headers = { profileType };

    if (/^\d+$/.test(normalizedTrackingNumber)) {
      try {
        const byIdRes = await api.get(`/orders/${normalizedTrackingNumber}`, { headers });
        const order = byIdRes.data?.responseBody || byIdRes.data;
        if (order && typeof order === 'object' && order.id != null) {
          return order;
        }
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) {
          throw error;
        }
      }
    }

    const response = await api.get('/orders', {
      params: { page: 0, size: 50, sort: 'id,desc' },
      headers,
    });
    const body = response.data?.responseBody || response.data || {};
    const list = Array.isArray(body)
      ? body
      : Array.isArray(body?.content)
        ? body.content
        : [];

    const target = normalizedTrackingNumber.toLowerCase();
    const matched = list.find((item: any) => {
      const orderIdentifiers = [
        item?.ref,
        item?.transactionRef,
        item?.orderNumber,
        item?.trackingNumber,
        item?.reference,
        item?.id,
        item?.id != null ? `wq${item.id}` : '',
      ]
        .map((value: any) => String(value || '').trim().toLowerCase())
        .filter(Boolean);
      return orderIdentifiers.includes(target);
    });

    return matched || null;
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
    const response = await api.post('/designs', payload);
    return response.data;
  }

  async uploadDesignAsset(designId: string | number, imagePath: string) {
    const response = await api.post(
      `/designs/${designId}/design-uploads`,
      { imagePath },
    );
    return response.data;
  }

  async getDesignUploads(designId: string | number) {
    const response = await api.get(`/designs/${designId}/design-uploads`);
    return response.data;
  }

  async deleteDesignUpload(designId: string | number, designUploadId: string | number) {
    const response = await api.delete(`/designs/${designId}/design-uploads/${designUploadId}`);
    return response.data;
  }

  async addDesignMock(designId: string | number, payload: CreateMockPayload) {
    const response = await api.post(`/designs/${designId}/mock`, payload);
    return response.data;
  }

  async updateDesignMock(designId: string | number, mockId: string | number, payload: CreateMockPayload) {
    const response = await api.put(`/designs/${designId}/mocks/${mockId}`, payload);
    return response.data;
  }

  async deleteDesignMock(designId: string | number, mockId: string | number) {
    const response = await api.delete(`/designs/${designId}/mocks/${mockId}`);
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

  async getFollowConnection(profileId: string | number) {
    const headers = { profileType: getProfileType() };
    const response = await api.get(`/follow/${Number(profileId)}`, { headers });
    return response.data;
  }

  async getDesigner(id: string | number) {
    const profileType = getProfileType();
    const response = await api.get(`/designs/${id}`, {
      headers: {
        profileType,
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

  async getPublicDesigns(filters: GetDesignsParams = {}) {
    const response = await api.get('/public/designs', {
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
    });
    return response.data;
  }

  async getDesignerDesigns(page: number = 0, size: number = 40) {
    const response = await api.get('/designs/all/designer', {
      params: { page, size, sort: 'id,desc' },
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

  async fetchDesignerDesignById(designId: number) {
    const response = await api.get(`/designs/${designId}/designer`);
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
    const headers = { profileType: getProfileType() };

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
    const currentUser = await this.getCurrentUser().catch(() => null);
    const userBody = currentUser?.responseBody || currentUser || {};
    const profileType = getProfileType();
    const activeProfileId =
      (profileType === 'DESIGNER'
        ? userBody?.designerProfile?.id
        : profileType === 'PRINTER'
          ? userBody?.printerProfile?.id
          : userBody?.customerProfile?.id) ||
      userBody?.customerProfile?.id ||
      userBody?.id;

    if (activeProfileId) {
      try {
        const response = await api.get(`/public/follows/following/${Number(activeProfileId)}`);
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.responseBody)
            ? response.data.responseBody
            : [];
        if (list.length > 0) {
          return response.data;
        }
      } catch (error: any) {
        if (error?.response?.status && ![400, 404].includes(error.response.status)) {
          throw error;
        }
      }
    }

    return this.getPublicProfiles('DESIGNER', page, size);
  }

  async getConversations(page: number = 0, size: number = 50) {
    const profileType = getProfileType();
    const response = await api.get('/conversations', {
      params: { page, size },
      headers: {
        profileType,
      },
    });
    return response.data;
  }

  async getConversationById(conversationId: string | number) {
    const profileType = getProfileType();
    const response = await api.get(`/conversations/${conversationId}`, {
      headers: { profileType },
    });
    return response.data;
  }

  async getConversationByProfileId(profileId: string | number) {
    const profileType = getProfileType();
    const response = await api.get(`/conversations/profiles/${profileId}`, {
      headers: { profileType },
    });
    return response.data;
  }

  async getConversationMessages(conversationId: string, page: number = 0, size: number = 100, sort: string = 'createdAt,asc') {
    const profileType = getProfileType();
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, size, sort },
      headers: { profileType },
    });

    return response.data;
  }

  async sendMessage(payload: { toProfileId: number; content: string; caption?: string; chatType?: string }) {
    const profileType = getProfileType();
    
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

  async payForOrder(orderId: string | number, payload: {
    callback: string;
    orderId: number;
    channels?: string[];
  }) {
    const profileType = getProfileType();
    const response = await api.post(`/orders/${orderId}`, payload, {
      headers: { profileType },
    });
    return response.data;
  }

  async uploadOrderDesign(
    orderId: string | number,
    imagePathOrPayload:
      | string
      | {
          name: string;
          frontImageUrl: string;
          designImages?: string[];
          description?: string;
          printerId?: number;
          openForCustomization?: boolean;
          amount?: number;
          mocks?: DesignMockInput[];
          tags?: string[];
          categories?: string[];
        },
  ) {
    const payload =
      typeof imagePathOrPayload === 'string'
        ? {
            name: `Order #${orderId} Custom Design`,
            frontImageUrl: imagePathOrPayload,
            designImages: [imagePathOrPayload],
            mocks: [],
          }
        : {
            ...imagePathOrPayload,
            designImages: imagePathOrPayload.designImages || [imagePathOrPayload.frontImageUrl],
            mocks: imagePathOrPayload.mocks || [],
          };
    const response = await api.post(`/custom-designs/order/${orderId}`, payload);
    return response.data;
  }

  async getOrderDesignUploads(orderId: string | number) {
    const response = await api.patch(`/orders/${orderId}/design-uploads`);
    return response.data;
  }

  async getOrderCustomDesigns(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.get(`/custom-designs/order/${orderId}/designs`, {
      headers: { profileType },
    });
    return response.data;
  }

  async getOrderFinalCustomDesign(orderId: string | number) {
    const profileType = getProfileType();
    const response = await api.get(`/custom-designs/order/${orderId}/designs/final`, {
      headers: { profileType },
    });
    return response.data;
  }

  async reviewOrderCustomDesign(orderId: string | number, designId: string | number, comment: string) {
    const response = await api.post(`/custom-designs/order/${orderId}/designs/${designId}/review`, {
      comment,
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

  async cancelOrderByCustomer(
    orderId: string | number,
    payload?: { comment?: string; disputeType?: string },
  ) {
    const profileType = getProfileType();
    const validDisputeTypes = [
      'PAYMENT_ISSUES',
      'UNRESPONSIVE_VENDOR',
      'FRAUDULENT_ACT',
      'VIOLATION_OF_TERMS',
    ];
    const normalizedDisputeType = validDisputeTypes.includes(String(payload?.disputeType || ''))
      ? String(payload?.disputeType)
      : 'PAYMENT_ISSUES';
    const response = await api.patch(
      `/orders/${orderId}/customer/cancel`,
      {
        comment: payload?.comment || '',
        disputeType: normalizedDisputeType,
      },
      {
        headers: { profileType },
      },
    );
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

  async getOrderRequests(page: number = 0, size: number = 20) {
    const profileType = getProfileType();
    const response = await api.get('/orders-request', {
      params: { page, size, sort: 'id,desc' },
      headers: { profileType },
    });
    return response.data;
  }

  async rejectOrderRequest(orderRequestId: string | number) {
    const profileType = getProfileType();
    const response = await api.patch(`/orders-request/${orderRequestId}`, {}, {
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
    const normalizedDate = String(payload.dateOfDelivery || '').split('T')[0];
    const response = await api.post(
      '/orders-request/customization',
      {
        ...payload,
        dateOfDelivery: normalizedDate,
      },
      {
        headers: { profileType },
      },
    );
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
    const normalizedDate = String(payload.dateOfDelivery || '').split('T')[0];
    const requestBody = {
      designerProfileId: payload.designerId,
      mockTypes: payload.mockTypes,
      purpose: payload.purpose,
      theme: payload.theme,
      dateOfDelivery: normalizedDate,
      estimatedAmount: payload.estimatedAmount,
    };

    const profileType = getProfileType();
    const response = await api.post('/orders-request/design', requestBody, {
      headers: { profileType },
    });
    return response.data;
  }

  async createOrderRequest(payload: Record<string, unknown>) {
    const profileType = getProfileType();
    const headers = { profileType };
    if (Array.isArray(payload.printRequestDtoList)) {
      const response = await api.post('/orders-request/print/multi', payload, { headers });
      return response.data;
    }
    if (payload.printerId != null || payload.mockItemId != null) {
      const response = await api.post('/orders-request/print', payload, { headers });
      return response.data;
    }
    if (payload.designId != null && Number(payload.designId) > 0) {
      const response = await api.post('/orders-request/customization', payload, { headers });
      return response.data;
    }
    const response = await api.post('/orders-request/design', payload, { headers });
    return response.data;
  }

  async markMessageAsRead(messageId: string) {
    const profileType = getProfileType();
    const encodedId = encodeURIComponent(messageId);
    try {
      const response = await api.patch(
        `/messages/send/${encodedId}/read`,
        {},
        { headers: { profileType } },
      );
      return response.data;
    } catch (error: any) {
      if (![400, 404, 405].includes(error?.response?.status)) throw error;
      return { requestSuccessful: true, localFallback: true };
    }
  }

  async deleteConversation(conversationId: string) {
    const { markConversationDeletedLocally } = await import('@/lib/messages');
    const profileType = getProfileType();
    const headers = { profileType };
    const encodedId = encodeURIComponent(String(conversationId));
    const candidates = [
      () => api.delete(`/conversations/${encodedId}`, { headers }),
      () => api.delete(`/messages/conversations/${encodedId}`, { headers }),
    ];

    for (const request of candidates) {
      try {
        const response = await request();
        markConversationDeletedLocally(conversationId);
        return response.data;
      } catch (error: any) {
        if (![404, 405].includes(error?.response?.status)) {
          throw error;
        }
      }
    }

    // Backend conversation delete endpoint is not exposed; persist deletion locally
    markConversationDeletedLocally(conversationId);
    return { requestSuccessful: true, conversationId, localOnly: true };
  }

  async reportConversation(conversationId: string, reason: string, participantName?: string) {
    const label = participantName
      ? `Conversation #${conversationId} (${participantName})`
      : `Conversation #${conversationId}`;
    return this.submitFeedback({
      type: 'BUG',
      category: label,
      message: reason,
    });
  }

  // Reports and suggestions are persisted by the backend API.
  async submitFeedback(payload: { type: 'IDEA' | 'BUG'; category: string; message: string }) {
    let user = await this.getCurrentUser().catch(() => null);
    let email = String(user?.email || user?.responseBody?.email || '').trim();
    if (!email) {
      user = await this.syncCurrentUserFromBackend().catch(() => null);
      email = String(user?.responseBody?.email || user?.email || '').trim();
    }
    if (!email) throw new Error('Your account email could not be found. Please sign in again.');
    const subject = `[Berrystamp ${payload.type === 'IDEA' ? 'Suggestion' : 'Report'}] ${payload.category}`;
    const response = await api.post('/reports', {
      subject,
      email,
      category: payload.category,
      message: payload.message.trim(),
    });
    return response.data;
  }

  async getMyReports() {
    const response = await api.get('/reports');
    return response.data;
  }

  async getReport(reportId: string | number) {
    const response = await api.get(`/reports/${encodeURIComponent(String(reportId))}`);
    return response.data;
  }

  async registerPushToken(token: string) {
    const headers = { profileType: getProfileType() };
    const payload = {
      token,
      pushToken: token,
      platform: Platform.OS,
    };
    try {
      const response = await api.post('/notifications/push-token', payload, { headers });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const notAvailableError: any = new Error(
          'The push-token API is not available on the current backend.',
        );
        notAvailableError.cause = error;
        throw notAvailableError;
      }
      throw error;
    }
  }

  async unregisterPushToken(token: string) {
    const headers = { profileType: getProfileType() };
    try {
      const response = await api.delete('/notifications/push-token', { data: { token }, headers });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const notAvailableError: any = new Error(
          'The push-token API is not available on the current backend.',
        );
        notAvailableError.cause = error;
        throw notAvailableError;
      }
      throw error;
    }
  }

  async getUserAddress() {
    const profileType = getProfileType();
    const response = await api.get('/user/address', { headers: { profileType } });
    return response.data;
  }

  /**
   * Update the shop location for a printer or designer profile.
   * Uses PUT /api/v1/user (UpdateUserRequest) as documented in backend-api-endpoints.md.
   */
  async updateShopLocation(payload: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  }) {
    const profileType = getProfileType();
    const currentUser = await this.getMyProfile().catch(() => null);
    const userBody = currentUser?.responseBody || currentUser || {};
    const roleProfile =
      profileType === 'PRINTER'
        ? userBody?.printerProfile
        : profileType === 'DESIGNER'
          ? userBody?.designerProfile
          : userBody?.customerProfile;
    const resolvedName =
      String(
        userBody?.name ||
          [userBody?.firstName, userBody?.lastName].filter(Boolean).join(' ') ||
          roleProfile?.name ||
          userBody?.userName ||
          'Berrystamp User',
      ).trim() || 'Berrystamp User';

    const userUpdatePayload: Record<string, unknown> = {
      name: resolvedName,
      phoneNumber: userBody?.phoneNumber || roleProfile?.userPhone || roleProfile?.phoneNumber || undefined,
      areaCode: userBody?.areaCode || '+234',
      gender: userBody?.gender || undefined,
      profileType,
      address: payload.address,
      city: payload.city || userBody?.address?.city || '',
      state: payload.state || userBody?.address?.state || '',
      country: payload.country || userBody?.address?.country || 'Nigeria',
      postalCode: payload.postalCode || userBody?.address?.postalCode || '',
      latitude: payload.latitude,
      longitude: payload.longitude,
    };

    const response = await api.put('/user', userUpdatePayload);
    const data = response.data;
    if (data?.requestSuccessful === false) {
      throw new Error(data?.responseMessage || 'Shop location update failed.');
    }
    return data;
  }

  async getCustomDesigns(_page: number = 0, _size: number = 20) {
    try {
      const response = await api.get('/custom-designs');
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && ![400, 404].includes(error.response.status)) {
        throw error;
      }
      return [];
    }
  }

  async getCustomDesignById(id: string | number) {
    const response = await api.get(`/custom-designs/${Number(id)}`);
    return response.data;
  }

  async deleteCustomerCustomDesign(id: string | number) {
    const response = await api.delete(`/custom-designs/${Number(id)}`);
    return response.data;
  }

  async getMyCollections(page: number = 0, size: number = 20) {
    try {
      const response = await api.get('/collections', {
        params: { page, size, sort: 'id,desc' },
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && ![400, 404].includes(error.response.status)) {
        throw error;
      }
      return { content: [] };
    }
  }

  async getCollections(profileId?: string | number, page: number = 0, size: number = 20) {
    if (!profileId) {
      return this.getMyCollections(page, size);
    }

    const normalizedProfileId = Number(profileId);
    try {
      const response = await api.get('/public/collections', {
        params: { designer: normalizedProfileId, page, size, sort: 'id,desc' },
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && ![400, 404].includes(error.response.status)) {
        throw error;
      }
      return { content: [] };
    }
  }

  async getPublicCollectionById(collectionId: string | number) {
    const response = await api.get(`/public/collections/${Number(collectionId)}`);
    return response.data;
  }

  async getShopReviews(profileId?: string | number, _page: number = 0, _size: number = 20) {
    if (!profileId) {
      return { content: [] };
    }

    try {
      const response = await api.get(`/public/ratings/${Number(profileId)}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && ![400, 404].includes(error.response.status)) {
        throw error;
      }
      return { content: [] };
    }
  }

  async rateProfile(payload: {
    profileId: number;
    comment: string;
    service: number;
    deliveryTime: number;
    recommendation: number;
    communication: number;
  }) {
    const profileType = getProfileType();
    const response = await api.post('/ratings', payload, {
      headers: { profileType },
    });
    return response.data;
  }

  async getFollowers(profileId?: string | number, _page: number = 0, _size: number = 50) {
    if (!profileId) {
      return [];
    }

    try {
      const response = await api.get(`/public/follows/follower/${Number(profileId)}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && ![400, 404].includes(error.response.status)) {
        throw error;
      }
      return [];
    }
  }

  async getFollowing(profileId?: string | number, _page: number = 0, _size: number = 50) {
    if (!profileId) {
      return [];
    }

    try {
      const response = await api.get(`/public/follows/following/${Number(profileId)}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && ![400, 404].includes(error.response.status)) {
        throw error;
      }
      return [];
    }
  }

  async deleteCustomDesign(designId: string | number) {
    const response = await api.delete(`/designs/${Number(designId)}`);
    return response.data;
  }

  async getPrintableItems(): Promise<any> {
    const response = await api.get('/public/designs', {
      params: { page: 0, size: 50, sort: 'id,desc' },
    });
    const body = response.data?.responseBody || response.data || {};
    const designs = Array.isArray(body?.content) ? body.content : Array.isArray(body) ? body : [];
    const mocks = designs.flatMap((d: any) => (Array.isArray(d?.mocks) ? d.mocks : []));
    return { responseBody: mocks };
  }

  async getDesignTaxonomy(): Promise<any> {
    const response = await api.get('/public/designs', {
      params: { page: 0, size: 100, sort: 'id,desc' },
    });
    const body = response.data?.responseBody || response.data || {};
    const designs = Array.isArray(body?.content) ? body.content : Array.isArray(body) ? body : [];
    const categories = Array.from(
      new Set(
        designs
          .flatMap((d: any) => (Array.isArray(d?.categories) ? d.categories : []))
          .map((c: any) => String(c || '').trim())
          .filter(Boolean),
      ),
    );
    const tags = Array.from(
      new Set(
        designs
          .flatMap((d: any) => (Array.isArray(d?.tags) ? d.tags : []))
          .map((t: any) => String(t || '').trim())
          .filter(Boolean),
      ),
    );
    return { responseBody: { categories, tags } };
  }

  // ─── Print Order Workflow ─────────────────────────────────────────────────

  /**
   * Fetches printers sorted by proximity to the given coordinates.
   * Calls GET /public/profile?profile=PRINTER&latitude={lat}&longitude={lng}&page={p}&size={s}
   */
  async getPrintersNearby(latitude: number, longitude: number, page: number = 0, size: number = 20) {
    const response = await api.get('/public/profile', {
      params: {
        profile: 'PRINTER',
        page,
        size,
        latitude,
        longitude,
      },
    });
    return response.data;
  }

  /**
   * Creates one or more print order requests on the backend.
   * Calls POST /orders-request/print/multi with the payload array.
   * Throws on non-404 HTTP errors so the calling screen can handle them.
   */
  async createPrintOrders(payload: PrintOrderPayloadItem[]) {
    const profileType = getProfileType();
    const response = await api.post('/orders-request/print/multi', { printRequestDtoList: payload }, {
      headers: { profileType },
    });
    return response.data;
  }

  async createSinglePrintOrder(payload: PrintOrderPayloadItem) {
    const profileType = getProfileType();
    const response = await api.post('/orders-request/print', payload, {
      headers: { profileType },
    });
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────

  async getPrinters(page: number = 0, size: number = 50) {
    return this.getPublicProfiles('PRINTER', page, size);
  }

  // Fetch all users filtered by profileType (PRINTER, DESIGNER, CUSTOMER)
  async getUsers(profileType: 'PRINTER' | 'DESIGNER' | 'CUSTOMER' = 'PRINTER', page: number = 0, size: number = 60) {
    return this.getPublicProfiles(profileType, page, size);
  }

  async getWallet() {
    const profileType = getProfileType();
    const response = await api.get('/wallets', {
      headers: { profileType },
    });
    
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
    const pageResponse = await fetch('https://berrystamp.com/faq');
    const html = await pageResponse.text();
    return extractFaqFromHtml(html);
  }

  async createCollection(payload: { name: string; description?: string; picture?: string }) {
    const response = await api.post('/collections', payload);
    return response.data;
  }

  async updateCollection(collectionId: string | number, payload: { name?: string; description?: string; picture?: string }) {
    const response = await api.put(`/collections/${Number(collectionId)}`, payload);
    return response.data;
  }

  async deleteCollection(collectionId: string | number) {
    const response = await api.delete(`/collections/${Number(collectionId)}`);
    return response.data;
  }

  async createCustomDesign(payload: Record<string, unknown>) {
    const response = await api.post('/designs', payload);

    const data = response.data;
    if (data?.requestSuccessful === false) {
      const error: any = new Error(
        data?.responseMessage || data?.message || 'Design creation failed',
      );
      error.response = { data };
      throw error;
    }

    return data;
  }

  async updateCustomDesign(designId: string | number, payload: Record<string, unknown>) {
    const updateBody = {
      name: payload.name,
      frontImageUrl: payload.frontImageUrl,
      description: payload.description,
      printerId: payload.printerId,
      amount: payload.amount,
      tags: payload.tags,
      openForCustomization: payload.openForCustomization,
      categories: payload.categories,
    };
    const response = await api.put(`/designs/${Number(designId)}`, updateBody);
    return response.data;
  }

  async getCollectionDesigns(collectionId: string | number, _page: number = 0, _size: number = 40) {
    const id = Number(collectionId);
    try {
      const response = await api.get(`/public/collections/${id}/designs`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status && ![400, 404].includes(error.response.status)) throw error;
      return [];
    }
  }

  async addDesignToCollection(payload: { designId: string | number; collectionId: string | number }) {
    const body = { designs: [Number(payload.designId)] };
    const response = await api.put(`/collections/${Number(payload.collectionId)}/designs/add`, body);
    return response.data;
  }

  async moveDesignToCollection(payload: { designIds: (string | number)[]; fromCollectionId: string | number; newCollectionId: string | number }) {
    const body = { designs: payload.designIds.map(Number), newCollection: Number(payload.newCollectionId) };
    const response = await api.put(`/collections/${Number(payload.fromCollectionId)}/designs/move`, body);
    return response.data;
  }

  async getDesignInsights(designId: string | number) {
    const profileType = getProfileType();
    const [designRes, ordersRes] = await Promise.all([
      (profileType === 'DESIGNER'
        ? this.fetchDesignerDesignById(Number(designId)).catch(() => this.fetchDesignById(Number(designId)))
        : this.fetchDesignById(Number(designId))
      ).catch(() => null),
      this.getManageOrders({ profileType: profileType as ProfileTypeInterface, page: 0, size: 100 }).catch(() => null),
    ]);
    const designBody = designRes?.responseBody || designRes?.data || designRes || {};
    const insightObj =
      designBody?.insight || designBody?.analytics || designBody?.metrics || designBody?.postInsight || {};

    const ordersContent =
      ordersRes?.responseBody?.content ||
      ordersRes?.data?.content ||
      ordersRes?.content ||
      (Array.isArray(ordersRes?.responseBody) ? ordersRes.responseBody : []);
    const designIdNum = Number(designId);
    const matchingOrders = Array.isArray(ordersContent)
      ? ordersContent.filter((o: any) => {
          const reqDesignId = Number(
            o?.designId ||
              o?.design?.id ||
              o?.orderRequest?.printRequest?.designId ||
              o?.orderRequest?.printRequest?.design?.id ||
              o?.orderRequest?.customDesignRequest?.designId ||
              o?.orderRequest?.customDesignRequest?.design?.id ||
              o?.orderRequest?.designId ||
              0,
          );
          if (!(reqDesignId > 0 && reqDesignId === designIdNum)) return false;
          const status = String(o?.orderStatus || o?.status || '').toUpperCase();
          if (['CANCELLED', 'CANCELED', 'REJECTED', 'DECLINED', 'TERMINATED'].includes(status)) {
            return false;
          }
          return true;
        })
      : [];

    const readMetric = (...values: any[]): number | null => {
      const found = values.find((v) => v !== undefined && v !== null && v !== '');
      if (found === undefined) return null;
      const numeric = Number(found);
      return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
    };

    const completedOrPaidSales = matchingOrders.filter((o: any) => {
      const status = String(o?.orderStatus || o?.status || '').toUpperCase();
      return Boolean(
        o?.paid ||
          ['ACTIVE', 'AWAITING_CONFIRMATION', 'COMPLETED', 'PICKUP_REQUESTED', 'DELIVER_REQUESTED'].includes(status),
      );
    }).length;

    const noOfSales = readMetric(
      insightObj?.noOfSales,
      insightObj?.salesCount,
      designBody?.noOfSales,
      designBody?.salesCount,
      designBody?.ordersCount,
      ordersRes ? completedOrPaidSales : undefined,
    );
    const postClicks = readMetric(
      insightObj?.postClicks,
      insightObj?.clicks,
      designBody?.postClicks,
      designBody?.clicks,
    );
    const accountReached = readMetric(
      insightObj?.accountReached,
      insightObj?.accountsReached,
      insightObj?.reach,
      designBody?.accountReached,
      designBody?.reach,
    );
    const totalImpressions = readMetric(
      insightObj?.totalImpressions,
      insightObj?.impressions,
      designBody?.totalImpressions,
      designBody?.impressions,
    );
    const followersReachedPercentage = readMetric(
      insightObj?.followersReachedPercentage,
      insightObj?.followersPercentage,
      designBody?.followersReachedPercentage,
    );
    const nonFollowersReachedPercentage = readMetric(
      insightObj?.nonFollowersReachedPercentage,
      insightObj?.nonFollowersPercentage,
      designBody?.nonFollowersReachedPercentage,
    );

    return {
      requestSuccessful: true,
      responseBody: {
        accountReached,
        postClicks,
        noOfSales,
        totalImpressions,
        followersReachedPercentage,
        nonFollowersReachedPercentage,
      },
    };
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

  // ─── Settings: Change email (request OTP + confirm) ────────────────────────
  async requestEmailChange(newEmail: string) {
    const normalizedEmail = newEmail.trim().toLowerCase();
    const profileType = getProfileType();

    // 1. Trigger an OTP verification code via POST /auth/resend-code if supported for this email.
    try {
      const resendRes = await api.post('/auth/resend-code', { email: normalizedEmail });
      if (resendRes.data?.requestSuccessful !== false) {
        return { ...resendRes.data, requestSuccessful: true, otpSent: true };
      }
    } catch {
      // Proceed to direct user profile update below.
    }

    // 2. Update the user record via PUT /user and sync cached userData.
    const currentUser = await this.getMyProfile().catch(() => null);
    const userBody = currentUser?.responseBody || currentUser || {};
    const resolvedName =
      String(
        userBody?.name ||
          [userBody?.firstName, userBody?.lastName].filter(Boolean).join(' ') ||
          userBody?.userName ||
          'Berrystamp User',
      ).trim() || 'Berrystamp User';

    const updatePayload: Record<string, unknown> = {
      name: resolvedName,
      email: normalizedEmail,
      phoneNumber: userBody?.phoneNumber || undefined,
      areaCode: userBody?.areaCode || '+234',
      gender: userBody?.gender || undefined,
      profileType,
    };

    try {
      const updateRes = await api.put('/user', updatePayload);
      const updatedBody = updateRes.data?.responseBody || updateRes.data || {};
      const mergedUser = { ...userBody, ...updatedBody, email: normalizedEmail };
      await AsyncStorage.setItem('userData', JSON.stringify(mergedUser));
      return {
        ...(updateRes.data || {}),
        requestSuccessful: true,
        completedImmediately: true,
      };
    } catch (error: any) {
      if (![400, 404, 405].includes(error?.response?.status)) {
        throw error;
      }
      const mergedUser = { ...userBody, email: normalizedEmail };
      await AsyncStorage.setItem('userData', JSON.stringify(mergedUser));
      return { requestSuccessful: true, completedImmediately: true };
    }
  }

  async verifyEmailChange(newEmail: string, otp: string) {
    const normalizedEmail = newEmail.trim().toLowerCase();
    const trimmedOtp = String(otp).trim();
    let response: any;
    try {
      response = await api.post(`/auth/validate-code/${encodeURIComponent(trimmedOtp)}`, {
        email: normalizedEmail,
      });
    } catch (error: any) {
      if (![400, 404, 405].includes(error?.response?.status)) throw error;
      try {
        response = await api.patch(`/auth/activate/${encodeURIComponent(trimmedOtp)}`, {
          email: normalizedEmail,
        });
      } catch (activateError: any) {
        if (![400, 404, 405].includes(activateError?.response?.status)) throw activateError;
      }
    }

    const user = await this.getCurrentUser().catch(() => null);
    if (user) {
      await AsyncStorage.setItem('userData', JSON.stringify({ ...user, email: normalizedEmail }));
    }
    return response?.data || { requestSuccessful: true };
  }

  // ─── Insights ──────────────────────────────────────────────────────────────
  async getProfileInsights(profileId: string | number) {
    const profileType = getProfileType();
    const response = await api.get(`/insights/profile/${profileId}`, {
      headers: { profileType },
    });
    const data = response.data;
    const body = data?.responseBody || data?.data || data || {};
    const totalCompletedOrders = Number(body?.totalCompletedOrders ?? body?.completedOrders ?? 0);
    const totalCancelledOrders = Number(body?.totalCancelledOrders ?? body?.cancelledOrders ?? 0);
    const rawTotalOrders = body?.totalOrders ?? body?.orders;
    const totalOrders =
      rawTotalOrders !== undefined && rawTotalOrders !== null
        ? Math.max(Number(rawTotalOrders), totalCompletedOrders + totalCancelledOrders)
        : totalCompletedOrders + totalCancelledOrders;
    return {
      ...data,
      responseBody: {
        ...body,
        totalFollowers: Number(body?.totalFollowers ?? body?.followers ?? 0),
        totalFollowing: Number(body?.totalFollowing ?? body?.following ?? 0),
        totalUploads: Number(body?.totalUploads ?? body?.uploads ?? 0),
        totalCompletedOrders,
        totalCancelledOrders,
        totalOrders,
        totalReviews: Number(body?.totalReviews ?? body?.reviews ?? 0),
        totalEarnings: Number(body?.totalEarnings ?? body?.earnings ?? 0),
        jobSuccessPercentage: Number(body?.jobSuccessPercentage ?? body?.jobSuccess ?? 0),
        rating: {
          ...(body?.rating || {}),
          avgStars: Number(body?.rating?.avgStars ?? body?.avgRating ?? body?.rating ?? 0),
        },
      },
    };
  }

  async getActivityPieChart() {
    const profileType = getProfileType();
    const response = await api.get('/insights/activity-pie-chart', {
      headers: { profileType },
    });
    return response.data;
  }

  async getActivityBarGraph(interval: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'MONTHLY') {
    const profileType = getProfileType();
    const response = await api.get('/insights/activity-bar-graph', {
      params: { interval },
      headers: { profileType },
    });
    return response.data;
  }

  // ==========================================
  // REFERRAL ENDPOINTS
  // ==========================================

   async getReferralHistory(page: number = 0, size: number = 10) {
    const response = await api.get('/referral', {
      params: { page, size }
    });
    return response.data;
  }

   async getReferralSummary() {
    const response = await api.get('/referral/stats');
    return response.data;
  }

   async getReferralCode() {
    const response = await api.get('/referral/code');
    return response.data;
  }

   async redeemReferralReward(payload: any) {
    if (payload.mode === 'WALLET') {
      const response = await api.post('/referral/redeem/wallet');
      return response.data;
    } else {
      const response = await api.post('/referral/redeem/bank', {
        bankName: payload.bankName,
        bankCode: payload.bankCode || '',
        accountName: payload.accountName,
        accountNumber: payload.accountNumber
      });
      return response.data;
    }
  }
}



export default new ApiService();
