import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { type AccountType, useAuthStore } from '@/store/authStore';

export default function ChooseAccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: 'signup' | 'login' }>();
  const { setAccountType, isLoggedIn } = useAuthStore();

  const theme = {
    background: isDark ? '#121212' : '#FAFAFA',
    purple: '#4B3A99',
    lightPurple: isDark ? '#4B3A9930' : '#EFEAFE',
  };

  const authMode = mode ?? 'signup';

  const handleSelectType = (type: AccountType) => {
    setAccountType(type);

    if (isLoggedIn) {
      if (type === 'customer') {
        router.replace('/(auth)/interests');
      } else {
        router.replace('/(tabs)');
      }
      return;
    }

    router.replace(authMode === 'login' ? '/(auth)/login' : '/(auth)/signup');
  };

  return (
    <View className="flex-1 px-6 pt-24 pb-10" style={{ backgroundColor: theme.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Text className="text-[26px] font-bold text-center text-[#1A1A1A] dark:text-white mb-10">
        Continue as
      </Text>

      <View className="flex-1 w-full flex-col gap-y-4 mt-6">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelectType('customer')}
          className="flex-row items-center p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E]"
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <Ionicons name="cart-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1 flex-col gap-y-1">
            <Text className="text-[15px] font-semibold" style={{ color: theme.purple }}>{authMode === 'login' ? 'Login as Customer' : 'Sign up as Customer'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelectType('designer')}
          className="flex-row items-center p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E]"
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <MaterialCommunityIcons name="palette-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold" style={{ color: theme.purple }}>{authMode === 'login' ? 'Login as Designer' : 'Sign up as Designer'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelectType('printer')}
          className="flex-row items-center p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E]"
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <MaterialCommunityIcons name="brush-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold" style={{ color: theme.purple }}>{authMode === 'login' ? 'Login as Printer' : 'Sign up as Printer'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
