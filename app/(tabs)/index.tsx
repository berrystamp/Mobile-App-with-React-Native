import { ArtistCard } from '@/components/ArtistCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionHeader } from '@/components/SectionHeader';
import { addRecentDesign } from '@/lib/localStorage';
import { useHomeData } from '@/hooks/useHomeData';
import { Design } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

function HomeDesignCard({
  design,
  onPress,
  onFavoriteToggle,
  width = 132,
}: {
  design: Design;
  onPress: () => void;
  onFavoriteToggle: (designId: number) => void;
  width?: number;
}) {
  const isDark = useColorScheme() === 'dark';

  const imageUrl = design.imagePath?.startsWith('http')
    ? design.imagePath
    : design.imagePath
      ? `https://berrystamp-backend-dev-4cn29.ondigitalocean.app/${design.imagePath}`
      : '';

  const artistName = `${design.profile.firstName} ${design.profile.lastName}`.trim() || design.profile.username;
  const mockPrices = design.mocks.map((mock) => mock.price).filter((price) => price > 0);
  const lowestPrice = mockPrices.length > 0 ? Math.min(...mockPrices) : design.amount || 0;

  return (
    <TouchableOpacity
      style={[
        styles.designCard,
        {
          width,
          backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
          borderColor: isDark ? '#2B2B2B' : '#F1F1F1',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}>
      <View style={[styles.designImageWrap, { backgroundColor: isDark ? '#232323' : '#F7F7F7' }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.designImage} resizeMode="cover" />
        ) : (
          <View style={[styles.designImage, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={24} color={isDark ? '#9A9A9A' : '#B9B9B9'} />
          </View>
        )}
        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)' }]}
          onPress={() => onFavoriteToggle(design.id)}>
          <Ionicons name={design.liked ? 'heart' : 'heart-outline'} size={16} color={design.liked ? '#FF4D67' : '#767676'} />
        </TouchableOpacity>
      </View>

      <View style={styles.designContent}>
        <Text style={[styles.designTitle, { color: isDark ? '#FFFFFF' : '#252525' }]} numberOfLines={1}>
          {design.title}
        </Text>
        <Text style={[styles.designArtist, { color: isDark ? '#B3B3B3' : '#7F7F7F' }]} numberOfLines={1}>
          By {artistName}
        </Text>
        <Text style={[styles.designPrice, { color: isDark ? '#FFFFFF' : '#252525' }]}>₦{lowestPrice.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const {
    topArtists,
    recentDesigns,
    featuredDesigns,
    isLoading,
    error,
    refreshing,
    refresh,
    toggleFavorite,
    retry,
  } = useHomeData();

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    subtext: isDark ? '#B8B8B8' : '#6B6B6B',
  };

  const openDesign = useCallback(
    async (design: Design) => {
      await addRecentDesign(design.id);
      router.push({
        pathname: '/products',
        params: { designId: String(design.id) },
      });
    },
    [router],
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading designs..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retry} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <SectionHeader title="Top Artists" showViewAll={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistList}>
          {topArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onPress={() =>
                router.push({
                  pathname: '/products',
                  params: {
                    artistId: String(artist.id),
                    artistName: `${artist.firstName} ${artist.lastName}`.trim(),
                  },
                })
              }
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Recent designs" onViewAllPress={() => router.push('/products')} />
        {recentDesigns.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.subtext }]}>No designs available right now.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
            {recentDesigns.map((design) => (
              <HomeDesignCard
                key={design.id}
                design={design}
                width={134}
                onFavoriteToggle={toggleFavorite}
                onPress={() => openDesign(design)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Feature designs" onViewAllPress={() => router.push('/products')} />
        {featuredDesigns.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.subtext }]}>No designs available right now.</Text>
        ) : (
          <View style={styles.featureGrid}>
            {featuredDesigns.map((design) => (
              <HomeDesignCard
                key={design.id}
                design={design}
                width={156}
                onFavoriteToggle={toggleFavorite}
                onPress={() => openDesign(design)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 28,
  },
  artistList: {
    paddingRight: 20,
  },
  recentList: {
    paddingRight: 12,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  designCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  designImageWrap: {
    width: '100%',
    height: 118,
    position: 'relative',
  },
  designImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  designContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  designTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  designArtist: {
    fontSize: 10,
    marginBottom: 8,
  },
  designPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
  },
});
