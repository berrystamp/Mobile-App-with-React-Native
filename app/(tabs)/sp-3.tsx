import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { DEFAULT_PRINT_ITEMS } from '@/lib/customDesign';
import { decodeSponsoredDraft, encodeSponsoredDraft } from '@/lib/sponsoredPayment';

export default function SponsoredPaymentStep3() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const [selected, setSelected] = useState<string[]>(draft.items);

  const toggleItem = (item: string) => {
    setSelected((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  };

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (3/11)</Text>
        <View className="w-10" />
      </View>

      <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">Select item(s) to print on</Text>
      <Text className="mt-2 text-sm text-[#7C768D] dark:text-[#A5A3AF]">Choose one or more items.</Text>

      <ScrollView className="mt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="rounded-3xl bg-white p-2 dark:bg-[#1E1E1E]">
          {DEFAULT_PRINT_ITEMS.map((item) => {
            const active = selected.includes(item);
            return (
              <TouchableOpacity key={item} onPress={() => toggleItem(item)} className="mb-2 flex-row items-center justify-between rounded-2xl px-4 py-4">
                <Text className={`text-base ${active ? 'font-semibold text-[#4A34A5]' : 'text-[#312B3F] dark:text-white'}`}>{item}</Text>
                <View className={`h-5 w-5 rounded-md border ${active ? 'border-[#4A34A5] bg-[#4A34A5]' : 'border-[#CFC9DE]'}`}>
                  {active ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity
          disabled={!selected.length}
          onPress={() => router.push({ pathname: '/sp-4', params: { flow: encodeSponsoredDraft({ ...draft, items: selected }) } })}
          className={`items-center rounded-full py-4 ${selected.length ? 'bg-[#4A34A5]' : 'bg-[#CBC3E6]'}`}>
          <Text className="text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

