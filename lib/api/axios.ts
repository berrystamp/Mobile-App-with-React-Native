import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { ENV } from "../config/env";

const api = axios.create({
  baseURL: ENV.BASE_URL,
  timeout: ENV.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;