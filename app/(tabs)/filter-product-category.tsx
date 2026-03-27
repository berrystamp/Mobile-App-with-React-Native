import { defaultSearchFilters, getSearchFilters, setSearchFilters } from '@/lib/localStorage';
import { normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function FilterProductCategoryScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#222222',
      subtext: isDark ? '#B0B0B0' : '#999999',
      border: isDark ? '#2A2A2A' : '#ECECF2',
      inputBg: isDark ? '#171717' : '#FFFFFF',
    }),
    [isDark],
  );

  useEffect(() => {
    const loadState = async () => {
      const [filters, designResponse] = await Promise.all([getSearchFilters(), ApiService.getDesigns({ size: 40 })]);
      const designs = normalizeDesignListResponse(designResponse);
      setSelectedItems(filters.productCategories);
      setItems(Array.from(new Set(designs.flatMap((design) => design.mocks.map((mock) => mock.name)).filter(Boolean))));
    };

    loadState().catch((error) => console.error('Failed to load product categories', error));
  }, []);

  const toggleItem = (item: string) => {
    setSelectedItems((prev) => (prev.includes(item) ? prev.filter((entry) => entry !== item) : [...prev, item]));
  };

  const handleApply = async () => {
    const filters = await getSearchFilters();
    await setSearchFilters({ ...filters, productCategories: selectedItems });
    router.back();
  };

  const handleClear = async () => {
    setSelectedItems([]);
    const filters = await getSearchFilters();
    await setSearchFilters({ ...filters, productCategories: defaultSearchFilters.productCategories });
  };

  const filteredItems = items.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.topIconButton}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: theme.text }]}>Product Category</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}> 
        <Ionicons name="search-outline" size={18} color={theme.subtext} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Category"
          placeholderTextColor={theme.subtext}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredItems.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity key={item} style={styles.listItem} onPress={() => toggleItem(item)}>
              <Text style={[styles.listText, { color: theme.text }]}>{item}</Text>
              <View style={[styles.checkbox, { borderColor: isSelected ? '#4B3A99' : theme.border, backgroundColor: isSelected ? '#F1EEFF' : 'transparent' }]}>
                {isSelected ? <Ionicons name="checkmark" size={16} color="#4B3A99" /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyText}>Apply filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topIconButton: { width: 28, height: 28, justifyContent: 'center' },
  topTitle: { fontSize: 15, fontWeight: '600' },
  clearButton: { minWidth: 40, alignItems: 'flex-end' },
  clearText: { color: '#4B3A99', fontSize: 14, fontWeight: '500' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: 24,
    marginHorizontal: 16,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 120 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  listText: { fontSize: 14 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: 16, paddingBottom: 28 },
  applyButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4B3A99',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
