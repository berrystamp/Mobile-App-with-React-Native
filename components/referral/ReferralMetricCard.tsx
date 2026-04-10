import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
};

export default function ReferralMetricCard({ label, value }: Props) {
  return (
    <View className="flex-1 rounded-xl bg-[#F5F4F9] px-2 py-3">
      <Text className="text-center text-[11px] text-[#8E8A9B]" numberOfLines={1}>{label}</Text>
      <Text className="mt-1 text-center text-lg font-semibold text-[#26222E]">{value}</Text>
    </View>
  );
}
