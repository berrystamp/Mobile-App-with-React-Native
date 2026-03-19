import { defaultSearchFilters, getSearchFilters, setSearchFilters } from '@/lib/localStorage';
import { normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

const sortOptions = ['Recently added', 'Low Price', 'High Price'];

const FilterScreen = () => {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [selectedProductCategories, setSelectedProductCategories] = useState<string[]>([]);
  const [selectedDesignCategories, setSelectedDesignCategories] = useState<string[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [designCategories, setDesignCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9000]);
  const [sortBy, setSortBy] = useState('Recently added');

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#FFFFFF',
      card: isDark ? '#181818' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#222222',
      subtext: isDark ? '#B0B0B0' : '#8A8A8A',
      border: isDark ? '#2A2A2A' : '#ECECF2',
      chipBg: isDark ? '#241F45' : '#F1EEFF',
      chipText: '#4B3A99',
    }),
    [isDark],
  );

  useEffect(() => {
    const loadState = async () => {
      const [filters, designResponse] = await Promise.all([getSearchFilters(), ApiService.getDesigns({ size: 40 })]);
      const designs = normalizeDesignListResponse(designResponse);

      setSelectedProductCategories(filters.productCategories);
      setSelectedDesignCategories(filters.designCategories);
      setPriceRange(filters.priceRange);
      setSortBy(filters.sortBy);
      setProductCategories(
        Array.from(new Set(designs.flatMap((design) => design.mocks.map((mock) => mock.name)).filter(Boolean))).slice(0, 8),
      );
      setDesignCategories(
        Array.from(new Set(designs.flatMap((design) => design.categories || []).filter(Boolean))).slice(0, 8),
      );
    };

    loadState().catch((error) => console.error('Failed to load filters', error));
  }, []);

  const handleApply = async () => {
    await setSearchFilters({
      productCategories: selectedProductCategories,
      designCategories: selectedDesignCategories,
      priceRange,
      sortBy,
    });
    router.back();
  };

  const handleClear = async () => {
    setSelectedProductCategories([]);
    setSelectedDesignCategories([]);
    setPriceRange(defaultSearchFilters.priceRange);
    setSortBy(defaultSearchFilters.sortBy);
    await setSearchFilters(defaultSearchFilters);
  };

  const renderChip = (label: string, active = true) => (
    <View
      key={label}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.chipBg : isDark ? '#1C1C1C' : '#F8F8FC',
          borderColor: active ? 'transparent' : theme.border,
        },
      ]}>
      <Text style={[styles.chipText, { color: active ? theme.chipText : theme.subtext }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.topIconButton}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: theme.text }]}>Filter Result</Text>
        <TouchableOpacity onPress={handleClear} style={styles.topTextButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Product Categories</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/filter-product-category')}>
              <Text style={[styles.viewAllText, { color: theme.text }]}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {productCategories.slice(0, 6).map((item) => renderChip(item, selectedProductCategories.includes(item)))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Design Categories</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/filter-design-category')}>
              <Text style={[styles.viewAllText, { color: theme.text }]}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {designCategories.slice(0, 6).map((item) => renderChip(item, selectedDesignCategories.includes(item)))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Price Range</Text>
            <Text style={[styles.rangeText, { color: theme.text }]}>₦0 - ₦{priceRange[1].toLocaleString()}</Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={10000}
            step={500}
            value={priceRange[1]}
            onValueChange={(value) => setPriceRange([0, Math.round(value)])}
            minimumTrackTintColor="#4B3A99"
            maximumTrackTintColor={isDark ? '#343434' : '#E1E1E8'}
            thumbTintColor="#4B3A99"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 14 }]}>Sort By</Text>
          <View style={styles.sortRow}>
            {sortOptions.map((option) => {
              const isSelected = sortBy === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor: isSelected ? theme.chipBg : isDark ? '#1B1B1B' : '#F7F7FC',
                      borderColor: isSelected ? 'transparent' : theme.border,
                    },
                  ]}
                  onPress={() => setSortBy(option)}>
                  <Text style={[styles.sortChipText, { color: isSelected ? theme.chipText : theme.subtext }]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}> 
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topIconButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  topTextButton: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  clearText: {
    fontSize: 14,
    color: '#4B3A99',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipRow: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    maxWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 8,
  },
  applyButton: {
    backgroundColor: '#4B3A99',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default FilterScreen;
