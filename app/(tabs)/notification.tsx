import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import ApiService from '@/services/apiClient';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
};

type TabFilter = 'all' | 'read' | 'unread';

const fallbackNotifications: NotificationItem[] = [
  { id: 1, title: 'PROFILE | Welcome to Berrystamp', message: 'Your account setup is completed successfully.', read: false, type: 'PROFILE', createdAt: 'Mar 10' },
  { id: 2, title: 'MESSAGE | From Mohh_Jumju', message: 'Sarah sent you a message about your custom design request.', read: false, type: 'MESSAGE', createdAt: 'Mar 10' },
  { id: 3, title: 'ORDER | Your print order has been confirmed', message: 'Order #12345 is now being processed and will be shipped soon.', read: true, type: 'ORDER', createdAt: 'Mar 10' },
  { id: 4, title: 'DELIVERY | From dispatcher rider', message: 'Item delivered by dispatcher rider to printer’s office.', read: true, type: 'DELIVERY', createdAt: 'Mar 10' },
];

export default function NotificationScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [tab, setTab] = useState<TabFilter>('all');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getNotifications();
        const content = response?.responseBody?.content || response?.content || response?.data || [];
        const normalized = Array.isArray(content)
          ? content.map((item: any, index: number) => ({
              id: Number(item.id ?? index + 1),
              title: item.title || item.subject || 'Notification',
              message: item.message || item.body || '',
              read: Boolean(item.read),
              type: item.type || 'GENERAL',
              createdAt: item.createdAt || item.createdDate || 'Mar 10',
            }))
          : [];
        setItems(normalized.length ? normalized : fallbackNotifications);
      } catch {
        setItems(fallbackNotifications);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const filteredItems = useMemo(() => {
    if (tab === 'read') return items.filter((item) => item.read);
    if (tab === 'unread') return items.filter((item) => !item.read);
    return items;
  }, [items, tab]);

  const markAllAsRead = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await ApiService.markAllNotificationsAsRead();
    } catch {}
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <View className="flex-1 px-6 pt-12">
        <View className="mb-6 flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text className="text-base font-medium text-[#2B2833] dark:text-white">Notification</Text>
          <Text className="text-xs font-medium text-[#2D71E3]">{items.filter((item) => !item.read).length}</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4732A1" />
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="notifications-outline" size={92} color={isDark ? '#8B8B8B' : '#BCBBC3'} />
            <Text className="mt-5 text-[26px] font-medium text-[#2B2833] dark:text-white">No notification yet</Text>
            <Text className="mt-3 text-center text-sm leading-6 text-[#8C8798] dark:text-gray-400">
              You will be updated about activities going on your account here.
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={markAllAsRead} className="mb-4 self-end">
              <Text className="text-sm font-medium text-[#FF4C5A]">Mark all as read</Text>
            </TouchableOpacity>

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 110 }}
              renderItem={({ item, index }) => (
                <View className="mb-3">
                  {index === 0 ? (
                    <Text className="mb-2 text-xs font-medium text-[#6F6B78] dark:text-gray-400">{tab === 'all' ? 'New' : tab === 'read' ? 'Read' : 'Unread'}</Text>
                  ) : null}
                  <View className="flex-row">
                    <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full bg-[#F3EEFF] dark:bg-[#2A2147]">
                      <Ionicons
                        name={
                          item.type === 'MESSAGE'
                            ? 'mail-outline'
                            : item.type === 'ORDER'
                              ? 'cube-outline'
                              : item.type === 'DELIVERY'
                                ? 'bicycle-outline'
                                : 'person-outline'
                        }
                        size={16}
                        color="#6A4AE2"
                      />
                    </View>
                    <View className="flex-1 border-b border-[#F1EDF6] pb-3 dark:border-[#262626]">
                      <View className="flex-row items-start justify-between">
                        <Text className={`flex-1 text-[11px] font-semibold ${item.read ? 'text-[#6D67A6]' : 'text-[#4B33A2]'}`}>{item.title}</Text>
                        <Text className="ml-3 text-[10px] text-[#AAA5B2] dark:text-gray-500">{item.createdAt}</Text>
                      </View>
                      <Text className="mt-1 text-[11px] leading-4 text-[#777284] dark:text-gray-400">{item.message}</Text>
                    </View>
                  </View>
                </View>
              )}
            />

            <View className="absolute bottom-6 left-6 right-6 rounded-full bg-[#F4F0FF] p-1 dark:bg-[#1E1E1E]">
              <View className="flex-row">
                <FilterButton label="All" active={tab === 'all'} onPress={() => setTab('all')} />
                <FilterButton label="Read" active={tab === 'read'} onPress={() => setTab('read')} />
                <FilterButton label="Unread" active={tab === 'unread'} onPress={() => setTab('unread')} />
              </View>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className={`flex-1 items-center rounded-full py-3 ${active ? 'bg-[#4A3298]' : ''}`}>
      <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-[#5B53B3]'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
