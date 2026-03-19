import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';

const AVATAR_IMAGE = require('@/assets/images/item1.png');
const PRODUCT_IMAGE = require('@/assets/images/item1.png');

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS = ['29', '30', '31', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '1', '2'];

export default function DeliveryDateScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [selectedDay, setSelectedDay] = useState('2');
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

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
            <TouchableOpacity onPress={() => setFeedback({ title: 'Added to favourites', message: 'This product has been saved to your favourites.' })}>
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Feather name="share-2" size={22} color="#FFFFFF" style={{ marginLeft: 14 }} />
          </View>
        </View>
      </View>

      <View className="relative flex-1 bg-[#B9B9B9] dark:bg-[#0F0F0F]">
        <Image source={PRODUCT_IMAGE} className="mx-auto mt-4 h-[430px] w-[290px] opacity-90" resizeMode="contain" />

        <View className="absolute inset-0 items-center justify-center bg-black/25">
          <View className="w-[88%] rounded-2xl bg-white px-4 py-4 dark:bg-[#1C1C1C]">
            <View className="mb-4 flex-row items-center justify-center">
              <TouchableOpacity className="rounded-full bg-[#EEF0F7] px-4 py-1.5 dark:bg-[#2B2F3F]">
                <Text className="text-[22px] font-medium text-[#1E4266] dark:text-[#CED4F7]">April</Text>
              </TouchableOpacity>
              <TouchableOpacity className="ml-8 flex-row items-center">
                <Text className="text-[24px] font-medium text-[#1E4266] dark:text-[#CED4F7]">2022</Text>
                <Ionicons name="chevron-down" size={18} color={isDark ? '#CED4F7' : '#1E4266'} />
              </TouchableOpacity>
            </View>

            <View className="mb-2 flex-row justify-between px-1">
              {WEEK.map((d) => (
                <Text key={d} className="w-8 text-center text-[19px] font-medium text-[#17466A] dark:text-[#BED0E2]">
                  {d}
                </Text>
              ))}
            </View>

            <View className="flex-row flex-wrap justify-between px-1">
              {DAYS.map((day, index) => {
                const isMuted = index < 2 || index > 32;
                const isSelected = day === selectedDay && index === 4;

                return (
                  <TouchableOpacity
                    key={`${day}-${index}`}
                    onPress={() => setSelectedDay(day)}
                    className={`my-1 h-9 w-8 items-center justify-center rounded-full ${isSelected ? 'bg-[#3B2D85]' : ''}`}
                  >
                    <Text
                      className={`text-[20px] ${
                        isSelected
                          ? 'text-white'
                          : isMuted
                            ? 'text-[#C2C2C2] dark:text-[#666666]'
                            : 'text-[#363636] dark:text-[#E4E4E4]'
                      }`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View className="absolute bottom-0 left-0 right-0 bg-[#F3F3F3] px-6 pb-6 pt-3 dark:bg-[#141414]">
          <View className="mb-2 flex-row items-center justify-center">
            <View className="h-3 w-3 rounded-full bg-[#2F2F2F]" />
            <View className="ml-2 h-3 w-3 rounded-full bg-[#C9C9C9]" />
            <View className="ml-2 h-3 w-3 rounded-full bg-[#C9C9C9]" />
            <View className="ml-2 h-3 w-3 rounded-full bg-[#C9C9C9]" />
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[44px] text-[#1F1F1F] dark:text-white">Long Sleeve Men Shirt</Text>
            <Text className="text-[45px] font-semibold text-[#3B2D85]">₦5,000</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setFeedback({ title: 'Added to cart', message: 'Item was added to your cart successfully.' })}
              className="mr-3 flex-1 items-center rounded-xl border border-[#3B2D85] py-4"
            >
              <Text className="text-[34px] font-semibold text-[#3B2D85]">Add to cart</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/print-now')} className="ml-3 flex-1 items-center rounded-xl bg-[#3B2D85] py-4">
              <Text className="text-[34px] font-semibold text-white">Print now</Text>
            </TouchableOpacity>
          </View>
        </View>
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
