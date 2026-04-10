import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

function normalizeDate(value?: string) {
  if (!value) return 'Now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const now = new Date();
  const diff = now.getTime() - parsed.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;

  if (diff < minute) return 'Now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < 24 * hour) return `${Math.floor(diff / hour)}h ago`;

  return parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

function iconByType(type: string) {
  if (type.includes('DELIVER')) return 'bicycle-outline';
  if (type.includes('ORDER')) return 'cube-outline';
  if (type.includes('MESSAGE') || type.includes('CHAT')) return 'chatbubble-ellipses-outline';
  return 'notifications-outline';
}

export default function NotificationScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [tab, setTab] = useState<TabFilter>('all');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNotifications();
      const content = response?.responseBody?.content || response?.responseBody || response?.content || response?.data || [];
      const normalized = (Array.isArray(content) ? content : [])
        .map((item: any, index: number) => ({
          id: Number(item.id ?? index + 1),
          title: String(item.title || item.subject || 'Notification'),
          message: String(item.message || item.body || item.description || ''),
          read: Boolean(item.read || item.isRead),
          type: String(item.type || item.category || 'GENERAL').toUpperCase(),
          createdAt: normalizeDate(item.createdAt || item.createdDate || item.updatedAt),
        }))
        .sort((a, b) => Number(a.read) - Number(b.read));

      setItems(normalized);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const filteredItems = useMemo(() => {
    if (tab === 'read') return items.filter((item) => item.read);
    if (tab === 'unread') return items.filter((item) => !item.read);
    return items;
  }, [items, tab]);

  const { newItems, weekItems } = useMemo(() => {
    const currentNew = filteredItems.slice(0, Math.min(filteredItems.length, 2));
    const thisWeek = filteredItems.slice(currentNew.length);
    return { newItems: currentNew, weekItems: thisWeek };
  }, [filteredItems]);

  const markAsRead = useCallback(async (item: NotificationItem) => {
    if (item.read) return;
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
    try {
      await ApiService.markNotificationAsRead(item.id);
    } catch {
      setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, read: false } : entry)));
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFC] dark:bg-[#121212]">
      <View className="flex-1 px-5 pt-12">
        <View className="mb-5 flex-row items-center justify-between py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1E1E1E'} />
          </TouchableOpacity>
          <Text className="text-[22px] font-medium text-[#2B2833] dark:text-white">Notification</Text>
          <Text className="text-[20px] font-medium text-[#2D71E3]">{unreadCount}</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4732A1" />
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="notifications-outline" size={130} color={isDark ? '#8B8B8B' : '#BCBBC3'} />
            <Text className="mt-4 text-[36px] font-medium text-[#2B2833] dark:text-white">No notification yet</Text>
            <Text className="mt-4 text-center text-[20px] leading-8 text-[#8C8798] dark:text-gray-400">
              You will be updated about activities going on your account here
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={[...(newItems.length ? [{ section: 'New', data: newItems }] : []), ...(weekItems.length ? [{ section: 'This Week', data: weekItems }] : [])]}
              keyExtractor={(item) => item.section}
              contentContainerStyle={{ paddingBottom: 116 }}
              renderItem={({ item }) => (
                <View className="mb-4">
                  <Text className="mb-3 text-[30px] font-medium text-[#2F2B38] dark:text-white">{item.section}</Text>
                  {item.data.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      onPress={() => markAsRead(notification)}
                      className={`mb-2 flex-row items-start rounded-xl px-2 py-3 ${notification.read ? 'opacity-45' : ''}`}>
                      <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full bg-[#F3EEFF] dark:bg-[#2A2147]">
                        <Ionicons name={iconByType(notification.type)} size={17} color="#6A4AE2" />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between">
                          <Text className="mr-2 flex-1 text-[22px] leading-7 text-[#2B2833] dark:text-white">{notification.message || notification.title}</Text>
                          <Text className="text-[16px] text-[#AAA5B2] dark:text-gray-500">{notification.createdAt}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            <View className="absolute bottom-6 left-6 right-6 rounded-full bg-[#F1EFF8] p-1.5 dark:bg-[#1E1E1E]">
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
    <TouchableOpacity onPress={onPress} className={`flex-1 items-center rounded-full py-3.5 ${active ? 'bg-[#4A3298]' : ''}`}>
      <Text className={`text-[16px] font-medium ${active ? 'text-white' : 'text-[#5B53B3]'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
