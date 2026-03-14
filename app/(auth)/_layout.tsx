import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Login & Signup */}
      <Stack.Screen name="login/index" />
      <Stack.Screen name="signup/index" />
      <Stack.Screen name="choose-account/index" />
      <Stack.Screen name="printer-designer-sign-up" />
      
      {/* Verification */}
      <Stack.Screen name="verify-account" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="printer-design-verify-account" />
      <Stack.Screen name="printer-designer-verify-otp" />
      <Stack.Screen name="forgot-password-verify-otp" />
      
      {/* Password Recovery */}
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen 
        name="reset-password-success" 
        options={{ presentation: 'transparentModal' }} 
      />
      
      {/* Onboarding */}
      <Stack.Screen name="interests" />
    </Stack>
  );
}