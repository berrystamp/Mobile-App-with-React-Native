import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEFAULT_DESIGN_CATEGORIES, decodeDraft, encodeDraft } from '@/lib/customDesign';
import { useAppTheme } from '@/lib/theme/appTheme';

const MAX_SELECTIONS = 3;

export default function SelectDesignForScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  const parsed = useMemo(() => decodeDraft(draft), [draft]);

  const initialSelections = parsed?.designFor ? parsed.designFor.split(', ').filter(Boolean) : [];
  const standardSelected = initialSelections.filter((item) =>
    DEFAULT_DESIGN_CATEGORIES.includes(item as (typeof DEFAULT_DESIGN_CATEGORIES)[number])
  );
  const customInitial = initialSelections
    .filter(
      (item) => !DEFAULT_DESIGN_CATEGORIES.includes(item as (typeof DEFAULT_DESIGN_CATEGORIES)[number])
    )
    .join(', ');

  const [selected, setSelected] = useState<string[]>(standardSelected);
  const [custom, setCustom] = useState(customInitial);

  const totalCount = selected.length + (custom.trim() ? custom.split(',').filter((s) => s.trim()).length : 0);
  const atLimit = totalCount >= MAX_SELECTIONS;

  const toggle = (category: string) => {
    setSelected((current) => {
      if (current.includes(category)) {
        // Always allow deselect
        return current.filter((item) => item !== category);
      }
      // Block new selection if at limit
      if (atLimit) return current;
      return [...current, category];
    });
  };

  const apply = () => {
    const customValues = custom
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const choices = Array.from(new Set([...selected, ...customValues])).slice(0, MAX_SELECTIONS);
    const nextDraft = encodeDraft({
      designFor: choices.join(', '),
      designTheme: parsed?.designTheme || '',
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Designing For</Text>
        <TouchableOpacity onPress={apply} style={styles.applyButton}>
          <Text style={[styles.applyText, { color: theme.primary }]}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Selection counter */}
      <View style={[styles.counter, { backgroundColor: theme.surfaceMuted }]}>
        <Text style={[styles.counterText, { color: atLimit ? theme.primary : theme.textMuted }]}>
          {totalCount}/{MAX_SELECTIONS} selected{atLimit ? ' — limit reached' : ''}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {DEFAULT_DESIGN_CATEGORIES.map((category, index) => {
            const isChecked = selected.includes(category);
            const isDisabled = !isChecked && atLimit;
            const isLast = index === DEFAULT_DESIGN_CATEGORIES.length - 1;
            return (
              <TouchableOpacity
                key={category}
                activeOpacity={isDisabled ? 1 : 0.75}
                onPress={() => !isDisabled && toggle(category)}
                style={[
                  styles.optionRow,
                  !isLast && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
                  isDisabled && { opacity: 0.4 },
                ]}>
                <Text style={[styles.optionText, { color: isChecked ? theme.primary : theme.text }]}>
                  {category}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isChecked ? theme.primary : 'transparent',
                      borderColor: isChecked ? theme.primary : theme.border,
                    },
                  ]}>
                  {isChecked ? <Ionicons name="checkmark" size={15} color={theme.onPrimary} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            Can&apos;t see your category? Add a custom one
          </Text>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="Input custom category"
            placeholderTextColor={theme.textMuted}
            editable={!atLimit || Boolean(custom.trim())}
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: custom.trim() ? theme.primary : theme.border,
                color: theme.text,
                opacity: atLimit && !custom.trim() ? 0.4 : 1,
              },
            ]}
          />
          {atLimit && (
            <Text style={[styles.limitNote, { color: theme.primary }]}>
              Maximum {MAX_SELECTIONS} selections reached
            </Text>
          )}
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
  counter: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
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
  checkbox: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  limitNote: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
});
