import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { decodeSponsoredDraft, encodeSponsoredDraft } from '@/lib/sponsoredPayment';
import { MOCK_DESIGNERS } from '@/utils/mockData';

export default function SponsoredPaymentStep6() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const [selectedPrinterId, setSelectedPrinterId] = useState(draft.printerId);

  const selectedPrinter = MOCK_DESIGNERS.find((item) => item.id === selectedPrinterId);

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (6/11)</Text>
        <View className="w-10" />
      </View>

      <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">Select a printer/designer</Text>
      <Text className="mt-2 text-sm text-[#7C768D] dark:text-[#A5A3AF]">Pick who should execute this sponsored order.</Text>

      <ScrollView className="mt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {MOCK_DESIGNERS.map((item) => {
          const active = selectedPrinterId === item.id;
          return (
            <TouchableOpacity key={item.id} onPress={() => setSelectedPrinterId(item.id)} className={`mb-3 rounded-2xl border p-3 ${active ? 'border-[#4A34A5] bg-[#EEE9FF]' : 'border-[#E4DFEF] bg-white dark:border-[#33333A] dark:bg-[#1E1E1E]'}`}>
              <View className="flex-row items-center">
                <Image source={{ uri: item.avatar }} className="h-12 w-12 rounded-full" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-[#2D273A] dark:text-white">{item.username}</Text>
                  <Text className="text-xs text-[#7C768D] dark:text-[#A5A3AF]">{item.specialty}</Text>
                </View>
                {active ? <Ionicons name="checkmark-circle" size={22} color="#4A34A5" /> : <Ionicons name="ellipse-outline" size={22} color="#BDB8CC" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity
          disabled={!selectedPrinterId}
          onPress={() =>
            router.push({
              pathname: '/sp-7',
              params: {
                flow: encodeSponsoredDraft({
                  ...draft,
                  printerId: selectedPrinterId,
                  printerName: selectedPrinter?.username || '',
                }),
              },
            })
          }
          className={`items-center rounded-full py-4 ${selectedPrinterId ? 'bg-[#4A34A5]' : 'bg-[#CBC3E6]'}`}>
          <Text className="text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

