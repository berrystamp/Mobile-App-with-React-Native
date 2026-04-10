import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {  useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { type AccountType, useAuthStore } from '@/store/authStore';

export default function ChooseAccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { setAccountType } = useAuthStore();

  const theme = {
    background: isDark ? '#121212' : '#FAFAFA',
    purple: '#4B3A99',
    lightPurple: isDark ? '#4B3A9930' : '#EFEAFE',
  };


  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    router.push('/(auth)/login');
  };

  return (
    <View className="flex-1 px-6 pt-24 pb-10" style={{ backgroundColor: theme.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Text className="text-[26px] font-bold text-center text-[#1A1A1A] dark:text-white mb-2">
        Welcome to <Text className="text-[#4B3A99] dark:text-[#7A6AE6]">BerryStamp</Text>
      </Text>
      <Text className="text-md text-center text-[#1A1A1A] dark:text-white mb-10">
        Kindly select the type of account you want to continue with  
      </Text>
      <View className="flex-1 w-full flex-col gap-y-4 mt-6">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelectType('customer')}
          className="flex-row items-start p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E]"
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <Ionicons name="cart-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1 flex-col gap-y-1">
            <Text className="text-[18px] font-semibold" style={{ color: theme.purple }}>Customer</Text>
            <Text className="text-sm" style={{ color: isDark ? '#B8B4C8' : '#8A8298' }}>
              Explore and buy unique designs from talented designers around the world.
            </Text>

          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelectType('designer')}
          className="flex-row items-start p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E]"
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <MaterialCommunityIcons name="palette-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1">
            <Text className="text-[18px] font-semibold" style={{ color: theme.purple }}>Designer</Text>
            <Text className="text-sm" style={{ color: isDark ? '#B8B4C8' : '#8A8298' }}>
              Create and sell your own unique designs to customers worldwide.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelectType('printer')}
          className="flex-row items-start p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E]"
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <MaterialCommunityIcons name="brush-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1">
            <Text className="text-[18px] font-semibold" style={{ color: theme.purple }}>Printer</Text>
            <Text className="text-sm" style={{ color: isDark ? '#B8B4C8' : '#8A8298' }}>
              Print and distribute designs created by talented designers.
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
