/**
 * Select Printer Screen
 *
 * Displays printers sorted by proximity to the customer's delivery address.
 * Each card has a "View Profile" and a "Message" button.
 * Tapping "Message" creates a real backend print order and opens the chat
 * with the conversationId returned from the backend response.
 */

import { useAppAlert } from '@/components/common/AppAlert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ApiService, { type PrintOrderPayloadItem } from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrinterCard {
  id: number;
  userId: number;
  name: string;
  avatar: string | null;
  cover: string | null;
  bio: string;
  categories: string[];
  rating: number;
  totalCompletedOrders: number;
  jobSuccessPercentage: number;
  distanceInKm: number;
}

interface ParsedCartItem {
  id: string;
  designId: number;
  mockId: number;
  name: string;
  colour: string;
  size: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  variantText?: string;
  designerName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toAbsUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://backend-dev-api.berrystamp.com/${path.replace(/^\/+/, '')}`;
};

const normalizePrinter = (item: any): PrinterCard => ({
  id: Number(item.id),
  userId: Number(item.userId ?? item.id),
  name:
    item.name ||
    `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
    item.userName ||
    item.username ||
    'Printer',
  avatar: toAbsUrl(
    item.profileImage?.thumbnailUrl ||
    item.profileImage?.url ||
    item.thumbnailProfilePic ||
    item.profilePic ||
    item.avatar,
  ),
  cover: toAbsUrl(item.coverImage?.url || item.coverPic || item.profileImage?.url),
  bio: item.bio || item.specialty || 'Commercial Printer',
  categories: Array.isArray(item.categories) ? item.categories : [],
  rating: Number(item.insight?.rating?.avgStars ?? 0),
  totalCompletedOrders: Number(item.insight?.totalCompletedOrders ?? 0),
  jobSuccessPercentage: Number(item.insight?.jobSuccessPercentage ?? 0),
  distanceInKm: Number(item.distanceInKm ?? item.insight?.distanceInKm ?? 0),
});

// ─── Printer Card Component ───────────────────────────────────────────────────

function PrinterCardItem({
  printer,
  isSending,
  onViewProfile,
  onMessage,
}: {
  printer: PrinterCard;
  isSending: boolean;
  onViewProfile: () => void;
  onMessage: () => void;
}) {
  const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

  return (
    <View
      style={{ width: CARD_WIDTH }}
      className="mb-4 overflow-hidden rounded-2xl border border-[#E5E5EA] bg-white dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
    >
      {/* Cover */}
      <View className="h-20 bg-[#F5F5F7] dark:bg-[#2C2C2E]">
        {printer.cover ? (
          <Image source={{ uri: printer.cover }} className="h-full w-full" resizeMode="cover" />
        ) : null}
        {/* Avatar */}
        <View
          className="absolute bottom-[-20px] left-0 right-0 items-center"
          style={{ alignItems: 'center' }}
        >
          <View className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-[#4A3298] dark:border-[#1C1C1E]">
            {printer.avatar ? (
              <Image source={{ uri: printer.avatar }} className="h-full w-full" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-[14px] font-bold text-white">
                  {printer.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Info */}
      <View className="items-center px-3 pb-3 pt-7">
        <View className="mb-0.5 flex-row items-center">
          <Text
            numberOfLines={1}
            className="text-[13px] font-bold text-[#1C1C1E] dark:text-white"
          >
            {printer.name}
          </Text>
          <Ionicons name="checkmark-circle" size={13} color="#4A3298" style={{ marginLeft: 3 }} />
        </View>
        <Text numberOfLines={1} className="mb-1 text-[11px] text-[#8E8E93]">
          {printer.bio}
        </Text>
        <Text className="mb-1 text-[10px] text-[#AEAEB2] dark:text-[#636366]">
          {printer.totalCompletedOrders} orders
          {printer.rating > 0 ? ` · ★ ${printer.rating.toFixed(1)}` : ''}
        </Text>
        {printer.distanceInKm > 0 && (
          <Text className="mb-3 text-[10px] text-[#AEAEB2] dark:text-[#636366]">
            {printer.distanceInKm.toFixed(1)} km away
          </Text>
        )}

        {/* View Profile */}
        <TouchableOpacity
          onPress={onViewProfile}
          className="mb-2 w-full items-center rounded-full border border-[#4A3298] py-2"
        >
          <Text className="text-[12px] font-semibold text-[#4A3298]">View Profile</Text>
        </TouchableOpacity>

        {/* Message */}
        <TouchableOpacity
          onPress={onMessage}
          disabled={isSending}
          className={`w-full items-center rounded-full py-2 ${isSending ? 'bg-[#9B8BCC]' : 'bg-[#4A3298]'
            }`}
        >
          {isSending ? (
            <View className="flex-row items-center gap-1.5">
              <ActivityIndicator size="small" color="#FFF" />
              <Text className="text-[12px] font-semibold text-white">Sending…</Text>
            </View>
          ) : (
            <Text className="text-[12px] font-semibold text-white">Message</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SelectPrinterScreen() {
  const router = useRouter();
  const { show: showAlert, element: alertElement } = useAppAlert();

  const {
    cartItems: cartItemsParam,
    estimatedAmount,
    dateOfDelivery,
    deliveryAddress: deliveryAddressParam,
    hasOwnItem: hasOwnItemParam,
  } = useLocalSearchParams<{
    cartItems?: string;
    estimatedAmount?: string;
    dateOfDelivery?: string;
    deliveryAddress?: string;
    hasOwnItem?: string;
    pickupAddress?: string;
  }>();

  // Parse route params
  const cartItems = useMemo<ParsedCartItem[]>(() => {
    if (!cartItemsParam) return [];
    try {
      return JSON.parse(cartItemsParam);
    } catch {
      return [];
    }
  }, [cartItemsParam]);

  const deliveryAddress = useMemo<{ name: string; latitude: number; longitude: number } | null>(() => {
    if (!deliveryAddressParam) return null;
    try {
      return JSON.parse(deliveryAddressParam);
    } catch {
      return null;
    }
  }, [deliveryAddressParam]);

  const hasOwnItem = hasOwnItemParam === 'true';

  // Screen state
  const [printers, setPrinters] = useState<PrinterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const loadPrinters = useCallback(async () => {
    if (!deliveryAddress) {
      setError('Delivery address with coordinates is required to find nearby printers.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.getPrintersNearby(
        deliveryAddress.latitude,
        deliveryAddress.longitude,
        0,
        20,
      );
      const content: any[] =
        res?.responseBody?.content ||
        res?.content ||
        (Array.isArray(res?.responseBody) ? res.responseBody : []) ||
        [];
      setPrinters(content.map(normalizePrinter));
    } catch (err: any) {
      setError(
        err?.response?.data?.responseMessage ||
        err?.message ||
        'Failed to load printers. Please try again.',
      );
      setPrinters([]);
    } finally {
      setLoading(false);
    }
  }, [deliveryAddress]);

  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  const handleViewProfile = (printer: PrinterCard) => {
    router.push({
      pathname: '/(tabs)/my-shop',
      params: { profileId: String(printer.id) },
    });
  };

  const handleMessage = async (printer: PrinterCard) => {
    if (!deliveryAddress) return;
    setSendingId(printer.id);

    try {
      const payload: PrintOrderPayloadItem[] = cartItems.map((item) => ({
        designId: Number(item.designId),
        colour: item.colour || '',
        quantity: Number(item.quantity) || 1,
        size: item.size || '',
        mockItemId: Number(item.mockId),
        customDesign: false,
        sourceOfItem: hasOwnItem ? 'From Customer' : 'From Printer',
        estimatedAmount: estimatedAmount || '',
        dateOfDelivery: dateOfDelivery || '',
        deliveryAddress: {
          name: deliveryAddress.name,
          latitude: deliveryAddress.latitude,
          longitude: deliveryAddress.longitude,
        },
        printerId: printer.id,
      }));
      console.log(payload)
      const res = await ApiService.createPrintOrders(payload);
      const responseBody: any[] = res?.responseBody ?? res ?? [];
      const firstOrder = Array.isArray(responseBody) ? responseBody[0] : responseBody;
      const conversationId = firstOrder?.conversationId;

      if (!conversationId) {
        throw new Error('No conversation ID returned from the server.');
      }

      router.push({
        pathname: '/(tabs)/chat',
        params: {
          conversationId: String(conversationId),
          participantId: String(printer.userId ?? printer.id),
          participantName: printer.name,
          participantRole: 'Printers',
        },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.responseMessage ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send order. Please try again.';
      showAlert({ type: 'error', title: 'Order Failed', message: msg });
    } finally {
      setSendingId(null);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return <LoadingSpinner message="Finding nearby printers…" />;
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F7FA] px-6 dark:bg-black">
        <Ionicons name="alert-circle-outline" size={56} color="#FF3B30" />
        <Text className="mt-4 text-center text-[15px] text-[#FF3B30]">{error}</Text>
        <TouchableOpacity
          onPress={loadPrinters}
          className="mt-6 rounded-xl bg-[#4A3298] px-8 py-3.5"
        >
          <Text className="text-[15px] font-semibold text-white">Retry</Text>
        </TouchableOpacity>
        {alertElement}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F7] dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-4 py-4 dark:bg-[#1C1C1E]">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#4A3298" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[18px] font-bold text-[#1C1C1E] dark:text-white">
            Select Print Partner
          </Text>
          {deliveryAddress ? (
            <Text numberOfLines={1} className="mt-0.5 text-[12px] text-[#8E8E93]">
              Near {deliveryAddress.name}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={loadPrinters}>
          <Ionicons name="refresh-outline" size={22} color="#4A3298" />
        </TouchableOpacity>
      </View>

      <Text className="px-5 py-2 text-[13px] text-[#736E80]">
        Choose a verified print partner for production and fulfilment.
      </Text>

      {printers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="print-outline" size={64} color="#D1D1D6" />
          <Text className="mt-4 text-center text-[16px] text-[#8E8E93]">
            No print partners available in this region.
          </Text>
          <TouchableOpacity
            onPress={loadPrinters}
            className="mt-5 rounded-xl bg-[#4A3298] px-8 py-3.5"
          >
            <Text className="text-[14px] font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={printers}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          columnWrapperStyle={{ gap: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PrinterCardItem
              printer={item}
              isSending={sendingId === item.id}
              onViewProfile={() => handleViewProfile(item)}
              onMessage={() => handleMessage(item)}
            />
          )}
        />
      )}

      {alertElement}
    </SafeAreaView>
  );
}
