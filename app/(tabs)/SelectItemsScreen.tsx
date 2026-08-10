import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEFAULT_PRINT_ITEMS } from '@/lib/customDesign';
import { useAppTheme } from '@/lib/theme/appTheme';
import { useCustomDesignStore } from '@/context/CustomDesignContext';

const MAX_SELECTIONS = 3;

export default function SelectItemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  
  const { items, setItems } = useCustomDesignStore();
  const [selected, setSelected] = useState<string[]>(items || []);

  const atLimit = selected.length >= MAX_SELECTIONS;

  const toggle = (item: string) => {
    setSelected((current) => {
      if (current.includes(item)) {
        return current.filter((value) => value !== item);
      }
      if (current.length >= MAX_SELECTIONS) return current;
      return [...current, item];
    });
  };

  const apply = () => {
    setItems(selected);
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Select Items</Text>
        <TouchableOpacity onPress={apply} style={styles.applyButton}>
          <Text style={[styles.applyText, { color: theme.primary }]}>Apply</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.counter, { backgroundColor: theme.surfaceMuted }]}>
        <Text style={[styles.counterText, { color: atLimit ? theme.primary : theme.textMuted }]}>
          {selected.length}/{MAX_SELECTIONS} selected{atLimit ? ' limit reached' : ''}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {DEFAULT_PRINT_ITEMS.map((item, index) => {
            const isChecked = selected.includes(item);
            const isDisabled = !isChecked && atLimit;
            const isLast = index === DEFAULT_PRINT_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={isDisabled ? 1 : 0.75}
                onPress={() => !isDisabled && toggle(item)}
                style={[
                  styles.optionRow,
                  !isLast && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
                  isDisabled && { opacity: 0.4 },
                ]}>
                <Text style={[styles.optionText, { color: isChecked ? theme.primary : theme.text }]}>
                  {item}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconButton: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', marginHorizontal: 12 },
  applyButton: { minWidth: 48 },
  applyText: { fontSize: 16, fontWeight: '700', textAlign: 'right' },
  counter: { paddingHorizontal: 20, paddingVertical: 8 },
  counterText: { fontSize: 12, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  optionRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 18 },
  optionText: { flex: 1, fontSize: 15, fontWeight: '600', paddingRight: 16 },
  checkbox: { alignItems: 'center', borderRadius: 8, borderWidth: 1.5, height: 24, justifyContent: 'center', width: 24 },
});