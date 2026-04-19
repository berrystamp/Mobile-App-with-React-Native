import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View, useColorScheme, useWindowDimensions } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import { formatNaira } from '@/lib/currency';
import { normalizeDesign, normalizeDesignListResponse } from '@/lib/designs';
import { upsertLocalConversation } from '@/lib/localConversations';
import ApiService from '@/services/apiClient';
import type { Design, Mock } from '@/types';

const AVATAR_FALLBACK = require('@/assets/images/item1.png');

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const isDark = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState<Design | null>(null);
  const [relatedDesigns, setRelatedDesigns] = useState<Design[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!designId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await ApiService.fetchDesignById(Number(designId));
        const normalized = normalizeDesign(response?.responseBody || response);
        setDesign(normalized);
        setIsFavorite(normalized.liked);

        const relatedResponse = await ApiService.getDesigns({
          page: 0,
          size: 6,
          designer: normalized.designerId,
        });
        const related = normalizeDesignListResponse(relatedResponse).filter((item) => item.id !== normalized.id).slice(0, 4);
        setRelatedDesigns(related);
      } catch {
        setDesign(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [designId]);

  const gallery = useMemo(() => {
    if (!design) return [];
    const mockGallery = design.mocks
      .filter((mock) => mock.imagePath)
      .map((mock) => ({ id: `mock-${mock.id}`, imagePath: mock.imagePath, label: mock.name }));
    const items = [{ id: `design-${design.id}`, imagePath: design.imagePath, label: design.title }, ...mockGallery];
    return items.filter((item, index, list) => item.imagePath && list.findIndex((entry) => entry.imagePath === item.imagePath) === index);
  }, [design]);

  const lowestPrice = useMemo(() => {
    if (!design) return 0;
    const mockPrices = design.mocks.map((mock) => mock.price).filter((price) => price > 0);
    return mockPrices.length > 0 ? Math.min(...mockPrices) : design.amount || 0;
  }, [design]);

  const availableQty = useMemo(() => {
    if (!design) return 0;
    return design.mocks.reduce((total, mock) => total + (mock.availableQty || 0), 0);
  }, [design]);

  const artistName = useMemo(() => {
    if (!design) return 'Berrystamp';
    // Prefer shop/brand name over personal name
    return (design as any).shopName
      || (design as any).brandName
      || design.designerName
      || design.profile.username
      || `${design.profile.firstName} ${design.profile.lastName}`.trim();
  }, [design]);

  const handleFavoriteToggle = async () => {
    if (!designId) return;

    const nextFavoriteState = !isFavorite;
    setIsFavorite(nextFavoriteState);

    try {
      await ApiService.toggleFavorite(String(designId));
      setFeedback({
        title: nextFavoriteState ? 'Added to favourites' : 'Removed from favourites',
        message: nextFavoriteState ? 'This product has been saved to your favourites.' : 'This product has been removed from your favourites.',
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
      initialMessages: [
        {
          id: `customization-${design.id}-${Date.now()}`,
          type: 'text',
          text: `Hi, I want to customize "${design.title}" for a new order. Can we discuss size, color, quantity and printing options?`,
          previewText: `Customization request for "${design.title}"`,
          author: 'me',
          createdAt: new Date().toISOString(),
          status: 'sent',
        },
      ],
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

  if (loading) {
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
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View className="bg-[#B7B7B7] px-5 pb-4 pt-12">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push({ pathname: '/my-shop', params: { profileId: String(design.profile.id) } })}
              className="ml-2 flex-1 flex-row items-center">
              <Image source={design.profile.profilePicturePath ? { uri: design.profile.profilePicturePath } : AVATAR_FALLBACK} className="h-10 w-10 rounded-full" />
              <View className="ml-3 flex-1">
                <Text numberOfLines={1} className="text-lg font-semibold text-white">{design.title}</Text>
                <Text numberOfLines={1} className="text-sm text-white/90">Designed by {artistName}</Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleFavoriteToggle} className="mx-1 h-9 w-9 items-center justify-center">
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity className="h-9 w-9 items-center justify-center">
                <Feather name="share-2" size={21} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="bg-[#ECECEC] py-5 dark:bg-[#1A1A1A]">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setGalleryIndex(nextIndex);
            }}>
            {gallery.map((item) => (
              <View key={item.id} style={{ width }} className="items-center justify-center px-6">
                <Image source={{ uri: item.imagePath }} style={{ width: width * 0.78, height: 320 }} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
          {gallery.length > 1 ? (
            <View className="mt-3 flex-row justify-center">
              {gallery.map((item, index) => (
                <View key={item.id} className={`mx-1 h-2.5 rounded-full ${index === galleryIndex ? 'w-6 bg-[#333333]' : 'w-2.5 bg-[#D0D0D0]'}`} />
              ))}
            </View>
          ) : null}
        </View>

        <View className="px-6 pb-4 pt-5">
          <Text className="text-[28px] font-semibold text-[#222222] dark:text-white">{design.title}</Text>
          <Text className="mt-1 text-base text-[#3A3A3A] dark:text-[#E3E3E3]">
            From <Text className="text-[#2D71E3]">{design.categories?.[0] || 'Berrystamp Collection'}</Text>
          </Text>
          <Text className="mt-2 text-lg text-[#4C4C4C] dark:text-[#D8D8D8]">
            <Text className="font-semibold">{availableQty || design.mocks.length}</Text> piece available
          </Text>
          <Text className="mt-2 text-[26px] font-semibold text-[#333333] dark:text-white">{formatNaira(lowestPrice)}</Text>
        </View>

        <View className="px-5">
          <TouchableOpacity
            onPress={() => router.push('/item-specification')}
            className="mb-3 flex-row items-center rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 dark:border-[#2C2C2C] dark:bg-[#1D1D1D]">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-lg bg-[#ECEBFF]">
              <Ionicons name="add" size={22} color="#3B2D85" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-[#343434] dark:text-white">Add Item Specification</Text>
              <Text className="text-xs text-[#8B8B8B]">Color, size and quantity</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/print-specification')}
            className="mb-3 flex-row items-center rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 dark:border-[#2C2C2C] dark:bg-[#1D1D1D]">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-lg bg-[#ECEBFF]">
              <Ionicons name="add" size={22} color="#3B2D85" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-[#343434] dark:text-white">Add Printing Specification</Text>
              <Text className="text-xs text-[#8B8B8B]">Type, budget and timeframe</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRequestCustomization}
            className="mb-5 mt-3 flex-row items-center rounded-xl border border-[#D8D8E8] px-4 py-4 dark:border-[#2F2F45]">
            <MaterialCommunityIcons name="note-edit-outline" size={20} color="#3B2D85" />
            <Text className="ml-3 flex-1 text-base font-medium text-[#3B2D85]">Request customization</Text>
            <Ionicons name="chevron-forward" size={22} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>
        </View>

        <View className="px-6">
          <Text className="text-2xl font-semibold text-[#262626] dark:text-white">Description</Text>
          <Text className="mt-3 text-sm leading-7 text-[#4A4A4A] dark:text-[#D7D7D7]">
            {design.description || 'No description is available for this design yet.'}
          </Text>
        </View>

        {design.mocks.length ? (
          <View className="mt-6 px-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-semibold text-[#262626] dark:text-white">Available Mockups</Text>
              <TouchableOpacity onPress={() => router.push('/products')}>
                <Text className="text-sm font-medium text-[#3B2D85]">View all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {design.mocks.map((mock: Mock) => (
                <TouchableOpacity key={mock.id} className="mr-3 w-[160px] overflow-hidden rounded-2xl bg-white dark:bg-[#1F1F1F]">
                  <View className="h-28 items-center justify-center bg-[#F2F2F2] dark:bg-[#2A2A2A]">
                    {mock.imagePath ? <Image source={{ uri: mock.imagePath }} className="h-24 w-24" resizeMode="contain" /> : null}
                  </View>
                  <View className="px-3 py-3">
                    <Text numberOfLines={1} className="text-sm text-[#333333] dark:text-white">{mock.name}</Text>
                    <Text className="mt-1 text-base font-semibold text-[#333333] dark:text-white">{formatNaira(mock.price || lowestPrice)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {relatedDesigns.length ? (
          <View className="mt-6 px-6 pb-4">
            <Text className="mb-4 text-2xl font-semibold text-[#262626] dark:text-white">More from this designer</Text>
            <View className="flex-row flex-wrap justify-between">
              {relatedDesigns.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push({ pathname: '/product-details', params: { designId: String(item.id) } })}
                  className="mb-4 w-[48.5%] overflow-hidden rounded-2xl bg-white dark:bg-[#1F1F1F]">
                  <View className="h-36 bg-[#F2F2F2] dark:bg-[#2A2A2A]">
                    {item.imagePath ? <Image source={{ uri: item.imagePath }} className="h-full w-full" resizeMode="cover" /> : null}
                  </View>
                  <View className="px-3 py-3">
                    <Text numberOfLines={1} className="text-base text-[#303030] dark:text-white">{item.title}</Text>
                    <Text className="mt-1 text-xs text-[#8B8B8B]">By {artistName}</Text>
                    <Text className="mt-2 text-lg font-semibold text-[#303030] dark:text-white">{formatNaira(item.amount || 0)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: isDark ? '#121212' : '#F5F5F5', paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, gap: 8 }}>
        <TouchableOpacity
          onPress={() => handleAddToCart(false)}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: '#3B2D85', paddingVertical: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#3B2D85' }}>Add to cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAddToCart(true)}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#3B2D85', paddingVertical: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Print now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => { try { const { Share } = await import('react-native'); await Share.share({ message: 'Check out this design on Berrystamp: ' + (design?.title || ''), url: 'https://berrystamp.com' }); } catch {} }}
          style={{ width: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: isDark ? '#2A2A2A' : '#E0E0E0', backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }}>
          <Ionicons name="share-outline" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
        </TouchableOpacity>
      </View>

      <ActionFeedbackModal
        visible={Boolean(feedback)}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={() => setFeedback(null)}
      />
    </View>
  );
}
