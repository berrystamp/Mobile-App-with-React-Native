import ApiService from '@/services/apiClient'; // This now refers to your unified ApiService.ts
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

      /**
       * Backend structure handling:
       * Drilling into responseBody if it exists, otherwise falling back to content/data 
       * to ensure compatibility with different API response patterns.
       */
      const artists = artistsRes.responseBody?.content || artistsRes.content || artistsRes.data || artistsRes;
      const trending = trendingRes.responseBody?.content || trendingRes.content || trendingRes.data || trendingRes;
      const recommended = recommendedRes.responseBody?.content || recommendedRes.content || recommendedRes.data || recommendedRes;

      setTopArtists(Array.isArray(artists) ? artists : []);
      setTrendingDesigns(Array.isArray(trending) ? trending : []);
      setRecommendedDesigns(Array.isArray(recommended) ? recommended : []);
      
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
      const response = await ApiService.toggleFavorite(designId.toString());
      
      // If the backend specifically indicates failure, roll back the UI
      if (response && response.requestSuccessful === false) {
        throw new Error(response.responseMessage);
      }
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