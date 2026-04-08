import { loginRequest } from '@/lib/api/authFlow';
import { type AccountType, useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

const roleLabels = {
  customer: 'Customer',
  designer: 'Designer',
  printer: 'Printer',
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const { accountType, login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const selectedRole: AccountType = accountType ?? 'customer';

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await loginRequest(selectedRole, {
        email: 'jane@example.com',
        password: 'password123',
      });

      const roleFromApi = (response?.role || selectedRole).toLowerCase();
      const role = roleFromApi === 'designer' || roleFromApi === 'printer' ? roleFromApi : 'customer';

      login(role);

      if (role === 'customer') {
        router.replace('/(auth)/interests');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Login failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-[#F5F5F7] dark:bg-[#121212]">
      <Text className="text-[24px] font-bold text-center text-[#1a1a1a] dark:text-white mb-6">
        Login as {roleLabels[selectedRole]}
      </Text>

      <TouchableOpacity onPress={handleLogin} className="py-4 rounded-[30px] items-center bg-[#3D2E8E]" disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-semibold">Log in</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(auth)/choose-account?mode=login')}
        className="items-center mt-5">
        <Text className="text-[14px] text-[#4B3A99] font-semibold">Login as another account type</Text>
      </TouchableOpacity>
    </View>
  );
}
