import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react'; // <-- 1. Add useEffect here
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppAlert } from '@/components/common/AppAlert';
import ApiService from '@/services/apiClient';
import { useCustomDesignStore } from '@/context/CustomDesignContext';

export default function CustomDesignScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { show: showAlert, element: alertElement } = useAppAlert();
  const [submitting, setSubmitting] = useState(false);

  const { 
    designFor, 
    theme, 
    items, 
    productContext, 
    setProductContext, 
    clearDraft 
  } = useCustomDesignStore();

  // ---------------------------------------------------------
  // 2. ADD THIS: Automatic Cleanup on Back Button
  // ---------------------------------------------------------
  useEffect(() => {
    return () => {
      // This cleanup function ONLY runs when this screen is closed/popped.
      // It wipes the global state automatically so it's fresh next time.
      clearDraft();
    };
  }, []); 
  // ---------------------------------------------------------

  const canContinue = Boolean(designFor && theme && items.length);
  const isProductCustomization = Boolean(productContext?.sourceDesignId);

  const bottomBarHeight = 70 + Math.max(insets.bottom, 16);

  const handleContinue = async () => {
    if (!canContinue || submitting) return;
    
    if (!isProductCustomization) {
      router.push({ pathname: '/(tabs)/select-designer' });
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await ApiService.createCustomizationOrderRequest({
        designId: Number(productContext?.sourceDesignId) || 0,
        designerId: Number(productContext?.designerId) || 0,
        mockTypes: items,
        purpose: designFor,
        theme: theme,
        dateOfDelivery: new Date().toISOString(),
        estimatedAmount: 0,
      });

      const body = response?.responseBody || response?.data || response || {};
      const conversationId = body?.conversationId || body?.conversation?.id || body?.orderRequest?.conversationId;
      const orderId = body?.orderId || body?.order?.id || body?.id;

      // We still explicitly clear here just to be safe before routing to chat
      clearDraft();

      router.replace({
        pathname: '/(tabs)/chat',
        params: {
          ...(conversationId ? { conversationId: String(conversationId) } : {}),
          ...(orderId ? { orderId: String(orderId) } : {}),
          participantId: String(productContext?.designerId),
          participantName: productContext?.designerName || 'Designer',
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
      setSubmitting(false);
    }
  };


  return (
    <View className="flex-1 bg-white dark:bg-[#121212]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomBarHeight + 16 }}>
        <View className="px-4 pb-10 pt-10">
          <View className="mb-5 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="h-8 w-8 items-start justify-center">
              <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : '#2D273A'} />
            </TouchableOpacity>
            <Text className="text-[17px] font-medium text-[#2D273A] dark:text-white">Custom Design</Text>
            
            <TouchableOpacity onPress={clearDraft}>
              <Text className="text-[15px] font-semibold text-[#4A34A5]">Clear</Text>
            </TouchableOpacity>
          </View>

          <View>
            {/* NEW: Attached Product Banner */}
            {isProductCustomization && (
              <View className="mb-4 flex-row items-center justify-between rounded-lg bg-[#F0EBFF] px-4 py-3 dark:bg-[#30244F]">
                <View className="flex-1 pr-2">
                  <Text className="text-[10px] font-semibold uppercase tracking-wider text-[#4A34A5] dark:text-[#C8BFFF]">
                    Attached Product
                  </Text>
                  <Text className="mt-0.5 text-[13px] font-medium text-[#2E2939] dark:text-white" numberOfLines={1}>
                    {productContext?.sourceDesignTitle || 'Custom Product'}
                  </Text>
                </View>
                {/* Clicking this instantly detaches the product and turns the submit button back into 'Select Designer' */}
                <TouchableOpacity 
                  onPress={() => setProductContext(null)} 
                  className="h-8 w-8 items-center justify-center rounded-full bg-white/50 dark:bg-black/20"
                >
                  <Ionicons name="close" size={18} color={isDark ? '#C8BFFF' : '#4A34A5'} />
                </TouchableOpacity>
              </View>
            )}

            <SelectionCard
              label="What Are You Designing For"
              value={designFor || 'What are you Designing for'}
              isPlaceholder={!designFor}
              onPress={() => router.push('/(tabs)/SelectDesignForScreen')}
            />

            <SelectionCard
              label="Preferred Design Theme"
              value={theme || 'Preferred Design Theme'}
              isPlaceholder={!theme}
              onPress={() => router.push('/(tabs)/SelectDesignThemeScreen')}
            />

            <View className="mt-5 bg-white dark:bg-[#121212]">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 pr-4 text-[12px] font-medium text-[#2E2939] dark:text-white">
                  What item(s) would you like to print on?
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/SelectItemsScreen')}>
                  <Text className="text-[12px] font-semibold text-[#4A34A5]">View all</Text>
                </TouchableOpacity>
              </View>

              {items.length ? (
                <View className="mt-4 flex-row flex-wrap">
                  {items.map((item) => (
                    <View key={item} className="mb-2 mr-2 rounded-full bg-[#F0EBFF] px-4 py-2 dark:bg-[#30244F]">
                      <Text className="text-[12px] font-medium text-[#4A34A5] dark:text-[#C8BFFF]">{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/SelectItemsScreen')}
                  className="mt-4 rounded-2xl border border-dashed border-[#D9D4E6] px-4 py-5 dark:border-[#393939]">
                  <Text className="text-center text-[13px] font-medium text-[#847C95] dark:text-[#9B9BA6]">
                    Tap to select items you want to print on
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 dark:bg-[#121212]"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canContinue || submitting}
          className={`items-center rounded-full py-4 ${canContinue ? 'bg-[#4A34A5]' : 'bg-[#CFC8E8] dark:bg-[#3A3450]'}`}>
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-semibold text-white">
              {isProductCustomization ? 'Submit Request' : 'Select Designer'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {alertElement}
    </View>
  );
}

function SelectionCard({
  label,
  value,
  isPlaceholder,
  onPress,
}: {
  label: string;
  value: string;
  isPlaceholder?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="mb-4">
      <View className="flex-row items-center justify-between rounded-md border border-[#E7E3F2] px-3 py-3 dark:border-[#33333A]">
        <Text className={`flex-1 text-[12px] ${isPlaceholder ? 'text-[#A19BAF] dark:text-[#7D7D88]' : 'text-[#2E2939] dark:text-white'}`}>
          {isPlaceholder ? label : value}
        </Text>
        <Ionicons name="chevron-down" size={15} color="#A39BB2" />
      </View>
    </TouchableOpacity>
  );
}