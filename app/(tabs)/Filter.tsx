import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Header from '@/components/common/Header';
import CheckboxList from '@/components/filter/CheckboxList';
import PriceRangeSlider from '@/components/filter/PriceRangeSlider';
import SortOptions from '@/components/filter/SortOptions';
import { productCategories, designCategories, sortOptions } from '../data/mockData';
import { useRouter } from 'expo-router';

const FilterScreen = () => {
  const [selectedProductCategories, setSelectedProductCategories] = useState<string[]>([
    'Clothing/Apparel',
    'Face Mask',
  ]);
  const router = useRouter();
  const [selectedDesignCategories, setSelectedDesignCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9000]);
  const [sortBy, setSortBy] = useState('Recently added');

  const handleClear = () => {
    setSelectedProductCategories([]);
    setSelectedDesignCategories([]);
    setPriceRange([0, 9000]);
    setSortBy('Recently added');
  };

  const handleApply = () => {
    console.log('Filters applied:', {
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
    <View style={styles.container}>
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

      <View style={styles.footer}>
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
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
