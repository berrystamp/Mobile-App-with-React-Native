import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { decodeSponsoredDraft, encodeSponsoredDraft, SP_COLORS, SP_SIZES } from '@/lib/sponsoredPayment';

export default function SponsoredPaymentStep4() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const [size, setSize] = useState(draft.size);
  const [color, setColor] = useState(draft.color);
  const [quantity, setQuantity] = useState(draft.quantity);

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (4/11)</Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">Item specification</Text>

        <Text className="mt-6 text-sm font-semibold text-[#7B748C] dark:text-[#A5A3AF]">Choose size</Text>
        <View className="mt-3 flex-row flex-wrap">
          {SP_SIZES.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSize(item)}
              className={`mb-2 mr-2 rounded-lg border px-4 py-2 ${size === item ? 'border-[#4A34A5] bg-[#EEE9FF]' : 'border-[#DBD5E8] bg-white dark:border-[#33333A] dark:bg-[#1E1E1E]'}`}>
              <Text className={`font-semibold ${size === item ? 'text-[#4A34A5]' : 'text-[#2D273A] dark:text-white'}`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mt-6 text-sm font-semibold text-[#7B748C] dark:text-[#A5A3AF]">Quantity</Text>
        <View className="mt-3 flex-row items-center">
          <TouchableOpacity onPress={() => setQuantity((current: number) => Math.max(1, current - 1))} className="h-11 w-11 items-center justify-center rounded-lg bg-[#4A34A5]">
            <Text className="text-xl font-bold text-white">-</Text>
          </TouchableOpacity>
          <View className="mx-3 min-w-[60px] rounded-lg bg-white px-4 py-2 dark:bg-[#1E1E1E]">
            <Text className="text-center text-lg font-semibold text-[#2D273A] dark:text-white">{quantity}</Text>
          </View>
          <TouchableOpacity onPress={() => setQuantity((current: number) => current + 1)} className="h-11 w-11 items-center justify-center rounded-lg bg-[#4A34A5]">
            <Text className="text-xl font-bold text-white">+</Text>
          </TouchableOpacity>
        </View>

        <Text className="mt-6 text-sm font-semibold text-[#7B748C] dark:text-[#A5A3AF]">Select color</Text>
        <View className="mt-3 flex-row flex-wrap">
          {SP_COLORS.map((item) => (
            <TouchableOpacity key={item.name} onPress={() => setColor(item.name)} className="mb-4 mr-4 w-16 items-center">
              <View className={`h-9 w-9 rounded-full border-2 ${color === item.name ? 'border-[#4A34A5]' : 'border-[#D8D2E6]'}`} style={{ backgroundColor: item.hex }} />
              <Text className="mt-1 text-center text-xs text-[#2D273A] dark:text-white">{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/sp-5', params: { flow: encodeSponsoredDraft({ ...draft, size, color, quantity }) } })}
          className="items-center rounded-full bg-[#4A34A5] py-4">
          <Text className="text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

