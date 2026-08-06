import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppAlert } from '@/components/common/AppAlert';
import { formatNaira } from '@/lib/currency';
import { normalizeInfluencerMerchOrderDetails } from '@/lib/orders';
import ApiService from '@/services/apiClient';
import type { InfluencerMerchOrderDetails } from '@/types';

const countdownLabels = ['Days', 'Hours', 'Minutes', 'Seconds'];

function getCountdownParts(deliveryDate?: string): string[] {
  if (!deliveryDate) return ['00', '00', '00', '00'];
  const target = new Date(deliveryDate);
  if (isNaN(target.getTime())) return ['00', '00', '00', '00'];
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return ['00', '00', '00', '00'];
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return [days, hours, minutes, seconds].map((n) => String(n).padStart(2, '0'));
}

export default function InfluencerMerchOrderDetailsScreen() {
  const isDark = useColorScheme() === 'dark';
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<InfluencerMerchOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'deliver' | 'cancel' | null>(null);
  const [showMockup, setShowMockup] = useState(true);
  const [tick, setTick] = useState(0);
  const { show: showAlert, element: alertElement } = useAppAlert();

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    card: isDark ? '#1A1A1A' : '#FFFFFF',
    text: isDark ? '#F3F3F3' : '#1A1A1A',
    subtext: isDark ? '#A6A1B1' : '#6B6875',
    accent: '#4D44B5',
    danger: '#FF4B55',
    border: isDark ? '#2A2A2A' : '#EAEAEA',
  };

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await ApiService.getInfluencerMerchOrderById(orderId);
      setOrder(normalizeInfluencerMerchOrderDetails(response));
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Unable to load order',
        message: error?.response?.data?.responseMessage || error?.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  useEffect(() => {
    if (!order || order.status !== 'ACTIVE') return;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [order]);

  const countdownParts = useMemo(() => getCountdownParts(order?.deliveryDate), [order, tick]);

  const handleDeliver = () => {
    if (!order) return;
    showAlert({
      type: 'confirm',
      title: 'Deliver this order?',
      message: 'This marks the order as delivered and notifies the customer.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deliver',
          style: 'default',
          onPress: async () => {
            try {
              setBusy('deliver');
              await ApiService.deliverInfluencerMerchOrder(order.id);
              showAlert({ type: 'success', title: 'Order delivered' });
              loadOrder();
            } catch (error: any) {
              showAlert({
                type: 'error',
                title: 'Unable to deliver order',
                message: error?.response?.data?.responseMessage || error?.message || 'Please try again.',
              });
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    });
  };

  const handleCancel = () => {
    if (!order) return;
    showAlert({
      type: 'confirm',
      title: 'Cancel this order?',
      message: 'This cancels the order and notifies the customer. This action cannot be undone.',
      buttons: [
        { text: 'Keep order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy('cancel');
              await ApiService.cancelInfluencerMerchOrder(order.id);
              showAlert({ type: 'success', title: 'Order cancelled' });
              loadOrder();
            } catch (error: any) {
              showAlert({
                type: 'error',
                title: 'Unable to cancel order',
                message: error?.response?.data?.responseMessage || error?.message || 'Please try again.',
              });
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centeredWrap}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centeredWrap}>
          <Text style={{ color: theme.text, fontSize: 16 }}>Order not found.</Text>
        </View>
        {alertElement}
      </SafeAreaView>
    );
  }

  const detailRows: [string, string | React.ReactNode][] = [
    ['Description:', order.description],
    [
      'Influencer:',
      <View key="influencer" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <MaterialCommunityIcons name="crown" size={13} color="#F9A70D" />
        <Text style={{ color: theme.subtext, fontSize: 13, fontWeight: '500' }}>{order.influencerName}</Text>
      </View>,
    ],
    ['Order date:', order.orderDate],
    ['Expected delivery date:', order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-GB') : 'N/A'],
    ['Design amount (Printing Included):', formatNaira(order.designAmount)],
    ['Delivery amount:', formatNaira(order.deliveryAmount)],
    ['Delivery address:', order.deliveryAddress],
    ['Total amount:', formatNaira(order.totalAmount)],
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>ORD-{order.orderRef}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Countdown */}
        <View style={styles.countdownRow}>
          {countdownParts.map((part, index) => (
            <React.Fragment key={`${countdownLabels[index]}`}>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownValue}>{part}</Text>
                <Text style={[styles.countdownLabel, { color: theme.subtext }]}>{countdownLabels[index]}</Text>
              </View>
              {index < countdownParts.length - 1 && <Text style={styles.countdownColon}>:</Text>}
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.itemTitle, { color: theme.text }]}>{order.design.name}</Text>

        {/* Order details card */}
        <View style={[styles.detailsCard, { borderColor: theme.border }]}>
          <Text style={[styles.detailsTitle, { color: theme.text }]}>Order details</Text>
          {detailRows.map(([label, value], i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.subtext }]}>{label}</Text>
              {typeof value === 'string' ? (
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={2}>{value}</Text>
              ) : (
                value
              )}
            </View>
          ))}
        </View>

        {/* Design section */}
        <View style={[styles.designCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <View style={styles.designHeader}>
            <Text style={[styles.detailsTitle, { color: theme.text, marginBottom: 0 }]}>Design</Text>
            <TouchableOpacity onPress={() => setShowMockup((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '600' }}>
                {showMockup ? 'Hide' : 'Show'} Mockup &amp; Preference
              </Text>
              <Ionicons name={showMockup ? 'chevron-up' : 'chevron-down'} size={14} color={theme.accent} />
            </TouchableOpacity>
          </View>

          <View style={styles.designRow}>
            {order.design.imageUrl ? (
              <Image source={{ uri: order.design.imageUrl }} style={styles.designImage} />
            ) : (
              <View style={[styles.designImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.border }]}>
                <Ionicons name="image-outline" size={24} color={theme.subtext} />
              </View>
            )}
            <Text style={[styles.designName, { color: theme.text }]}>{order.design.name}</Text>
          </View>

          {(order.design.pngUrl || order.design.svgUrl) && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {order.design.pngUrl && (
                <TouchableOpacity style={[styles.downloadBtn, { borderColor: theme.border }]}>
                  <Text style={[styles.downloadBtnText, { color: theme.accent }]}>Download PNG</Text>
                </TouchableOpacity>
              )}
              {order.design.svgUrl && (
                <TouchableOpacity style={[styles.downloadBtn, { borderColor: theme.border }]}>
                  <Text style={[styles.downloadBtnText, { color: theme.accent }]}>Download SVG</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {showMockup && (
            <View style={[styles.mockupRow, { borderColor: theme.border }]}>
              {order.mockup.imageUrl ? (
                <Image source={{ uri: order.mockup.imageUrl }} style={styles.mockupImage} />
              ) : (
                <View style={[styles.mockupImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.border }]}>
                  <Ionicons name="shirt-outline" size={20} color={theme.subtext} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Text style={[styles.mockupName, { color: theme.text }]}>{order.mockup.name}</Text>
                  <Text style={[styles.mockupAmount, { color: theme.subtext }]}>{formatNaira(order.mockup.amount)}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.mockupMeta, { color: theme.subtext }]}>Colour:</Text>
                    <View style={[styles.colourSwatch, { backgroundColor: order.mockup.colour || '#ccc', borderColor: theme.border }]} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.mockupMeta, { color: theme.subtext }]}>Size:</Text>
                    <View style={[styles.sizeBox, { borderColor: theme.border }]}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.text }}>{order.mockup.size}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.mockupMeta, { color: theme.subtext }]}>Quantity:</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: theme.text }}>{order.mockup.quantity}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCancel}
          disabled={order.status !== 'ACTIVE' || busy !== null}
          style={[styles.cancelButton, { borderColor: theme.danger, opacity: order.status !== 'ACTIVE' ? 0.5 : 1 }]}
        >
          {busy === 'cancel' ? (
            <ActivityIndicator size="small" color={theme.danger} />
          ) : (
            <Text style={[styles.cancelText, { color: theme.danger }]}>Cancel Order</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleDeliver}
          disabled={order.status !== 'ACTIVE' || busy !== null}
          style={[styles.deliverButton, { opacity: order.status !== 'ACTIVE' ? 0.5 : 1 }]}
        >
          {busy === 'deliver' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.deliverText}>Deliver Item</Text>
          )}
        </TouchableOpacity>
      </View>

      {alertElement}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centeredWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 14 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 22, paddingBottom: 30 },
  countdownRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'center', marginBottom: 20, marginTop: 6 },
  countdownItem: { alignItems: 'center', width: 62 },
  countdownValue: { color: '#FF2C3F', fontSize: 26, fontWeight: '700', letterSpacing: 1 },
  countdownColon: { color: '#FF2C3F', fontSize: 22, fontWeight: '700', marginHorizontal: 2, marginTop: 2 },
  countdownLabel: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  itemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  detailsCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20 },
  detailsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 },
  detailLabel: { fontSize: 12.5, flex: 1 },
  detailValue: { fontSize: 12.5, fontWeight: '500', flex: 1, textAlign: 'right' },
  designCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 30 },
  designHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  designRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  designImage: { width: 72, height: 72, borderRadius: 10 },
  designName: { fontSize: 14, fontWeight: '600', flex: 1 },
  downloadBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  downloadBtnText: { fontSize: 12, fontWeight: '600' },
  mockupRow: { flexDirection: 'row', gap: 12, marginTop: 18, paddingTop: 18, borderTopWidth: 1 },
  mockupImage: { width: 56, height: 56, borderRadius: 8 },
  mockupName: { fontSize: 13, fontWeight: '600' },
  mockupAmount: { fontSize: 12, textDecorationLine: 'line-through' },
  mockupMeta: { fontSize: 12 },
  colourSwatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1 },
  sizeBox: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 16, borderTopWidth: 1, gap: 12 },
  cancelButton: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingVertical: 16, borderRadius: 8, borderWidth: 1.5 },
  cancelText: { fontSize: 15, fontWeight: '600' },
  deliverButton: { alignItems: 'center', backgroundColor: '#4D44B5', borderRadius: 8, flex: 1.3, justifyContent: 'center', paddingVertical: 16 },
  deliverText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});