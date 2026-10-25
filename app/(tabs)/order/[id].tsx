import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppAlert } from '@/components/common/AppAlert';
import { formatNaira } from '@/lib/currency';
import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';

const countdownLabels = ['Days', 'Hours', 'Mins', 'Secs'];

const DISPUTE_TYPES = [
  { value: 'PAYMENT_ISSUES', label: 'Payment issues' },
  { value: 'QUALITY_ISSUES', label: 'Quality issues' },
  { value: 'DELIVERY_ISSUES', label: 'Delivery issues' },
  { value: 'OTHER', label: 'Other' },
] as const;

function getCountdownParts(dueDate?: string): string[] {
  if (!dueDate) return ['00', '00', '00', '00'];
  let target: Date;
  const parts = dueDate.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      target = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  } else {
    target = new Date(dueDate);
  }

  if (isNaN(target.getTime())) return ['00', '00', '00', '00'];

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
    String(seconds).padStart(2, '0'),
  ];
}

function DashedDivider({ color }: { color: string }) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        borderColor: color,
        marginVertical: 12,
      }}
    />
  );
}

function TicketNotch({ color, side }: { color: string; side: 'left' | 'right' }) {
  return (
    <View
      style={{
        position: 'absolute',
        [side]: -12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: color,
        top: 0,
      }}
    />
  );
}

function getStatusMeta(status: string, theme: any) {
  switch (status) {
    case 'COMPLETED':
      return { label: 'DELIVERED', color: '#2E7D32', bg: '#E8F5E9' };
    case 'CANCELED':
    case 'TERMINATED':
    case 'CANCELLED':
    case 'DECLINED':
      return { label: status === 'DECLINED' ? 'DECLINED' : 'CANCELLED', color: theme.danger, bg: '#FDECEA' };
    case 'IN_PROGRESS':
      return { label: 'IN PROGRESS', color: '#F57C00', bg: '#FFF3E0' };
    case 'PENDING':
      return { label: 'PENDING', color: theme.accent, bg: '#EDEAFB' };
    default:
      return { label: status || 'ACTIVE', color: theme.subtext, bg: theme.border };
  }
}

