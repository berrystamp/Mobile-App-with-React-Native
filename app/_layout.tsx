import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import 'react-native-reanimated';
import SplashScreen from "./SplashScreen";

import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export function MainApp() {
  const colorScheme = useColorScheme();
  
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
      <Stack>
        <Stack.Screen name="login/index" options={{ headerShown: false }} />
        <Stack.Screen name="choose-account/index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="PrinterDesignerSignUp" options={{ headerShown: false }} />
        <Stack.Screen name="PrinterDesignerVerify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPasswordVerify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="PrinterDesignVerify-account" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password-success" options={{ headerShown: false, presentation: 'transparentModal' }} />
        <Stack.Screen name="verify-account" options={{ headerShown: false }} />
        <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="interests" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="home/index" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  
   const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2500); 
  }, []);

  return loading ? <SplashScreen /> : <MainApp />;

}
