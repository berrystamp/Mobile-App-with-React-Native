import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DEFAULT_PRINT_ITEMS, decodeDraft, encodeDraft } from '@/lib/customDesign';

export default function SelectItemsScreen() {
  const router = useRouter();
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  const parsed = useMemo(() => decodeDraft(draft), [draft]);
  const [selected, setSelected] = useState<string[]>(parsed?.items || []);

  const toggle = (item: string) => {
    setSelected((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  };

  const apply = () => {
    const nextDraft = encodeDraft({ designFor: parsed?.designFor || '', designTheme: parsed?.designTheme || '', items: selected });
    router.replace({ pathname: '/custom-design', params: { draft: nextDraft } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2C2733" />
        </TouchableOpacity>
        <Text style={styles.title}>Select items</Text>
        <TouchableOpacity onPress={apply}>
          <Text style={styles.apply}>Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {DEFAULT_PRINT_ITEMS.map((item) => {
          const checked = selected.includes(item);
          return (
            <TouchableOpacity key={item} style={styles.row} onPress={() => toggle(item)}>
              <Text style={[styles.label, checked && styles.activeLabel]}>{item}</Text>
              <View style={[styles.checkbox, checked && styles.checkboxActive]}>
                {checked ? <Ionicons name="checkmark" size={16} color="#3A2E99" /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F6F8' },
  header: { paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600', color: '#2C2733', flex: 1, marginHorizontal: 10 },
  apply: { color: '#3A2E99', fontSize: 18, fontWeight: '500' },
  content: { paddingHorizontal: 20 },
  row: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#EAE6F2', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 20, color: '#2C2733' },
  activeLabel: { color: '#3A2E99', fontWeight: '500' },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 1.5, borderColor: '#D2CDDE', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { borderColor: '#3A2E99', backgroundColor: '#F2EFFF' },
});
