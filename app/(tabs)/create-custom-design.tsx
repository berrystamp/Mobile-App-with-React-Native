import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { decodeDraft, encodeDraft } from '@/lib/customDesign';

export default function CustomDesignScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ draft?: string }>();

  const [designFor, setDesignFor] = useState('');
  const [theme, setTheme] = useState('');
  const [items, setItems] = useState<string[]>([]);

  // Re-read draft every time we return to this screen from a sub-screen
  useFocusEffect(
    useCallback(() => {
      const parsed = decodeDraft(params.draft as string | undefined);
      setDesignFor(parsed?.designFor || '');
      setTheme(parsed?.designTheme || '');
      setItems(parsed?.items || []);
    }, [params.draft])
  );

  const draft = { designFor, designTheme: theme, items };
  const encoded = encodeDraft(draft);
  const canContinue = Boolean(designFor && theme && items.length);

  // Bottom button height: py-4 (~16px*2) + text (~22px) + pt-4 (~16px) + border = ~70px
  // Add insets.bottom so it sits above Android nav bar
  const bottomBarHeight = 70 + Math.max(insets.bottom, 16);

  return (
    <View className="flex-1 bg-[#F8F8FB] dark:bg-[#121212]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomBarHeight + 16 }}>
        <View className="px-4 pb-4 pt-12">
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-[#1E1E1E]">
              <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : '#2D273A'} />
            </TouchableOpacity>
            <Text className="text-[18px] font-semibold text-[#2D273A] dark:text-white">Custom Design</Text>
            <TouchableOpacity
              onPress={() => {
                setDesignFor('');
                setTheme('');
                setItems([]);
              }}>
              <Text className="text-[14px] font-semibold text-[#4A34A5]">Clear</Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-[28px] bg-[#4A34A5] px-5 py-5 dark:bg-[#362774]">
            <Text className="text-[20px] font-semibold text-white">Bring your idea to life</Text>
            <Text className="mt-2 text-[13px] leading-5 text-white/75">
              Tell us what you want to create and we&apos;ll help you connect with the right designer.
            </Text>

            <View className="mt-5 flex-row flex-wrap">
              <StatusPill label={designFor || 'Design for'} active={Boolean(designFor)} />
              <StatusPill label={theme || 'Theme'} active={Boolean(theme)} />
              <StatusPill
                label={items.length ? `${items.length} item${items.length > 1 ? 's' : ''}` : 'Items'}
                active={Boolean(items.length)}
              />
            </View>
          </View>

          <View className="mt-6">
            <SelectionCard
              label="What are you designing for"
              value={designFor || 'Select occasion or purpose'}
              isPlaceholder={!designFor}
              onPress={() =>
                router.push({ pathname: '/(tabs)/SelectDesignForScreen', params: { draft: encoded } })
              }
            />

            <SelectionCard
              label="Preferred design theme"
              value={theme || 'Choose a design style'}
              isPlaceholder={!theme}
              onPress={() =>
                router.push({ pathname: '/(tabs)/SelectDesignThemeScreen', params: { draft: encoded } })
              }
            />

            <View className="mt-5 rounded-[24px] bg-white px-4 py-4 shadow-sm dark:bg-[#1E1E1E]">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 pr-4 text-[14px] font-medium text-[#2E2939] dark:text-white">
                  What item(s) would you like to print on?
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({ pathname: '/(tabs)/SelectItemsScreen', params: { draft: encoded } })
                  }>
                  <Text className="text-[13px] font-semibold text-[#4A34A5]">View all</Text>
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

            <View className="mt-5 rounded-[24px] bg-white px-4 py-4 shadow-sm dark:bg-[#1E1E1E]">
              <Text className="text-[15px] font-semibold text-[#2E2939] dark:text-white">Design Summary</Text>
              <SummaryRow label="Design for" value={designFor || 'Not selected'} />
              <SummaryRow label="Theme" value={theme || 'Not selected'} />
              <SummaryRow
                label="Print items"
                value={items.length ? items.join(', ') : 'No item selected'}
                isLast
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom button — clears Android nav bar via insets.bottom */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F8F8FB] px-4 pt-4 dark:border-[#232327] dark:bg-[#121212]"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(tabs)/select-designer', params: { draft: encoded } })}
          disabled={!canContinue}
          className={`items-center rounded-full py-4 ${canContinue ? 'bg-[#4A34A5]' : 'bg-[#CFC8E8] dark:bg-[#3A3450]'}`}>
          <Text className="text-[15px] font-semibold text-white">Select Designer</Text>
        </TouchableOpacity>
      </View>
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
    <TouchableOpacity onPress={onPress} className="mb-4 rounded-[24px] bg-white px-4 py-4 shadow-sm dark:bg-[#1E1E1E]">
      <Text className="mb-3 text-[12px] font-medium text-[#887FA0] dark:text-[#8F8FA1]">{label}</Text>
      <View className="flex-row items-center justify-between rounded-xl border border-[#E7E3F2] px-4 py-4 dark:border-[#33333A]">
        <Text
          className={`flex-1 text-[14px] ${isPlaceholder ? 'text-[#A19BAF] dark:text-[#7D7D88]' : 'text-[#2E2939] dark:text-white'}`}>
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#A39BB2" />
      </View>
    </TouchableOpacity>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <View className={`mb-2 mr-2 rounded-full px-3 py-2 ${active ? 'bg-white/20' : 'bg-white/10'}`}>
      <Text className="text-[12px] font-medium text-white">{label}</Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-start justify-between py-3 ${isLast ? '' : 'border-b border-[#F0EBF7] dark:border-[#31313A]'}`}>
      <Text className="mr-4 text-[13px] text-[#847C95] dark:text-[#9B9BA6]">{label}</Text>
      <Text className="flex-1 text-right text-[13px] font-medium text-[#2E2939] dark:text-white">{value}</Text>
    </View>
  );
}
