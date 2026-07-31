import ApiService from '@/services/apiClient';
import { toAccountType, useAuthStore } from '@/store/authStore';
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean, profileType?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: (skipRedirect?: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const loginStore = useAuthStore((state) => state.login);
  const needsInterestOnboarding = useAuthStore((state) => state.needsInterestOnboarding);

  useEffect(() => {
    // Pass true to skip the redirect on the initial app load
    checkAuth(true);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [segments.join('/')]);

  const refreshUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to refresh user state', error);
    }
  };

  const checkAuth = async (skipRedirect = false) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const inAuthGroup = segments[0] === '(auth)';

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        
        // Only redirect if we aren't skipping it (e.g., let index.tsx handle initial routing)
        if (!skipRedirect) {
          if (needsInterestOnboarding) {
            const routeSegments = segments as unknown as string[];
            if (!(routeSegments[0] === '(auth)' && routeSegments[1] === 'interests')) {
              router.replace('/(auth)/interests');
            }
          } else if (segments[0] !== '(tabs)') {
            router.replace('/(tabs)');
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        
        if (!skipRedirect && !inAuthGroup) {
          router.replace('/(auth)/login');
        }
      }
    } catch (error) {
      console.error('Failed to restore auth state', error);
      if (!skipRedirect) {
        router.replace('/(auth)/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = true,
    profileType: string = 'CUSTOMER',
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await ApiService.login(email, password, 'CUSTOMER');

      if (result.requestSuccessful && result.responseBody?.token) {
        const loggedInUser = (await ApiService.getCurrentUser()) || result.responseBody.user;
        const normalizedAccountType = toAccountType('CUSTOMER');

        setUser(loggedInUser);
        setIsAuthenticated(true);
        loginStore(normalizedAccountType);

        if (needsInterestOnboarding) {
          router.replace('/(auth)/interests');
        } else {
          router.replace('/(tabs)');
        }

        return { success: true };
      } else {
        return {
          success: false,
          error: result.responseMessage || result.message || 'Invalid email or password.',
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.responseMessage ||
        error.response?.data?.message ||
        'Network Error. Unable to reach the server.';
      const statusCode = error.response?.status;
      const normalizedErrorMessage = String(errorMessage).toLowerCase();

      if (
        statusCode === 401 &&
        (normalizedErrorMessage.includes('verification') ||
          normalizedErrorMessage.includes('verify') ||
          normalizedErrorMessage.includes('email not verified'))
      ) {
        router.replace({
          pathname: '/(auth)/verify-account',
          params: { email: email.trim() },
        });
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, checkAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}