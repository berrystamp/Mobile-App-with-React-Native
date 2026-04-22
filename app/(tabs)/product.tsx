import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import { formatNaira } from '@/lib/currency';
import { normalizeDesign, normalizeDesignListResponse } from '@/lib/designs';
import { upsertLocalConversation } from '@/lib/localConversations';
import ApiService from '@/services/apiClient';
import type { Design, Mock } from '@/types';

const AVATAR_FALLBACK = require('@/assets/images/item1.png');

type ReviewSummary = {
  average: number;
  count: number;
  distribution: Record<number, number>;
};

function buildReviewSummary(items: any[]): ReviewSummary {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const ratings = items
    .map((item) => Number(item?.stars ?? item?.rating ?? item?.rate ?? 0))
    .map((value) => Math.max(0, Math.min(5, Math.round(value))))
    .filter((value) => value > 0);

  ratings.forEach((value) => {
    distribution[value] = (distribution[value] || 0) + 1;
  });

  const total = ratings.length;
  const average = total ? ratings.reduce((sum, value) => sum + value, 0) / total : 0;

  return {
    average,
    count: total,
    distribution,
  };
}

function getMockSizes(mock?: Mock | null): string[] {
  if (!mock) return [];
  const dynamic = (mock as any).sizes || (mock as any).availableSizes || (mock as any).sizeOptions;
  if (Array.isArray(dynamic)) {
    return dynamic.map((item) => String(item)).filter(Boolean);
  }
  return [];
}

