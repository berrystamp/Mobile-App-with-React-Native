import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Berrystamp Backend API Base URL
const API_BASE_URL = "https://backend-prod-api.berrystamp.com/api/v1";

type TProfileType = "CUSTOMER" | "DESIGNER" | "PRINTER";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token and profile type
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("idToken");
        const profileType =
          (await AsyncStorage.getItem("profileType")) || "CUSTOMER";

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          config.headers.profileType = profileType;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear storage
          await AsyncStorage.removeItem("idToken");
          await AsyncStorage.removeItem("userData");
          await AsyncStorage.removeItem("profileType");
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post(
      "/auth/login",
      { email, password },
      { headers: { profileType: "CUSTOMER" } },
    );

    if (response.data.idToken) {
      await AsyncStorage.setItem("idToken", response.data.idToken);
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(response.data.user),
      );
      await AsyncStorage.setItem("profileType", "CUSTOMER");
    }

    return response.data;
  }

  async register(
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      username: string;
      phoneNumber: string;
    },
    profileType: TProfileType = "CUSTOMER",
  ) {
    const response = await this.api.post("/auth/register", userData, {
      headers: { profileType },
    });
    return response.data;
  }

  async activateAccount(otp: string, email: string) {
    const response = await this.api.patch(`/auth/activate/${otp}`, { email });
    return response.data;
  }

  async resendOtp(email: string) {
    const response = await this.api.post("/auth/resend-code", { email });
    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem("idToken");
    await AsyncStorage.removeItem("userData");
    await AsyncStorage.removeItem("profileType");
  }

  async checkAuth() {
    const token = await AsyncStorage.getItem("idToken");
    return !!token;
  }

  async getCurrentUser() {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  // Profile methods
  async fetchUser() {
    const response = await this.api.get("/user");
    return response.data;
  }

  async fetchAllProfiles(queries: string = "") {
    const response = await this.api.get(`/public/profile?${queries}`);
    return response.data;
  }

  async fetchUserProfile(profileId: number) {
    const response = await this.api.get(`/public/profile/${profileId}`);
    return response.data;
  }

  // Design methods
  async fetchAllDesigns(queries: string = "") {
    const token = await AsyncStorage.getItem("idToken");

    if (token) {
      const response = await this.api.get(`/designs?${queries}`, {
        headers: { profileType: "CUSTOMER" },
      });
      return response.data;
    } else {
      const response = await this.api.get(`/public/designs?${queries}`);
      return response.data;
    }
  }

  async fetchDesignById(designId: number) {
    const token = await AsyncStorage.getItem("idToken");

    if (token) {
      const response = await this.api.get(`/designs/${designId}`, {
        headers: { profileType: "CUSTOMER" },
      });
      return response.data;
    } else {
      const response = await this.api.get(`/public/designs/${designId}`);
      return response.data;
    }
  }

  async fetchLikedDesigns(queries: string = "") {
    const response = await this.api.get(`/designs/all/likes?${queries}`, {
      headers: { profileType: "CUSTOMER" },
    });
    return response.data;
  }

  async likeAndUnlikeDesign(designId: number) {
    const response = await this.api.patch(
      `/designs/${designId}/likes`,
      {},
      { headers: { profileType: "CUSTOMER" } },
    );
    return response.data;
  }

  // Collection methods
  async fetchAllCollections(queries: string = "") {
    const response = await this.api.get(`/public/collections?${queries}`);
    return response.data;
  }

  async fetchCollectionById(collectionId: string) {
    const response = await this.api.get(`/public/collections/${collectionId}`);
    return response.data;
  }

  // Follows methods
  async fetchFollowings(profileId: number) {
    const response = await this.api.get(
      `/public/follows/following/${profileId}`,
    );
    return response.data;
  }

  async fetchFollowers(profileId: number) {
    const response = await this.api.get(
      `/public/follows/follower/${profileId}`,
    );
    return response.data;
  }

  async followUser(profileId: number) {
    const response = await this.api.post("/follow/add", { profileId });
    return response.data;
  }

  async unfollowUser(profileId: number) {
    const response = await this.api.delete("/follow/remove", {
      data: { profileId },
    });
    return response.data;
  }

  // Cart methods
  async fetchAllItemsInCart() {
    const response = await this.api.get("/cart-items");
    return response.data;
  }

  async addToCart(designId: number, mockId: number) {
    const response = await this.api.post(`/cart-items/${designId}/${mockId}`);
    return response.data;
  }

  async removeItemFromCart(itemId: number) {
    const response = await this.api.delete(`/cart-items/${itemId}`);
    return response.data;
  }

  async emptyCart() {
    const response = await this.api.delete("/cart-items");
    return response.data;
  }

  // Order methods
  async fetchAllOrders(queries: string = "") {
    const response = await this.api.get(`/orders?${queries}`);
    return response.data;
  }

  async fetchOrderById(orderId: number) {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  async createNewOrder(orderData: any) {
    const response = await this.api.post("/orders", orderData);
    return response.data;
  }

  async payForOrder(orderId: number, paymentData: any) {
    const response = await this.api.post(`/orders/${orderId}`, paymentData);
    return response.data;
  }

  // Conversation methods
  async fetchAllConversations() {
    const response = await this.api.get("/conversations");
    return response.data;
  }

  async fetchConversationMessages(conversationId: string) {
    const response = await this.api.get(
      `/conversations/${conversationId}/messages`,
    );
    return response.data;
  }

  async sendMessage(data: any) {
    const response = await this.api.post("/messages/send", data);
    return response.data;
  }

  // Notification methods
  async fetchAllNotifications(queries: string = "") {
    const response = await this.api.get(`/notifications?${queries}`);
    return response.data;
  }

  async markNotificationAsRead(id: number) {
    const response = await this.api.patch(`/notifications/read/${id}`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.patch("/notifications/read");
    return response.data;
  }

  // Wallet methods
  async fetchWallet() {
    const response = await this.api.get("/wallets");
    return response.data;
  }

  async fetchWalletHistory() {
    const response = await this.api.get("/wallets/histories");
    return response.data;
  }

  async withdraw(data: any) {
    const response = await this.api.post("/wallets/withdraw", data);
    return response.data;
  }

  // File upload methods
  async uploadSingleImage(formData: FormData) {
    const response = await this.api.post("/files/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async uploadMultipleImages(formData: FormData) {
    const response = await this.api.post("/files/multi", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Helper methods for Home Screen
  async getTopArtists(limit: number = 10) {
    // Fetch top rated profiles (designers/printers)
    const response = await this.fetchAllProfiles(
      `size=${limit}&page=0&sort=rating,desc`,
    );
    return response;
  }

  async getTrendingDesigns(limit: number = 10) {
    // Fetch trending designs (sorted by likes/views)
    const response = await this.fetchAllDesigns(
      `size=${limit}&page=0&sort=likes,desc`,
    );
    return response;
  }

  async getRecommendedDesigns(limit: number = 10) {
    // Fetch recommended designs for user
    const response = await this.fetchAllDesigns(`size=${limit}&page=0`);
    return response;
  }

  async toggleFavorite(designId: number) {
    const response = await this.likeAndUnlikeDesign(designId);
    return response;
  }

  async searchDesigns(query: string, limit: number = 20) {
    const response = await this.fetchAllDesigns(
      `search=${query}&size=${limit}&page=0`,
    );
    return response;
  }

  // Generic request method
  async request(config: AxiosRequestConfig) {
    const response = await this.api.request(config);
    return response.data;
  }
}

export default new ApiService();
