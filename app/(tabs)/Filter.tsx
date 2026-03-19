import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import Header from '@/components/common/Header';
import CheckboxList from '@/components/filter/CheckboxList';
import PriceRangeSlider from '@/components/filter/PriceRangeSlider';
import SortOptions from '@/components/filter/SortOptions';
import { normalizeDesignListResponse } from '@/lib/designs';
import { defaultSearchFilters, getSearchFilters, setSearchFilters } from '@/lib/localStorage';
import ApiService from '@/services/apiClient';
import { useRouter } from 'expo-router';

const sortOptions = ['Recently added', 'Low Price', 'High Price'];

const FilterScreen = () => {
  const [selectedProductCategories, setSelectedProductCategories] = useState<string[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedDesignCategories, setSelectedDesignCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9000]);
  const [sortBy, setSortBy] = useState('Recently added');
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [designCategories, setDesignCategories] = useState<string[]>([]);

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#FFF',
      card: isDark ? '#121212' : '#FFF',
      border: isDark ? '#2A2A2A' : '#F0F0F0',
    }),
    [isDark],
  );

  useEffect(() => {
    const loadState = async () => {
      const [filters, designResponse] = await Promise.all([getSearchFilters(), ApiService.getDesigns({ size: 40 })]);
      const designs = normalizeDesignListResponse(designResponse);
      const nextProductCategories = Array.from(
        new Set(designs.flatMap((design) => design.mocks.map((mock) => mock.name)).filter(Boolean)),
      ).slice(0, 12);
      const nextDesignCategories = Array.from(
        new Set(designs.flatMap((design) => design.categories || []).filter(Boolean)),
      ).slice(0, 12);

      setSelectedProductCategories(filters.productCategories);
      setSelectedDesignCategories(filters.designCategories);
      setPriceRange(filters.priceRange);
      setSortBy(filters.sortBy);
      setProductCategories(nextProductCategories);
      setDesignCategories(nextDesignCategories);
    };

    loadState().catch((error) => {
      console.error('Failed to load filter options', error);
    });
  }, []);

  const handleClear = async () => {
    setSelectedProductCategories([]);
    setSelectedDesignCategories([]);
    setPriceRange(defaultSearchFilters.priceRange);
    setSortBy(defaultSearchFilters.sortBy);
    await setSearchFilters(defaultSearchFilters);
  };

  const handleApply = async () => {
    await setSearchFilters({
      productCategories: selectedProductCategories,
      designCategories: selectedDesignCategories,
      priceRange,
      sortBy,
    });
    router.back();
  };

  const toggleProductCategory = (category: string) => {
    setSelectedProductCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  const toggleDesignCategory = (category: string) => {
    setSelectedDesignCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Header
        type="back"
        title="Filter"
        onBackPress={() => router.back()}
        rightAction
        rightActionText="Clear"
        onRightAction={handleClear}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <CheckboxList
          label="Product Categories"
          items={productCategories}
          selectedItems={selectedProductCategories}
          onToggle={toggleProductCategory}
        />

        <CheckboxList
          label="Design Categories"
          items={designCategories}
          selectedItems={selectedDesignCategories}
          onToggle={toggleDesignCategory}
        />

        <PriceRangeSlider range={priceRange} onRangeChange={setPriceRange} />

        <SortOptions options={sortOptions} selected={sortBy} onSelect={setSortBy} />

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}> 
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  applyBtn: {
    backgroundColor: '#4A3F8F',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default FilterScreen;
