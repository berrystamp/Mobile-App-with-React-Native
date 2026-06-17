import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppAlert } from '@/components/common/AppAlert';
import { decodeDraft, encodeDraft } from '@/lib/customDesign';
import ApiService from '@/services/apiClient';

export default function CustomDesignScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ draft?: string }>();
  const { show: showAlert, element: alertElement } = useAppAlert();

  const [designFor, setDesignFor] = useState('');
  const [theme, setTheme] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [productContext, setProductContext] = useState<ReturnType<typeof decodeDraft>>(null);
  const [submitting, setSubmitting] = useState(false);

  // Re-read draft every time we return to this screen from a sub-screen
  useFocusEffect(
    useCallback(() => {
      const parsed = decodeDraft(params.draft as string | undefined);
      setDesignFor(parsed?.designFor || '');
      setTheme(parsed?.designTheme || '');
      setItems(parsed?.items || []);
      setProductContext(parsed);
    }, [params.draft])
  );

  const draft = {
    ...(productContext || {}),
    designFor,
    designTheme: theme,
    items,
  };
  const encoded = encodeDraft(draft);
  const canContinue = Boolean(designFor && theme && items.length);
  const isProductCustomization = Boolean(productContext?.sourceDesignId && productContext?.designerId);

  // Bottom button height: py-4 (~16px*2) + text (~22px) + pt-4 (~16px) + border = ~70px
  // Add insets.bottom so it sits above Android nav bar
  const bottomBarHeight = 70 + Math.max(insets.bottom, 16);

  const unwrapBody = (response: any) => response?.responseBody || response?.data || response || {};

  const handleContinue = async () => {
    if (!canContinue || submitting) return;

    if (!isProductCustomization) {
      router.push({ pathname: '/(tabs)/select-designer', params: { draft: encoded } });
      return;
    }

    setSubmitting(true);
    try {
      const response = await ApiService.createOrderRequest({
        providerProfileId: productContext?.designerId,
        designerProfileId: productContext?.designerId,
        designId: productContext?.sourceDesignId,
        orderType: 'CUSTOM_DESIGN',
        title: productContext?.sourceDesignTitle || designFor,
        budgetAmount: 0,
        customDesignRequest: {
          purpose: designFor,
          theme,
          mockTypes: items,
          imageUrlFront: productContext?.sourceDesignImage,
        },
      });
      const body = unwrapBody(response);
      const conversationId = body?.conversationId || body?.conversation?.id || body?.orderRequest?.conversationId;
      const orderId = body?.orderId || body?.order?.id || body?.id;

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
        <View className="px-4 pb-4 pt-10">
          <View className="mb-5 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-8 w-8 items-start justify-center">
              <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : '#2D273A'} />
            </TouchableOpacity>
            <Text className="text-[13px] font-medium text-[#2D273A] dark:text-white">Custom Design</Text>
            <TouchableOpacity
              onPress={() => {
                setDesignFor('');
                setTheme('');
                setItems([]);
              }}>
              <Text className="text-[12px] font-semibold text-[#4A34A5]">Clear</Text>
            </TouchableOpacity>
          </View>

          <View>
            <SelectionCard
              label="What Are You Designing For"
              value={designFor || 'What are you Designing for'}
              isPlaceholder={!designFor}
              onPress={() =>
                router.push({ pathname: '/(tabs)/SelectDesignForScreen', params: { draft: encoded } })
              }
            />

            <SelectionCard
              label="Preferred Design Theme"
              value={theme || 'Preferred Design Theme'}
              isPlaceholder={!theme}
              onPress={() =>
                router.push({ pathname: '/(tabs)/SelectDesignThemeScreen', params: { draft: encoded } })
              }
            />

            <View className="mt-5 bg-white dark:bg-[#121212]">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 pr-4 text-[12px] font-medium text-[#2E2939] dark:text-white">
                  What item(s) would you like to print on?
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({ pathname: '/(tabs)/SelectItemsScreen', params: { draft: encoded } })
                  }>
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
                  onPress={() =>
                    router.push({ pathname: '/(tabs)/SelectItemsScreen', params: { draft: encoded } })
                  }
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

      {/* Fixed bottom button — clears Android nav bar via insets.bottom */}
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