export default function OrderDetailScreen() {
  const isDark = useColorScheme() === 'dark';
  const { id } = useLocalSearchParams<{ id: string }>();
  const role = useAuthStore((state) => state.role);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string[]>(['00', '00', '00', '00']);
  const { show: showAlert, element: alertElement } = useAppAlert();

  // Dispute modal state (cross-platform cancellation for CUSTOMER)
  const [dispute, setDispute] = useState<{ disputeType: string } | null>(null);
  const [disputeComment, setDisputeComment] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // ---------- Role flags ----------
  const isCustomer = role === 'CUSTOMER';
  const isProvider = role === 'DESIGNER' || role === 'PRINTER';

  // ---------- Derived state ----------
  const isCountdownExpired =
    timeLeft[0] === '00' && timeLeft[1] === '00' && timeLeft[2] === '00' && timeLeft[3] === '00';

  const orderStatus: string = order?.orderStatus || '';
  const isDelivered = orderStatus === 'COMPLETED';
  const isTerminated =
    orderStatus === 'CANCELED' ||
    orderStatus === 'CANCELLED' ||
    orderStatus === 'TERMINATED' ||
    orderStatus === 'DECLINED' ||
    order?.canceledByCustomer === true;

  const canDeliver = !!order && !isDelivered && !isTerminated && !isCountdownExpired;
  const canCancel = !!order && !isDelivered && !isTerminated && !isCountdownExpired;
  const showFooterActions = canDeliver || canCancel;

  // ---------- Handlers ----------
  const handleDeliverOrder = () => {
    if (!order || !canDeliver) return;
    console.log('🟣 Deliver pressed — order id:', order.id, 'role:', role);

    Alert.alert(
      'Deliver Order',
      isCustomer
        ? 'Confirm this order has been delivered to you?'
        : 'Mark this order as delivered to the customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deliver',
          onPress: async () => {
            try {
              await ApiService.deliverOrder(order.id);
              showAlert({
                type: 'success',
                title: 'Success',
                message: 'Order marked as delivered.',
              });
              router.back();
            } catch (e: any) {
              console.log('🔴 Deliver failed:', e);
              showAlert({
                type: 'error',
                title: 'Failed',
                message:
                  e?.response?.data?.responseMessage ||
                  e?.message ||
                  'Could not deliver order.',
              });
            }
          },
        },
      ]
    );
  };

  // CUSTOMER cancel — opens dispute type picker
  const handleCustomerCancel = () => {
    if (!order || !canCancel) return;
    console.log('🔴 Customer cancel pressed — order id:', order.id);

    Alert.alert(
      'Cancel Order',
      'Why are you cancelling this order?',
      [
        ...DISPUTE_TYPES.map((d) => ({
          text: d.label,
          onPress: () => setDispute({ disputeType: d.value }),
        })),
        { text: 'Never mind', style: 'cancel' as const },
      ]
    );
  };

  const submitCustomerCancel = async () => {
    if (!order || !dispute) return;
    try {
      setSubmittingDispute(true);
      await ApiService.cancelOrderByCustomer(order.id, {
        comment: disputeComment.trim() || 'No comment provided',
        disputeType: dispute.disputeType,
      });
      setDispute(null);
      setDisputeComment('');
      showAlert({
        type: 'success',
        title: 'Order cancelled',
        message: 'Your cancellation was submitted.',
      });
      router.back();
    } catch (e: any) {
      console.log('🔴 Customer cancel failed:', e);
      showAlert({
        type: 'error',
        title: 'Failed',
        message:
          e?.response?.data?.responseMessage ||
          e?.message ||
          'Could not cancel order.',
      });
    } finally {
      setSubmittingDispute(false);
    }
  };

  // PROVIDER cancel
  const handleProviderCancel = () => {
    if (!order || !canCancel) return;
    console.log('🔴 Provider cancel pressed — order id:', order.id, 'role:', role);

    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.cancelOrderByProvider(order.id);
            showAlert({
              type: 'success',
              title: 'Cancelled',
              message: 'Order cancelled.',
            });
            router.back();
          } catch (e: any) {
            console.log('🔴 Provider cancel failed:', e);
            showAlert({
              type: 'error',
              title: 'Failed',
              message:
                e?.response?.data?.responseMessage ||
                e?.message ||
                'Could not cancel order.',
            });
          }
        },
      },
    ]);
  };

  // PROVIDER decline
  const handleDeclineOrder = () => {
    if (!order || !canCancel) return;
    console.log('🟠 Decline pressed — order id:', order.id, 'role:', role);

    Alert.alert('Decline Order', 'Decline this order request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.declineOrder(order.id);
            showAlert({
              type: 'success',
              title: 'Declined',
              message: 'Order declined.',
            });
            router.back();
          } catch (e: any) {
            console.log('🔴 Decline failed:', e);
            showAlert({
              type: 'error',
              title: 'Failed',
              message:
                e?.response?.data?.responseMessage ||
                e?.message ||
                'Could not decline order.',
            });
          }
        },
      },
    ]);
  };

  // ---------- Effects ----------
  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await ApiService.getManageOrderById(id, toProfileType(role));
        const body = response?.responseBody || response?.data || response;
        setOrder(body || null);
      } catch (error: any) {
        showAlert({
          type: 'error',
          title: 'Unable to load order',
          message:
            error?.response?.data?.responseMessage || error?.message || 'Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, role]);

  useEffect(() => {
    const targetDate = order?.deliveryDate || order?.dateOfDelivery || order?.dueOn;
    if (!targetDate) return;

    const updateTimer = () => setTimeLeft(getCountdownParts(targetDate));
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [order]);

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#F4F2EE',
      ticketBg: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#F3F3F3' : '#1A1A1A',
      subtext: isDark ? '#A6A1B1' : '#8A8790',
      accent: '#4D44B5',
      danger: '#FF4B55',
      warning: '#F59E0B',
      border: isDark ? '#2E2E2E' : '#E8E4DC',
      ticketShadow: isDark ? '#000' : '#00000022',
      perforation: isDark ? '#3A3A3A' : '#D9D4CA',
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredWrap}>
          <Text style={{ color: theme.text, fontSize: 16 }}>Order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const orderCode = order.ref || order.code || `WQ${order.id}`;
  const orderTitle =
    order.title || order.customDesignRequest?.theme || order.description || 'Order Customization';
  const statusMeta = getStatusMeta(orderStatus, theme);

  const detailRowStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 10,
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
            marginRight: 28,
            letterSpacing: 1,
          }}
        >
          RECEIPT
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
      >
        {/* ===== TICKET ===== */}
        <View
          style={{
            marginTop: 8,
            borderRadius: 16,
            backgroundColor: theme.ticketBg,
            shadowColor: theme.ticketShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {/* --- TOP STUB --- */}
          <View
            style={{
              backgroundColor: theme.accent,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingVertical: 20,
              paddingHorizontal: 20,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#FFFFFFCC',
                fontSize: 11,
                letterSpacing: 3,
                fontWeight: '600',
                marginBottom: 4,
              }}
            >
              ORDER TICKET
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 22,
                fontWeight: '800',
                letterSpacing: 2,
              }}
            >
              {orderCode}
            </Text>

            <View
              style={{
                marginTop: 10,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                backgroundColor: statusMeta.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '800',
                  letterSpacing: 1.5,
                  color: statusMeta.color,
                }}
              >
                {statusMeta.label}
              </Text>
            </View>
          </View>

          {/* --- Perforation with notches --- */}
          <View style={{ position: 'relative' }}>
            <TicketNotch color={theme.background} side="left" />
            <TicketNotch color={theme.background} side="right" />
            <View
              style={{
                marginHorizontal: 16,
                borderBottomWidth: 2,
                borderStyle: 'dashed',
                borderColor: theme.perforation,
              }}
            />
          </View>

          {/* --- MIDDLE: Countdown + Title --- */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 11,
                letterSpacing: 2,
                fontWeight: '600',
                color: theme.subtext,
                marginBottom: 12,
              }}
            >
              {isCountdownExpired ? 'DELIVERY WINDOW CLOSED' : 'TIME REMAINING'}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                opacity: isCountdownExpired ? 0.5 : 1,
              }}
            >
              {timeLeft.map((part, index) => (
                <React.Fragment key={`${part}-${countdownLabels[index]}`}>
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: isDark ? '#2A2A2A' : '#FBF9F5',
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      minWidth: 58,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text
                      style={{
                        color: isCountdownExpired ? theme.subtext : theme.accent,
                        fontSize: 22,
                        fontWeight: '800',
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {part}
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        marginTop: 2,
                        fontWeight: '600',
                        letterSpacing: 1,
                        color: theme.subtext,
                      }}
                    >
                      {countdownLabels[index].toUpperCase()}
                    </Text>
                  </View>
                  {index < timeLeft.length - 1 && (
                    <Text
                      style={{
                        color: isCountdownExpired ? theme.subtext : theme.accent,
                        fontSize: 18,
                        fontWeight: '800',
                        marginHorizontal: 4,
                        marginBottom: 12,
                      }}
                    >
                      :
                    </Text>
                  )}
                </React.Fragment>
              ))}
            </View>

            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                textAlign: 'center',
                color: theme.text,
                marginBottom: 20,
              }}
            >
              {orderTitle}
            </Text>

            <DashedDivider color={theme.perforation} />
          </View>

          {/* --- DETAILS SECTION --- */}
          <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 2,
                fontWeight: '700',
                color: theme.subtext,
                marginBottom: 14,
              }}
            >
              ORDER DETAILS
            </Text>

            <View style={detailRowStyle}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: theme.subtext, flex: 0.42 }}>
                Description
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: theme.text,
                  flex: 0.58,
                  textAlign: 'right',
                }}
                numberOfLines={3}
              >
                {order.description || 'N/A'}
              </Text>
            </View>

            <View style={detailRowStyle}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: theme.subtext, flex: 0.42 }}>
                {isCustomer ? 'Designer' : 'Customer'}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: theme.accent,
                  flex: 0.58,
                  textAlign: 'right',
                }}
              >
                {isCustomer
                  ? order.providerProfile?.name ||
                    order.orderRequest?.providerProfile?.name ||
                    'Berrystamp Prints'
                  : order.orderRequest?.customerProfile?.name || 'N/A'}
              </Text>
            </View>

            <View style={detailRowStyle}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: theme.subtext, flex: 0.42 }}>
                Order date
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: theme.text,
                  flex: 0.58,
                  textAlign: 'right',
                }}
              >
                {order.createdDate
                  ? new Date(order.createdDate).toLocaleDateString()
                  : order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>

            <View style={detailRowStyle}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: theme.subtext, flex: 0.42 }}>
                Expected delivery
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: theme.text,
                  flex: 0.58,
                  textAlign: 'right',
                }}
              >
                {order.deliveryDate || order.dateOfDelivery || 'N/A'}
              </Text>
            </View>

            <View style={detailRowStyle}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: theme.subtext, flex: 0.42 }}>
                Payment status
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: order.paid ? '#2E7D32' : theme.danger,
                  flex: 0.58,
                  textAlign: 'right',
                }}
              >
                {order.paid ? 'PAID' : 'UNPAID'}
              </Text>
            </View>

            <DashedDivider color={theme.perforation} />

            <View style={detailRowStyle}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: theme.subtext, flex: 0.42 }}>
                Design amount
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: theme.text,
                  flex: 0.58,
                  textAlign: 'right',
                }}
              >
                {formatNaira(order.designAmount || 0)}
              </Text>
            </View>
          </View>

          {/* --- TOTAL BLOCK --- */}
          <View
            style={{
              backgroundColor: isDark ? '#262626' : '#FBF9F5',
              marginHorizontal: 16,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginTop: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, letterSpacing: 1 }}>
              TOTAL
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.accent }}>
              {formatNaira(order.totalAmount || 0)}
            </Text>
          </View>

          {/* --- BOTTOM STUB --- */}
          <View style={{ position: 'relative', marginTop: 20 }}>
            <TicketNotch color={theme.background} side="left" />
            <TicketNotch color={theme.background} side="right" />
            <View
              style={{
                marginHorizontal: 16,
                borderBottomWidth: 2,
                borderStyle: 'dashed',
                borderColor: theme.perforation,
              }}
            />
          </View>

          <View style={{ alignItems: 'center', paddingVertical: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 32, marginBottom: 8 }}>
              {[3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1, 3].map((w, i) => (
                <View
                  key={i}
                  style={{
                    width: w,
                    height: 28,
                    backgroundColor: theme.text,
                    marginHorizontal: 1,
                  }}
                />
              ))}
            </View>
            <Text
              style={{
                fontSize: 10,
                letterSpacing: 4,
                color: theme.subtext,
                fontWeight: '600',
              }}
            >
              {String(orderCode).toUpperCase()}
            </Text>
          </View>
        </View>

        <Text
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: theme.subtext,
            marginTop: 20,
            letterSpacing: 1,
          }}
        >
          {isDelivered
            ? 'This order has been delivered'
            : isTerminated
            ? 'This order has been cancelled'
            : isCountdownExpired
            ? 'The delivery window for this order has closed'
            : 'Thank you for your order'}
        </Text>
      </ScrollView>

      {/* Footer Actions — role-aware */}
      {showFooterActions ? (
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
            gap: 8,
          }}
        >
          {/* CUSTOMER: Deliver */}
          {isCustomer && canDeliver && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: theme.accent,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
              }}
              onPress={handleDeliverOrder}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                Deliver order
              </Text>
            </TouchableOpacity>
          )}

          {/* CUSTOMER: Cancel (with dispute) */}
          {isCustomer && canCancel && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.danger,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
              }}
              onPress={handleCustomerCancel}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.danger }}>
                Cancel order
              </Text>
            </TouchableOpacity>
          )}

          {/* PROVIDER: Deliver */}
          {isProvider && canDeliver && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: theme.accent,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
              }}
              onPress={handleDeliverOrder}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                Deliver order
              </Text>
            </TouchableOpacity>
          )}

          {/* PROVIDER: Decline + Cancel */}
          {isProvider && canCancel && (
            <>
              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.warning,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 14,
                }}
                onPress={handleDeclineOrder}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.warning }}>
                  Decline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.danger,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 14,
                }}
                onPress={handleProviderCancel}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.danger }}>
                  Cancel order
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.subtext, letterSpacing: 1 }}>
            {isDelivered
              ? 'ORDER COMPLETED'
              : isTerminated
              ? 'ORDER CANCELLED'
              : 'DELIVERY WINDOW CLOSED'}
          </Text>
        </View>
      )}

      {/* Dispute modal (cross-platform customer cancellation) */}
      {dispute && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: theme.ticketBg,
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 28,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 4 }}>
              Cancellation details
            </Text>
            <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 12 }}>
              {dispute.disputeType.replace(/_/g, ' ').toLowerCase()}
            </Text>

            <TextInput
              value={disputeComment}
              onChangeText={setDisputeComment}
              placeholder="Describe the issue (optional)"
              placeholderTextColor={theme.subtext}
              multiline
              style={{
                minHeight: 90,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 10,
                padding: 12,
                color: theme.text,
                backgroundColor: theme.background,
                textAlignVertical: 'top',
                marginBottom: 16,
              }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setDispute(null);
                  setDisputeComment('');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.text, fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={submittingDispute}
                onPress={submitCustomerCancel}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 10,
                  backgroundColor: theme.danger,
                  alignItems: 'center',
                  opacity: submittingDispute ? 0.6 : 1,
                }}
              >
                {submittingDispute ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});