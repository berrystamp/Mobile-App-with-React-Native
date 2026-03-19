import { addRecentDesign, addSearchHistory, getSearchFilters, SearchFilters } from '@/lib/localStorage';
import { normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/apiClient';
import { Design } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

const getLowestPrice = (design: Design) => {
  const prices = design.mocks.map((mock) => mock.price).filter((price) => price > 0);
  return prices.length > 0 ? Math.min(...prices) : design.amount || 0;
};

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

function SearchDesignCard({ design, onPress }: { design: Design; onPress: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const artistName = `${design.profile.firstName} ${design.profile.lastName}`.trim() || design.profile.username;
  const imageUrl = design.imagePath;
  const price = getLowestPrice(design);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
          borderColor: isDark ? '#2A2A2A' : '#F0F0F0',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}>
      <View style={[styles.cardImageWrap, { backgroundColor: isDark ? '#232323' : '#F8F8FA' }]}>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" /> : null}
        <View style={[styles.cardHeart, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.95)' }]}>
          <Ionicons name={design.liked ? 'heart' : 'heart-outline'} size={16} color={design.liked ? '#FF5C74' : '#8C8C8C'} />
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#232323' }]} numberOfLines={1}>
          {design.title}
        </Text>
        <Text style={[styles.cardMeta, { color: isDark ? '#B0B0B0' : '#8A8A8A' }]} numberOfLines={1}>
          By {artistName}
        </Text>
        <Text style={[styles.cardPrice, { color: isDark ? '#FFFFFF' : '#232323' }]}>₦{price.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const SearchScreen = () => {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Design[]>([]);
  const [storedFilters, setStoredFilters] = useState<SearchFilters>({
    productCategories: [],
    designCategories: [],
    priceRange: [0, 9000],
    sortBy: 'Recently added',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#222222',
      subtext: isDark ? '#AEAEAE' : '#8A8A8A',
      inputBg: isDark ? '#171717' : '#FFFFFF',
      inputBorder: isDark ? '#2D2D2D' : '#E8E8EE',
      icon: isDark ? '#CFCFCF' : '#666666',
    }),
    [isDark],
  );

  const loadFilters = useCallback(async () => {
    const filters = await getSearchFilters();
    setStoredFilters(filters);
  }, []);

  const loadDesigns = useCallback(
    async (query: string, filters: SearchFilters) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = query.trim()
          ? await ApiService.searchDesigns({ searchField: query.trim(), size: 20, page: 0 })
          : await ApiService.getRecentDesigns(20);

        const normalizedResults = normalizeDesignListResponse(response);
        setResults(applyStoredFilters(normalizedResults, filters));
      } catch (err: any) {
        console.error('Search screen request failed', err);
        setError(err.response?.data?.message || 'Unable to load designs right now.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadFilters();
    }, [loadFilters]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDesigns(searchQuery, storedFilters);
    }, searchQuery.trim() ? 350 : 0);

    return () => clearTimeout(timer);
  }, [loadDesigns, searchQuery, storedFilters]);

  const openProduct = useCallback(
    async (design: Design) => {
      await Promise.all([addRecentDesign(design.id), addSearchHistory(searchQuery)]);
      router.push({
        pathname: '/products',
        params: {
          designId: String(design.id),
          searchField: searchQuery || undefined,
        },
      });
    },
    [router, searchQuery],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.headerRow}>
        <View style={[styles.searchInputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}> 
          <Ionicons name="search-outline" size={18} color={theme.icon} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search designs"
            placeholderTextColor={theme.subtext}
            style={[styles.searchInput, { color: theme.text }]}
            returnKeyType="search"
            onSubmitEditing={() => addSearchHistory(searchQuery)}
          />
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={() => router.push('/Filter')}>
          <Ionicons name="options-outline" size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
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
              <SearchDesignCard key={design.id} design={design} onPress={() => openProduct(design)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  centerState: {
    paddingVertical: 56,
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    paddingVertical: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  card: {
    width: '47.5%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImageWrap: {
    height: 116,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 3,
  },
  cardMeta: {
    fontSize: 10,
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default SearchScreen;
