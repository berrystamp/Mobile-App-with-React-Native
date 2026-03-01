import { ArtistCard } from '@/components/ArtistCard';
import { DesignCard } from '@/components/DesignCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionHeader } from '@/components/SectionHeader';
import { useHomeData } from '@/hooks/useHomeData';
import { Artist } from '@/types';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

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
    background: isDark ? '#121212' : '#F3F3F3',
    card: isDark ? '#1E1E1E' : '#FFFFFF',
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <LoadingSpinner message="Loading amazing designs..." />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ErrorMessage message={error} onRetry={retry} />
      </View>
    );
  }

  const renderArtist = ({ item }: { item: Artist }) => (
    <ArtistCard
      artist={item}
      onPress={() => router.push(`/artist/${item.id}`)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#4B3A99"
            colors={['#4B3A99']}
          />
        }
      >
        {/* Top Artists Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Artists"
            onViewAllPress={() => router.push('/artists')}
          />
          <FlatList
            data={topArtists}
            renderItem={renderArtist}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistsList}
          />
        </View>

        {/* Trending Designs Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Trending Designs"
            onViewAllPress={() => router.push('/designs/trending')}
          />
          <FlatList
            data={trendingDesigns.slice(0, 3)}
            renderItem={({ item }) => (
              <DesignCard
                design={item}
                width={140}
                onPress={() => router.push(`/design/${item.id}`)}
                onFavoriteToggle={toggleFavorite}
                showPrice={false}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.designsList}
          />
        </View>

        {/* Just for You Section */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader
            title="Just for you"
            onViewAllPress={() => router.push('/designs/recommended')}
          />
          <View style={styles.gridContainer}>
            {recommendedDesigns.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onPress={() => router.push(`/design/${design.id}`)}
                onFavoriteToggle={toggleFavorite}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  lastSection: {
    paddingBottom: 100,
  },
  artistsList: {
    paddingRight: 20,
  },
  designsList: {
    paddingRight: 20,
    gap: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});