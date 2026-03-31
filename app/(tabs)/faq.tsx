import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import ApiService from '@/services/apiClient';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await ApiService.getFaqItems();
        setItems(response);
      } catch (error: any) {
        Alert.alert('Unable to load FAQs', error?.response?.data?.responseMessage || error?.message || 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <View className="flex-1 bg-[#F7F7FB]">
      <View className="flex-row items-center px-4 pb-4 pt-14">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-[#ECEAF7]">
          <Ionicons name="arrow-back" size={22} color="#2B2833" />
        </TouchableOpacity>
        <Text className="ml-3 text-xl font-semibold text-[#1F1B2A]">FAQ</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4732A1" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
          {items.map((item, index) => {
            const expanded = openId === item.id;
            return (
              <View key={item.id} className="mb-3 overflow-hidden rounded-2xl bg-white">
                <TouchableOpacity className="flex-row items-center px-4 py-4" onPress={() => setOpenId(expanded ? null : item.id)}>
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-lg bg-[#4732A1]">
                    <Text className="text-xs font-semibold text-white">{String(index + 1).padStart(2, '0')}</Text>
                  </View>
                  <Text className="flex-1 text-sm font-medium text-[#2E2939]">{item.question}</Text>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#8B8797" />
                </TouchableOpacity>

                {expanded ? (
                  <View className="border-t border-[#F0EEF7] px-4 pb-4 pt-3">
                    <Text className="text-sm leading-6 text-[#686479]">{item.answer}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {!items.length ? (
            <View className="rounded-2xl bg-white px-5 py-6">
              <Text className="text-base font-medium text-[#2A2732]">No FAQ available right now.</Text>
              <Text className="mt-1 text-sm text-[#7E7A8C]">Please check back again later.</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
