import { extractArtistsFromDesigns, normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/apiClient';
import { Artist, Design } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';

const HOME_DATA_CACHE_KEY = 'berrystamp_home_data_cache_v1';
let memoryHomeCache: { topArtists: Artist[]; recentDesigns: Design[]; featuredDesigns: Design[] } | null = null;

function prefetchHomeImages(artists: Artist[], recent: Design[], featured: Design[]) {
  const urls = [
    ...artists.map((a) => a.profilePicturePath),
    ...recent.map((d) => d.imagePath),
    ...featured.map((d) => d.imagePath),
  ].filter((u): u is string => Boolean(u && u.startsWith('http')));
  if (urls.length > 0) {
    ExpoImage.prefetch(Array.from(new Set(urls)).slice(0, 30), 'memory-disk').catch(() => {});
  }
}

export function useHomeData(enabled: boolean = true) {
  const [topArtists, setTopArtists] = useState<Artist[]>(memoryHomeCache?.topArtists || []);
  const [recentDesigns, setRecentDesigns] = useState<Design[]>(memoryHomeCache?.recentDesigns || []);
  const [featuredDesigns, setFeaturedDesigns] = useState<Design[]>(memoryHomeCache?.featuredDesigns || []);
  const [isLoading, setIsLoading] = useState(!memoryHomeCache);
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
      } else if (memoryHomeCache) {
        setTopArtists(memoryHomeCache.topArtists);
        setRecentDesigns(memoryHomeCache.recentDesigns);
        setFeaturedDesigns(memoryHomeCache.featuredDesigns);
        setIsLoading(false);
      } else {
        const rawCached = await AsyncStorage.getItem(HOME_DATA_CACHE_KEY).catch(() => null);
        if (rawCached) {
          const parsed = JSON.parse(rawCached);
          if (parsed && typeof parsed === 'object') {
            const cachedPayload = {
              topArtists: Array.isArray(parsed.topArtists) ? parsed.topArtists : [],
              recentDesigns: Array.isArray(parsed.recentDesigns) ? parsed.recentDesigns : [],
              featuredDesigns: Array.isArray(parsed.featuredDesigns) ? parsed.featuredDesigns : [],
            };
            if (cachedPayload.recentDesigns.length || cachedPayload.featuredDesigns.length) {
              memoryHomeCache = cachedPayload;
              setTopArtists(cachedPayload.topArtists);
              setRecentDesigns(cachedPayload.recentDesigns);
              setFeaturedDesigns(cachedPayload.featuredDesigns);
              setIsLoading(false);
            } else {
              setIsLoading(true);
            }
          } else {
            setIsLoading(true);
          }
        } else {
          setIsLoading(true);
        }
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

      const nextCache = {
        topArtists: topArtistsByUploads,
        recentDesigns: recent,
        featuredDesigns: featured,
      };
      memoryHomeCache = nextCache;
      AsyncStorage.setItem(HOME_DATA_CACHE_KEY, JSON.stringify(nextCache)).catch(() => {});
      prefetchHomeImages(topArtistsByUploads, recent, featured);

      setTopArtists(topArtistsByUploads);
      setRecentDesigns(recent);
      setFeaturedDesigns(featured);
    } catch (err: any) {
      console.error('Error fetching home data:', err);
      if (!memoryHomeCache) {
        setError(err.responseMessage || err.message || 'Failed to load data. Please try again.');
      }
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