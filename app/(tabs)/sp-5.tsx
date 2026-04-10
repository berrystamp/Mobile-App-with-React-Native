import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { decodeSponsoredDraft, encodeSponsoredDraft } from '@/lib/sponsoredPayment';

const buildDates = () =>
  Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      id: date.toISOString(),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      label: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    };
  });

export default function SponsoredPaymentStep5() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const dates = useMemo(buildDates, []);
  const [deliveryDate, setDeliveryDate] = useState(draft.deliveryDate || dates[0]?.label || '');

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (5/11)</Text>
        <View className="w-10" />
      </View>

      <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">Select delivery date</Text>

      <ScrollView className="mt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="rounded-3xl bg-white p-4 dark:bg-[#1E1E1E]">
          {dates.map((item) => {
            const active = deliveryDate === item.label;
            return (
              <TouchableOpacity key={item.id} onPress={() => setDeliveryDate(item.label)} className={`mb-2 flex-row items-center justify-between rounded-2xl px-4 py-4 ${active ? 'bg-[#EEE9FF]' : 'bg-[#F9F8FD] dark:bg-[#25252B]'}`}>
                <View>
                  <Text className={`text-base font-semibold ${active ? 'text-[#4A34A5]' : 'text-[#2D273A] dark:text-white'}`}>{item.label}</Text>
                  <Text className="text-xs text-[#8D879C]">{item.day}</Text>
                </View>
                {active ? <Ionicons name="checkmark-circle" size={22} color="#4A34A5" /> : <Ionicons name="ellipse-outline" size={22} color="#BDB8CC" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/sp-6', params: { flow: encodeSponsoredDraft({ ...draft, deliveryDate }) } })}
          className="items-center rounded-full bg-[#4A34A5] py-4">
          <Text className="text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

