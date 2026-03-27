import { DesignCard } from '@/components/DesignCard';
import { formatNaira } from '@/lib/currency';
import { normalizeDesign, normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/apiClient';
import { Design, Mock } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

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

  const loadProducts = useCallback(async () => {
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
        size: 20,
        designer: artistId ? Number(artistId) : undefined,
        searchField: searchField || undefined,
      });

      const normalizedProducts = normalizeDesignListResponse(response);
      setProducts(normalizedProducts);
    } catch (err: any) {
      console.error('Failed to load products', err);
      setError(err.response?.data?.message || 'Unable to load products right now.');
    } finally {
      setIsLoading(false);
    }
  }, [artistId, designId, searchField]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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


  const handleFavoriteToggle = useCallback(async (designIdToToggle: number) => {
    const updateList = (list: Design[]) =>
      list.map((item) =>
        item.id === designIdToToggle
          ? {
              ...item,
              liked: !item.liked,
              likes: item.liked ? Math.max(0, item.likes - 1) : item.likes + 1,
            }
          : item,
      );

    const previousProducts = [...products];
    const previousSelectedDesign = selectedDesign;

    setProducts((current) => updateList(current));
    setSelectedDesign((current) => {
      if (!current || current.id !== designIdToToggle) return current;
      return {
        ...current,
        liked: !current.liked,
        likes: current.liked ? Math.max(0, current.likes - 1) : current.likes + 1,
      };
    });

    try {
      await ApiService.toggleFavorite(String(designIdToToggle));
    } catch (err: any) {
      setProducts(previousProducts);
      setSelectedDesign(previousSelectedDesign);
      Alert.alert('Could not update favourite', err?.response?.data?.message || 'Please try again.');
    }
  }, [products, selectedDesign]);

  const title = artistName
    ? `${artistName}'s products`
    : searchField
      ? `Search: ${searchField}`
      : 'Products';

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
        <TouchableOpacity onPress={loadProducts} style={styles.headerIcon}>
          <Ionicons name="refresh-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <Text style={{ color: theme.subtext }}>Loading products...</Text>
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
              <DesignCard
                key={product.id}
                design={product}
                onPress={() => openDetails(product)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <Modal animationType="slide" transparent visible={!!selectedDesign} onRequestClose={closeDetails}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}> 
            {selectedDesign ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Product details</Text>
                  <TouchableOpacity onPress={closeDetails}>
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Image source={{ uri: selectedDesign.imagePath }} style={styles.heroImage} resizeMode="cover" />
                  <Text style={[styles.designTitle, { color: theme.text }]}>{selectedDesign.title}</Text>
                  <Text style={[styles.designMeta, { color: theme.subtext }]}>
                    {/* Added optional chaining here to prevent crashes if profile is undefined */}
                    By {selectedDesign.designerName || `${selectedDesign.profile?.firstName || ''} ${selectedDesign.profile?.lastName || ''}`.trim() || 'Unknown'}
                  </Text>
                  <Text style={[styles.designDescription, { color: theme.subtext }]}>{selectedDesign.description}</Text>

                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Available mocks</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mockRow}>
                    {selectedDesign.mocks?.map((mock) => {
                      const isActive = selectedMock?.id === mock.id;
                      return (
                        <TouchableOpacity
                          key={mock.id}
                          style={[
                            styles.mockChip,
                            {
                              borderColor: isActive ? theme.accent : theme.border,
                              backgroundColor: isActive ? `${theme.accent}20` : 'transparent',
                            },
                          ]}
                          onPress={() => handleMockSelect(mock)}>
                          <Text style={{ color: theme.text, fontWeight: isActive ? '700' : '500' }}>{mock.name}</Text>
                          <Text style={{ color: theme.subtext, marginTop: 4 }}>
                            {formatNaira(mock.price || selectedDesign.amount || 0)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {selectedMock?.colours?.length ? (
                    <>
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>Colours</Text>
                      <View style={styles.colourRow}>
                        {selectedMock.colours.map((colour) => {
                          const isActive = selectedColour === colour;
                          return (
                            <TouchableOpacity
                              key={colour}
                              style={[styles.colourChip, { borderColor: isActive ? theme.accent : theme.border }]}
                              onPress={() => setSelectedColour(colour)}>
                              <View style={[styles.colourSwatch, { backgroundColor: colour }]} />
                              <Text style={{ color: theme.text, fontSize: 12 }}>{colour}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  ) : null}

                  <View style={[styles.summaryCard, { backgroundColor: isDark ? '#171717' : '#F6F4FF' }]}> 
                    <Text style={[styles.summaryTitle, { color: theme.text }]}>Order summary</Text>
                    <Text style={[styles.summaryText, { color: theme.subtext }]}>Base price: {formatNaira(selectedMock?.price || selectedDesign.amount || 0)}</Text>
                    <Text style={[styles.summaryText, { color: theme.subtext }]}>Mock availability: {selectedMock?.availableQty ?? 'N/A'}</Text>
                    {selectedDesign.tags?.length ? (
                      <Text style={[styles.summaryText, { color: theme.subtext }]}>Tags: {selectedDesign.tags.join(', ')}</Text>
                    ) : null}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.accent, opacity: isAddingToCart ? 0.7 : 1 }]}
                  disabled={isAddingToCart}
                  onPress={handleAddToCart}>
                  <Text style={styles.addButtonText}>{isAddingToCart ? 'Adding...' : 'Add to cart'}</Text>
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