import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { decodeSponsoredDraft, encodeSponsoredDraft } from '@/lib/sponsoredPayment';

export default function SponsoredPaymentStep7() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const [message, setMessage] = useState(
    `Hi ${draft.printerName || 'there'}, this is a sponsored payment order. Please proceed with the selected specifications.`,
  );

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (7/11)</Text>
        <View className="w-10" />
      </View>

      <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">Send order message</Text>
      <Text className="mt-2 text-sm text-[#7C768D] dark:text-[#A5A3AF]">Confirm the order details with {draft.printerName || 'the selected printer'}.</Text>

      <View className="mt-6 rounded-3xl bg-white p-4 dark:bg-[#1E1E1E]">
        <Text className="mb-2 text-xs font-semibold text-[#8A8499] dark:text-[#A5A3AF]">Your message</Text>
        <TextInput
          value={message}
          multiline
          onChangeText={setMessage}
          className="min-h-[160px] rounded-2xl border border-[#DDD7EA] px-4 py-3 text-sm text-[#2D273A] dark:border-[#33333A] dark:text-white"
          placeholder="Type your message"
          placeholderTextColor="#A29CB1"
        />
      </View>

      <View className="mt-4 rounded-2xl bg-white p-4 dark:bg-[#1E1E1E]">
        <Text className="text-sm font-semibold text-[#2D273A] dark:text-white">Snapshot</Text>
        <Text className="mt-2 text-xs text-[#7C768D] dark:text-[#A5A3AF]">Design for: {draft.designFor || '-'}</Text>
        <Text className="mt-1 text-xs text-[#7C768D] dark:text-[#A5A3AF]">Theme: {draft.designTheme || '-'}</Text>
        <Text className="mt-1 text-xs text-[#7C768D] dark:text-[#A5A3AF]">Items: {draft.items.join(', ') || '-'}</Text>
      </View>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity
          disabled={!message.trim()}
          onPress={() => router.push({ pathname: '/sp-8', params: { flow: encodeSponsoredDraft(draft) } })}
          className={`items-center rounded-full py-4 ${message.trim() ? 'bg-[#4A34A5]' : 'bg-[#CBC3E6]'}`}>
          <Text className="text-base font-semibold text-white">Review Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

