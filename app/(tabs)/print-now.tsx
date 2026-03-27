import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function PrintNowScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <View className="flex-1 items-center justify-center bg-[#F8F8FB] px-6 dark:bg-[#121212]">
      <View className="w-full max-w-[360px] rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#1E1E1E]">
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#EEEAFB]">
          <Ionicons name="print-outline" size={28} color="#3B2D85" />
        </View>
        <Text className="text-xl font-semibold text-[#2B2833] dark:text-white">Continue in Cart</Text>
        <Text className="mt-3 text-sm leading-6 text-[#6F6B7A] dark:text-gray-400">
          Printing preferences now use the same real flow as the cart page. Continue there to set delivery details and send the order to the designer.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace({ pathname: '/cart', params: { openPrintPrefs: '1' } })}
          className="mt-6 items-center rounded-full bg-[#3B2D85] py-4">
          <Text className="text-base font-semibold text-white">Open Cart Preferences</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.back()} className="mt-5">
        <Text className="text-sm font-medium" style={{ color: isDark ? '#A7A3B5' : '#6F6B7A' }}>
          Go back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
