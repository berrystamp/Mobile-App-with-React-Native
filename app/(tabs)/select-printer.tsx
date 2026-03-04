import React from 'react';
import { Image, Text, View, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PrinterData {
    id: string;
    name: string;
    role: string;
    jobs: number;
    ratingScore: string;
    stars: string;
    location: string;
    avatarSource: any;
    bannerSource: any;
}

export default function SelectPrinterScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Mock Data based on the UI design
    const printers: PrinterData[] = [
        { id: '1', name: 'Mohh_Jumah', role: 'Abstract designer', jobs: 235, ratingScore: '98%', stars: '4.5', location: 'Lagos state', avatarSource: require('@/assets/images/item1.png'), bannerSource: require('@/assets/images/item2.png') },
        { id: '2', name: 'Mohh_Jumah', role: 'Abstract designer', jobs: 235, ratingScore: '98%', stars: '4.5', location: 'Lagos state', avatarSource: require('@/assets/images/item1.png'), bannerSource: require('@/assets/images/item2.png') },
        { id: '3', name: 'Mohh_Jumah', role: 'Abstract designer', jobs: 235, ratingScore: '98%', stars: '4.5', location: 'Lagos state', avatarSource: require('@/assets/images/item1.png'), bannerSource: require('@/assets/images/item2.png') },
        { id: '4', name: 'Mohh_Jumah', role: 'Abstract designer', jobs: 235, ratingScore: '98%', stars: '4.5', location: 'Lagos state', avatarSource: require('@/assets/images/item1.png'), bannerSource: require('@/assets/images/item2.png') },
    ];

    const renderPrinterCard = ({ item }: { item: PrinterData }) => (
        <View className="flex-1 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm m-2 overflow-hidden">
            
            {/* Top Banner & Overlapping Avatar */}
            <View className="h-16 w-full relative">
                {/* Abstract Banner */}
                <Image source={item.bannerSource} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                
                {/* Circular Avatar positioned absolute to overlap */}
                <View className="absolute -bottom-6 w-full items-center">
                    <View className="w-[52px] h-[52px] rounded-full border-[3px] border-white dark:border-[#1E1E1E] bg-[#FDBA74] items-center justify-center overflow-hidden">
                        <Image source={item.avatarSource} style={{ width: '80%', height: '80%' }} resizeMode="contain" />
                    </View>
                </View>
            </View>

            {/* Card Content (Starts with top padding to make room for avatar) */}
            <View className="pt-8 pb-4 px-3 items-center">
                
                {/* Name & Verified Badge */}
                <View className="flex-row items-center space-x-1">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm">{item.name}</Text>
                    <Ionicons name="checkmark-circle" size={14} color="#0056D2" />
                </View>

                {/* Role */}
                <Text className="text-[#828282] dark:text-gray-400 text-xs mt-0.5">{item.role}</Text>

                {/* Stats Row */}
                <View className="flex-row items-center mt-1.5 space-x-1">
                    <Text className="text-[#BDBDBD] dark:text-gray-500 text-[10px]">{item.jobs} | </Text>
                    <Text className="text-[#219653] text-[10px] font-semibold">{item.ratingScore}</Text>
                    <Text className="text-[#BDBDBD] dark:text-gray-500 text-[10px]"> | </Text>
                    <Ionicons name="star" size={10} color="#F2C94C" />
                    <Text className="text-[#BDBDBD] dark:text-gray-500 text-[10px]">{item.stars}</Text>
                </View>

                {/* Location */}
                <View className="flex-row items-center mt-1.5 mb-4 space-x-1">
                    <Ionicons name="location-outline" size={12} color="#BDBDBD" />
                    <Text className="text-[#BDBDBD] dark:text-gray-500 text-[10px]">{item.location}</Text>
                </View>

                {/* Outline Message Button */}
                <TouchableOpacity className="w-full border border-[#3B2D85] rounded-full py-1.5 items-center justify-center">
                    <Text className="text-[#3B2D85] dark:text-[#8D7BE3] font-semibold text-xs">Message</Text>
                </TouchableOpacity>

            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#FDFDFD] dark:bg-[#121212]">
            
            {/* Header */}
            <View className="w-full flex flex-row justify-between items-center px-6 pt-16 pb-4">
                <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} className="w-8">
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                </TouchableOpacity>
                <View className="flex-1 items-center pr-8">
                    <Text className="text-[#333333] dark:text-white text-lg font-semibold">Select Printer</Text>
                </View>
            </View>

            {/* 2-Column Grid using FlatList */}
            <FlatList
                data={printers}
                keyExtractor={(item) => item.id}
                renderItem={renderPrinterCard}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />

        </View>
    );
}