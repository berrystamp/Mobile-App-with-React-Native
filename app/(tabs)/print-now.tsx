import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';

const AVATAR_IMAGE = require('@/assets/images/item1.png');
const PRODUCT_IMAGE = require('@/assets/images/item1.png');

export default function PrintNowScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [ownItemChoice, setOwnItemChoice] = useState<'yes' | 'no' | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  return (
    <View className="flex-1 bg-[#B6B6B6] dark:bg-[#0F0F0F]">
      <View className="bg-[#838383] px-5 pb-3 pt-12">
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
            <TouchableOpacity
              onPress={() => setFeedback({ title: 'Added to favourites', message: 'This product has been saved to your favourites.' })}
              className="mx-1"
            >
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity className="ml-2">
              <Feather name="share-2" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="items-center bg-[#B6B6B6] py-4 dark:bg-[#0F0F0F]">
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
          <Text className="mb-2 text-[22px] text-[#5B5B5B] dark:text-[#CACACA]">Label</Text>
          <View className="mb-4 rounded-xl border border-[#C9CBD2] px-4 py-3 dark:border-[#3A3A3A]">
            <Text className="text-[30px] text-[#4D4D4D] dark:text-[#E0E0E0]">Text</Text>
          </View>

          <Text className="mb-3 text-[33px] font-medium text-[#333333] dark:text-white">Budget Range(₦)</Text>
          <View className="mb-4 flex-row justify-between">
            <View className="w-[47%] rounded-xl border border-[#C9CBD2] px-4 py-3 dark:border-[#3A3A3A]">
              <Text className="text-[22px] text-[#5B52A2]">Label</Text>
              <Text className="mt-1 text-[30px] text-[#4D4D4D] dark:text-[#E0E0E0]">Text</Text>
            </View>
            <View className="w-[47%] rounded-xl border border-[#C9CBD2] px-4 py-3 dark:border-[#3A3A3A]">
              <Text className="text-[22px] text-[#5B52A2]">Label</Text>
              <Text className="mt-1 text-[30px] text-[#4D4D4D] dark:text-[#E0E0E0]">Text</Text>
            </View>
          </View>

          <View className="mb-6 flex-row items-center rounded-xl border border-[#C9CBD2] px-4 py-3 dark:border-[#3A3A3A]">
            <View className="flex-1">
              <Text className="text-[22px] text-[#5B52A2]">Label</Text>
              <Text className="mt-1 text-[30px] text-[#4D4D4D] dark:text-[#E0E0E0]">Text</Text>
            </View>
            <Ionicons name="calendar-clear-outline" size={24} color={isDark ? '#D5D5D5' : '#9B9B9B'} />
          </View>

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
          <Text className="text-[34px] font-semibold text-white">Sign up</Text>
        </TouchableOpacity>
      </View>

      <ActionFeedbackModal
        visible={Boolean(feedback)}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={() => setFeedback(null)}
      />
    </View>
  );
}
