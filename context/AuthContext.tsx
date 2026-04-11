import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { User } from '@/types'; 
import ApiService from '@/services/apiClient'; // Import your API service
import { toAccountType, useAuthStore } from '@/store/authStore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean, profileType?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments(); // Used to know what screen we are currently on
  const loginStore = useAuthStore((state) => state.login);
  const needsInterestOnboarding = useAuthStore((state) => state.needsInterestOnboarding);
  const currentRole = useAuthStore((state) => state.role);

  useEffect(() => {
    checkAuth();
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

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      const inAuthGroup = segments[0] === '(auth)';

      if (token && userData) {
        // Token exists, log them in
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        if (String(currentRole).toLowerCase() === 'customer' && needsInterestOnboarding) {
          if (!(segments[0] === '(auth)' && segments[1] === 'interests')) {
            router.replace('/(auth)/interests');
          }
        } else if (segments[0] !== '(tabs)') {
          router.replace('/(tabs)');
        }
      } else {
        // No token found. If they aren't already in the auth screens, send them to login
        setIsAuthenticated(false);
        setUser(null);
        if (!inAuthGroup) {
          router.replace('/(auth)/choose-account'); // Adjust this path if your choose-account screen is named differently
        }
      }
    } catch (error) {
      console.error('Failed to restore auth state', error);
      router.replace('/(auth)/choose-account');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = true, profileType: string = "CUSTOMER"): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use your ApiService here instead of raw fetch
      const result = await ApiService.login(email, password, profileType);

      if (result.requestSuccessful && result.responseBody?.token) {
        const loggedInUser = (await ApiService.getCurrentUser()) || result.responseBody.user;
        const normalizedAccountType = toAccountType(profileType);

        setUser(loggedInUser);
        setIsAuthenticated(true);
        loginStore(normalizedAccountType);
        
        if (normalizedAccountType === 'customer' && needsInterestOnboarding) {
          router.replace('/(auth)/interests');
        } else {
          router.replace('/(tabs)');
        }

        return { success: true };
      } else {
        return { 
            success: false, 
            error: result.responseMessage || result.message || 'Invalid email or password.' 
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Axios wraps errors, so we can check for a response payload
      const errorMessage = error.response?.data?.responseMessage || error.response?.data?.message || 'Network Error. Unable to reach the server.';
      const statusCode = error.response?.status;
      const normalizedErrorMessage = String(errorMessage).toLowerCase();
      const emailNotVerified =
        normalizedErrorMessage.includes('email not verified');
      const requiresVerification =
        statusCode === 401 &&
        (normalizedErrorMessage.includes('verification') || normalizedErrorMessage.includes('verify'));

      if (emailNotVerified) {
        router.replace({
          pathname: '/(auth)/verify-account',
          params: { email: email.trim() },
        });
      } else if (requiresVerification) {
        router.replace({
          pathname: '/(auth)/verify-otp',
          params: { email: email.trim() },
        });
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Use your ApiService to clear storage
      await ApiService.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/(auth)/login'); // Send user back to login upon logging out
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
