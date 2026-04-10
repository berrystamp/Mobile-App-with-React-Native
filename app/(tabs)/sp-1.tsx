import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { DEFAULT_DESIGN_CATEGORIES } from '@/lib/customDesign';
import { decodeSponsoredDraft, encodeSponsoredDraft } from '@/lib/sponsoredPayment';

export default function SponsoredPaymentStep1() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const [selected, setSelected] = useState(draft.designFor);

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (1/11)</Text>
        <View className="w-10" />
      </View>

      <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">What are you designing for?</Text>
      <Text className="mt-2 text-sm text-[#7C768D] dark:text-[#A5A3AF]">Choose one category to continue this sponsored flow.</Text>

      <ScrollView className="mt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="flex-row flex-wrap">
          {DEFAULT_DESIGN_CATEGORIES.map((category) => {
            const active = selected === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelected(category)}
                className={`mb-3 mr-3 rounded-full border px-4 py-2 ${active ? 'border-[#4A34A5] bg-[#EEE9FF]' : 'border-[#E3DEEF] bg-white dark:border-[#33333A] dark:bg-[#1E1E1E]'}`}>
                <Text className={`text-sm font-semibold ${active ? 'text-[#4A34A5]' : 'text-[#3A3448] dark:text-white'}`}>{category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity
          disabled={!selected}
          onPress={() => router.push({ pathname: '/sp-2', params: { flow: encodeSponsoredDraft({ ...draft, designFor: selected }) } })}
          className={`items-center rounded-full py-4 ${selected ? 'bg-[#4A34A5]' : 'bg-[#CBC3E6]'}`}>
          <Text className="text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
