import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DEFAULT_DESIGN_THEMES, decodeDraft, encodeDraft } from '@/lib/customDesign';

export default function SelectDesignThemeScreen() {
  const router = useRouter();
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  const parsed = useMemo(() => decodeDraft(draft), [draft]);
  const [selected, setSelected] = useState(parsed?.designTheme || '');

  const apply = () => {
    const nextDraft = encodeDraft({ designFor: parsed?.designFor || '', designTheme: selected, items: parsed?.items || [] });
    router.replace({ pathname: '/custom-design', params: { draft: nextDraft } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2C2733" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Design Theme</Text>
        <TouchableOpacity onPress={apply}>
          <Text style={styles.apply}>Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {DEFAULT_DESIGN_THEMES.map((theme) => {
          const isSelected = selected === theme;
          return (
            <TouchableOpacity key={theme} style={styles.row} onPress={() => setSelected(theme)}>
              <Text style={[styles.label, isSelected && styles.activeLabel]}>{theme}</Text>
              <View style={[styles.radio, isSelected && styles.radioActive]}>{isSelected ? <View style={styles.dot} /> : null}</View>
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
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EAE6F2', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 20, color: '#2C2733' },
  activeLabel: { color: '#3A2E99', fontWeight: '500' },
  radio: { width: 23, height: 23, borderRadius: 11.5, borderWidth: 1.5, borderColor: '#D2CDDE', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#3A2E99' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3A2E99' },
});
