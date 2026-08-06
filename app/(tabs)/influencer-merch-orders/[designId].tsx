import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppAlert } from '@/components/common/AppAlert';
import { formatNaira } from '@/lib/currency';
import { normalizeInfluencerMerchOrderListResponse } from '@/lib/orders';
import ApiService from '@/services/apiClient';
import type { InfluencerMerchOrderItem, InstantOrderStatus } from '@/types';

const STATUS_COLOR: Record<InstantOrderStatus, string> = {
  ACTIVE: '#4D44B5',
  COMPLETED: '#22B573',
  CANCELLED: '#FF5B5B',
};
const STATUS_BG: Record<InstantOrderStatus, string> = {
  ACTIVE: '#EEF0FF',
  COMPLETED: '#E8F8EF',
  CANCELLED: '#FFF0F0',
};
const STATUS_LABEL: Record<InstantOrderStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Drill-down from the grouped Manage Orders screen: every customer's
// instant-checkout order for one specific Influencer Merch design.
export default function InfluencerMerchDesignOrdersScreen() {
  const isDark = useColorScheme() === 'dark';
  const { designId } = useLocalSearchParams<{ designId: string }>();
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<InfluencerMerchOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { show: showAlert, element: alertElement } = useAppAlert();

  const theme = {
    background: isDark ? '#121212' : '#F7F6FC',
    card: isDark ? '#1A1A1A' : '#FFFFFF',
    border: isDark ? '#2E2E2E' : '#E6E3EC',
    text: isDark ? '#FFFFFF' : '#2E2C35',
    subtext: isDark ? '#A4A0AE' : '#8D8A95',
    muted: isDark ? '#908A9B' : '#B7B4BE',
    inputBg: isDark ? '#1E1E1E' : '#FFFFFF',
    shadow: isDark ? '#000' : '#D7D1E6',
    avatarBg: isDark ? '#2A2A2A' : '#F0EEF9',
  };

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (!designId) return;
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getInfluencerMerchDesignOrders(designId, { page: 0, size: 50 });
      setOrders(normalizeInfluencerMerchOrderListResponse(response));
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Unable to load orders',
        message: error?.response?.data?.responseMessage || error?.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [designId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(true);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) => (order.username + ' ' + order.itemOrdered).toLowerCase().includes(query));
  }, [orders, search]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Manage order</Text>
          <Text style={styles.headerCount}>{filteredOrders.length} order</Text>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
          <Ionicons name="search-outline" size={18} color={theme.subtext} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Order"
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.muted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D44B5" />}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#4D44B5" style={styles.loader} />
          ) : filteredOrders.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Ionicons name="receipt-outline" size={36} color={theme.subtext} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders for this design yet</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.88}
                onPress={() =>
                  router.push({
                    pathname: '/influencer-merch-orders/[orderId]' as any,
                    params: { orderId: String(order.id) },
                  })
                }
                style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, borderColor: theme.border }]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.userRow}>
                    {order.avatarUrl ? (
                      <Image source={{ uri: order.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: theme.avatarBg, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="person" size={16} color={theme.muted} />
                      </View>
                    )}
                    <Text style={[styles.username, { color: theme.text }]}>@{order.username}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[order.status] }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[order.status] }]}>{STATUS_LABEL[order.status]}</Text>
                  </View>
                </View>
                <Text style={[styles.itemTitle, { color: theme.text }]}>{order.itemOrdered}</Text>
                <View style={styles.metaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: theme.subtext }]}>Quantity</Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>{order.quantity} Item{order.quantity > 1 ? 's' : ''}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: theme.subtext }]}>Amount</Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>{formatNaira(order.amount)}</Text>
                  </View>
                </View>
                <View style={styles.metaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: theme.subtext }]}>Date Initiated</Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>{order.dateInitiated}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: theme.subtext }]}>Due Date</Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>{order.dueDate}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
      {alertElement}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, minHeight: 44 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginLeft: -40 },
  headerCount: { fontSize: 14, fontWeight: '700', color: '#4D44B5' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, height: 48, paddingHorizontal: 14, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8 },
  scrollContent: { paddingTop: 4, paddingBottom: 40 },
  loader: { marginTop: 60 },
  emptyState: { alignItems: 'center', borderRadius: 16, borderWidth: 1, marginTop: 40, padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  card: { borderRadius: 16, marginBottom: 12, padding: 14, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  username: { fontSize: 13, fontWeight: '600' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  metaGrid: { flexDirection: 'row', marginBottom: 8 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 11, marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '600' },
});