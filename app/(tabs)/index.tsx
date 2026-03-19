import { ArtistCard } from '@/components/ArtistCard';
import { DesignCard } from '@/components/DesignCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionHeader } from '@/components/SectionHeader';
import { useHomeData } from '@/hooks/useHomeData';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const {
    topArtists,
    trendingDesigns,
    recommendedDesigns,
    isLoading,
    error,
    refreshing,
    refresh,
    toggleFavorite,
    retry,
  } = useHomeData();

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    subtext: isDark ? '#B8B8B8' : '#6B6B6B',
  };

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
        <SectionHeader title="Top artists" showViewAll={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
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
        <SectionHeader title="Trending designs" showViewAll={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {trendingDesigns.map((design) => (
            <View key={design.id} style={styles.trendingCardWrap}>
              <DesignCard
                design={design}
                width={220}
                onFavoriteToggle={toggleFavorite}
                onPress={() =>
                  router.push({
                    pathname: '/products',
                    params: { designId: String(design.id) },
                  })
                }
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Recommended for you" showViewAll={false} />
        {recommendedDesigns.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.subtext }]}>No designs available right now.</Text>
        ) : (
          <View style={styles.grid}>
            {recommendedDesigns.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onFavoriteToggle={toggleFavorite}
                onPress={() =>
                  router.push({
                    pathname: '/products',
                    params: { designId: String(design.id) },
                  })
                }
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
  horizontalList: {
    paddingRight: 8,
  },
  trendingCardWrap: {
    marginRight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyText: {
    fontSize: 14,
  },
  searchShortcut: {
    backgroundColor: '#4B3A99',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },
  searchShortcutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
