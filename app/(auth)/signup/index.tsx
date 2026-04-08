import { signUpRequest } from '@/lib/api/authFlow';
import { type AccountType, useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

const roleLabels = {
  customer: 'Customer',
  designer: 'Designer',
  printer: 'Printer',
} as const;

export default function SignUpScreen() {
  const router = useRouter();
  const { accountType, signUp, setAccountType } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const selectedRole: AccountType = accountType ?? 'customer';

  const handleSignUp = async () => {
    try {
      setLoading(true);

      const response = await signUpRequest(selectedRole, {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

      const roleFromApi = (response?.role || selectedRole).toLowerCase();
      const role = roleFromApi === 'designer' || roleFromApi === 'printer' ? roleFromApi : 'customer';

      signUp(role);

      if (role === 'customer') {
        router.replace('/(auth)/interests');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Sign up failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-[#F5F5F7] dark:bg-[#121212]">
      <Text className="text-[24px] font-bold text-center text-[#1a1a1a] dark:text-white mb-6">
        Sign up as {roleLabels[selectedRole]}
      </Text>

      <TouchableOpacity onPress={handleSignUp} className="py-4 rounded-[30px] items-center bg-[#3D2E8E]" disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-semibold">Sign up</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(auth)/choose-account?mode=signup')}
        className="items-center mt-5">
        <Text className="text-[14px] text-[#4B3A99] font-semibold">Sign up as another account type</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setAccountType(selectedRole);
          router.push('/(auth)/choose-account?mode=login');
        }}
        className="items-center mt-3">
        <Text className="text-[14px] text-[#4B3A99]">Login as {roleLabels[selectedRole]}</Text>
      </TouchableOpacity>
    </View>
  );
}
