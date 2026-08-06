import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { normalizeInfluencerMerchDesignListResponse } from '@/lib/orders';
import ApiService from '@/services/apiClient';
import type { InfluencerMerchDesignSummary, InstantOrderStatus } from '@/types';

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

// Printer-facing Influencer Merch order management: instant-checkout orders
// are grouped by design here rather than listed one-by-one like negotiated
// print requests (see manage-order.tsx for that flow).
export default function InfluencerMerchOrdersScreen() {
  const isDark = useColorScheme() === 'dark';
  const [search, setSearch] = useState('');
  const [designs, setDesigns] = useState<InfluencerMerchDesignSummary[]>([]);
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
    inputBgImg: isDark ? '#2A2A2A' : '#F0EEF9',
  };

  const loadDesigns = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getInfluencerMerchDesigns({ page: 0, size: 50 });
      setDesigns(normalizeInfluencerMerchDesignListResponse(response));
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
  }, []);

  useEffect(() => { loadDesigns(); }, [loadDesigns]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDesigns(true);
  }, [loadDesigns]);

  const filteredDesigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return designs;
    return designs.filter((design) =>
      (design.designName + ' ' + design.influencerName).toLowerCase().includes(query)
    );
  }, [designs, search]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Manage order</Text>
          <Text style={styles.headerCount}>{filteredDesigns.length} order</Text>
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
          ) : filteredDesigns.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <MaterialCommunityIcons name="crown-outline" size={36} color={theme.subtext} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Influencer Merch orders</Text>
              <Text style={[styles.emptyText, { color: theme.subtext }]}>
                {search ? 'Try a different search term.' : 'Orders for your assigned Influencer Merch designs will show up here.'}
              </Text>
            </View>
          ) : (
            filteredDesigns.map((design) => (
              <TouchableOpacity
                key={design.designId}
                activeOpacity={0.88}
                onPress={() => router.push({ pathname: '/influencer-merch-orders/[designId]' as any, params: { designId: String(design.designId) } })}
                style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, borderColor: theme.border }]}
              >
                <View style={styles.cardRow}>
                  {design.designPreviewUrl ? (
                    <Image source={{ uri: design.designPreviewUrl }} style={[styles.avatar, { backgroundColor: theme.inputBgImg }]} />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: theme.inputBgImg, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="image-outline" size={18} color={theme.muted} />
                    </View>
                  )}
                  <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        <MaterialCommunityIcons name="crown" size={13} color="#F9A70D" />
                        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{design.designName}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[design.status] }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLOR[design.status] }]}>{STATUS_LABEL[design.status]}</Text>
                      </View>
                    </View>
                    <Text style={[styles.cardMeta, { color: theme.subtext }]} numberOfLines={1}>
                      {design.totalOrders} Orders · {design.influencerName}
                    </Text>
                    <Text style={[styles.cardMeta, { color: theme.subtext }]}>{formatNaira(design.amount)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.muted} />
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
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptyText: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  card: { borderRadius: 16, marginBottom: 12, padding: 14, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 10, marginRight: 12 },
  cardContent: { flex: 1, marginRight: 8 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { fontSize: 12, marginBottom: 2 },
});