import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';

type ProductCard = {
  id: string;
  name: string;
  author?: string;
  price: number;
  image: any;
};

const HERO_IMAGE = require('@/assets/images/item5.png');
const AVATAR_IMAGE = require('@/assets/images/item1.png');

const MOCKUPS: ProductCard[] = [
  { id: 'm1', name: 'Long Sleeve Men Shirt', price: 5000, image: require('@/assets/images/item1.png') },
  { id: 'm2', name: 'Body fit', price: 5000, image: require('@/assets/images/item2.png') },
  { id: 'm3', name: 'Long Sleeve', price: 5000, image: require('@/assets/images/item3.png') },
];

const RELATED_PRODUCTS: ProductCard[] = [
  { id: 'r1', name: 'My Mind Mug', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item1.png') },
  { id: 'r2', name: 'We Meuuve Slang design', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item2.png') },
  { id: 'r3', name: 'Sapa be like', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item3.png') },
  { id: 'r4', name: 'Fun and peaceful', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item4.png') },
];

export default function ProductScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  return (
    <View className="flex-1 bg-[#F5F5F5] dark:bg-[#121212]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative">
          <ImageBackground source={HERO_IMAGE} className="h-[520px] w-full" resizeMode="cover">
            <View className="h-full w-full bg-black/35 px-5 pt-12">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View className="ml-2 flex-1 flex-row items-center">
                  <Image source={AVATAR_IMAGE} className="h-11 w-11 rounded-full border border-white/20" />
                  <View className="ml-3">
                    <Text className="text-2xl font-semibold text-white">Japan Night</Text>
                    <Text className="text-base text-white/90">Designed by Berrystamp</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setFeedback({ title: 'Added to favourites', message: 'This design has been saved to your favourites.' })}
                    className="mx-1 h-9 w-9 items-center justify-center"
                  >
                    <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity className="h-9 w-9 items-center justify-center">
                    <Feather name="share-2" size={21} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View className="bg-[#F5F5F5] px-6 pb-2 pt-6 dark:bg-[#121212]">
          <Text className="text-[30px] text-[#363636] dark:text-white">
            From <Text className="text-[#2D71E3]">Berrystamp Collections</Text>
          </Text>
          <Text className="mt-2 text-[48px] font-semibold text-[#333333] dark:text-white">₦5,000</Text>

          <Text className="mt-3 text-[34px] font-semibold text-[#333333] dark:text-white">Description</Text>
          <Text className="mt-1 text-[25px] leading-10 text-[#4F4F4F] dark:text-[#D7D7D7]">
            Japan Night brings a playful yet haunting twist to everyday style. It captures the thrill of
            the night with a fearless street vibe.
          </Text>

          <TouchableOpacity onPress={() => router.push('/product-details')} className="mt-6 items-center rounded-full bg-[#3B2D85] py-5">
            <Text className="text-[28px] font-semibold text-white">Request Customization</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[38px] font-semibold text-[#333333] dark:text-white">Select Mockup</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text className="text-[34px] text-[#3B2D85]">View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MOCKUPS.map((mockup) => (
              <TouchableOpacity
                key={mockup.id}
                onPress={() => router.push('/product-details')}
                className="mr-4 w-[190px] overflow-hidden rounded-2xl bg-white dark:bg-[#1F1F1F]"
              >
                <View className="h-44 items-center justify-center bg-[#F6F6F6] dark:bg-[#2A2A2A]">
                  <Image source={mockup.image} className="h-36 w-36" resizeMode="contain" />
                </View>
                <View className="px-3 py-3">
                  <Text numberOfLines={1} className="text-lg text-[#333333] dark:text-white">
                    {mockup.name}
                  </Text>
                  <Text className="mt-1 text-xl font-semibold text-[#333333] dark:text-white">
                    ₦{mockup.price.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mt-6 px-6 pb-4">
          <Text className="mb-4 text-[38px] font-semibold text-[#333333] dark:text-white">More like this</Text>

          <View className="flex-row flex-wrap justify-between">
            {RELATED_PRODUCTS.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="mb-4 w-[48.5%] overflow-hidden rounded-2xl bg-white dark:bg-[#1F1F1F]"
              >
                <View className="relative h-44 bg-[#F2F2F2] dark:bg-[#2A2A2A]">
                  <Image source={item.image} className="h-full w-full" resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => setFeedback({ title: 'Added to favourites', message: 'This design has been saved to your favourites.' })}
                    className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-white/90"
                  >
                    <Ionicons name="heart-outline" size={18} color={isDark ? '#FFFFFF' : '#333333'} />
                  </TouchableOpacity>
                </View>
                <View className="px-3 py-3">
                  <Text numberOfLines={1} className="text-xl text-[#333333] dark:text-white">
                    {item.name}
                  </Text>
                  <Text numberOfLines={1} className="mt-1 text-base text-[#828282]">
                    By {item.author}
                  </Text>
                  <Text className="mt-2 text-2xl font-semibold text-[#333333] dark:text-white">
                    ₦{item.price.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row bg-[#F5F5F5] px-6 pb-7 pt-3 dark:bg-[#121212]">
        <TouchableOpacity
          onPress={() => setFeedback({ title: 'Added to cart', message: 'Item was added to your cart successfully.' })}
          className="mr-3 flex-1 items-center justify-center rounded-2xl border border-[#3B2D85] py-4"
        >
          <Text className="text-[31px] font-semibold text-[#3B2D85]">Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/print-now')} className="ml-3 flex-1 items-center justify-center rounded-2xl bg-[#3B2D85] py-4">
          <Text className="text-[31px] font-semibold text-white">Print Now</Text>
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
