// src/screens/SearchScreen.jsx
import React, { useState } from 'react';

import { useRouter } from "expo-router";
import { View, ScrollView, StyleSheet } from 'react-native';
import SearchBar from '@/components/common/SearchBar';
import SearchHistory from '@/components/search/SearchHistory';
import CategoryList from '@/components/search/CategoryList';
import ProductGrid from '@/components/lists/ProductGrid';
import { searchHistory, categories, products } from '../data/mockData';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
 const router = useRouter();
  const handleHistoryItemPress = (item) => {
    setSearchQuery(item);
  };

  const handleCategoryPress = (category) => {
    console.log('Category pressed:', category);
  };

  const handleProductPress = (product) => {
    console.log('Product pressed:', product);
  };

  const handleFavoritePress = (id) => {
    console.log('Favorite pressed:', id);
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => router.push('Filter')}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!searchQuery ? (
          <>
            <SearchHistory
              items={searchHistory}
              onItemPress={handleHistoryItemPress}
            />
            <CategoryList
              title="Search by categories"
              categories={categories}
              onCategoryPress={handleCategoryPress}
            />
          </>
        ) : (
          <ProductGrid
            data={products}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            showTitle={false}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
});

export default SearchScreen;