export default function ProductScreen() {
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const isDark = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();

  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState<Design | null>(null);
  const [relatedDesigns, setRelatedDesigns] = useState<Design[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<ReviewSummary>({ average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedMock, setSelectedMock] = useState<Mock | null>(null);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

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

        const defaultMock = normalized.mocks[0] || null;
        setSelectedMock(defaultMock);
        setSelectedColour(defaultMock?.colours?.[0] || null);
        setSelectedSize(getMockSizes(defaultMock)[0] || null);

        const [relatedResponse, reviewsResponse] = await Promise.all([
          ApiService.getDesigns({ page: 0, size: 12, designer: normalized.designerId }).catch(() => ({ responseBody: { content: [] } })),
          ApiService.getShopReviews(normalized.profile.id, 0, 200).catch(() => ({ responseBody: { content: [] } })),
        ]);

        const related = normalizeDesignListResponse(relatedResponse).filter((item) => item.id !== normalized.id).slice(0, 4);
        setRelatedDesigns(related);

        const reviewList = (reviewsResponse as any)?.responseBody?.content || (reviewsResponse as any)?.content || [];
        setReviewsSummary(buildReviewSummary(Array.isArray(reviewList) ? reviewList : []));
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
    return mockPrices.length ? Math.min(...mockPrices) : design.amount || 0;
  }, [design]);

  const availableQty = useMemo(() => {
    if (!design) return 0;
    return design.mocks.reduce((sum, mock) => sum + (mock.availableQty || 0), 0);
  }, [design]);

  const artistName = useMemo(() => {
    if (!design) return 'Berrystamp';
    return (design as any).shopName || (design as any).brandName || design.designerName || design.profile.username || `${design.profile.firstName} ${design.profile.lastName}`.trim();
  }, [design]);

  const mockSizes = useMemo(() => getMockSizes(selectedMock), [selectedMock]);

  const handleShare = async () => {
    if (!design) return;
    try {
      await Share.share({ message: `Check out "${design.title}" by ${artistName} on Berrystamp.` });
    } catch {
      setFeedback({ title: 'Share failed', message: 'Unable to share this product right now.' });
    }
  };

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
    if (!design || !selectedMock) {
      setFeedback({ title: 'Unavailable', message: 'Please pick an available mockup first.' });
      return;
    }

    try {
      await ApiService.addOrUpdateCartItem(design.id, selectedMock.id, {
        quantity,
        colour: selectedColour || undefined,
        size: selectedSize || undefined,
      });

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
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
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
                <Text numberOfLines={1} className="text-base font-semibold text-white">{design.title}</Text>
                <Text numberOfLines={1} className="text-xs text-white/90">Designed by {artistName}</Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleFavoriteToggle} className="mx-1 h-9 w-9 items-center justify-center">
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} className="h-9 w-9 items-center justify-center">
                <Feather name="share-2" size={21} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="bg-[#ECECEC] py-4 dark:bg-[#1A1A1A]">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => setGalleryIndex(Math.round(event.nativeEvent.contentOffset.x / width))}>
            {gallery.map((item) => (
              <View key={item.id} style={{ width }} className="items-center justify-center px-5">
                <Image source={{ uri: item.imagePath }} style={{ width: width * 0.74, height: 300 }} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
          <View className="mt-3 flex-row justify-center">
            {gallery.map((item, index) => (
              <View key={item.id} className={`mx-1 h-2.5 rounded-full ${index === galleryIndex ? 'w-6 bg-[#333333]' : 'w-2.5 bg-[#D0D0D0]'}`} />
            ))}
          </View>
        </View>

        <View className="px-6 pb-2 pt-4">
          <Text className="text-[28px] font-semibold text-[#222222] dark:text-white">{design.title}</Text>
          <Text className="mt-1 text-base text-[#3A3A3A] dark:text-[#E3E3E3]">From <Text className="text-[#2D71E3]">{design.categories?.[0] || 'Japan tour Collection'}</Text></Text>
          <Text className="mt-2 text-[14px] text-[#4C4C4C] dark:text-[#D8D8D8]"><Text className="font-semibold">{availableQty || design.mocks.length}</Text> piece available</Text>

          {!!selectedMock?.category && (
            <View className="mt-2 flex-row items-center">
              <MaterialCommunityIcons name="lock-outline" size={14} color="#666" />
              <Text className="ml-1 text-xs text-[#666]">This design is {selectedMock.category.toLowerCase()}</Text>
            </View>
          )}
        </View>

        {!!selectedMock?.colours?.length && (
          <View className="px-6 py-2">
            <Text className="mb-2 text-sm font-medium text-[#222] dark:text-white">Select Colors</Text>
            <View className="flex-row flex-wrap">
              {selectedMock.colours.map((colour) => (
                <TouchableOpacity
                  key={colour}
                  onPress={() => setSelectedColour(colour)}
                  className={`mr-3 mt-2 h-8 w-8 rounded-full border ${selectedColour === colour ? 'border-[#3B2D85] border-2' : 'border-[#D7D7D7]'}`}
                  style={{ backgroundColor: colour }}
                />
              ))}
            </View>
          </View>
        )}

        {!!mockSizes.length && (
          <View className="px-6 py-2">
            <Text className="mb-2 text-sm font-medium text-[#222] dark:text-white">Select size</Text>
            <View className="flex-row flex-wrap">
              {mockSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  className={`mr-2 mt-2 min-w-[44px] rounded-md border px-3 py-1.5 ${selectedSize === size ? 'border-[#3B2D85] bg-[#EEEAFB]' : 'border-[#D7D7D7] bg-white dark:bg-[#1A1A1A]'}`}>
                  <Text className="text-xs font-medium text-[#333] dark:text-white">{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="px-6 py-2">
          <Text className="mb-2 text-sm font-medium text-[#222] dark:text-white">Quantity</Text>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setQuantity((q) => Math.max(1, q - 1))} className="h-8 w-8 items-center justify-center rounded bg-[#124EB7]">
              <Text className="text-lg font-bold text-white">-</Text>
            </TouchableOpacity>
            <Text className="mx-4 text-base font-semibold text-[#333] dark:text-white">{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity((q) => q + 1)} className="h-8 w-8 items-center justify-center rounded bg-[#124EB7]">
              <Text className="text-lg font-bold text-white">+</Text>
            </TouchableOpacity>
          </View>
          <Text className="mt-3 text-xs text-[#666]">Your item order will be delivered within 5 days of payment.</Text>
        </View>

        <View className="px-6 pt-2">
          <TouchableOpacity onPress={() => router.push('/item-specification')} className="mb-3 flex-row items-center rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 dark:border-[#2C2C2C] dark:bg-[#1D1D1D]">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-lg bg-[#ECEBFF]"><Ionicons name="add" size={20} color="#3B2D85" /></View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-[#343434] dark:text-white">Add Item Specification</Text>
              <Text className="text-xs text-[#8B8B8B]">Color, Size and Quantity</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/print-specification')} className="mb-2 flex-row items-center rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 dark:border-[#2C2C2C] dark:bg-[#1D1D1D]">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-lg bg-[#ECEBFF]"><Ionicons name="add" size={20} color="#3B2D85" /></View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-[#343434] dark:text-white">Add Printing Specification</Text>
              <Text className="text-xs text-[#8B8B8B]">Type, budget and Time Frame</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRequestCustomization} className="mb-2 mt-3 flex-row items-center rounded-xl border border-[#D8D8E8] bg-white px-4 py-3 dark:border-[#2F2F45] dark:bg-[#1D1D1D]">
            <MaterialCommunityIcons name="note-edit-outline" size={18} color="#3B2D85" />
            <Text className="ml-3 flex-1 text-sm font-medium text-[#3B2D85]">Request customization</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#D1D1D1' : '#8F8F8F'} />
          </TouchableOpacity>
        </View>

        <View className="px-6 pt-2">
          <Text className="text-sm font-semibold text-[#222] dark:text-white">Policy</Text>
          <Text className="mt-2 text-xs leading-5 text-[#666]">To be delivered to anywhere in Nigeria after 10 days. Note that delivery days might be sooner base on your location.</Text>
          <Text className="mt-2 text-xs leading-5 text-[#666]">Return is free with tangible reason within 10 days after delivery.</Text>
        </View>

        <View className="px-6 pt-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-[#222] dark:text-white">Designer Reviews</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/shop-reviews', params: { profileId: String(design.profile.id) } })}>
              <Text className="text-xs font-medium text-[#3B2D85]">See more</Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-xl bg-white p-3 dark:bg-[#1D1D1D]">
            <View className="flex-row items-center justify-between">
              <View className="items-center">
                <Text className="text-sm font-semibold text-[#3B2D85]">{reviewsSummary.average ? `${reviewsSummary.average.toFixed(1)}/5` : '0/5'}</Text>
                <Text className="mt-1 text-yellow-500">★ ★ ★ ★ ★</Text>
                <Text className="mt-1 text-xs text-[#777]">{reviewsSummary.count} Reviews</Text>
              </View>
              <View className="flex-1 pl-4">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviewsSummary.distribution[rating] || 0;
                  const ratio = reviewsSummary.count ? count / reviewsSummary.count : 0;
                  return (
                    <View key={rating} className="mb-1 flex-row items-center">
                      <Text className="w-6 text-[10px] text-[#666]">{rating}</Text>
                      <View className="mx-1 h-1.5 flex-1 rounded-full bg-[#E8E8F4]"><View style={{ width: `${ratio * 100}%` }} className="h-1.5 rounded-full bg-[#3B2D85]" /></View>
                      <Text className="w-7 text-right text-[10px] text-[#666]">({count})</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {!!design.description && (
          <View className="px-6 pt-5">
            <Text className="text-base font-semibold text-[#222] dark:text-white">Description</Text>
            <Text className="mt-2 text-xs leading-5 text-[#666]">{design.description}</Text>
          </View>
        )}

        {!!design.mocks.length && (
          <View className="px-6 pt-5">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-[#222] dark:text-white">Select Mockup</Text>
              <TouchableOpacity onPress={() => router.push('/products')}><Text className="text-xs font-medium text-[#3B2D85]">View all</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {design.mocks.map((mock) => (
                <TouchableOpacity
                  key={mock.id}
                  onPress={() => {
                    setSelectedMock(mock);
                    setSelectedColour(mock.colours?.[0] || null);
                    setSelectedSize(getMockSizes(mock)[0] || null);
                  }}
                  className={`mr-3 w-[132px] overflow-hidden rounded-xl border ${selectedMock?.id === mock.id ? 'border-[#3B2D85]' : 'border-transparent'} bg-white dark:bg-[#1D1D1D]`}>
                  <View className="h-24 items-center justify-center bg-[#F2F2F2] dark:bg-[#2A2A2A]">
                    {!!mock.imagePath && <Image source={{ uri: mock.imagePath }} className="h-20 w-20" resizeMode="contain" />}
                  </View>
                  <View className="px-2 py-2">
                    <Text numberOfLines={1} className="text-xs text-[#333] dark:text-white">{mock.name}</Text>
                    <Text className="mt-1 text-xs font-semibold text-[#333] dark:text-white">{formatNaira(mock.price || lowestPrice)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {!!relatedDesigns.length && (
          <View className="px-6 pb-4 pt-5">
            <Text className="mb-3 text-base font-semibold text-[#222] dark:text-white">More like this</Text>
            <View className="flex-row flex-wrap justify-between">
              {relatedDesigns.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => router.push({ pathname: '/product', params: { designId: String(item.id) } })} className="mb-3 w-[48.5%] overflow-hidden rounded-xl bg-white dark:bg-[#1D1D1D]">
                  <View className="h-24 bg-[#F2F2F2] dark:bg-[#2A2A2A]">{!!item.imagePath && <Image source={{ uri: item.imagePath }} className="h-full w-full" resizeMode="cover" />}</View>
                  <View className="px-2 py-2">
                    <Text numberOfLines={1} className="text-xs text-[#333] dark:text-white">{item.title}</Text>
                    <Text className="mt-0.5 text-[10px] text-[#8B8B8B]">By {item.designerName || artistName}</Text>
                    <Text className="mt-1 text-sm font-semibold text-[#333] dark:text-white">{formatNaira(item.amount || 0)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: isDark ? '#121212' : '#F5F5F5', paddingHorizontal: 16, paddingBottom: 24, paddingTop: 10, gap: 8 }}>
        <TouchableOpacity
          onPress={() => handleAddToCart(false)}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#3B2D85', paddingVertical: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#3B2D85' }}>Add to cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAddToCart(true)}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#3B2D85', paddingVertical: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Print now</Text>
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
