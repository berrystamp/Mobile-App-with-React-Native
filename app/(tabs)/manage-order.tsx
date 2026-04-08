import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatNaira } from '@/lib/currency';
import { normalizeManageOrderListResponse } from '@/lib/orders';
import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';
import type { ManageOrderItem, ManageOrderStatus } from '@/types';

const FILTERS: ('All order' | ManageOrderStatus)[] = ['All order', 'Active', 'Completed', 'Canceled'];

const STATUS_COLOR: Record<ManageOrderStatus, string> = {
  Active: '#4D44B5',
  Completed: '#22B573',
  Canceled: '#FF5B5B',
};

export default function ManageOrderScreen() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const role = useAuthStore((state) => state.role);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('All order');
  const [orders, setOrders] = useState<ManageOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getManageOrders({
          profileType: toProfileType(role),
        });
        setOrders(normalizeManageOrderListResponse(response));
      } catch (error: any) {
        Alert.alert('Unable to load orders', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [role]);

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    border: isDark ? '#2E2E2E' : '#E6E3EC',
    text: isDark ? '#FFFFFF' : '#2E2C35',
    subtext: isDark ? '#A4A0AE' : '#8D8A95',
    muted: isDark ? '#908A9B' : '#B7B4BE',
    shadow: isDark ? '#000000' : '#D7D1E6',
    pill: isDark ? '#24212B' : '#F5F3FA',
    pillActive: '#4D44B5',
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'All order' || order.status === activeFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || `${order.title} ${order.shopName} ${order.code}`.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, orders, search]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.screen, { backgroundColor: theme.background, paddingBottom: 92 + insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Manage order</Text>
          <Text style={styles.headerCount}>{filteredOrders.length} order</Text>
        </View>

        <View style={[styles.searchWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Ionicons name="search-outline" size={18} color={theme.subtext} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Order"
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading ? <ActivityIndicator size="large" color="#4D44B5" style={styles.loader} /> : null}
          {!loading && !filteredOrders.length ? (
            <View style={[styles.emptyState, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="receipt-outline" size={28} color={theme.subtext} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders found</Text>
              <Text style={[styles.emptyText, { color: theme.subtext }]}>Try another filter or search term.</Text>
            </View>
          ) : null}

          {filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              activeOpacity={0.92}
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
              style={[styles.orderCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
              <View style={styles.orderRow}>
                <View style={[styles.orderIcon, { backgroundColor: isDark ? '#2A2A2A' : '#F4F2FB' }]}>
                  <Ionicons name="print-outline" size={22} color="#4D44B5" />
                </View>
                <View style={styles.orderContent}>
                  <View style={styles.orderTopRow}>
                    <Text style={[styles.orderTitle, { color: theme.text }]}>{order.title}</Text>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[order.status] }]}>{order.status}</Text>
                  </View>
                  <Text style={[styles.orderMeta, { color: theme.subtext }]}>{order.shopName} | {formatNaira(order.amount)}</Text>
                  <Text style={[styles.orderCode, { color: theme.muted }]}>{order.code}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.filterBar, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, 16) }]}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.85}
                style={[
                  styles.filterPill,
                  { backgroundColor: theme.pill },
                  isActive && [styles.filterPillActive, { backgroundColor: theme.pillActive }],
                ]}>
                <Text style={[styles.filterText, { color: theme.subtext }, isActive && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    minHeight: 40,
  },
  backButton: {
    left: 0,
    paddingVertical: 4,
    position: 'absolute',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  headerCount: {
    color: '#4D44B5',
    fontSize: 15,
    fontWeight: '500',
    position: 'absolute',
    right: 0,
  },
  searchWrap: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  orderCard: {
    borderRadius: 20,
    elevation: 5,
    marginBottom: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },
  orderRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  orderIcon: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 14,
    width: 44,
  },
  orderContent: {
    flex: 1,
  },
  orderTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  orderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  orderCode: {
    fontSize: 12,
    marginTop: 4,
  },
  filterBar: {
    borderTopColor: 'rgba(141,138,149,0.25)',
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  filterPill: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: 12,
  },
  filterPillActive: {},
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 6,
  },
});
