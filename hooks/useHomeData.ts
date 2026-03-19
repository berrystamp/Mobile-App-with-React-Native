import { extractArtistsFromDesigns, normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/apiClient';
import { Artist, Design } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export function useHomeData() {
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [trendingDesigns, setTrendingDesigns] = useState<Design[]>([]);
  const [recommendedDesigns, setRecommendedDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Fetching data from the unified ApiService
      const [artistsRes, trendingRes, recommendedRes] = await Promise.all([
        ApiService.getTopArtists(10),
        ApiService.getTrendingDesigns(10),
        ApiService.getRecommendedDesigns(10),
      ]);

      const artistSourceDesigns = normalizeDesignListResponse(artistsRes);
      const trending = normalizeDesignListResponse(trendingRes);
      const recommended = normalizeDesignListResponse(recommendedRes);

      setTopArtists(extractArtistsFromDesigns(artistSourceDesigns));
      setTrendingDesigns(trending);
      setRecommendedDesigns(recommended);
    } catch (err: any) {
      console.error('Error fetching home data:', err);
      // Handling Axios error objects or generic error messages
      setError(err.responseMessage || err.message || 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (designId: number) => {
    const originalTrending = [...trendingDesigns];
    const originalRecommended = [...recommendedDesigns];

    // Optimistic UI Update
    const updateList = (list: Design[]) => 
      list.map(design => 
        design.id === designId 
          ? { ...design, liked: !design.liked, likes: design.liked ? Math.max(0, design.likes - 1) : design.likes + 1 }
          : design
      );

    setTrendingDesigns(prev => updateList(prev));
    setRecommendedDesigns(prev => updateList(prev));

    try {
      await ApiService.toggleFavorite(String(designId));

      setTrendingDesigns((prev) =>
        prev.map((design) =>
          design.id === designId
            ? {
                ...design,
                liked: !design.liked,
                likes: design.liked ? Math.max(0, design.likes - 1) : design.likes + 1,
              }
            : design,
        ),
      );

      setRecommendedDesigns((prev) =>
        prev.map((design) =>
          design.id === designId
            ? {
                ...design,
                liked: !design.liked,
                likes: design.liked ? Math.max(0, design.likes - 1) : design.likes + 1,
              }
            : design,
        ),
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Rollback UI state on error
      setTrendingDesigns(originalTrending);
      setRecommendedDesigns(originalRecommended);
    }
  }, [trendingDesigns, recommendedDesigns]);

  const refresh = useCallback(() => {
    fetchHomeData(true);
  }, [fetchHomeData]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  return {
    topArtists,
    trendingDesigns,
    recommendedDesigns,
    isLoading,
    error,
    refreshing,
    refresh,
    toggleFavorite,
    retry: () => fetchHomeData(),
  };
}
