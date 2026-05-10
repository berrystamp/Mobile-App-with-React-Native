import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEFAULT_DESIGN_THEMES, decodeDraft, encodeDraft } from '@/lib/customDesign';
import { useAppTheme } from '@/lib/theme/appTheme';

export default function SelectDesignThemeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  const parsed = useMemo(() => decodeDraft(draft), [draft]);
  const [selected, setSelected] = useState(parsed?.designTheme || '');

  const apply = () => {
    const nextDraft = encodeDraft({
      designFor: parsed?.designFor || '',
      designTheme: selected,
      items: parsed?.items || [],
    });
    // Replace back to the correct screen — /(tabs)/create-custom-design
    router.replace({ pathname: '/(tabs)/create-custom-design', params: { draft: nextDraft } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Select Theme</Text>
        <TouchableOpacity onPress={apply} style={styles.applyButton}>
          <Text style={[styles.applyText, { color: theme.primary }]}>Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {DEFAULT_DESIGN_THEMES.map((item, index) => {
            const isSelected = selected === item;
            const isLast = index === DEFAULT_DESIGN_THEMES.length - 1;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.75}
                onPress={() => setSelected(item)}
                style={[
                  styles.optionRow,
                  !isLast && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
                ]}>
                <Text style={[styles.optionText, { color: isSelected ? theme.primary : theme.text }]}>
                  {item}
                </Text>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? theme.primary : 'transparent',
                    },
                  ]}>
                  {isSelected ? <View style={[styles.radioInner, { backgroundColor: theme.onPrimary }]} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  applyButton: {
    minWidth: 48,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingRight: 16,
  },
  radioOuter: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioInner: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
});
