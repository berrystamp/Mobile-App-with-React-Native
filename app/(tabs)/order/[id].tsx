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
import { SafeAreaView } from 'react-native-safe-area-context';

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
  return [
    String(days).padStart(2, '0'),
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0')
  ];
}

export default function OrderDetailScreen() {
  const isDark = useColorScheme() === 'dark';
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
        showAlert({
          type: 'error',
          title: 'Unable to load order',
          message: error?.response?.data?.responseMessage || error?.message || 'Please try again.',
        });
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
      text: isDark ? '#F3F3F3' : '#1A1A1A',
      subtext: isDark ? '#A6A1B1' : '#6B6875',
      accent: '#4D44B5',
      danger: '#FF4B55',
      border: isDark ? '#2A2A2A' : '#EAEAEA',
    }),
    [isDark]
  );

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
      </SafeAreaView>
    );
  }

  const countdownParts = getCountdownParts(order.dueOn); // Added order.dueOn to populate timer properly

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Order {order.code}</Text>
        <Text style={styles.headerCount}>{count}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Countdown */}
        <View style={styles.countdownRow}>
          {countdownParts.map((part, index) => (
            <React.Fragment key={`${part}-${countdownLabels[index]}`}>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownValue}>{part}</Text>
                <Text style={[styles.countdownLabel, { color: theme.subtext }]}>{countdownLabels[index]}</Text>
              </View>
              {index < countdownParts.length - 1 && (
                <View style={styles.colonWrap}>
                  <Text style={styles.countdownColon}>:</Text>
                </View>
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <Text style={[styles.descriptionText, { color: theme.text }]}>{order.description}</Text>
          <Text style={styles.amountText}>{formatNaira(order.amount)}</Text>
        </View>

        <View style={[styles.metaCard, { borderColor: theme.border }]}>
          <Text style={[styles.metaLine, { color: theme.subtext }]}>
            Design by <Text style={styles.metaLink}>{order.designer}</Text>
          </Text>
          <Text style={[styles.metaLine, { color: theme.subtext }]}>Updated on {order.updatedAt}</Text>
          <Text style={[styles.metaLine, { color: theme.subtext }]}>Created on {order.createdAt}</Text>
          <Text style={[styles.metaLine, { color: theme.subtext }]}>Due on {order.dueOn}</Text>
        </View>

        {/* Specifications */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Item Specification</Text>
        
        <View style={styles.specRow}>
          <Text style={[styles.specLabel, { color: theme.subtext }]}>Design Purpose :</Text>
          <Text style={[styles.specValue, { color: theme.text }]}>{order.purpose}</Text>
        </View>
        
        <View style={styles.specRow}>
          <Text style={[styles.specLabel, { color: theme.subtext }]}>Items to be printed on:</Text>
          <View style={styles.specItemsWrap}>
            {order.itemsToPrint.map((item) => (
              <Text key={item} style={[styles.specValue, { color: theme.text }]}>
                • {item}
              </Text>
            ))}
          </View>
        </View>

        {/* Uploaded Designs */}
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

      {/* Fixed Footer */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity activeOpacity={0.85} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: theme.danger }]}>Cancel Order</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} style={styles.deliverButton}>
          <Text style={styles.deliverText}>Deliver order</Text>
        </TouchableOpacity>
      </View>

      {alertElement}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centeredWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  backButton: {
    left: 22,
    paddingVertical: 4,
    position: 'absolute',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerCount: {
    color: '#4D44B5',
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    right: 22,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 30, // Replaced heavy hardcoded padding
  },
  countdownRow: {
    alignItems: 'flex-start', // Fixed alignment 
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  countdownItem: {
    alignItems: 'center',
    width: 60,
  },
  countdownValue: {
    color: '#FF2C3F',
    fontSize: 22, // Slightly more legible for numbers
    fontWeight: '600',
    letterSpacing: 1,
  },
  colonWrap: {
    paddingTop: 2, // Naturally aligns colon with numbers
  },
  countdownColon: {
    color: '#FF2C3F',
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  countdownLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  descriptionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    paddingRight: 16,
  },
  amountText: {
    color: '#4D44B5',
    fontSize: 20,
    fontWeight: '700',
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  metaLine: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  metaLink: {
    color: '#4D44B5',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
    marginTop: 8,
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    flex: 0.4, // Responsive width rather than hardcoded 92px
  },
  specItemsWrap: {
    flex: 0.6,
  },
  specValue: {
    fontSize: 14,
    lineHeight: 22,
  },
  designsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  designImage: {
    borderRadius: 8,
    height: 120, // slightly taller for modern screens
    width: '48%',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 16, // SafeArea will pad the rest dynamically below this
  },
  cancelButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginRight: 12,
    paddingVertical: 16,
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deliverButton: {
    alignItems: 'center',
    backgroundColor: '#4D44B5',
    borderRadius: 8,
    elevation: 4,
    flex: 1.5,
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: '#4D44B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  deliverText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});