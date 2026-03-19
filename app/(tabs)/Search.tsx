import { DesignCard } from '@/components/DesignCard';
import SearchBar from '@/components/common/SearchBar';
import CategoryList from '@/components/search/CategoryList';
import SearchHistory from '@/components/search/SearchHistory';
import { normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/api';
import { Design } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { categories, searchHistory } from '../data/mockData';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#111111',
      subtext: isDark ? '#ABABAB' : '#777777',
    }),
    [isDark],
  );

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await ApiService.searchDesigns({ searchField: trimmedQuery, size: 20, page: 0 });
        setResults(normalizeDesignListResponse(response));
      } catch (err: any) {
        console.error('Search failed', err);
        setError(err.response?.data?.message || 'Unable to search designs right now.');
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleHistoryItemPress = (item: string) => {
    setSearchQuery(item);
  };

  const handleCategoryPress = (category: { name: string }) => {
    setSearchQuery(category.name);
  };

  const openProduct = (design: Design) => {
    router.push({
      pathname: '/products',
      params: {
        designId: String(design.id),
        searchField: searchQuery,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => router.push('/Filter')}
        placeholder="Search designs, tags or mock name"
        autoFocus
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!searchQuery.trim() ? (
          <>
            <Text style={[styles.helperTitle, { color: theme.text }]}>Recent searches</Text>
            <SearchHistory items={searchHistory} onItemPress={handleHistoryItemPress} />
            <CategoryList title="Search by categories" categories={categories} onCategoryPress={handleCategoryPress} />
          </>
        ) : (
          <>
            <Text style={[styles.resultTitle, { color: theme.text }]}>Results for “{searchQuery.trim()}”</Text>
            {isLoading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#4B3A99" />
              </View>
            ) : error ? (
              <Text style={[styles.message, { color: '#E15656' }]}>{error}</Text>
            ) : results.length === 0 ? (
              <Text style={[styles.message, { color: theme.subtext }]}>No matching designs found.</Text>
            ) : (
              <View style={styles.grid}>
                {results.map((design) => (
                  <DesignCard key={design.id} design={design} onPress={() => openProduct(design)} />
                ))}
              </View>
            )}
          </>
        )}

        <Text style={[styles.tip, { color: theme.subtext }]}>Tap any design to view details and add it to your cart.</Text>
      </ScrollView>
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
  content: {
    paddingBottom: 110,
  },
  helperTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  centerState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  grid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  message: {
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  tip: {
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default SearchScreen;
