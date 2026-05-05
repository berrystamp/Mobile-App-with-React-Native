import ApiService from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
  rawDate: Date;
  avatar?: string;
};

type FilterTab = 'All' | 'Read' | 'Unread';

function normalizeDate(value?: string): { label: string; raw: Date } {
  const raw = value ? new Date(value) : new Date();
  if (Number.isNaN(raw.getTime())) return { label: value || 'Now', raw: new Date() };
  const now = new Date();
  const diff = now.getTime() - raw.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  let label: string;
  if (diff < minute) label = 'Now';
  else if (diff < hour) label = Math.floor(diff / minute) + 'm ago';
  else if (diff < day) label = Math.floor(diff / hour) + 'h ago';
  else label = raw.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { label, raw };
}

function typeLabel(type: string): string {
  if (type.includes('PROFILE')) return 'PROFILE';
  if (type.includes('MESSAGE') || type.includes('CHAT')) return 'MESSAGE';
  if (type.includes('ORDER')) return 'ORDER';
  if (type.includes('DELIVER')) return 'DELIVERY';
  return type.split('_')[0] || 'NOTICE';
}

function iconByType(type: string): { name: keyof typeof Ionicons.glyphMap; bg: string; color: string } {
  if (type.includes('PROFILE')) return { name: 'person-circle-outline', bg: '#EDE8FF', color: '#4732A1' };
  if (type.includes('MESSAGE') || type.includes('CHAT')) return { name: 'mail-outline', bg: '#E8F4FF', color: '#2F80ED' };
  if (type.includes('ORDER')) return { name: 'cube-outline', bg: '#FFF3E8', color: '#F2994A' };
  if (type.includes('DELIVER')) return { name: 'bicycle-outline', bg: '#E8FFF3', color: '#27AE60' };
  return { name: 'notifications-outline', bg: '#F4F2FB', color: '#4732A1' };
}

function groupByRecency(items: NotificationItem[]): { title: string; data: NotificationItem[] }[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  const newItems: NotificationItem[] = [];
  const thisWeekItems: NotificationItem[] = [];
  const olderItems: NotificationItem[] = [];

  items.forEach((item) => {
    if (item.rawDate >= startOfToday) {
      newItems.push(item);
    } else if (item.rawDate >= startOfWeek) {
      thisWeekItems.push(item);
    } else {
      olderItems.push(item);
    }
  });

  const sections: { title: string; data: NotificationItem[] }[] = [];
  if (newItems.length) sections.push({ title: 'New', data: newItems });
  if (thisWeekItems.length) sections.push({ title: 'This Week', data: thisWeekItems });
  if (olderItems.length) sections.push({ title: 'Earlier', data: olderItems });
  return sections;
}

export default function NotificationScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  // Theme
  const bg = isDark ? '#0F0F13' : '#FFFFFF';
  const surface = isDark ? '#1A1A22' : '#FFFFFF';
  const border = isDark ? '#2A2A35' : '#F0EFF5';
  const text = isDark ? '#FFFFFF' : '#1A1A1A';
  const subtext = isDark ? '#9090A0' : '#7A7A8A';
  const sectionHeaderBg = isDark ? '#0F0F13' : '#FFFFFF';
  const primary = '#4732A1';
  const unreadBg = isDark ? '#1C1830' : '#F7F5FF';
  const unreadBorder = isDark ? '#352D6A' : '#E5E0FF';

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
        .map((item: any, index: number) => {
          const { label, raw } = normalizeDate(item.createdAt || item.createdDate || item.updatedAt);
          return {
            id: Number(item.id ?? index + 1),
            title: String(item.title || item.subject || 'Notification'),
            message: String(item.message || item.body || item.description || item.title || ''),
            read: Boolean(item.read || item.isRead),
            type: String(item.type || item.category || 'GENERAL').toUpperCase(),
            createdAt: label,
            rawDate: raw,
            avatar: item.avatar || item.senderAvatar || undefined,
          };
        })
        .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      setItems(normalized);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

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
      loadNotifications();
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, unreadCount, loadNotifications]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'Read') return items.filter((i) => i.read);
    if (activeTab === 'Unread') return items.filter((i) => !i.read);
    return items;
  }, [items, activeTab]);

  const sections = useMemo(() => groupByRecency(filteredItems), [filteredItems]);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const { name: iconName, bg: iconBg, color: iconColor } = iconByType(item.type);
    const label = typeLabel(item.type);

    return (
      <TouchableOpacity
        onPress={() => markAsRead(item)}
        activeOpacity={0.75}
        style={[
          styles.notifRow,
          {
            backgroundColor: item.read ? surface : unreadBg,
            borderColor: item.read ? border : unreadBorder,
          },
        ]}
      >
        {/* Avatar / Icon */}
        <View style={[styles.avatarWrap, { backgroundColor: isDark ? '#252535' : iconBg }]}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name={iconName} size={20} color={iconColor} />
          )}
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTopRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.notifTitle, { color: text }]} numberOfLines={2}>
                <Text style={[styles.notifTypeLabel, { color: primary }]}>{label}</Text>
                <Text style={{ color: isDark ? '#C0C0D0' : '#555' }}>{' | '}</Text>
                {item.title}
              </Text>
              <Text style={[styles.notifMessage, { color: subtext }]} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
            <Text style={[styles.notifDate, { color: subtext }]}>{item.createdAt}</Text>
          </View>
        </View>

        {/* Unread dot */}
        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: text }]}>Notification</Text>

          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <Text style={styles.unreadBadge}>{unreadCount}</Text>
            )}
          </View>
        </View>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            disabled={markingAll}
            style={styles.markAllRow}
          >
            <Text style={styles.markAllText}>
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : items.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIconWrap, { borderColor: isDark ? '#333' : '#D8D5E8' }]}>
              <Ionicons
                name="notifications-outline"
                size={52}
                color={isDark ? '#555' : '#C0BBDA'}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: text }]}>No notification yet</Text>
            <Text style={[styles.emptySubtitle, { color: subtext }]}>
              You will be updated about activities{'\n'}going on your account here.
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHeader, { backgroundColor: sectionHeaderBg }]}>
                <Text style={[styles.sectionTitle, { color: text }]}>{section.title}</Text>
              </View>
            )}
            renderItem={renderItem}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: border }]} />
            )}
          />
        )}

        {/* Bottom Filter Tabs */}
        {!loading && (
          <View style={[
            styles.tabBar,
            {
              backgroundColor: isDark ? '#16161E' : '#F5F4FA',
              borderTopColor: border,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            },
          ]}>
            {(['All', 'Read', 'Unread'] as FilterTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabItem,
                    isActive && { backgroundColor: primary },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? '#FFFFFF' : isDark ? '#9090A0' : '#7A7A8A' },
                      isActive && { fontWeight: '700' },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerRight: {
    width: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  unreadBadge: {
    color: '#2F80ED',
    fontSize: 15,
    fontWeight: '700',
  },
  markAllRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  markAllText: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notifContent: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notifTypeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginBottom: 3,
  },
  notifMessage: {
    fontSize: 11,
    lineHeight: 16,
  },
  notifDate: {
    fontSize: 10,
    marginTop: 1,
    flexShrink: 0,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
