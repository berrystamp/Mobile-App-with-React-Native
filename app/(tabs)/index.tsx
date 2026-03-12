// src/screens/HomeScreen.jsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import HorizontalList from '@/components/lists/HorizontalList';
import ProductGrid from '@/components/lists/ProductGrid';
import ArtistCard from '@/components/cards/ArtistCard';
import TrendingCard from '@/components/cards/TrendingCard';
import { topArtists, trendingDesigns, products } from '../data/mockData';

const HomeScreen = ({ navigation }) => {
  const handleArtistPress = (artist) => {
    console.log('Artist pressed:', artist);
  };

  const handleDesignPress = (design) => {
    console.log('Design pressed:', design);
  };

  const handleProductPress = (product) => {
    console.log('Product pressed:', product);
  };

  const handleFavoritePress = (id) => {
    console.log('Favorite pressed:', id);
  };

  return (
    <View style={styles.container}>
      

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <HorizontalList
          title="Top Artists"
          data={topArtists}
          renderItem={({ item }) => (
            <ArtistCard artist={item} onPress={() => handleArtistPress(item)} />
          )}
        />

        <HorizontalList
          title="Trending Designs"
          data={trendingDesigns}
          showViewAll
          onViewAll={() => console.log('View all trending')}
          renderItem={({ item }) => (
            <TrendingCard
              design={item}
              onPress={() => handleDesignPress(item)}
              onFavoritePress={handleFavoritePress}
            />
          )}
        />

        <ProductGrid
          title="Just for you"
          data={products}
          onProductPress={handleProductPress}
          onFavoritePress={handleFavoritePress}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
});

export default HomeScreen;