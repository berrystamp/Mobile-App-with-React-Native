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

      const [artistsRes, recentRes, featuredRes, designerProfilesRes] = await Promise.all([
        ApiService.getTopArtists(80),
        ApiService.getRecentDesigns(10),
        ApiService.getFeaturedDesigns(10),
        ApiService.getPublicProfiles('DESIGNER', 0, 120).catch(() => null),
      ]);
      const artistSourceDesigns = normalizeDesignListResponse(artistsRes);
      const recent = normalizeDesignListResponse(recentRes);
      const featured = normalizeDesignListResponse(featuredRes);
      const profileList =
        designerProfilesRes?.responseBody?.content ||
        designerProfilesRes?.content ||
        designerProfilesRes?.responseBody ||
        [];
      const profileMap = new Map<number, any>(
        (Array.isArray(profileList) ? profileList : [])
          .map((profile: any): [number, any] => [
            Number(profile?.id || profile?.profileId || profile?.userId),
            profile,
          ])
          .filter(([id]) => Number.isFinite(id) && id > 0),
      );

      const topArtistsByUploads = extractArtistsFromDesigns(artistSourceDesigns)
        .map((artist) => {
          const profile = profileMap.get(artist.id);
          const shopName =
            profile?.shopName ||
            profile?.brandName ||
            profile?.name ||
            profile?.userName ||
            artist.shopName ||
            artist.username;

          return {
            ...artist,
            shopName,
            username: shopName || artist.username,
          };
        })
        .sort((a, b) => (b.totalDesigns || 0) - (a.totalDesigns || 0))
        .slice(0, 12);

      setTopArtists(topArtistsByUploads);
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