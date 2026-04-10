import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/lib/theme/appTheme';
import ApiService from '@/services/apiClient';

type TrackingStage = {
  title: string;
  at: string;
  done: boolean;
};

type TrackingOrder = {
  title: string;
  orderRef: string;
  timelineStart: string;
  timelineEnd: string;
  stages: TrackingStage[];
  latitude?: number;
  longitude?: number;
};

function mapOrder(order: any): TrackingOrder {
  const events = Array.isArray(order?.trackingEvents)
    ? order.trackingEvents
    : Array.isArray(order?.events)
      ? order.events
      : [];
  const status = String(order?.status || '').toUpperCase();

  const fallbackStages: TrackingStage[] = [
    { title: 'Item pickup via dispatcher rider from customer', at: String(order?.createdAt || order?.orderDate || ''), done: true },
    { title: "Item delivered by dispatcher rider to printer's office", at: String(order?.updatedAt || order?.processingAt || ''), done: true },
    { title: 'Printer indicated job completion of item', at: String(order?.completedAt || ''), done: ['COMPLETED', 'DELIVERED'].includes(status) },
    { title: 'Order on its way to customer', at: String(order?.deliveryStartedAt || ''), done: ['SHIPPED', 'DELIVERED'].includes(status) },
  ];

  const stages = events.length
    ? events.map((item: any) => ({
        title: String(item.description || item.title || item.status || 'Order update'),
        at: String(item.createdAt || item.time || item.timestamp || ''),
        done: item.done === undefined ? true : Boolean(item.done),
      }))
    : fallbackStages;

  const first = stages[0]?.at || '';
  const last = stages[stages.length - 1]?.at || '';

  return {
    title: String(order?.designName || order?.title || order?.itemName || 'Order tracking'),
    orderRef: String(order?.orderNumber || order?.trackingNumber || order?.id || ''),
    timelineStart: first,
    timelineEnd: last,
    stages,
    latitude: Number(order?.deliveryAddress?.latitude || order?.latitude || order?.currentLat || 0) || undefined,
    longitude: Number(order?.deliveryAddress?.longitude || order?.longitude || order?.currentLong || 0) || undefined,
  };
}

function formatDate(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('en-CA')} ${date.toLocaleTimeString('en-US', { hour12: false })}`;
}

export default function TrackOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  const canSubmit = trackingNumber.trim().length > 0;
  const completedStages = order?.stages.filter((stage) => stage.done).length || 0;
  const totalStages = order?.stages.length || 1;
  const progressWidth = `${Math.max(completedStages / totalStages, 0.08) * 100}%`;

  const mapCoordinates = useMemo(() => {
    if (!order?.latitude || !order?.longitude) return 'Location not available yet';
    return `Lat: ${order.latitude.toFixed(5)} | Long: ${order.longitude.toFixed(5)}`;
  }, [order?.latitude, order?.longitude]);

  const handleTrack = async () => {
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      setSearched(true);
      const response = await ApiService.findOrderByTrackingNumber(trackingNumber);
      setOrder(response ? mapOrder(response) : null);
      setMapVisible(false);
    } catch (error: any) {
      setOrder(null);
      Alert.alert('Unable to track order', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Track Order</Text>
        <Text style={[styles.headerCount, { color: theme.primary }]}>{order ? '1 order' : '0 order'}</Text>
      </View>

      {!searched || (!order && !loading) ? (
        <View style={styles.searchWrap}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Input order tracking number to track your order</Text>
          <Text style={[styles.heroText, { color: theme.textMuted }]}>
            Your tracking number is a unique key sent to your email immediately after an order is placed.
          </Text>

          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={setTrackingNumber}
            placeholder="e.g. TRK-12345678"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={trackingNumber}
          />

          {!order && searched ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: theme.surfaceMuted }]}>
                <Ionicons name="alert-circle" size={52} color="#EF4444" />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Order not found</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                We couldn&apos;t find an order with this number. Please check the number and try again.
              </Text>
            </View>
          ) : null}

          <View style={styles.footerButtonWrap}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!canSubmit || loading}
              onPress={handleTrack}
              style={[
                styles.primaryButton,
                { backgroundColor: !canSubmit || loading ? theme.border : theme.primary },
              ]}>
              {loading ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>Track Order</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.resultsWrap}>
          <View style={[styles.orderCard, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.orderTitle, { color: theme.text }]}>{order?.title}</Text>
            <Text style={[styles.orderRef, { color: theme.textMuted }]}>#{order?.orderRef}</Text>
          </View>

          <View style={[styles.progressCard, { backgroundColor: theme.surface }]}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.progressStart, { color: theme.primary }]}>{formatDate(order?.timelineStart)}</Text>
              <Text style={[styles.progressEnd, { color: theme.textMuted }]}>{formatDate(order?.timelineEnd)}</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { backgroundColor: theme.primary, width: progressWidth }]} />
            </View>
          </View>

          {mapVisible ? (
            <View style={[styles.mapCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.mapIconWrap, { backgroundColor: theme.surfaceMuted }]}>
                <Ionicons name="location" size={34} color={theme.primary} />
              </View>
              <Text style={[styles.mapTitle, { color: theme.text }]}>Live courier location</Text>
              <Text style={[styles.mapCoords, { color: theme.textMuted }]}>{mapCoordinates}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.timelineContent} style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
              {order?.stages.map((stage, index) => {
                const isLast = index === order.stages.length - 1;
                return (
                  <View key={`${stage.title}-${index}`} style={styles.timelineRow}>
                    <View style={styles.timelineRail}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: stage.done ? theme.primary : theme.surface,
                            borderColor: stage.done ? theme.primary : theme.border,
                          },
                        ]}>
                        {stage.done ? <Ionicons name="checkmark" size={11} color={theme.onPrimary} /> : null}
                      </View>
                      {!isLast ? <View style={[styles.timelineLine, { backgroundColor: stage.done ? theme.primary : theme.border }]} /> : null}
                    </View>
                    <View style={styles.timelineTextWrap}>
                      <Text style={[styles.timelineDate, { color: theme.textMuted }]}>{formatDateTime(stage.at)}</Text>
                      <Text style={[styles.timelineTitle, { color: stage.done ? theme.text : theme.textMuted }]}>{stage.title}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={[styles.bottomAction, { backgroundColor: theme.background }]}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setMapVisible((prev) => !prev)} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
              <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>{mapVisible ? 'Back to timeline' : 'View on Map'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  headerCount: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 64,
    textAlign: 'right',
  },
  searchWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    textAlign: 'center',
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 17,
    marginTop: 28,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 56,
    paddingHorizontal: 16,
  },
  emptyIconWrap: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: 18,
    width: 96,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    textAlign: 'center',
  },
  footerButtonWrap: {
    marginTop: 'auto',
    paddingBottom: 8,
    paddingTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  resultsWrap: {
    flex: 1,
  },
  orderCard: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  orderRef: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  progressCard: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressStart: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressEnd: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  mapCard: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    margin: 20,
    paddingHorizontal: 24,
  },
  mapIconWrap: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 18,
    width: 80,
  },
  mapTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  mapCoords: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  timelineScroll: {
    flex: 1,
  },
  timelineContent: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineRail: {
    alignItems: 'center',
    marginRight: 18,
  },
  timelineDot: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
    zIndex: 1,
  },
  timelineLine: {
    flex: 1,
    marginVertical: 4,
    width: 2,
  },
  timelineTextWrap: {
    flex: 1,
    paddingBottom: 28,
    paddingTop: 1,
  },
  timelineDate: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  timelineTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
