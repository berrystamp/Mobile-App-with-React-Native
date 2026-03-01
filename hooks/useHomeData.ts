import ApiService from '@/services/api';
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

      const [artistsData, trendingData, recommendedData] = await Promise.all([
        ApiService.getTopArtists(10),
        ApiService.getTrendingDesigns(10),
        ApiService.getRecommendedDesigns(10),
      ]);

      // Handle paginated response format from backend
      const artists = artistsData.content || artistsData.data || artistsData;
      const trending = trendingData.content || trendingData.data || trendingData;
      const recommended = recommendedData.content || recommendedData.data || recommendedData;

      setTopArtists(artists);
      setTrendingDesigns(trending);
      setRecommendedDesigns(recommended);
    } catch (err: any) {
      console.error('Error fetching home data:', err);
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (designId: number) => {
    try {
      await ApiService.toggleFavorite(designId);
      
     
      setTrendingDesigns(prev => 
        prev.map(design => 
          design.id === designId 
            ? { ...design, liked: !design.liked, likes: design.liked ? design.likes - 1 : design.likes + 1 }
            : design
        )
      );
      
      setRecommendedDesigns(prev => 
        prev.map(design => 
          design.id === designId 
            ? { ...design, liked: !design.liked, likes: design.liked ? design.likes - 1 : design.likes + 1 }
            : design
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Optionally show a toast/alert to user
    }
  }, []);

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