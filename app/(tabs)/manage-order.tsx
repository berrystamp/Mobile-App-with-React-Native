import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,Dimensions,RefreshControl, ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatNaira } from '@/lib/currency';
import { normalizeManageOrderListResponse } from '@/lib/orders';
import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';
import type { ManageOrderItem, ManageOrderStatus } from '@/types';
import { useAppAlert } from '@/components/common/AppAlert';

// 2. Get the screen width
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'All' | ManageOrderStatus;
const FILTERS: FilterType[] = ['All', 'Active', 'Completed', 'Canceled'];

const STATUS_COLOR: Record<ManageOrderStatus, string> = {
  Active: '#4D44B5',
  Completed: '#22B573',
  Canceled: '#FF5B5B',
};

const STATUS_BG: Record<ManageOrderStatus, string> = {
  Active: '#EEF0FF',
  Completed: '#E8F8EF',
  Canceled: '#FFF0F0',
};

const STATUS_BG_DARK: Record<ManageOrderStatus, string> = {
  Active: '#1E1C3A',
  Completed: '#0D2A1A',
  Canceled: '#2A0D0D',
};

export default function ManageOrderScreen() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const role = useAuthStore((state) => state.role);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [orders, setOrders] = useState<ManageOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { show: showAlert, element: alertElement } = useAppAlert();

  const theme = {
    background: isDark ? '#121212' : '#F7F6FC',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    card: isDark ? '#1A1A1A' : '#FFFFFF',
    border: isDark ? '#2E2E2E' : '#E6E3EC',
    text: isDark ? '#FFFFFF' : '#2E2C35',
    subtext: isDark ? '#A4A0AE' : '#8D8A95',
    muted: isDark ? '#908A9B' : '#B7B4BE',
    pill: isDark ? '#2A2A2A' : '#F0EEF9',
    pillActive: '#4D44B5',
    inputBg: isDark ? '#1E1E1E' : '#FFFFFF',
    shadow: isDark ? '#000' : '#D7D1E6',
  };

  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getManageOrders({ profileType: toProfileType(role) });
      setOrders(normalizeManageOrderListResponse(response));
    } catch (error: any) {
      showAlert({ type: 'error', title: 'Unable to load orders', message: error?.response?.data?.responseMessage || error?.message || 'Please try again.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(true);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || (order.title + ' ' + order.shopName + ' ' + order.code).toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, orders, search]);

  const statusCount = useMemo(() => ({
    All: orders.length,
    Active: orders.filter((o) => o.status === 'Active').length,
    Completed: orders.filter((o) => o.status === 'Completed').length,
    Canceled: orders.filter((o) => o.status === 'Canceled').length,
  }), [orders]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
          <View style={[styles.countBadge, { backgroundColor: isDark ? '#2A2A2A' : '#EEF0FF' }]}>
            <Text style={[styles.countText, { color: theme.pillActive }]}>{filteredOrders.length}</Text>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
          <Ionicons name="search-outline" size={18} color={theme.subtext} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by order name or code"
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Orders List */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.pillActive} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#4D44B5" style={styles.loader} />
          ) : filteredOrders.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="receipt-outline" size={36} color={theme.subtext} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders found</Text>
              <Text style={[styles.emptyText, { color: theme.subtext }]}>
                {search ? 'Try a different search term.' : 'You have no orders yet.'}
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.88}
                onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
                style={[styles.orderCard, { backgroundColor: theme.card, shadowColor: theme.shadow, borderColor: theme.border }]}
              >
                <View style={styles.orderRow}>
                  <View style={[styles.orderIcon, { backgroundColor: isDark ? '#2A2A2A' : '#F4F2FB' }]}>
                    <Ionicons name="receipt-outline" size={20} color="#4D44B5" />
                  </View>
                  <View style={styles.orderContent}>
                    <View style={styles.orderTopRow}>
                      <Text style={[styles.orderTitle, { color: theme.text }]} numberOfLines={1}>{order.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: isDark ? STATUS_BG_DARK[order.status] : STATUS_BG[order.status] }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLOR[order.status] }]}>{order.status}</Text>
                      </View>
                    </View>
                    <Text style={[styles.orderMeta, { color: theme.subtext }]} numberOfLines={1}>
                      {order.shopName} {order.amount ? '· ' + formatNaira(order.amount) : ''}
                    </Text>
                    {order.code ? (
                      <Text style={[styles.orderCode, { color: theme.muted }]}>#{order.code}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.muted} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Fixed Bottom Filter Pills */}
      <View style={[
        styles.bottomFilterContainer, 
        { 
          backgroundColor: theme.surface, 
          borderTopColor: theme.border,
          marginBottom: insets.bottom + 80 
        }
      ]}>
        {/* 3. Changed ScrollView to a standard View */}
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
                style={[
                  styles.filterPill,
                  { backgroundColor: isActive ? theme.pillActive : theme.pill },
                ]}
              >
                <Text 
                  numberOfLines={1} 
                  adjustsFontSizeToFit // Allows text to slightly shrink if counts get big
                  style={[styles.filterText, { color: isActive ? '#FFFFFF' : theme.subtext, fontWeight: isActive ? '600' : '400' }]}
                >
                  {filter}
                  {statusCount[filter] > 0 ? '  ' + statusCount[filter] : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {alertElement}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, minHeight: 44 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, marginLeft: 4 },
  countBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { fontSize: 13, fontWeight: '700' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, height: 48, paddingHorizontal: 14, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8 },
  scrollContent: { paddingTop: 4, paddingBottom: 16 },
  orderCard: { borderRadius: 16, marginBottom: 12, padding: 14, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  orderRow: { flexDirection: 'row', alignItems: 'center' },
  orderIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  orderContent: { flex: 1, marginRight: 8 },
  orderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  orderTitle: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderMeta: { fontSize: 12, marginBottom: 2 },
  orderCode: { fontSize: 11 },
  loader: { marginTop: 60 },
  emptyState: { alignItems: 'center', borderRadius: 16, borderWidth: 1, marginTop: 40, padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptyText: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  
  bottomFilterContainer: {
    borderTopWidth: 1,
    width: '100%',
  },
  filterRow: { 
    flexDirection: 'row',
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    gap: 8, // 8px gap between pills
  },
  filterPill: { 
    // 4. Mathematical width logic: Total width - (horizontal padding: 40px) - (3 gaps of 8px: 24px) / 4 items
    width: (SCREEN_WIDTH - 40 - 24) / 4, 
    borderRadius: 20, 
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: { 
    fontSize: 12, 
    textAlign: 'center' 
  },
});