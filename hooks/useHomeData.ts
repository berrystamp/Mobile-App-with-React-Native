import { extractArtistsFromDesigns, normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/apiClient';
import { Artist, Design } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export function useHomeData(enabled: boolean = true) {
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [recentDesigns, setRecentDesigns] = useState<Design[]>([]);
  const [featuredDesigns, setFeaturedDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = useCallback(async (isRefresh = false) => {
    if (!enabled) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [artistsRes, recentRes, featuredRes] = await Promise.all([
        ApiService.getTopArtists(10),
        ApiService.getRecentDesigns(10),
        ApiService.getFeaturedDesigns(10),
      ]);
      console.log('Fetched home data:', { artistsRes, recentRes, featuredRes });
      const artistSourceDesigns = normalizeDesignListResponse(artistsRes);
      const recent = normalizeDesignListResponse(recentRes);
      const featured = normalizeDesignListResponse(featuredRes);

      setTopArtists(extractArtistsFromDesigns(artistSourceDesigns));
      setRecentDesigns(recent);
      setFeaturedDesigns(featured);
    } catch (err: any) {
      console.error('Error fetching home data:', err);
      setError(err.responseMessage || err.message || 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [enabled]);

  const toggleFavorite = useCallback(async (designId: number) => {
    const originalRecent = [...recentDesigns];
    const originalFeatured = [...featuredDesigns];

    const updateList = (list: Design[]) =>
      list.map((design) =>
        design.id === designId
          ? {
              ...design,
              liked: !design.liked,
              likes: design.liked ? Math.max(0, design.likes - 1) : design.likes + 1,
            }
          : design,
      );

    setRecentDesigns((prev) => updateList(prev));
    setFeaturedDesigns((prev) => updateList(prev));

    try {
      await ApiService.toggleFavorite(String(designId));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setRecentDesigns(originalRecent);
      setFeaturedDesigns(originalFeatured);
    }
  }, [recentDesigns, featuredDesigns]);

  const refresh = useCallback(() => {
    fetchHomeData(true);
  }, [fetchHomeData]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    fetchHomeData();
  }, [enabled, fetchHomeData]);

  return {
    topArtists,
    recentDesigns,
    featuredDesigns,
    isLoading,
    error,
    refreshing,
    refresh,
    toggleFavorite,
    retry: () => fetchHomeData(),
  };
}
