import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { User } from '@/types'; 
import ApiService from '@/services/apiClient'; // Import your API service

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean, profileType?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments(); // Used to know what screen we are currently on

  useEffect(() => {
    checkAuth();
  }, []);

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
        // Redirect to tabs if they are not already there
        if (segments[0] !== '(tabs)') {
           router.replace('/(tabs)');
        }
      } else {
        // No token found. If they aren't already in the auth screens, send them to login
        setIsAuthenticated(false);
        setUser(null);
        if (!inAuthGroup) {
          router.replace('/(auth)/login'); // Adjust this path if your login screen is named differently
        }
      }
    } catch (error) {
      console.error('Failed to restore auth state', error);
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = true, profileType: string = "CUSTOMER"): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use your ApiService here instead of raw fetch
      const result = await ApiService.login(email, password, profileType);

      if (result.requestSuccessful && result.responseBody?.token) {
        const loggedInUser = result.responseBody.user;

        setUser(loggedInUser);
        setIsAuthenticated(true);
        
        // Redirect to tabs upon successful login
        router.replace('/(tabs)');

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
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, checkAuth }}>
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