import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, useColorScheme, Modal, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PRODUCTS = [
  { id: '1', name: 'Long Sleeve men Shirt', specs: 'M, White & Black, Front', price: 5000, qty: 2, image: require('@/assets/images/item1.png') },
  { id: '2', name: 'Long Sleeve men Shirt', specs: 'M, White & Black, Front', price: 5000, qty: 2, image: require('@/assets/images/item2.png') },
  { id: '3', name: 'Long Sleeve men Shirt', specs: 'M, White & Black, Front', price: 5000, qty: 2, image: require('@/assets/images/item3.png') },
  { id: '4', name: 'Long Sleeve men Shirt', specs: 'M, White & Black, Front', price: 5000, qty: 2, image: require('@/assets/images/item4.png') },
];

export default function ProductsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { height: screenHeight } = useWindowDimensions();
  const [isDetailVisible, setDetailVisible] = useState(false);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#121212]">
      {/* Header */}
      <View className="w-full flex-row items-center justify-between px-6 pt-14 pb-4 bg-white dark:bg-[#121212]">
        <TouchableOpacity onPress={() => router.back()} className="-ml-2"><Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} /></TouchableOpacity>
        <Text className="text-[#333333] dark:text-white text-lg font-bold">Products</Text>
        <TouchableOpacity><Ionicons name="ellipsis-vertical" size={20} color={isDark ? "#FFFFFF" : "#000000"} /></TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ paddingBottom: 40 }}>
        {PRODUCTS.map((item) => (
          <View key={item.id} className="flex-row items-center py-4 border-b border-gray-200 dark:border-gray-800">
            <View className="w-16 h-16 bg-gray-100 rounded-lg mr-4 p-1"><Image source={item.image} resizeMode="contain" className="w-full h-full" /></View>
            <View className="flex-1 justify-center">
                <View className="flex-row justify-between"><Text className="text-[#333333] dark:text-white font-bold text-sm">{item.name}</Text><Text className="text-[#828282] dark:text-gray-400 text-sm">x{item.qty}</Text></View>
                <Text className="text-[#828282] dark:text-gray-400 text-xs mt-0.5">{item.specs}</Text>
                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm">₦{(item.price).toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => setDetailVisible(true)}><Text className="text-[#2D71E3] font-semibold text-sm">See Details</Text></TouchableOpacity>
                </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* MODAL: Product Detail */}
      <Modal animationType="slide" transparent={true} visible={isDetailVisible} onRequestClose={() => setDetailVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ maxHeight: screenHeight * 0.9, paddingBottom: 40 }} className="bg-white dark:bg-[#1E1E1E] rounded-t-[32px] px-6 w-full shadow-lg">
            
            <View className="flex-row justify-between items-center w-full pt-6 pb-2">
                <View className="flex-1 items-center pl-6"><Text className="text-lg font-semibold text-[#333333] dark:text-white">Product Detail</Text></View>
                <TouchableOpacity onPress={() => setDetailVisible(false)}><Ionicons name="close" size={24} color={isDark ? "#FFF" : "#333"} /></TouchableOpacity>
            </View>

            <View className="items-center w-full mt-4 mb-6">
                <View className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-4">
                    <Image source={require('@/assets/images/item1.png')} resizeMode="contain" className="w-full h-full" />
                </View>
                <Text className="text-lg font-bold text-[#333333] dark:text-white">Long Sleeve men Shirt</Text>
            </View>

            <View className="flex-row justify-between w-full mt-2">
                {/* Left Column */}
                <View className="flex-1 pr-4">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm mb-2">Material specification</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs mb-1">Colour : Blue</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs mb-1">Size : Medium size</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs mb-4">Quantity : 3 pieces</Text>

                    <Text className="text-[#333333] dark:text-white font-bold text-sm mb-2">Item availability</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs">From: The printer&apos;s inventory</Text>
                </View>

                {/* Right Column */}
                <View className="flex-1 pl-2">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm mb-2">Printing Preferences</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs mb-1">Preferred printing type</Text>
                    <Text className="text-[#333333] dark:text-white text-xs font-semibold mb-3">Screen printing</Text>

                    <Text className="text-[#828282] dark:text-gray-400 text-xs mb-1">Total Budget</Text>
                    <Text className="text-[#2D71E3] font-bold text-xs mb-3">₦8000 - ₦10,000</Text>

                    <Text className="text-[#828282] dark:text-gray-400 text-xs mb-1">Preferred delivery date</Text>
                    <Text className="text-[#333333] dark:text-white text-xs font-semibold">20-12-2022</Text>
                </View>
            </View>
            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mt-10 self-center" />
          </View>
        </View>
      </Modal>
    </View>
  );
}