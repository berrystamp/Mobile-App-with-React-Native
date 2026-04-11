import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [design, setDesign] = useState<Design | null>(null);

  // Modal & Selection State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMock, setSelectedMock] = useState<any>(null);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartIntent, setCartIntent] = useState<'cart' | 'print'>('cart');

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

        // Initialize default mock if available
        if (normalized.mocks && normalized.mocks.length > 0) {
          setSelectedMock(normalized.mocks[0]);
          if (normalized.mocks[0].colours?.length > 0) {
            setSelectedColour(normalized.mocks[0].colours[0]);
          }
        }
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

  const handleShare = async () => {
    if (!design) return;
    try {
      await Share.share({
        message: `Check out "${design.title}" by ${artistName} on Berrystamp!\nPrice: ${formatNaira(price)}`,
      });
    } catch (error: any) {
      setFeedback({ title: 'Share failed', message: error.message });
    }
  };

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

  const openOptionsModal = (intent: 'cart' | 'print') => {
    setCartIntent(intent);
    setIsModalVisible(true);
  };

  const confirmAddToCart = async () => {
    if (!design || !selectedMock) {
      setFeedback({ title: 'Unavailable', message: 'Please select a printable mock first.' });
      return;
    }

    try {
      setIsAddingToCart(true);
      await ApiService.addOrUpdateCartItem(design.id, selectedMock.id, { 
        quantity: 1, 
        colour: selectedColour 
      });
      
      setIsModalVisible(false);
      
      if (cartIntent === 'print') {
        router.push({ pathname: '/cart', params: { openPrintPrefs: '1' } });
        return;
      }
      setFeedback({ title: 'Added to cart', message: 'Item was added to your cart successfully.' });
    } catch (error: any) {
      setFeedback({ title: 'Action failed', message: error?.response?.data?.message || 'Unable to update your cart right now.' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleMockSelect = (mock: any) => {
    setSelectedMock(mock);
    if (mock.colours && mock.colours.length > 0) {
      if (!mock.colours.includes(selectedColour)) {
        setSelectedColour(mock.colours[0]);
      }
    } else {
      setSelectedColour(null);
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
          id: `msg-${Date.now()}`,
          type: 'text',
          text: `Hi, I want to customize "${design.title}" for a new order. Can we discuss size, color, quantity and printing options?`,
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

                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/my-shop', params: { profileId: String(design.profile.id) } })}
                  className="ml-2 flex-1 flex-row items-center">
                  <Image source={avatarImage} className="h-10 w-10 rounded-full border border-white/20" />
                  <View className="ml-3 flex-1">
                    <Text numberOfLines={1} className="text-lg font-semibold text-white">{design.title}</Text>
                    <Text numberOfLines={1} className="text-sm text-white/90">Designed by {artistName}</Text>
                  </View>
                </TouchableOpacity>

                <View className="flex-row items-center">
                  <TouchableOpacity onPress={handleAddToFavorite} className="mx-1 h-9 w-9 items-center justify-center">
                    <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleShare} className="h-9 w-9 items-center justify-center">
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
          <Text className="mt-2 text-md font-semibold text-[#333333] dark:text-white">{formatNaira(price)}</Text>

          <View className="mt-5 rounded-3xl bg-white p-4 dark:bg-[#1E1E1E]">
            <Text className="text-md font-semibold text-[#333333] dark:text-white">Description</Text>
            <Text className="mt-3 text-sm leading-7 text-[#4F4F4F] dark:text-[#D7D7D7]">
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
            <Text className="text-md font-semibold text-white">Request Customization</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons restored to their original location inside the ScrollView */}
        <View style={{paddingBottom:100}} className="absolute bottom-[10] left-0 right-0 flex-row bg-[#F5F5F5] px-6 pt-4 dark:bg-[#121212]">
          <TouchableOpacity
            onPress={() => openOptionsModal('cart')}
            className="mr-2 flex-1 items-center justify-center rounded-2xl border border-[#3B2D85] py-4">
            <Text className="text-base font-semibold text-[#3B2D85] dark:text-[#C5BBF5]">Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openOptionsModal('print')} className="ml-2 flex-1 items-center justify-center rounded-2xl bg-[#3B2D85] py-4">
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

      {/* Variant Selection Modal */}
      <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="max-h-[90%] rounded-t-[32px] bg-white px-6 pb-10 pt-6 dark:bg-[#1A1A1A]">
            
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-[#333333] dark:text-white">Product details</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} className="rounded-full bg-gray-100 p-2 dark:bg-[#2A2A2A]">
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              <Image 
                source={{ uri: selectedMock?.imagePath || design.imagePath }} 
                style={{ width: '100%', height: 280, borderRadius: 16 }}
                className="bg-gray-100 dark:bg-[#2A2A2A]" 
                resizeMode="contain" 
              />
              
              {design.mocks && design.mocks.length > 0 && (
                <View className="mt-4 flex-row">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {design.mocks.map((mock) => {
                      const isActive = selectedMock?.id === mock.id;
                      return (
                        <TouchableOpacity
                          key={mock.id}
                          onPress={() => handleMockSelect(mock)}
                          className={`mr-3 overflow-hidden rounded-xl border-2 ${isActive ? 'border-[#3B2D85]' : 'border-transparent'}`}
                        >
                          <Image 
                            source={{ uri: mock.imagePath }} 
                            style={{ width: 64, height: 64 }}
                            className="bg-gray-100 dark:bg-[#2A2A2A]" 
                            resizeMode="cover" 
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <Text className="mt-5 text-lg font-semibold text-[#333333] dark:text-white">{design.title}</Text>
              <Text className="text-base text-gray-500 dark:text-gray-400">By {artistName}</Text>
            
              {selectedMock?.colours?.length > 0 && (
                <>
                  <Text className="mt-6 text-base font-semibold text-[#333333] dark:text-white">Colours</Text>
                  <View className="mt-3 flex-row flex-wrap">
                    {selectedMock.colours.map((colour: string) => {
                      const isActive = selectedColour === colour;
                      return (
                        <TouchableOpacity
                          key={colour}
                          className={`mb-3 mr-3 flex-row items-center rounded-full border px-4 py-2 ${
                            isActive ? 'border-[#3B2D85] bg-black/5 dark:bg-black/40' : 'border-gray-200 dark:border-[#333333]'
                          }`}
                          onPress={() => setSelectedColour(colour)}>
                          <View style={{ backgroundColor: colour }} className="mr-3 h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600" />
                          <Text className="text-sm text-gray-700 dark:text-gray-300">{colour}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <View className="mt-6 rounded-2xl bg-gray-50 p-5 dark:bg-[#2A2A2A]">
                <Text className="mb-3 text-base font-bold text-[#333333] dark:text-white">Order summary</Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Base price: ₦{(selectedMock?.price || design.amount || 0).toLocaleString()}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  Availability: {selectedMock?.availableQty ?? 'N/A'} in stock
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              className={`items-center rounded-2xl bg-[#3B2D85] py-4 ${isAddingToCart ? 'opacity-70' : 'opacity-100'}`}
              disabled={isAddingToCart}
              onPress={confirmAddToCart}>
              <Text className="text-base font-bold text-white">
                {isAddingToCart ? 'Processing...' : cartIntent === 'print' ? 'Confirm Print Now' : 'Add to cart'}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}