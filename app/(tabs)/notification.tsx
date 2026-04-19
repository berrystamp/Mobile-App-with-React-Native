import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, FlatList, Text,
  TouchableOpacity, View, useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- Imported from here instead
import ApiService from '@/services/apiClient';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
};

function normalizeDate(value?: string) {
  if (!value) return 'Now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const now = new Date();
  const diff = now.getTime() - parsed.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  if (diff < minute) return 'Now';
  if (diff < hour) return Math.floor(diff / minute) + 'm ago';
  if (diff < 24 * hour) return Math.floor(diff / hour) + 'h ago';
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
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [markingAll, setMarkingAll] = useState(false);

  const bg = isDark ? '#121212' : '#FAFAFC';
  const text = isDark ? '#FFFFFF' : '#1E1E1E';
  const subtext = isDark ? '#A0A0A0' : '#6B6880';
  const primary = '#4732A1';

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNotifications();
      const content =
        response?.responseBody?.content ||
        response?.responseBody ||
        response?.content ||
        response?.data || [];
      const normalized = (Array.isArray(content) ? content : [])
        .map((item: any, index: number) => ({
          id: Number(item.id ?? index + 1),
          title: String(item.title || item.subject || 'Notification'),
          message: String(item.message || item.body || item.description || item.title || ''),
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

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const markAsRead = useCallback(async (item: NotificationItem) => {
    if (item.read) return;
    setItems((prev) => prev.map((e) => (e.id === item.id ? { ...e, read: true } : e)));
    try {
      await ApiService.markNotificationAsRead(item.id);
    } catch {
      setItems((prev) => prev.map((e) => (e.id === item.id ? { ...e, read: false } : e)));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    setItems((prev) => prev.map((e) => ({ ...e, read: true })));
    try {
      await ApiService.markAllNotificationsAsRead();
    } catch {
      // revert on failure
      loadNotifications();
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, unreadCount, loadNotifications]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#1E1E1E' : '#F4F2FB', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={20} color={text} />
          </TouchableOpacity>

          <Text style={{ fontSize: 18, fontWeight: '600', color: text }}>Notifications</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <View style={{ backgroundColor: primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{unreadCount}</Text>
              </View>
            )}
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} disabled={markingAll} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: isDark ? '#2A2A2A' : '#F4F2FB', borderRadius: 10 }}>
                <Text style={{ color: primary, fontSize: 12, fontWeight: '600' }}>
                  {markingAll ? 'Marking...' : 'Mark all'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="notifications-outline" size={72} color={isDark ? '#555' : '#BCBBC3'} />
            <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: text, textAlign: 'center' }}>No notifications yet</Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: subtext, textAlign: 'center', lineHeight: 20 }}>
              You&apos;ll be notified about activity on your account here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => markAsRead(item)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row', alignItems: 'flex-start',
                  backgroundColor: item.read ? 'transparent' : isDark ? '#1A1630' : '#F5F3FF',
                  borderRadius: 14, padding: 12, marginBottom: 8,
                  borderWidth: item.read ? 0 : 1,
                  borderColor: item.read ? 'transparent' : isDark ? '#3A2D6A' : '#DDD8F8',
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 19,
                  backgroundColor: item.read ? isDark ? '#2A2A2A' : '#F4F2FB' : isDark ? '#2A2147' : '#EDE8FF',
                  alignItems: 'center', justifyContent: 'center', marginRight: 12,
                }}>
                  <Ionicons name={iconByType(item.type)} size={18} color={item.read ? subtext : primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={{ fontSize: 13, fontWeight: item.read ? '400' : '600', color: item.read ? subtext : text, flex: 1, marginRight: 8, lineHeight: 18 }}>
                      {item.message || item.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: subtext, marginTop: 1 }}>{item.createdAt}</Text>
                  </View>
                  {!item.read && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: primary }} />
                      <Text style={{ fontSize: 11, color: primary, fontWeight: '500' }}>Tap to mark as read</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}