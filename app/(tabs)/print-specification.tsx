import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AVATAR_IMAGE = require('@/assets/images/item1.png');
const PRODUCT_IMAGE = require('@/assets/images/item1.png');

export default function PrintSpecificationScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [ownItemChoice, setOwnItemChoice] = useState<'yes' | 'no' | null>(null);

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

      <View className="items-center bg-[#B9B9B9] py-4 dark:bg-[#0F0F0F]">
        <Image source={PRODUCT_IMAGE} className="h-44 w-44 opacity-90" resizeMode="contain" />
      </View>

      <View className="flex-1 rounded-t-[22px] bg-[#F2F2F2] px-5 pt-4 dark:bg-[#1A1A1A]">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-[38px] text-[#2D2D2D] dark:text-white">Print Specification</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={isDark ? '#E5E5E5' : '#333333'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.push('/select-print-type')}
            className="mb-5 flex-row items-center rounded-xl border border-[#C9CBD2] px-4 py-4 dark:border-[#3A3A3A]"
          >
            <Text className="flex-1 text-[31px] text-[#747474] dark:text-[#D1D1D1]">Select Printing Type</Text>
            <Ionicons name="chevron-down" size={24} color={isDark ? '#D5D5D5' : '#7A7A7A'} />
          </TouchableOpacity>

          <Text className="mb-3 text-[33px] font-medium text-[#333333] dark:text-white">Budget Range(₦)</Text>
          <View className="mb-5 flex-row justify-between">
            <View className="w-[47%] rounded-xl border border-[#C9CBD2] px-4 py-4 dark:border-[#3A3A3A]">
              <Text className="text-[31px] text-[#666666] dark:text-[#D1D1D1]">From</Text>
            </View>
            <View className="w-[47%] rounded-xl border border-[#C9CBD2] px-4 py-4 dark:border-[#3A3A3A]">
              <Text className="text-[31px] text-[#666666] dark:text-[#D1D1D1]">To</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/delivery-date')}
            className="mb-6 flex-row items-center rounded-xl border border-[#C9CBD2] px-4 py-4 dark:border-[#3A3A3A]"
          >
            <Text className="flex-1 text-[31px] text-[#666666] dark:text-[#D1D1D1]">Preffered Date of Delivery</Text>
            <Ionicons name="calendar-clear-outline" size={24} color={isDark ? '#D5D5D5' : '#9B9B9B'} />
          </TouchableOpacity>

          <Text className="mb-3 text-[34px] text-[#303030] dark:text-white">Do You Have Your Own Item</Text>

          <TouchableOpacity onPress={() => setOwnItemChoice('yes')} className="mb-3 flex-row">
            <View className={`mr-3 mt-1 h-5 w-5 rounded-full border ${ownItemChoice === 'yes' ? 'border-[#3B2D85]' : 'border-[#C2C2C2]'}`}>
              {ownItemChoice === 'yes' ? <View className="m-auto h-2.5 w-2.5 rounded-full bg-[#3B2D85]" /> : null}
            </View>
            <Text className="flex-1 text-[29px] leading-[40px] text-[#4A4A4A] dark:text-[#DADADA]">
              Yes, I have my items and I would like a pickup and delivery service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setOwnItemChoice('no')} className="mb-5 flex-row">
            <View className={`mr-3 mt-1 h-5 w-5 rounded-full border ${ownItemChoice === 'no' ? 'border-[#3B2D85]' : 'border-[#C2C2C2]'}`}>
              {ownItemChoice === 'no' ? <View className="m-auto h-2.5 w-2.5 rounded-full bg-[#3B2D85]" /> : null}
            </View>
            <Text className="flex-1 text-[29px] leading-[40px] text-[#4A4A4A] dark:text-[#DADADA]">
              No, Get Item from the printer&apos;s inventory with delivery service
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity onPress={() => router.back()} className="mb-5 items-center rounded-full bg-[#3B2D85] py-4">
          <Text className="text-[34px] font-semibold text-white">Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
