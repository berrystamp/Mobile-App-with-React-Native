import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import 'react-native-reanimated';
import Loading from "../components/Loading";

import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'index',
};

export function MainApp() {
  const colorScheme = useColorScheme();
  
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
      <Stack>
<Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login/index" options={{ headerShown: false }} />
        <Stack.Screen name="choose-account/index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="printer-designer-sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="printer-designer-verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password-verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="printer-design-verify-account" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password-success" options={{ headerShown: false, presentation: 'transparentModal' }} />
        <Stack.Screen name="verify-account" options={{ headerShown: false }} />
        <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="interests" options={{ headerShown: false }} />
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
    }, 500); 
  }, []);

  return loading ? <Loading /> : <MainApp />;

}
