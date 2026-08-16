import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAppAlert } from '@/components/common/AppAlert';
import { useCustomDesignStore } from '@/context/CustomDesignContext';
import ApiService from '@/services/apiClient';

interface DesignerCard {
  id: number;
  name: string;
  avatar: string;
  cover: string;
  role: string;
  jobs: number;
  rating: string;
}

const fallbackImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400';

const toAbsolutePath = (path?: string) => {
  if (!path) return fallbackImage;
  if (path.startsWith('http')) return path;
  return `https://backend-dev-api.berrystamp.com/${path.replace(/^\/+/, '')}`;
};

const unwrapList = (response: any) => {
  const body = response?.responseBody || response?.data || response || {};
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  return [];
};

export default function SelectDesignerScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { show: showAlert, element: alertElement } = useAppAlert();

  // 1. Pull clearDraft in addition to the variables
  const { designFor, theme, items, clearDraft } = useCustomDesignStore();

  const [loading, setLoading] = useState(true);
  const [designers, setDesigners] = useState<DesignerCard[]>([]);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const loadDesigners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPublicProfiles('DESIGNER', 0, 60);
      const list = unwrapList(response);

      setDesigners(
        list.map((item: any) => ({
          id: Number(item.id),
          name: item.username || item.name || 'Designer',
          avatar: toAbsolutePath(item.profileImage?.url || item.profilePic || item.previewProfilePic || item.thumbnailProfilePic),
          cover: toAbsolutePath(item.coverImage?.url || item.coverPic || item.previewCoverPic || item.thumbnailCoverPic || item.profileImage?.url),
          role: item.bio || 'Creative designer',
          jobs: Number(item.insight?.totalUploads || 0),
          rating: item.insight?.rating?.avgStars ? String(item.insight.rating.avgStars) : '4.5',
        }))
      );
    } catch (error) {
      console.error('Unable to fetch designers', error);
      setDesigners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDesigners();
  }, [loadDesigners]);
  console.log(designers)
  const handleMessage = async (designer: DesignerCard) => {
    if (submittingId) return;
    setSubmittingId(designer.id);

    try {
      const response = await ApiService.createCustomizeDesign({
        designId: 0,
        designerId: designer.id,
        mockTypes: items,
        purpose: designFor,
        theme: theme,
        // Format to YYYY-MM-DD to match the backend expectation
        dateOfDelivery: new Date().toISOString().split('T')[0],
        estimatedAmount: 0,
      });

      const body = response?.responseBody || response?.data || response || {};
      const conversationId = body?.conversationId || body?.conversation?.id || body?.orderRequest?.conversationId;
      const orderId = body?.orderId || body?.order?.id || body?.id;

      // 2. Wipe the global Custom Design state now that the request is successful
      clearDraft();

      router.replace({
        pathname: '/(tabs)/chat',
        params: {
          ...(conversationId ? { conversationId: String(conversationId) } : {}),
          ...(orderId ? { orderId: String(orderId) } : {}),
          participantId: String(designer.id),
          participantName: designer.name,
          participantRole: 'Designer',
        },
      });
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Request not sent',
        message: err?.response?.data?.responseMessage || err?.message || 'Please try again.',
      });
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading designers..." />;
  }

  return (
    <View className="flex-1 bg-[#F9F8FC] dark:bg-[#121212]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-4 pt-[58px]">
        <TouchableOpacity onPress={() => router.back()} className="h-8 w-8 justify-center">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#4A34A5'} />
        </TouchableOpacity>
        <Text className="text-xl font-medium text-[#2A2537] dark:text-white">
          Select Designer
        </Text>
        <TouchableOpacity onPress={loadDesigners} className="h-8 w-8 items-end justify-center">
          <Ionicons name="refresh-outline" size={22} color={isDark ? '#FFFFFF' : '#4A34A5'} />
        </TouchableOpacity>
      </View>

      <Text className="my-5 px-6 text-center text-[15px] text-[#2A2537] dark:text-[#D1D1D6]">
        Select a designer to discuss your idea, styling, and custom design direction.
      </Text>

      <FlatList
        data={designers}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View className="m-2 flex-1 items-center overflow-hidden rounded-2xl border border-[#ECE8F3] bg-white pb-4 dark:border-[#33333A] dark:bg-[#1C1C1E]">
            <Image source={{ uri: item.cover }} className="h-[62px] w-full" />

            <View className="-mt-6 rounded-full bg-white p-[2px] dark:bg-[#1C1C1E]">
              <Image source={{ uri: item.avatar }} className="h-12 w-12 rounded-full" />
            </View>

            <Text className="mt-2 px-2 text-[16px] font-semibold text-[#2A2537] dark:text-white" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="mt-1 px-2 text-[13px] text-[#8A8598] dark:text-[#A19BAF]" numberOfLines={1}>
              {item.role}
            </Text>
            <Text className="mt-1 px-2 text-[12px] text-[#928BA2] dark:text-[#7D7D88]">
              {item.jobs} uploads | ★ {item.rating}
            </Text>

            <TouchableOpacity
              className="mt-3 min-w-[100px] items-center rounded-full border border-[#4A34A5] px-5 py-2 dark:border-[#C8BFFF]"
              onPress={() => handleMessage(item)}
              disabled={submittingId !== null}
            >
              {submittingId === item.id ? (
                <ActivityIndicator size="small" color={isDark ? '#C8BFFF' : '#4A34A5'} />
              ) : (
                <Text className="text-[13px] font-semibold text-[#4A34A5] dark:text-[#C8BFFF]">
                  Message
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-[15px] text-[#888193] dark:text-[#A19BAF]">
            No designers available right now.
          </Text>
        }
      />
      {alertElement}
    </View>
  );
}