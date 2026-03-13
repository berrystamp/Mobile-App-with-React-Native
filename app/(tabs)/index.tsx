import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from "../../context/AuthContext";
import HorizontalList from '@/components/lists/HorizontalList';
import ProductGrid from '@/components/lists/ProductGrid';
import ArtistCard from '@/components/cards/ArtistCard';
import TrendingCard from '@/components/cards/TrendingCard';
import { topArtists, trendingDesigns, products } from '../data/mockData';
import ApiService from '@/services/apiClient';
import  Header  from '@/components/common/Header'; 

export interface Artist {
  id: string | number;
  name: string;
  avatar: string;
  rating: number;
  [key: string]: any; 
}

export interface Design {
  id: string | number;
  title: string;
  image: string;
  artist: string;
  [key: string]: any;
}

export interface Product {
  id: string | number;
  title: string;
  price: string | number; 
  image: string;
  artist: string;
  [key: string]: any;
}

const HomeScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeBgColor = isDark ? '#121212' : '#FFFFFF';

  // --- State ---
  const [artistsData, setArtistsData] = useState<any[] | null>(null);
  const [trendingData, setTrendingData] = useState<any[] | null>(null);
  const [recommendedData, setRecommendedData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
    const { logout } = useAuth();
  // --- Fetch Data ---
  useEffect(() => {
    let isMounted = true; 

    const fetchData = async () => {
      try {
        const [artistsRes, trendingRes, recommendedRes] = await Promise.all([
          ApiService.getTopArtists(),
          ApiService.getTrendingDesigns(),
          ApiService.getRecommendedDesigns()
        ]);
        console.log(JSON.stringify(artistsRes.responseBody.content))
        console.log(JSON.stringify(trendingRes.responseBody.content))
        console.log(JSON.stringify(recommendedRes.responseBody.content))
        if (isMounted) {
          // Extracts the array from Spring Boot's 'content' object
          setArtistsData(artistsRes.responseBody.content || artistsRes);
          setTrendingData(trendingRes.responseBody.content || trendingRes);
          setRecommendedData(recommendedRes.responseBody.content || recommendedRes);
        }
      } catch (error: any) {
        console.error('--- API ERROR DETECTED ---');
        console.error('Message:', error.message);
        if (error.response) {
          console.error('Backend Status:', error.response.status);
          console.error('Backend Data:', error.response.data);
        }
        console.error('Falling back to mock data...');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, []); 

  // --- Handlers ---
  const handleArtistPress = (artist: any) => console.log('Artist pressed:', artist.id);
  const handleDesignPress = (design: any) => console.log('Design pressed:', design.id);
  const handleProductPress = (product: any) => console.log('Product pressed:', product.id);
  const handleFavoritePress = (id: string | number) => console.log('Favorite pressed:', id);

  // --- Data Mappers ---
  const mapArtistData = (item: any): Artist => ({
    ...item,
    id: item.id,
    name: item.userName || item.name || 'Unknown Artist',
    avatar: item.profilePic || item.profileImage?.url || item.avatar,
    rating: item.insight?.rating?.avgStars || item.rating || 0,
  });

  const mapDesignData = (item: any): Design => ({
    ...item,
    id: item.id,
    title: item.name || item.title || 'Untitled',
    image: item.imageUrlFront || item.coverImage?.url || item.image,
    artist: item.designer?.userName || item.designer?.name || item.artist || 'Unknown',
  });

  const mapProductData = (item: any): Product => ({
    ...item,
    id: item.id,
    title: item.name || item.title || 'Untitled',
    price: item.amount !== undefined ? `$${item.amount}` : item.price,
    image: item.imageUrlFront || item.coverImage?.url || item.image,
    artist: item.designer?.userName || item.designer?.name || item.artist || 'Unknown',
  });

  return (
    <>
      <Header
        onSearchPress={() => router.push('/(tabs)/Search')}
        onNotificationPress={() => logout()}
      />    
      
      <View style={[styles.container, { backgroundColor: themeBgColor }]}>
        {isLoading ? (
           <View style={styles.centerContainer}>
             <ActivityIndicator size="large" color="#4B3A99" />
           </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={true}>
            
            <HorizontalList
              title="Top Artists"
              data={(artistsData && artistsData.length > 0 ? artistsData : topArtists).map(mapArtistData)}
              renderItem={({ item }) => (
                <ArtistCard artist={item} onPress={() => handleArtistPress(item)} />
              )}
            />

            <HorizontalList
              title="Trending Designs"
              data={(trendingData && trendingData.length > 0 ? trendingData : trendingDesigns).map(mapDesignData)}
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
              data={(recommendedData && recommendedData.length > 0 ? recommendedData : products).map(mapProductData)}
              onProductPress={handleProductPress}
              onFavoritePress={handleFavoritePress}
            />

            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default HomeScreen;