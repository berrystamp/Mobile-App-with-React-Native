import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { User } from '@/types'; 

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean, profileType: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        // Redirect immediately if token is found in local storage
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to restore auth state', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = true, profileType: string = "CUSTOMER"): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload = {
        email: email.trim(),
        password: password,
        rememberMe: rememberMe 
      };

      const response = await fetch('https://berrystamp-backend-dev-4cn29.ondigitalocean.app/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'profileType': profileType 
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Login Response:", result);

      // Extract from your specific backend response structure
      if (response.ok && result.requestSuccessful && result.responseBody?.token) {
        const token = result.responseBody.token;
        const loggedInUser = result.responseBody.user;

        // Save to local storage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(loggedInUser));
        
        setUser(loggedInUser);
        setIsAuthenticated(true);
        
        // Redirect to tabs upon successful login
        router.replace('/(tabs)');

        return { success: true };
      } else {
        return { 
            success: false, 
            // Fallback to responseMessage as defined in your JSON
            error: result.responseMessage || result.message || 'Invalid email or password.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network Error. Unable to reach the server.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/login'); // Send user back to login upon logging out
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