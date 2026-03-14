import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';

type MockupItem = {
  id: string;
  name: string;
  price: number;
  image: any;
};

const AVATAR_IMAGE = require('@/assets/images/item1.png');

const MOCKUP_ITEMS: MockupItem[] = [
  { id: '1', name: 'Long Sleeve Men Shirt', price: 5000, image: require('@/assets/images/item1.png') },
  { id: '2', name: 'Body fit', price: 5000, image: require('@/assets/images/item2.png') },
  { id: '3', name: 'Round neck', price: 5000, image: require('@/assets/images/item3.png') },
  { id: '4', name: 'Casual round neck', price: 5000, image: require('@/assets/images/item4.png') },
  { id: '5', name: 'Tote Bag', price: 5000, image: require('@/assets/images/item5.png') },
  { id: '6', name: 'Iphone 13 pouch', price: 5000, image: require('@/assets/images/item2.png') },
  { id: '7', name: 'Knapsack Bag', price: 5000, image: require('@/assets/images/item3.png') },
  { id: '8', name: 'Long Sleeve Men Shirt', price: 5000, image: require('@/assets/images/item4.png') },
];

export default function ProductsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  return (
    <View className="flex-1 bg-[#F1F1F1] dark:bg-[#121212]">
      <View className="w-full flex-row items-center justify-between px-6 pb-4 pt-14">
        <TouchableOpacity onPress={() => router.back()} className="-ml-1 h-10 w-10 items-start justify-center">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#2F2F2F'} />
        </TouchableOpacity>

        <View className="ml-1 mr-auto flex-row items-center">
          <Image source={AVATAR_IMAGE} className="h-12 w-12 rounded-full" />
          <View className="ml-3">
            <Text className="text-[34px] font-semibold text-[#2F2F2F] dark:text-white">Japan Night</Text>
            <Text className="text-[26px] text-[#535353] dark:text-[#D4D4D4]">Designed by Berrystamp</Text>
          </View>
        </View>

        <View className="ml-2 flex-row items-center">
          <TouchableOpacity
            onPress={() => setFeedback({ title: 'Added to favourites', message: 'This design has been saved to your favourites.' })}
            className="mx-1 h-9 w-9 items-center justify-center"
          >
            <Ionicons name="heart-outline" size={24} color={isDark ? '#FFFFFF' : '#2F2F2F'} />
          </TouchableOpacity>
          <TouchableOpacity className="h-9 w-9 items-center justify-center">
            <Feather name="share-2" size={22} color={isDark ? '#FFFFFF' : '#2F2F2F'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between">
          {MOCKUP_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push('/product-details')}
              className="mb-4 w-[48.6%] overflow-hidden rounded-2xl bg-[#EBEBEB] dark:bg-[#1F1F1F]"
            >
              <View className="h-[175px] items-center justify-center px-3 pt-3">
                <Image source={item.image} className="h-full w-full" resizeMode="contain" />
              </View>

              <View className="px-3 pb-3 pt-2">
                <Text numberOfLines={1} className="text-[26px] text-[#3B3B3B] dark:text-white">
                  {item.name}
                </Text>
                <Text className="mt-1 text-[30px] font-medium text-[#2F2F2F] dark:text-white">
                  ₦{item.price.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ActionFeedbackModal
        visible={Boolean(feedback)}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={() => setFeedback(null)}
      />
    </View>
  );
}
