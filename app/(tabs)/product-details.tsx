import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import ApiService from '@/services/apiClient';

type Item = {
  id: string;
  name: string;
  price: number;
  image: any;
  author?: string;
};

const PRODUCT_IMAGE = require('@/assets/images/item1.png');
const AVATAR_IMAGE = require('@/assets/images/item1.png');

const MOCKUPS: Item[] = [
  { id: 'm1', name: 'Long Sleeve Men Shirt', price: 5000, image: require('@/assets/images/item1.png') },
  { id: 'm2', name: 'Body fit', price: 5000, image: require('@/assets/images/item2.png') },
  { id: 'm3', name: 'Long Sleeve', price: 5000, image: require('@/assets/images/item3.png') },
];

const MORE_LIKE_THIS: Item[] = [
  { id: 'r1', name: 'My Mind Mug', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item2.png') },
  { id: 'r2', name: 'My Mind Mug', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item2.png') },
  { id: 'r3', name: 'My Mind Mug', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item2.png') },
  { id: 'r4', name: 'My Mind Mug', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item2.png') },
];

const RATING_ROWS = [
  { label: '5', count: 12, width: '90%' },
  { label: '4', count: 30, width: '82%' },
  { label: '3', count: 20, width: '64%' },
  { label: '2', count: 8, width: '40%' },
  { label: '1', count: 2, width: '20%' },
];

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const isDark = useColorScheme() === 'dark';
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteToggle = async () => {
    if (!designId) {
      setIsFavorite((prev) => !prev);
      setFeedback({ title: 'Added to favourites', message: 'This product has been saved to your favourites.' });
      return;
    }

    const nextFavoriteState = !isFavorite;
    setIsFavorite(nextFavoriteState);

    try {
      await ApiService.toggleFavorite(String(designId));
      setFeedback({ title: nextFavoriteState ? 'Added to favourites' : 'Removed from favourites', message: nextFavoriteState ? 'This product has been saved to your favourites.' : 'This product has been removed from your favourites.' });
    } catch (error: any) {
      setIsFavorite((prev) => !prev);
      setFeedback({ title: 'Action failed', message: error?.response?.data?.message || 'Unable to update favourites right now.' });
    }
  };

  return (
    <View className="flex-1 bg-[#F5F5F5] dark:bg-[#121212]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="bg-[#B7B7B7] px-5 pb-4 pt-12">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="ml-2 flex-1 flex-row items-center">
              <Image source={AVATAR_IMAGE} className="h-10 w-10 rounded-full" />
              <View className="ml-3">
                <Text className="text-[28px] font-semibold text-white">Japan Night</Text>
                <Text className="text-[20px] text-white/90">Designed by Berrystamp</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleFavoriteToggle}
                className="mx-1 h-9 w-9 items-center justify-center"
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity className="h-9 w-9 items-center justify-center">
                <Feather name="share-2" size={21} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="items-center bg-[#ECECEC] py-5 dark:bg-[#1A1A1A]">
          <Image source={PRODUCT_IMAGE} className="h-[470px] w-[300px]" resizeMode="contain" />
          <View className="mt-2 flex-row">
            <View className="mx-1 h-3 w-3 rounded-full bg-[#333333]" />
            <View className="mx-1 h-3 w-3 rounded-full bg-[#D0D0D0]" />
            <View className="mx-1 h-3 w-3 rounded-full bg-[#D0D0D0]" />
            <View className="mx-1 h-3 w-3 rounded-full bg-[#D0D0D0]" />
          </View>
        </View>

        <View className="px-6 pb-4 pt-5">
          <Text className="text-[44px] font-medium text-[#222222] dark:text-white">Long Sleeve Men Shirt</Text>
          <Text className="mt-1 text-[33px] text-[#3A3A3A] dark:text-[#E3E3E3]">
            From <Text className="text-[#2D71E3]">Japan tour Collection</Text>
          </Text>
          <Text className="mt-2 text-[35px] text-[#4C4C4C] dark:text-[#D8D8D8]">
            <Text className="font-semibold">475</Text> piece available
          </Text>
        </View>

        <View className="px-5">
          <TouchableOpacity
            onPress={() => router.push('/item-specification')}
            className="mb-3 flex-row items-center rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 dark:border-[#2C2C2C] dark:bg-[#1D1D1D]"
          >
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-lg bg-[#ECEBFF]">
              <Ionicons name="add" size={24} color="#3B2D85" />
            </View>
            <View className="flex-1">
              <Text className="text-[31px] text-[#343434] dark:text-white">Add Item Specification</Text>
              <Text className="text-[23px] text-[#8B8B8B]">Color, Size and Quantity</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/print-specification')}
            className="mb-3 flex-row items-center rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 dark:border-[#2C2C2C] dark:bg-[#1D1D1D]"
          >
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-lg bg-[#ECEBFF]">
              <Ionicons name="add" size={24} color="#3B2D85" />
            </View>
            <View className="flex-1">
              <Text className="text-[31px] text-[#343434] dark:text-white">Add Printing Specification</Text>
              <Text className="text-[23px] text-[#8B8B8B]">Type, budget and Time Frame</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>

          <TouchableOpacity className="mb-5 mt-3 flex-row items-center rounded-xl border border-[#D8D8E8] px-4 py-4 dark:border-[#2F2F45]">
            <MaterialCommunityIcons name="note-edit-outline" size={22} color="#3B2D85" />
            <Text className="ml-3 flex-1 text-[30px] text-[#3B2D85]">Request customization</Text>
            <Ionicons name="chevron-forward" size={23} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>
        </View>

        <View className="px-6">
          <Text className="text-[39px] font-medium text-[#262626] dark:text-white">Policy</Text>
          <Text className="mt-2 text-[31px] leading-[44px] text-[#4A4A4A] dark:text-[#D7D7D7]">
            To be delivered to anywhere in Nigeria after 10 days. Note that the delivery days might be sooner
            base on your location.
          </Text>
          <Text className="mt-3 text-[31px] leading-[44px] text-[#4A4A4A] dark:text-[#D7D7D7]">
            Return is free with tangible reason within 10 days after delivery.
          </Text>
        </View>

        <View className="mt-5 px-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[39px] font-medium text-[#262626] dark:text-white">Designer Reviews</Text>
            <TouchableOpacity>
              <Text className="text-[31px] text-[#3B2D85]">See more</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row">
            <View className="mr-4 w-[38%] items-center justify-center rounded-xl bg-[#F0EEF9] p-3 dark:bg-[#232030]">
              <Text className="text-[39px] font-semibold text-[#3B2D85]">4/5</Text>
              <Text className="text-[22px] text-[#CDAA00]">★★★★☆</Text>
              <Text className="mt-1 text-[34px] font-semibold text-[#222222] dark:text-white">152</Text>
              <Text className="text-[20px] text-[#808080]">Reviews</Text>
            </View>

            <View className="flex-1 justify-center">
              {RATING_ROWS.map((row) => (
                <View key={row.label} className="mb-1.5 flex-row items-center">
                  <Text className="mr-1 text-[21px] text-[#4A4A4A] dark:text-[#D9D9D9]">{row.label}</Text>
                  <Text className="mr-1 text-[16px] text-[#CDAA00]">★</Text>
                  <Text className="mr-2 text-[18px] text-[#666666] dark:text-[#AFAFAF]">({row.count})</Text>
                  <View className="h-2 flex-1 rounded-full bg-[#E7E5F0] dark:bg-[#2F2B40]">
                    <View className="h-2 rounded-full bg-[#3B2D85]" style={{ width: row.width }} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="mt-6 px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[39px] font-medium text-[#262626] dark:text-white">Select Mockup</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text className="text-[31px] text-[#3B2D85]">View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MOCKUPS.map((item) => (
              <TouchableOpacity key={item.id} className="mr-3 w-[150px] overflow-hidden rounded-2xl bg-white dark:bg-[#1F1F1F]">
                <View className="h-24 items-center justify-center bg-[#F2F2F2] dark:bg-[#2A2A2A]">
                  <Image source={item.image} className="h-20 w-20" resizeMode="contain" />
                </View>
                <View className="px-2 py-2">
                  <Text numberOfLines={1} className="text-[18px] text-[#333333] dark:text-white">
                    {item.name}
                  </Text>
                  <Text className="text-[22px] font-semibold text-[#333333] dark:text-white">₦{item.price.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mt-6 px-6 pb-4">
          <Text className="mb-4 text-[39px] font-medium text-[#262626] dark:text-white">More like this</Text>
          <View className="flex-row flex-wrap justify-between">
            {MORE_LIKE_THIS.map((item) => (
              <TouchableOpacity key={item.id} className="mb-4 w-[48.5%] overflow-hidden rounded-2xl bg-white dark:bg-[#1F1F1F]">
                <View className="relative h-36 bg-[#F2F2F2] dark:bg-[#2A2A2A]">
                  <Image source={item.image} className="h-full w-full" resizeMode="cover" />
                  <TouchableOpacity
                    onPress={handleFavoriteToggle}
                    className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#292929]"
                  >
                    <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={17} color={isFavorite ? '#FF4458' : isDark ? '#FFFFFF' : '#333333'} />
                  </TouchableOpacity>
                </View>
                <View className="px-2.5 py-2.5">
                  <Text numberOfLines={1} className="text-[28px] text-[#303030] dark:text-white">
                    {item.name}
                  </Text>
                  <Text className="mt-1 text-[22px] text-[#8B8B8B]">By {item.author}</Text>
                  <Text className="mt-1 text-[33px] font-semibold text-[#303030] dark:text-white">₦{item.price.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row bg-[#F5F5F5] px-6 pb-6 pt-3 dark:bg-[#121212]">
        <TouchableOpacity
          onPress={() => setFeedback({ title: 'Added to cart', message: 'Item was added to your cart successfully.' })}
          className="mr-3 flex-1 items-center justify-center rounded-xl border border-[#3B2D85] py-4"
        >
          <Text className="text-[31px] font-semibold text-[#3B2D85]">Add to cart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/print-now')} className="ml-3 flex-1 items-center justify-center rounded-xl bg-[#3B2D85] py-4">
          <Text className="text-[31px] font-semibold text-white">Print now</Text>
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
