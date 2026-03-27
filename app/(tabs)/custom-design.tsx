import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { decodeDraft, encodeDraft } from '@/lib/customDesign';

const pill = (label: string) => <Text style={styles.itemPill} key={label}>{label}</Text>;

export default function CustomDesignScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ draft?: string }>();
  const parsedDraft = useMemo(() => decodeDraft(params.draft), [params.draft]);

  const [designFor, setDesignFor] = useState(parsedDraft?.designFor || '');
  const [theme, setTheme] = useState(parsedDraft?.designTheme || '');
  const [items, setItems] = useState<string[]>(parsedDraft?.items || []);

  React.useEffect(() => {
    if (!parsedDraft) return;
    setDesignFor(parsedDraft.designFor || '');
    setTheme(parsedDraft.designTheme || '');
    setItems(parsedDraft.items || []);
  }, [parsedDraft]);

  const draft = { designFor, designTheme: theme, items };
  const encoded = encodeDraft(draft);
  const canContinue = Boolean(designFor && theme && items.length);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2D273A" />
        </TouchableOpacity>
        <Text style={styles.title}>Custom Design</Text>
        <TouchableOpacity
          onPress={() => {
            setDesignFor('');
            setTheme('');
            setItems([]);
          }}>
          <Text style={styles.clear}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.field}
          onPress={() => router.push({ pathname: '/SelectDesignForScreen', params: { draft: encoded } })}>
          <Text style={[styles.fieldText, !designFor && styles.placeholder]}>{designFor || 'What Are You Designing For'}</Text>
          <Ionicons name="chevron-down" size={20} color="#7D788A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.field}
          onPress={() => router.push({ pathname: '/SelectDesignThemeScreen', params: { draft: encoded } })}>
          <Text style={[styles.fieldText, !theme && styles.placeholder]}>{theme || 'Preferred Design Theme'}</Text>
          <Ionicons name="chevron-down" size={20} color="#7D788A" />
        </TouchableOpacity>

        <View style={styles.itemsHeader}>
          <Text style={styles.itemsLabel}>What Item(s) would you like to print on?</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/SelectItemsScreen', params: { draft: encoded } })}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemsWrap}>
          {items.length ? items.slice(0, 6).map(pill) : <Text style={styles.placeholder}>No item selected.</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
        disabled={!canContinue}
        onPress={() => router.push({ pathname: '/select-printer', params: { draft: encoded } })}>
        <Text style={styles.primaryButtonText}>Select Printer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 31, fontWeight: '600', color: '#2D273A' },
  clear: { color: '#3E2FA0', fontSize: 18, fontWeight: '500' },
  content: { paddingHorizontal: 20, paddingTop: 14 },
  field: { height: 54, borderWidth: 1, borderColor: '#D5D2DF', borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', marginBottom: 12 },
  fieldText: { fontSize: 17, color: '#2F2A39' },
  placeholder: { color: '#A29CAD' },
  itemsHeader: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemsLabel: { color: '#2F2A39', fontSize: 19, flex: 1, paddingRight: 8 },
  viewAll: { fontSize: 18, color: '#3E2FA0' },
  itemsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  itemPill: { backgroundColor: '#EEEAFB', color: '#3B2D85', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, overflow: 'hidden', fontSize: 14 },
  primaryButton: { position: 'absolute', left: 20, right: 20, bottom: 30, borderRadius: 28, backgroundColor: '#3C2D90', alignItems: 'center', paddingVertical: 16 },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
});
