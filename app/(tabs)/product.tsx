import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import { formatNaira } from '@/lib/currency';
import { normalizeDesign } from '@/lib/designs';
import { upsertLocalConversation } from '@/lib/localConversations';
import ApiService from '@/services/apiClient';
import type { Design } from '@/types';

const FALLBACK_IMAGE = require('@/assets/images/item5.png');
const FALLBACK_AVATAR = require('@/assets/images/item1.png');

export default function ProductScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [design, setDesign] = useState<Design | null>(null);

  useEffect(() => {
    const loadDesign = async () => {
      if (!designId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await ApiService.fetchDesignById(Number(designId));
        const normalized = normalizeDesign(response?.responseBody || response);
        setDesign(normalized);
        setIsFavorite(normalized.liked);
      } catch {
        setDesign(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDesign();
  }, [designId]);

  const artistName = useMemo(() => {
    if (!design) return 'Berrystamp';
    return design.designerName || `${design.profile.firstName} ${design.profile.lastName}`.trim() || design.profile.username;
  }, [design]);

  const price = useMemo(() => {
    if (!design) return 0;
    const mockPrices = design.mocks.map((mock) => mock.price).filter((value) => value > 0);
    return mockPrices.length ? Math.min(...mockPrices) : design.amount || 0;
  }, [design]);

  const heroImage = design?.imagePath ? { uri: design.imagePath } : FALLBACK_IMAGE;
  const avatarImage = design?.profile.profilePicturePath ? { uri: design.profile.profilePicturePath } : FALLBACK_AVATAR;

  const handleAddToFavorite = async () => {
    if (!designId) return;

    const nextFavoriteState = !isFavorite;
    setIsFavorite(nextFavoriteState);

    try {
      await ApiService.toggleFavorite(String(designId));
      setFeedback({
        title: nextFavoriteState ? 'Added to favourites' : 'Removed from favourites',
        message: nextFavoriteState ? 'This design has been saved to your favourites.' : 'This design was removed from your favourites.',
      });
    } catch (error: any) {
      setIsFavorite((prev) => !prev);
      setFeedback({ title: 'Action failed', message: error?.response?.data?.message || 'Unable to update favourites right now.' });
    }
  };

  const handleAddToCart = async (openPrintPrefs = false) => {
    if (!design) return;
    const fallbackMock = design.mocks[0];
    if (!fallbackMock) {
      setFeedback({ title: 'Unavailable', message: 'This design has no printable mock available right now.' });
      return;
    }

    try {
      await ApiService.addOrUpdateCartItem(design.id, fallbackMock.id, { quantity: 1 });
      if (openPrintPrefs) {
        router.push({ pathname: '/cart', params: { openPrintPrefs: '1' } });
        return;
      }
      setFeedback({ title: 'Added to cart', message: 'Item was added to your cart successfully.' });
    } catch (error: any) {
      setFeedback({ title: 'Action failed', message: error?.response?.data?.message || 'Unable to update your cart right now.' });
    }
  };

  const handleRequestCustomization = async () => {
    if (!design) return;

    const conversationId = await upsertLocalConversation({
      participantId: design.profile.id,
      name: artistName,
      role: 'Designer',
      initialMessage: `Hi, I want to customize "${design.title}" for a new order. Can we discuss size, color, quantity and printing options?`,
    });

    router.push({
      pathname: '/chat',
      params: {
        localConversationId: conversationId,
        participantId: String(design.profile.id),
        participantName: artistName,
        participantRole: 'Designer',
      },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F5F5] dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#3B2D85" />
      </View>
    );
  }

  if (!design) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F5F5] px-6 dark:bg-[#121212]">
        <Text className="text-center text-base text-[#4F4F4F] dark:text-gray-300">We could not load this product right now.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-5 rounded-full bg-[#3B2D85] px-6 py-3">
          <Text className="font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F5F5] dark:bg-[#121212]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
        <View className="relative">
          <ImageBackground source={heroImage} className="h-[420px] w-full" resizeMode="cover">
            <View className="h-full w-full bg-black/35 px-5 pt-12">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View className="ml-2 flex-1 flex-row items-center">
                  <Image source={avatarImage} className="h-10 w-10 rounded-full border border-white/20" />
                  <View className="ml-3 flex-1">
                    <Text numberOfLines={1} className="text-lg font-semibold text-white">{design.title}</Text>
                    <Text numberOfLines={1} className="text-sm text-white/90">Designed by {artistName}</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <TouchableOpacity onPress={handleAddToFavorite} className="mx-1 h-9 w-9 items-center justify-center">
                    <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity className="h-9 w-9 items-center justify-center">
                    <Feather name="share-2" size={21} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View className="bg-[#F5F5F5] px-6 pt-6 dark:bg-[#121212]">
          <Text className="text-base text-[#363636] dark:text-white/90">
            From <Text className="text-[#2D71E3]">{design.categories?.[0] || 'Berrystamp Collections'}</Text>
          </Text>
          <Text className="mt-2 text-[32px] font-semibold text-[#333333] dark:text-white">{formatNaira(price)}</Text>

          <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-[#1E1E1E]">
            <Text className="text-xl font-semibold text-[#333333] dark:text-white">Description</Text>
            <Text className="mt-3 text-base leading-7 text-[#4F4F4F] dark:text-[#D7D7D7]">
              {design.description || 'No description is available for this product yet.'}
            </Text>

            {design.tags?.length ? (
              <View className="mt-5 flex-row flex-wrap">
                {design.tags.map((tag) => (
                  <View key={tag} className="mb-2 mr-2 rounded-full bg-[#EEEAFB] px-3 py-2 dark:bg-[#2B2448]">
                    <Text className="text-xs font-medium text-[#3B2D85] dark:text-[#C5BBF5]">{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <TouchableOpacity onPress={handleRequestCustomization} className="mt-6 items-center rounded-full bg-[#3B2D85] py-4">
            <Text className="text-base font-semibold text-white">Request Customization</Text>
          </TouchableOpacity>
        </View>
      
      <View className="absolute bottom-[50] left-0 right-0 flex-row bg-[#F5F5F5] px-6 pb-8 pt-4 dark:bg-[#121212]">
        <TouchableOpacity
          onPress={() => handleAddToCart(false)}
          className="mr-2 flex-1 items-center justify-center rounded-2xl border border-[#3B2D85] py-4">
          <Text className="text-base font-semibold text-[#3B2D85]">Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAddToCart(true)} className="ml-2 flex-1 items-center justify-center rounded-2xl bg-[#3B2D85] py-4">
          <Text className="text-base font-semibold text-white">Print Now</Text>
        </TouchableOpacity>
      </View>

      <ActionFeedbackModal
        visible={Boolean(feedback)}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={() => setFeedback(null)}
      />
      </ScrollView>
    </View>

  );
}
