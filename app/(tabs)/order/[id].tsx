import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatNaira } from '@/lib/currency';
import { normalizeManageOrder } from '@/lib/orders';
import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';
import type { ManageOrderItem } from '@/types';
import { useAppAlert } from '@/components/common/AppAlert';

const countdownLabels = ['Days', 'Hours', 'Mins', 'Secs'];

function getCountdownParts(dueDate?: string): string[] {
  if (!dueDate) return ['--', '--', '--', '--'];
  // Try parsing dd/mm/yyyy from normalised date
  const parts = dueDate.split('/');
  let target: Date;
  if (parts.length === 3) {
    target = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  } else {
    target = new Date(dueDate);
  }
  if (isNaN(target.getTime())) return ['--', '--', '--', '--'];
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return ['00', '00', '00', '00'];
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return [String(days).padStart(2, '0'), String(hours).padStart(2, '0'), String(minutes).padStart(2, '0'), String(seconds).padStart(2, '0')];
}

export default function OrderDetailScreen() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const role = useAuthStore((state) => state.role);
  const [order, setOrder] = useState<ManageOrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const { show: showAlert, element: alertElement } = useAppAlert();

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await ApiService.getManageOrderById(id, toProfileType(role));
        const body = response?.responseBody || response?.data || response;
        setOrder(body ? normalizeManageOrder(body) : null);
      } catch (error: any) {
        showAlert({ type: 'error', title: 'Unable to load order', message: error?.response?.data?.responseMessage || error?.message || 'Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, role]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((value) => (value + 1) % 2);
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#FFFFFF',
      text: isDark ? '#F3F3F3' : '#2E2C35',
      subtext: isDark ? '#A6A1B1' : '#B1ADBA',
      accent: '#4D44B5',
      danger: '#FF4B55',
    }),
    [isDark],
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingWrap, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingWrap, { backgroundColor: theme.background }]}>
          <Text style={{ color: theme.text }}>Order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const countdownParts = getCountdownParts(order.dueOn);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.screen, { backgroundColor: theme.background, paddingBottom: 88 + insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Order {order.code}</Text>
          <Text style={styles.headerCount}>{count}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.countdownRow}>
            {countdownParts.map((part, index) => (
              <React.Fragment key={`${part}-${countdownLabels[index]}`}>
                <View style={styles.countdownItem}>
                  <Text style={styles.countdownValue}>{part}</Text>
                  <Text style={[styles.countdownLabel, { color: theme.subtext }]}>{countdownLabels[index]}</Text>
                </View>
                {index < countdownParts.length - 1 ? <Text style={styles.countdownColon}>:</Text> : null}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.descriptionText, { color: theme.text }]}>{order.description}</Text>
            <Text style={styles.amountText}>{formatNaira(order.amount)}</Text>
          </View>

          <Text style={[styles.metaLine, { color: theme.subtext }]}>Design by <Text style={styles.metaLink}>{order.designer}</Text></Text>
          <Text style={[styles.metaLine, { color: theme.subtext }]}>Updated on {order.updatedAt}</Text>
          <Text style={[styles.metaLine, { color: theme.subtext }]}>Created on {order.createdAt}</Text>
          <Text style={[styles.metaLine, { color: theme.subtext }]}>Due on {order.dueOn}</Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Item Specification</Text>
          <View style={styles.specRow}>
            <Text style={[styles.specLabel, { color: theme.subtext }]}>Design Purpose :</Text>
            <Text style={[styles.specValue, { color: theme.text }]}>{order.purpose}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specLabel, { color: theme.subtext }]}>Items to be printed on:</Text>
            <View style={styles.specItemsWrap}>
              {order.itemsToPrint.map((item) => (
                <Text key={item} style={[styles.specValue, { color: theme.text }]}>{item}</Text>
              ))}
            </View>
          </View>

          {order.uploadedDesigns?.length ? (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Uploaded Design</Text>
              <View style={styles.designsRow}>
                {order.uploadedDesigns.slice(0, 2).map((imageUrl) => (
                  <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.designImage} />
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, 18) }]}>
          <TouchableOpacity activeOpacity={0.85} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: theme.danger }]}>Cancel Order</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} style={styles.deliverButton}>
            <Text style={styles.deliverText}>Deliver order</Text>
          </TouchableOpacity>
        </View>
      </View>
      {alertElement}
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
    paddingTop: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 22,
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
  scrollContent: {
    paddingBottom: 120,
  },
  countdownRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 22,
  },
  countdownItem: {
    alignItems: 'center',
  },
  countdownValue: {
    color: '#FF2C3F',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1.2,
  },
  countdownColon: {
    color: '#FF2C3F',
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 8,
    marginTop: -14,
  },
  countdownLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  descriptionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    paddingRight: 18,
  },
  amountText: {
    color: '#4D44B5',
    fontSize: 24,
    fontWeight: '600',
  },
  metaLine: {
    fontSize: 13,
    marginBottom: 8,
  },
  metaLink: {
    color: '#4D44B5',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 18,
    marginTop: 24,
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  specLabel: {
    fontSize: 13,
    lineHeight: 22,
    width: 92,
  },
  specValue: {
    fontSize: 14,
    lineHeight: 22,
  },
  specItemsWrap: {
    flex: 1,
  },
  designsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  designImage: {
    borderRadius: 8,
    height: 104,
    width: '47.5%',
  },
  footer: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 22,
    position: 'absolute',
    right: 22,
  },
  cancelButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginRight: 16,
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '500',
  },
  deliverButton: {
    alignItems: 'center',
    backgroundColor: '#4D44B5',
    borderRadius: 8,
    elevation: 4,
    flex: 1.3,
    justifyContent: 'center',
    paddingVertical: 18,
    shadowColor: '#4D44B5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  deliverText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
  },
  loadingWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
