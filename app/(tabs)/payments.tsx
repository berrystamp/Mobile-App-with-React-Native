import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import { formatNaira } from '@/lib/currency';
import ApiService from '@/services/apiClient';

export default function PaymentsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [walletResponse, historyResponse] = await Promise.all([
          ApiService.getWallet().catch(() => null),
          ApiService.getWalletHistory().catch(() => null),
        ]);
        setWallet(walletResponse?.responseBody || walletResponse || null);
        setHistory(historyResponse?.responseBody?.content || historyResponse?.responseBody || historyResponse?.content || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalEarned = Number(wallet?.balance || 0);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <View className="flex-1 px-6 pt-12">
        <View className="mb-6 flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text className="text-base font-medium text-[#2B2833] dark:text-white">Payments</Text>
          <View style={{ width: 24 }} />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/sp-1')}
          className="mb-6 flex-row items-center justify-between rounded-2xl bg-[#EEE9FF] px-4 py-4 dark:bg-[#28233D]">
          <View>
            <Text className="text-sm font-semibold text-[#4A34A7] dark:text-[#CDC4FF]">Sponsored payment flow</Text>
            <Text className="mt-1 text-xs text-[#817A95] dark:text-[#A79FC8]">Open the full 11-screen sponsored payment journey</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#CDC4FF' : '#4A34A7'} />
        </TouchableOpacity>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4732A1" />
          </View>
        ) : (
          <>
            <View className="mb-8 items-center">
              <Text className="text-sm text-[#A09BAE] dark:text-gray-400">Total Earned</Text>
              <Text className="mt-2 text-4xl font-semibold text-[#2B2833] dark:text-white">{formatNaira(totalEarned)}</Text>
              <View className="mt-5 flex-row">
                <View className="mx-4 items-center">
                  <Text className="text-sm text-[#A09BAE] dark:text-gray-400">Total Charges</Text>
                  <Text className="mt-1 text-base font-semibold text-[#2B2833] dark:text-white">
                    {formatNaira(
                      history
                        .filter((item) => String(item.type).toUpperCase() === 'DEBIT')
                        .reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0),
                    )}
                  </Text>
                </View>
                <View className="mx-4 items-center">
                  <Text className="text-sm text-[#A09BAE] dark:text-gray-400">Credits</Text>
                  <Text className="mt-1 text-base font-semibold text-[#2B2833] dark:text-white">
                    {formatNaira(
                      history
                        .filter((item) => String(item.type).toUpperCase() === 'CREDIT')
                        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    )}
                  </Text>
                </View>
              </View>
            </View>

            <FlatList
              data={history}
              keyExtractor={(item, index) => String(item.id || index)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListEmptyComponent={
                <Text className="text-center text-sm text-[#8A8694] dark:text-gray-400">No payment history yet.</Text>
              }
              renderItem={({ item }) => (
                <View className="mb-5 flex-row items-start">
                  <View className="mr-3 mt-1 h-2.5 w-2.5 rounded-full bg-[#2970FF]" />
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-[#2F2A36] dark:text-white">{item.description || 'Wallet transaction'}</Text>
                        <Text className="mt-1 text-xs text-[#B2AEBB] dark:text-gray-500">{item.reference || 'Wallet'}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-semibold text-[#4A34A7]">{formatNaira(Number(item.amount || 0))}</Text>
                        <Text className="mt-1 text-xs text-[#B2AEBB] dark:text-gray-500">{String(item.type || 'Wallet')}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
