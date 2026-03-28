import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const fallbackStages: TrackingStage[] = [
    { title: 'Item pickup via dispatcher rider from customer', at: order?.createdAt || order?.orderDate || '', done: true },
    { title: "Item delivered by dispatcher rider to printer's office", at: order?.updatedAt || order?.processingAt || '', done: true },
    { title: 'Printer indicated job completion of item', at: order?.completedAt || '', done: order?.status === 'COMPLETED' },
    { title: 'Order on its way to customer', at: order?.deliveryStartedAt || '', done: order?.status === 'SHIPPED' || order?.status === 'DELIVERED' },
  ];

  const stages =
    events.length > 0
      ? events.map((item: any) => ({
          title: String(item.description || item.title || item.status || 'Order update'),
          at: String(item.createdAt || item.time || item.timestamp || ''),
          done: item.done === undefined ? true : Boolean(item.done),
        }))
      : fallbackStages;

  const first = stages[0]?.at;
  const last = stages[stages.length - 1]?.at;

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
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  const canSubmit = trackingNumber.trim().length > 0;

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFD]">
      <View className="px-5 pt-10 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2B2833" />
        </TouchableOpacity>
        <Text className="text-[22px] font-medium text-[#2B2833]">Track Order</Text>
        <Text className="text-[19px] font-medium text-[#2D71E3]">{order ? '1 order' : '0 order'}</Text>
      </View>

      {!searched || (!order && !loading) ? (
        <View className="flex-1 px-6 pt-10">
          <Text className="text-center text-[34px] font-medium leading-[44px] text-[#2E2B36]">
            Input order tracking Number to track the progress of your order
          </Text>
          <Text className="mt-3 text-center text-[18px] leading-8 text-[#8A8594]">
            Order tracking number is a unique key sent to your mail immediately an order is placed
          </Text>

          <TextInput
            value={trackingNumber}
            onChangeText={setTrackingNumber}
            placeholder="Tracking Number"
            placeholderTextColor="#B2AEBA"
            className="mt-8 h-[58px] rounded-[10px] border border-[#DCD8E6] px-4 text-[19px] text-[#2B2833]"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {!order && searched ? (
            <View className="mt-16 items-center px-6">
              <Ionicons name="alert-circle-outline" size={88} color="#BDBCC4" />
              <Text className="mt-5 text-[36px] font-medium text-[#2B2833]">Order not found</Text>
              <Text className="mt-4 text-center text-[19px] leading-8 text-[#8C8798]">
                There is no order registered with this number, check the number and try again or contact customer support
              </Text>
            </View>
          ) : null}

          <View className="mt-auto pb-8">
            <TouchableOpacity
              disabled={!canSubmit || loading}
              onPress={handleTrack}
              className={`h-[56px] items-center justify-center rounded-full ${!canSubmit || loading ? 'bg-[#44309D]/40' : 'bg-[#44309D]'}`}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-[24px] font-semibold text-white">Track Order</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-1">
          <View className="items-center pt-4 pb-4 px-6">
            <Text className="text-center text-[24px] font-medium text-[#2A2734]">{order?.title}</Text>
            <Text className="mt-2 text-[20px] text-[#94909F]">{order?.orderRef}</Text>
          </View>

          <View className="px-6 pb-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[14px] font-medium text-[#44309D]">{formatDate(order?.timelineStart)}</Text>
              <Text className="text-[14px] text-[#A8A3B3]">{formatDate(order?.timelineEnd)}</Text>
            </View>
            <View className="mt-2 h-1 rounded-full bg-[#E7E2F4]">
              <View className="h-1 w-2/3 rounded-full bg-[#44309D]" />
            </View>
          </View>

          {mapVisible ? (
            <View className="mx-6 mt-1 mb-4 flex-1 rounded-2xl bg-[#EFEAF9] items-center justify-center px-5">
              <Ionicons name="locate" size={44} color="#44309D" />
              <Text className="mt-4 text-center text-[18px] text-[#514C62]">Live courier location preview</Text>
              <Text className="mt-2 text-center text-[14px] text-[#7F7A8D]">{mapCoordinates}</Text>
            </View>
          ) : (
            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 20 }}>
              {order?.stages.map((stage, index) => {
                const isLast = index === order.stages.length - 1;
                return (
                  <View key={`${stage.title}-${index}`} className="flex-row">
                    <View className="mr-4 items-center">
                      <View className={`h-4 w-4 rounded-full border ${stage.done ? 'border-[#44309D] bg-[#44309D]' : 'border-[#D7D2E3] bg-white'}`} />
                      {!isLast ? <View className={`w-[2px] flex-1 ${stage.done ? 'bg-[#44309D]' : 'bg-[#E2DFEA]'}`} /> : null}
                    </View>
                    <View className="pb-8 flex-1">
                      <Text className="text-[14px] text-[#8F8B99]">{formatDateTime(stage.at)}</Text>
                      <Text className={`mt-1 text-[20px] leading-8 ${stage.done ? 'text-[#2D2938]' : 'text-[#B8B4C1]'}`}>{stage.title}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View className="px-6 pb-6 pt-2">
            <TouchableOpacity onPress={() => setMapVisible((prev) => !prev)} className="h-[56px] items-center justify-center rounded-full bg-[#44309D]">
              <Text className="text-[24px] font-semibold text-white">{mapVisible ? 'Back to track' : 'View on Map'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
