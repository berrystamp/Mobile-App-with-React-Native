import React from 'react';
import { Image, Text, View } from 'react-native';

export type ReferralHistoryItemModel = {
  id: string;
  name: string;
  amount: string;
  date: string;
  status: 'PENDING' | 'COMPLETED';
  avatar?: string;
};

export default function ReferralHistoryItem({ item }: { item: ReferralHistoryItemModel }) {
  return (
    <View className="mb-3 flex-row items-center">
      <Image
        source={{ uri: item.avatar || 'https://i.pravatar.cc/100?img=13' }}
        className="h-10 w-10 rounded-full"
      />
      <View className="ml-3 flex-1">
        <Text className="text-base font-medium text-[#2A2732]" numberOfLines={1}>{item.name}</Text>
        <Text className="mt-1 text-xs text-[#8E8A9B]">{item.amount} • {item.date}</Text>
      </View>
      <View className={`rounded-full px-3 py-1 ${item.status === 'COMPLETED' ? 'bg-[#E6F8ED]' : 'bg-[#FFF2E2]'}`}>
        <Text className={`text-xs font-medium ${item.status === 'COMPLETED' ? 'text-[#1FAF5B]' : 'text-[#EB8C23]'}`}>
          {item.status === 'COMPLETED' ? 'Completed' : 'Pending'}
        </Text>
      </View>
    </View>
  );
}
