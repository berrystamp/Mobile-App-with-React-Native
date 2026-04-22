import { DesignCard } from '@/components/DesignCard';
import { normalizeDesign, normalizeDesignListResponse } from '@/lib/designs';
import { addSearchHistory, getSearchFilters, SearchFilters } from '@/lib/localStorage';
import ApiService from '@/services/apiClient';
import { Design, Mock } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
  if (sortBy === 'Low Price') return list.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
  if (sortBy === 'High Price') return list.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime() || b.id - a.id);
};

const applyClientFilters = (designs: Design[], query: string, filters: SearchFilters) => {
  const normalizedQuery = query.trim().toLowerCase();
  return sortDesigns(
    designs.filter((design) => {
      if (normalizedQuery) {
        const haystack = [design.title, design.description, design.designerName, ...(design.tags || []), ...(design.categories || [])]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      if (filters.designCategories.length > 0) {
        const categorySet = new Set((design.categories || []).map((item) => item.toLowerCase()));
        const hasCategory = filters.designCategories.some((item) => categorySet.has(item.toLowerCase()));
        if (!hasCategory) return false;
      }
      if (filters.productCategories.length > 0) {
        const mockSet = new Set(design.mocks.map((mock) => `${mock.category || mock.name}`.toLowerCase()));
        const hasMock = filters.productCategories.some((item) => mockSet.has(item.toLowerCase()));
        if (!hasMock) return false;
      }
      const [minPrice, maxPrice] = filters.priceRange;
      const lowest = getLowestPrice(design);
      return lowest >= minPrice && lowest <= maxPrice;
    }),
    filters.sortBy,
  );
};

export default function ProductsScreen() {
  const router = useRouter();
  const { artistId, artistName, designId, searchField } = useLocalSearchParams<{
    artistId?: string;
    artistName?: string;
    designId?: string;
    searchField?: string;
  }>();

  const isDark = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [products, setProducts] = useState<Design[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchField || '');
  const [filters, setFilters] = useState<SearchFilters>({
    productCategories: [],
    designCategories: [],
    priceRange: [0, 9000],
    sortBy: 'Recently added',
  });
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [selectedMockId, setSelectedMockId] = useState<number | null>(null);
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#F8F8F8',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#111111',
      subtext: isDark ? '#ABABAB' : '#777777',
      border: isDark ? '#2A2A2A' : '#ECECEC',
      accent: '#4B3A99',
    }),
    [isDark],
  );

  const selectedMock: Mock | undefined = useMemo(
    () => selectedDesign?.mocks?.find((mock) => mock.id === selectedMockId) || selectedDesign?.mocks?.[0],
    [selectedDesign, selectedMockId],
  );

  const loadProducts = useCallback(async (query: string, nextFilters: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      if (designId) {
        const designResponse = await ApiService.fetchDesignById(Number(designId));
        const normalizedDesign = normalizeDesign(designResponse?.responseBody || designResponse);
        setProducts([normalizedDesign]);
        setSelectedDesign(normalizedDesign);
        setSelectedMockId(normalizedDesign.mocks?.[0]?.id || null);
        setSelectedColour(normalizedDesign.mocks?.[0]?.colours?.[0] || '');

        return;
      }
     
      const response = await ApiService.getDesigns({
        page: 0,
        size: 60,
        designer: artistId ? Number(artistId) : undefined,
        searchField: query.trim() || undefined,
        designCategories: nextFilters.designCategories.length ? nextFilters.designCategories.join(',') : undefined,
        mockName: nextFilters.productCategories.length ? nextFilters.productCategories.join(',') : undefined,
        mockCategory: nextFilters.productCategories.length ? nextFilters.productCategories.join(',') : undefined,
        lowerPriceRange: nextFilters.priceRange[0],
        upperPriceRange: nextFilters.priceRange[1],
      });

      const normalizedProducts = normalizeDesignListResponse(response);
      setProducts(applyClientFilters(normalizedProducts, query, nextFilters));
    } catch (err: any) {
      console.error('Failed to load products', err);
      setError(err.response?.data?.message || 'Unable to load products right now.');
    } finally {
      setIsLoading(false);
    }
  }, [artistId, designId]);

  useFocusEffect(
    useCallback(() => {
      const syncFilters = async () => {
        const stored = await getSearchFilters();
        setFilters(stored);
      };
      syncFilters();
    }, []),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(searchQuery, filters);
    }, searchQuery.trim() ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadProducts, searchQuery, filters]);

  const openDetails = (design: Design) => {
    setSelectedDesign(design);
    setSelectedMockId(design.mocks?.[0]?.id || null);
    setSelectedColour(design.mocks?.[0]?.colours?.[0] || '');
  };

  const closeDetails = () => {
    setSelectedDesign(null);
    setSelectedMockId(null);
    setSelectedColour('');
  };

  const handleMockSelect = (mock: Mock) => {
    setSelectedMockId(mock.id);
    setSelectedColour(mock.colours?.[0] || '');
  };

  const handleAddToCart = async () => {
    if (!selectedDesign || !selectedMock) {
      Alert.alert('Unavailable', 'This design does not have a selectable mock yet.');
      return;
    }

    try {
      setIsAddingToCart(true);
      await ApiService.addToCart(selectedDesign.id, selectedMock.id, {
        quantity: 1,
        colour: selectedColour,
      });
      Alert.alert('Added to cart', `${selectedDesign.title} has been added to your cart.`, [
        {
          text: 'Continue shopping',
          style: 'cancel',
        },
        {
          text: 'Go to cart',
          onPress: () => {
            closeDetails();
            router.push('/cart');
          },
        },
      ]);
    } catch (err: any) {
      console.error('Add to cart failed', err);
      Alert.alert('Could not add to cart', err.response?.data?.message || 'Please log in and try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const title = artistName
    ? `${artistName}'s products`
    : 'Marketplace';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}> 
        <TouchableOpacity onPress={() => ( router.push('/'))} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.subtext }]} numberOfLines={1}>
            Tap a product to view details and add it to cart.
          </Text>
        </View>
        <TouchableOpacity onPress={() => loadProducts(searchQuery, filters)} style={styles.headerIcon}>
          <Ionicons name="refresh-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>
      {!designId ? (
        <View style={styles.searchRow}>
          <View style={[styles.searchInputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={18} color={theme.subtext} style={{ marginRight: 8 }} />
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
            <Ionicons name="options-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#4B3A99" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={{ color: '#E15656', textAlign: 'center' }}>{error}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={{ color: theme.subtext, textAlign: 'center' }}>No products were found for this artist yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.productList} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {products.map((product) => (
              <DesignCard key={product.id} design={product} onPress={() => openDetails(product)} />
            ))}
          </View>
        </ScrollView>
      )}

    <Modal animationType="slide" transparent visible={!!selectedDesign} onRequestClose={closeDetails}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="max-h-[90%] rounded-t-[32px] bg-white px-6 pb-10 pt-6 dark:bg-[#1A1A1A]">
          {selectedDesign ? (
            <>
              {/* Header */}
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-[#333333] dark:text-white">
                  Product details
                </Text>
                <TouchableOpacity onPress={closeDetails} className="rounded-full bg-gray-100 p-2 dark:bg-[#2A2A2A]">
                  <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
                {/* Hero Image */}
                <Image 
                  source={{ uri: selectedMock?.imagePath || selectedDesign.imagePath }} 
                  style={{ width: '100%', height: 280, borderRadius: 16 }}
                  className="bg-gray-100 dark:bg-[#2A2A2A]" 
                  resizeMode="contain" 
                />
                
                {/* Available Mocks */}
                {selectedDesign.mocks && selectedDesign.mocks.length > 0 && (
                  <View className="mt-5">
                    <Text className="mb-3 text-base font-semibold text-[#333333] dark:text-white">Available mocks</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedDesign.mocks.map((mock) => {
                        const isActive = selectedMock?.id === mock.id;
                        return (
                          <TouchableOpacity
                            key={mock.id}
                            onPress={() => handleMockSelect(mock)}
                            className={`mr-3 items-center overflow-hidden rounded-xl border-2 p-1 ${
                              isActive ? 'border-[#3B2D85] bg-[#3B2D85]/5' : 'border-transparent'
                            }`}
                          >
                            <Image 
                              source={{ uri: mock.imagePath || selectedDesign.imagePath }} 
                              style={{ width: 64, height: 64, borderRadius: 8 }}
                              className="bg-gray-100 dark:bg-[#2A2A2A]" 
                              resizeMode="cover" 
                            />
                            <Text className="mt-2 text-xs font-medium text-[#333333] dark:text-white">
                              {mock.name}
                            </Text>
                            <Text className="text-xs font-bold text-[#3B2D85] dark:text-[#9D8DF1]">
                              ₦{(mock.price || selectedDesign.amount || 0).toLocaleString()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Title & Meta */}
                <Text className="mt-5 text-lg font-bold text-[#333333] dark:text-white">
                  {selectedDesign.title}
                </Text>
                <Text className="text-base text-gray-500 dark:text-gray-400">
                  By {selectedDesign.designerName || `${selectedDesign.profile?.firstName || ''} ${selectedDesign.profile?.lastName || ''}`.trim() || 'Unknown'}
                </Text>
                {selectedDesign.description ? (
                  <Text className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-300">
                    {selectedDesign.description}
                  </Text>
                ) : null}

                {/* Colours */}
                {selectedMock?.colours?.length > 0 && (
                  <>
                    <Text className="mt-6 text-base font-semibold text-[#333333] dark:text-white">Colours</Text>
                    <View className="mt-3 flex-row flex-wrap">
                      {selectedMock.colours.map((colour) => {
                        const isActive = selectedColour === colour;
                        return (
                          <TouchableOpacity
                            key={colour}
                            className={`mb-3 mr-3 flex-row items-center rounded-full border px-4 py-2 ${
                              isActive ? 'border-[#3B2D85] bg-black/5 dark:bg-black/40' : 'border-gray-200 dark:border-[#333333]'
                            }`}
                            onPress={() => setSelectedColour(colour)}>
                            <View 
                              style={{ backgroundColor: colour }} 
                              className="mr-3 h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600" 
                            />
                            <Text className="text-sm text-gray-700 dark:text-gray-300">{colour}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Order Summary */}
                <View className="mt-6 rounded-2xl bg-gray-50 p-5 dark:bg-[#2A2A2A]">
                  <Text className="mb-3 text-base font-bold text-[#333333] dark:text-white">Order summary</Text>
                  <Text className="mb-1 text-sm text-gray-600 dark:text-gray-300">
                    Base price: ₦{(selectedMock?.price || selectedDesign.amount || 0).toLocaleString()}
                  </Text>
                  <Text className="mb-1 text-sm text-gray-600 dark:text-gray-300">
                    Availability: {selectedMock?.availableQty ?? 'N/A'} in stock
                  </Text>
                  {selectedDesign.tags?.length ? (
                    <Text className="mt-2 border-t border-gray-200 pt-2 text-sm text-gray-600 dark:border-[#444] dark:text-gray-300">
                      Tags: {selectedDesign.tags.join(', ')}
                    </Text>
                  ) : null}
                </View>
              </ScrollView>

              {/* Add to Cart Button */}
              <TouchableOpacity
                className={`items-center rounded-2xl bg-[#3B2D85] py-4 ${isAddingToCart ? 'opacity-70' : 'opacity-100'}`}
                disabled={isAddingToCart}
                onPress={handleAddToCart}>
                <Text className="text-base font-bold text-white">
                  {isAddingToCart ? 'Adding...' : 'Add to cart'}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
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
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  productList: {
    padding: 16,
    paddingBottom: 120,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    padding: 20,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    marginBottom: 16,
  },
  designTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  designMeta: {
    fontSize: 14,
    marginBottom: 12,
  },
  designDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  mockRow: {
    paddingRight: 8,
  },
  mockChip: {
    minWidth: 132,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: 12,
  },
  colourRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colourChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colourSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 20,
  },
  addButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
