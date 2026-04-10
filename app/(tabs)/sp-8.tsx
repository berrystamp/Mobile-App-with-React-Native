import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { formatNaira } from '@/lib/currency';
import { decodeSponsoredDraft, encodeSponsoredDraft, sponsoredOrderBreakdown } from '@/lib/sponsoredPayment';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold text-[#8A8499] dark:text-[#A5A3AF]">{label}</Text>
      <Text className="mt-1 text-sm text-[#2D273A] dark:text-white">{value}</Text>
    </View>
  );
}

export default function SponsoredPaymentStep8() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const totals = useMemo(() => sponsoredOrderBreakdown(draft.quantity), [draft.quantity]);

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (8/11)</Text>
        <View className="w-10" />
      </View>

      <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">Order details</Text>

      <ScrollView className="mt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="rounded-3xl bg-white p-4 dark:bg-[#1E1E1E]">
          <Row label="Order title" value={`${draft.designFor || 'Custom design'} (${draft.items.join(', ') || 'selected item'})`} />
          <Row label="Design theme" value={draft.designTheme || '-'} />
          <Row label="Size / Color / Quantity" value={`${draft.size} / ${draft.color} / ${draft.quantity}`} />
          <Row label="Delivery date" value={draft.deliveryDate || '-'} />
          <Row label="Assigned printer" value={draft.printerName || '-'} />
          <Row label="Design amount" value={formatNaira(totals.designAmount)} />
          <Row label="Printing amount" value={formatNaira(totals.printingAmount)} />
          <Row label="Delivery amount" value={formatNaira(totals.deliveryAmount)} />
          <View className="mt-2 rounded-xl bg-[#F3F0FF] p-3">
            <Text className="text-sm font-semibold text-[#4A34A5]">Total: {formatNaira(totals.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity onPress={() => router.back()} className="mr-2 flex-1 items-center rounded-full border border-[#CFC9DE] py-4">
          <Text className="text-sm font-semibold text-[#3A3448] dark:text-white">Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/sp-9', params: { flow: encodeSponsoredDraft(draft) } })}
          className="ml-2 flex-1 items-center rounded-full bg-[#4A34A5] py-4">
          <Text className="text-sm font-semibold text-white">Pay for Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

