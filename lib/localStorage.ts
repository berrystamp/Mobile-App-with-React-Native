import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SEARCH_HISTORY_KEY = 'search_history';
const SEARCH_FILTERS_KEY = 'search_filters';
const RECENT_DESIGN_IDS_KEY = 'recent_design_ids';

export const defaultSearchFilters = {
  productCategories: [] as string[],
  designCategories: [] as string[],
  priceRange: [0, 9000] as [number, number],
  sortBy: 'Recently added',
};

export type SearchFilters = typeof defaultSearchFilters;

export async function getSearchHistory() {
  const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
  if (!raw) return [] as string[];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [] as string[];
  }
}

export async function addSearchHistory(query: string, limit = 8) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [] as string[];

  const current = await getSearchHistory();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const next = [
    trimmedQuery,
    ...current.filter((item) => item.trim().toLowerCase() !== normalizedQuery),
  ].slice(0, limit);

  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export async function getSearchFilters(): Promise<SearchFilters> {
  const raw = await AsyncStorage.getItem(SEARCH_FILTERS_KEY);
  if (!raw) return defaultSearchFilters;

  try {
    const parsed = JSON.parse(raw);
    return {
      productCategories: Array.isArray(parsed?.productCategories) ? parsed.productCategories : defaultSearchFilters.productCategories,
      designCategories: Array.isArray(parsed?.designCategories) ? parsed.designCategories : defaultSearchFilters.designCategories,
      priceRange:
        Array.isArray(parsed?.priceRange) && parsed.priceRange.length === 2
          ? [Number(parsed.priceRange[0]) || 0, Number(parsed.priceRange[1]) || 9000]
          : defaultSearchFilters.priceRange,
      sortBy: typeof parsed?.sortBy === 'string' ? parsed.sortBy : defaultSearchFilters.sortBy,
    };
  } catch {
    return defaultSearchFilters;
  }
}

export async function setSearchFilters(filters: SearchFilters) {
  await AsyncStorage.setItem(SEARCH_FILTERS_KEY, JSON.stringify(filters));
}

export async function addRecentDesign(designId: number, limit = 10) {
  if (!Number.isFinite(designId)) return [] as number[];

  const current = await getRecentDesignIds();
  const next = [designId, ...current.filter((id) => id !== designId)].slice(0, limit);
  await AsyncStorage.setItem(RECENT_DESIGN_IDS_KEY, JSON.stringify(next));
  return next;
}

export async function getRecentDesignIds() {
  const raw = await AsyncStorage.getItem(RECENT_DESIGN_IDS_KEY);
  if (!raw) return [] as number[];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item) => Number(item)).filter((item) => Number.isFinite(item))
      : [];
  } catch {
    return [] as number[];
  }
}

export async function saveCartItems(items: any[]) {
  try {
    const stored = JSON.stringify(items);
    if (Platform.OS === 'web') {
      localStorage.setItem('berrystamp_cart_items', stored);
    } else {
      await AsyncStorage.setItem('berrystamp_cart_items', stored);
    }
  } catch (error) {
    console.error('Failed to save cart items:', error);
  }
}

export async function getCartItems() {
  try {
    let data;
    if (Platform.OS === 'web') {
      data = localStorage.getItem('berrystamp_cart_items');
    } else {
      data = await AsyncStorage.getItem('berrystamp_cart_items');
    }
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get cart items:', error);
    return [];
  }
}

export async function clearCartItems() {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('berrystamp_cart_items');
    } else {
      await AsyncStorage.removeItem('berrystamp_cart_items');
    }
  } catch (error) {
    console.error('Failed to clear cart items:', error);
  }
}
 