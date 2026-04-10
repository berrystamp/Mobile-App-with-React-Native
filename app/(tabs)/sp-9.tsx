import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { PaymentFunder } from '@/types';
import { decodeSponsoredDraft, encodeSponsoredDraft } from '@/lib/sponsoredPayment';

export default function SponsoredPaymentStep9() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const [funder, setFunder] = useState<PaymentFunder>(draft.funder);

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (9/11)</Text>
        <View className="w-10" />
      </View>

      <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">Payment method</Text>
      <Text className="mt-2 text-sm text-[#7C768D] dark:text-[#A5A3AF]">Select how this order should be funded.</Text>

      <View className="mt-6 rounded-3xl bg-white p-4 dark:bg-[#1E1E1E]">
        <OptionRow label="Pay by yourself" active={funder === 'self'} onPress={() => setFunder('self')} />
        <OptionRow label="Sponsored payment" active={funder === 'sponsored'} onPress={() => setFunder('sponsored')} />
      </View>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/sp-10', params: { flow: encodeSponsoredDraft({ ...draft, funder }) } })}
          className="items-center rounded-full bg-[#4A34A5] py-4">
          <Text className="text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function OptionRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className={`mb-3 flex-row items-center justify-between rounded-2xl border px-4 py-4 ${active ? 'border-[#4A34A5] bg-[#EEE9FF]' : 'border-[#DDD7EA]'}`}>
      <Text className={`text-sm font-semibold ${active ? 'text-[#4A34A5]' : 'text-[#2D273A] dark:text-white'}`}>{label}</Text>
      {active ? <Ionicons name="radio-button-on" size={20} color="#4A34A5" /> : <Ionicons name="radio-button-off" size={20} color="#BDB8CC" />}
    </TouchableOpacity>
  );
}

