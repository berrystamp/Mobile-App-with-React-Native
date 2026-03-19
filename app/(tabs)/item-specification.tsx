import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AVATAR_IMAGE = require('@/assets/images/item1.png');
const PRODUCT_IMAGE = require('@/assets/images/item1.png');

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Red', hex: '#F23B2F' },
  { name: 'Blue', hex: '#021DCC' },
  { name: 'Green', hex: '#3A8323' },
  { name: 'Yellow', hex: '#E8E545' },
  { name: 'Purple', hex: '#7E1D95' },
  { name: 'Pink', hex: '#D76AB9' },
  { name: 'Orange', hex: '#E9A63A' },
  { name: 'Brown', hex: '#9D3A35' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Grey', hex: '#595959' },
  { name: 'Gold', hex: '#C7AC4A' },
  { name: 'Silver', hex: '#BBBBBB' },
  { name: 'Navy blue', hex: '#0C0A9E' },
  { name: 'Sky blue', hex: '#8BC0DE' },
  { name: 'Black', hex: '#000000' },
  { name: 'Crimson', hex: '#D13445' },
];

export default function ItemSpecificationScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Blue');
  const [quantity, setQuantity] = useState(1);
  const [limitQuantity, setLimitQuantity] = useState(true);

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

      <View className="flex-1 rounded-t-[20px] bg-[#F2F2F2] px-5 pt-4 dark:bg-[#1A1A1A]">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[36px] text-[#2E2E2E] dark:text-white">Item specification</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={isDark ? '#E5E5E5' : '#333333'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <Text className="mb-3 text-[30px] text-[#2D2D2D] dark:text-white">Choose size</Text>
          <View className="mb-6 flex-row flex-wrap">
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setSelectedSize(size)}
                className={`mr-3 mt-3 rounded-md border px-4 py-2 ${
                  selectedSize === size ? 'border-[#3B2D85] bg-[#ECEBFF]' : 'border-[#C9CBD2] bg-transparent'
                }`}
              >
                <Text className="text-[28px] text-[#2F2F2F] dark:text-white">{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => setLimitQuantity((prev) => !prev)} className="mb-4 flex-row items-center">
            <View className={`mr-3 h-6 w-6 rounded-full border-2 ${limitQuantity ? 'border-[#3B2D85]' : 'border-[#B8BAC2]'}`}>
              {limitQuantity ? <View className="m-auto h-3 w-3 rounded-full bg-[#3B2D85]" /> : null}
            </View>
            <Text className="text-[34px] text-[#2F2F2F] dark:text-white">Limit Quantity</Text>
          </TouchableOpacity>

          <View className="mb-6 flex-row items-center">
            <Text className="mr-4 text-[30px] text-[#6D6D6D] dark:text-[#CFCFCF]">Quantity:</Text>
            <TouchableOpacity
              onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="h-12 w-12 items-center justify-center rounded-md bg-[#084EB8]"
            >
              <Text className="text-[34px] font-medium text-white">−</Text>
            </TouchableOpacity>
            <View className="mx-3 h-12 w-12 items-center justify-center rounded-md bg-white dark:bg-[#2A2A2A]">
              <Text className="text-[30px] text-[#2E2E2E] dark:text-white">{quantity}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setQuantity((prev) => prev + 1)}
              className="h-12 w-12 items-center justify-center rounded-md bg-[#084EB8]"
            >
              <Text className="text-[34px] font-medium text-white">+</Text>
            </TouchableOpacity>
          </View>

          <Text className="mb-3 text-[32px] text-[#2D2D2D] dark:text-white">Select colors</Text>
          <View className="flex-row flex-wrap justify-between">
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color.name}
                onPress={() => setSelectedColor(color.name)}
                className="mb-4 w-[23%] items-center"
              >
                <View
                  className={`h-9 w-9 border ${selectedColor === color.name ? 'border-[#3B2D85]' : 'border-[#B8BAC2]'}`}
                  style={{ backgroundColor: color.hex }}
                />
                <Text className="mt-1 text-center text-[18px] text-[#575757] dark:text-[#D1D1D1]">{color.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity onPress={() => router.back()} className="mb-5 mt-2 items-center rounded-full bg-[#3B2D85] py-4">
          <Text className="text-[34px] font-semibold text-white">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
