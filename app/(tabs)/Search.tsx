import { DesignCard } from '@/components/DesignCard';
import SearchBar from '@/components/common/SearchBar';
import CategoryList from '@/components/search/CategoryList';
import SearchHistory from '@/components/search/SearchHistory';
import { normalizeDesignListResponse } from '@/lib/designs';
import { addRecentDesign, addSearchHistory, getSearchFilters, getSearchHistory, SearchFilters } from '@/lib/localStorage';
import ApiService from '@/services/apiClient';
import { Design } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

interface SearchCategory {
  id: number;
  name: string;
  image: string;
}

const sortDesigns = (designs: Design[], sortBy: string) => {
  const list = [...designs];

  if (sortBy === 'Low Price') {
    return list.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
  }

  if (sortBy === 'High Price') {
    return list.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
  }

  return list.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime() || b.id - a.id,
  );
};

const getLowestPrice = (design: Design) => {
  const prices = design.mocks.map((mock) => mock.price).filter((price) => price > 0);
  if (prices.length > 0) return Math.min(...prices);
  return design.amount || 0;
};

const applyStoredFilters = (designs: Design[], filters: SearchFilters) => {
  const [minPrice, maxPrice] = filters.priceRange;

  return sortDesigns(
    designs.filter((design) => {
      const lowestPrice = getLowestPrice(design);
      const matchesProductCategory =
        filters.productCategories.length === 0 ||
        design.mocks.some((mock) => filters.productCategories.includes(mock.name));
      const matchesDesignCategory =
        filters.designCategories.length === 0 ||
        design.categories?.some((category) => filters.designCategories.includes(category));
      const matchesPrice = lowestPrice >= minPrice && lowestPrice <= maxPrice;

      return matchesProductCategory && matchesDesignCategory && matchesPrice;
    }),
    filters.sortBy,
  );
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [storedFilters, setStoredFilters] = useState<SearchFilters>({
    productCategories: [],
    designCategories: [],
    priceRange: [0, 9000],
    sortBy: 'Recently added',
  });
  const [categories, setCategories] = useState<SearchCategory[]>([]);
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

  const loadStoredState = useCallback(async () => {
    const [history, filters] = await Promise.all([getSearchHistory(), getSearchFilters()]);
    setRecentSearches(history);
    setStoredFilters(filters);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await ApiService.getDesigns({ size: 30 });
      const designs = normalizeDesignListResponse(response);
      const uniqueCategories = new Map<string, SearchCategory>();

      designs.forEach((design) => {
        (design.categories || []).forEach((category) => {
          if (!category || uniqueCategories.has(category)) return;
          uniqueCategories.set(category, {
            id: uniqueCategories.size + 1,
            name: category,
            image: design.imagePath,
          });
        });
      });

      setCategories(Array.from(uniqueCategories.values()).slice(0, 8));
    } catch (err) {
      console.error('Failed to load search categories', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStoredState();
    }, [loadStoredState]),
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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
        const normalizedResults = normalizeDesignListResponse(response);
        setResults(applyStoredFilters(normalizedResults, storedFilters));
      } catch (err: any) {
        console.error('Search failed', err);
        setError(err.response?.data?.message || 'Unable to search designs right now.');
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, storedFilters]);

  const persistSearch = useCallback(async (query: string) => {
    const nextHistory = await addSearchHistory(query);
    setRecentSearches(nextHistory);
  }, []);

  const handleHistoryItemPress = (item: string) => {
    setSearchQuery(item);
  };

  const handleCategoryPress = (category: { name: string }) => {
    setSearchQuery(category.name);
  };

  const openProduct = async (design: Design) => {
    await Promise.all([addRecentDesign(design.id), persistSearch(searchQuery)]);
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
        onSubmitEditing={() => persistSearch(searchQuery)}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!searchQuery.trim() ? (
          <>
            <Text style={[styles.helperTitle, { color: theme.text }]}>Recent searches</Text>
            <SearchHistory items={recentSearches} onItemPress={handleHistoryItemPress} />
            {categories.length > 0 ? (
              <CategoryList title="Search by categories" categories={categories} onCategoryPress={handleCategoryPress} />
            ) : null}
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
