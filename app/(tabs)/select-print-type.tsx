import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AVATAR_IMAGE = require('@/assets/images/item1.png');
const PRODUCT_IMAGE = require('@/assets/images/item1.png');

const OPTIONS = ['Direct to screen', 'sublimation', 'Direct to garment', 'screen printing'];

export default function SelectPrintTypeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [selectedType, setSelectedType] = useState('screen printing');

  return (
    <View className="flex-1 bg-[#B9B9B9] dark:bg-[#0F0F0F]">
      <View className="bg-[#848484] px-5 pb-3 pt-12">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="ml-2 flex-1 flex-row items-center">
            <Image source={AVATAR_IMAGE} className="h-10 w-10 rounded-full" />
            <View className="ml-3">
              <Text className="text-[24px] font-semibold text-white">Japan Night</Text>
              <Text className="text-[18px] text-white/90">Designed by Berrystamp</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            <Feather name="share-2" size={22} color="#FFFFFF" style={{ marginLeft: 14 }} />
          </View>
        </View>
      </View>

      <View className="flex-1 items-center justify-between bg-[#B9B9B9] dark:bg-[#0F0F0F]">
        <Image source={PRODUCT_IMAGE} className="mt-6 h-[420px] w-[300px]" resizeMode="contain" />

        <View className="w-full rounded-t-[22px] bg-[#F2F2F2] px-6 pb-6 pt-3 dark:bg-[#1A1A1A]">
          <View className="mb-5 h-1.5 w-24 self-center rounded-full bg-[#D0D0D0] dark:bg-[#444444]" />
          {OPTIONS.map((option, idx) => (
            <TouchableOpacity
              key={option}
              onPress={() => {
                setSelectedType(option);
                router.back();
              }}
              className={`py-4 ${idx === 0 ? 'border-t border-[#E4E4E4] dark:border-[#303030]' : ''} border-b border-[#E4E4E4] dark:border-[#303030]`}
            >
              <Text className={`text-[35px] ${selectedType === option ? 'text-[#3B2D85] font-semibold' : 'text-[#343434] dark:text-white'}`}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
