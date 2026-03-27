import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { extractArtistsFromDesigns, normalizeDesignListResponse } from '@/lib/designs';
import ApiService from '@/services/apiClient';
import type { Artist, Design } from '@/types';

type FavoriteTab = 'favorites' | 'following';

export default function FavoritesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FavoriteTab>('favorites');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const favoritesCount = designs.length;

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [favoriteRes, followingRes] = await Promise.all([
        ApiService.getFavoriteDesigns(100, 0),
        ApiService.getFollowingArtists(100, 0),
      ]);

      const favoriteDesigns = normalizeDesignListResponse(favoriteRes).filter((design) => design.liked);
      const followingDesigns = normalizeDesignListResponse(followingRes);

      setDesigns(favoriteDesigns);
      setArtists(extractArtistsFromDesigns(followingDesigns));
    } catch (error: any) {
      console.error('Failed to load favorites data', error);
      Alert.alert('Unable to load favorites', error?.message || 'Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmRemoveFavorite = useCallback((design: Design) => {
    Alert.alert(
      'Remove item',
      'Are you sure you want to remove this item from favorite?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDesigns((prev) => prev.filter((item) => item.id !== design.id));
            try {
              await ApiService.toggleFavorite(String(design.id));
            } catch {
              setDesigns((prev) => [design, ...prev]);
              Alert.alert('Action failed', 'Could not update favorite at the moment.');
            }
          },
        },
      ],
    );
  }, []);

  const clearFavorites = useCallback(() => {
    if (!designs.length) {
      return;
    }

    Alert.alert('Clear favorites', 'This will remove all items in your favorites list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          const current = [...designs];
          setDesigns([]);

          try {
            await Promise.all(current.map((item) => ApiService.toggleFavorite(String(item.id))));
          } catch {
            setDesigns(current);
            Alert.alert('Action failed', 'Unable to clear favorites right now.');
          }
        },
      },
    ]);
  }, [designs]);

  const emptyCopy = useMemo(
    () =>
      activeTab === 'favorites'
        ? {
            title: 'Favorite is empty',
            body: 'You have not yet added any item to your favorite list, explore beautiful designs now and add them to favourite.',
          }
        : {
            title: 'No following yet',
            body: 'Designers and printers you follow will appear here.',
          },
    [activeTab],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}>
            <Ionicons name="arrow-back" size={24} color="#2C2733" />
          </TouchableOpacity>
          <Text style={styles.title}>Favourite {favoritesCount > 0 ? `⑤`.replace('⑤', `(${favoritesCount})`) : ''}</Text>
          <TouchableOpacity onPress={clearFavorites} disabled={!designs.length}>
            <Text style={[styles.clearText, !designs.length && styles.clearDisabled]}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <Pressable style={styles.tab} onPress={() => setActiveTab('favorites')}>
            <Text style={[styles.tabLabel, activeTab === 'favorites' && styles.tabLabelActive]}>Favorites</Text>
            <View style={[styles.tabLine, activeTab === 'favorites' && styles.tabLineActive]} />
          </Pressable>
          <Pressable style={styles.tab} onPress={() => setActiveTab('following')}>
            <Text style={[styles.tabLabel, activeTab === 'following' && styles.tabLabelActive]}>Following</Text>
            <View style={[styles.tabLine, activeTab === 'following' && styles.tabLineActive]} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#3F2FA0" />
          </View>
        ) : activeTab === 'favorites' ? (
          <FlatList
            data={designs}
            keyExtractor={(item) => String(item.id)}
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            contentContainerStyle={[styles.listContent, !designs.length && styles.centeredList]}
            renderItem={({ item }) => (
              <View style={styles.favoriteRow}>
                <Image source={{ uri: item.imagePath }} style={styles.favoriteImage} contentFit="cover" />
                <View style={styles.favoriteContent}>
                  <Text style={styles.favoriteName} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.favoriteAuthor} numberOfLines={1}>
                    By {item.designerName || item.profile.username}
                  </Text>
                  <Text style={styles.favoritePrice}>₦{(item.amount || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.favoriteActions}>
                  <TouchableOpacity onPress={() => confirmRemoveFavorite(item)}>
                    <Ionicons name="heart" size={22} color="#3F2FA0" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/product', params: { designId: String(item.id) } })}>
                    <Text style={styles.detailsLink}>See details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.centeredState}>
                <Ionicons name="heart-outline" size={100} color="#B8B6BF" />
                <Text style={styles.emptyTitle}>{emptyCopy.title}</Text>
                <Text style={styles.emptyBody}>{emptyCopy.body}</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={artists}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            contentContainerStyle={[styles.followingGrid, !artists.length && styles.centeredList]}
            columnWrapperStyle={artists.length > 1 ? styles.gridRow : undefined}
            renderItem={({ item, index }) => (
              <View style={styles.artistCard}>
                <View style={styles.cardBanner}>
                  <View style={styles.avatarRing}>
                    {item.profilePicturePath ? (
                      <Image source={{ uri: item.profilePicturePath }} style={styles.avatarImage} contentFit="cover" />
                    ) : (
                      <Text style={styles.avatarInitial}>{(item.username || 'A').charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.artistNameRow}>
                    <Text style={styles.artistName}>{item.username}</Text>
                    <MaterialIcons name="verified" size={14} color="#2D71E3" />
                  </View>
                  <Text style={styles.artistRole}>Abstract designer</Text>
                  <Text style={styles.artistStats}>
                    {(item.totalDesigns || 0).toLocaleString()} | <Text style={styles.artistGreen}>98%</Text> | ⭐ {item.rating.toFixed(1)}
                  </Text>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() =>
                      router.push({
                        pathname: '/chat',
                        params: {
                          conversationId: `profile-${item.id}-${index}`,
                          participantId: String(item.id),
                          participantName: item.username,
                        },
                      })
                    }>
                    <Text style={styles.messageButtonText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.centeredState}>
                <Ionicons name="people-outline" size={90} color="#B8B6BF" />
                <Text style={styles.emptyTitle}>{emptyCopy.title}</Text>
                <Text style={styles.emptyBody}>{emptyCopy.body}</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '600', color: '#252233' },
  clearText: { color: '#FF726B', fontSize: 20, fontWeight: '500' },
  clearDisabled: { opacity: 0.35 },
  tabs: { flexDirection: 'row', marginBottom: 14 },
  tab: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 22, color: '#8E8A95', marginBottom: 8 },
  tabLabelActive: { color: '#2B2833', fontWeight: '600' },
  tabLine: { width: '100%', height: 2, backgroundColor: '#E9E6EE' },
  tabLineActive: { backgroundColor: '#4A37BA' },
  listContent: { paddingBottom: 20, gap: 10 },
  favoriteRow: { flexDirection: 'row', padding: 10, borderRadius: 12, backgroundColor: '#F7F7F9', alignItems: 'center', gap: 12 },
  favoriteImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#EEE' },
  favoriteContent: { flex: 1, gap: 3 },
  favoriteName: { fontSize: 20, color: '#1E1B2B', fontWeight: '500' },
  favoriteAuthor: { fontSize: 16, color: '#8F889D' },
  favoritePrice: { fontSize: 32, fontWeight: '600', color: '#1D1A2B' },
  favoriteActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 70 },
  detailsLink: { color: '#3F2FA0', fontSize: 16, fontWeight: '500' },
  centeredList: { flexGrow: 1, justifyContent: 'center' },
  centeredState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  emptyTitle: { marginTop: 12, fontSize: 24, fontWeight: '600', color: '#2B2833' },
  emptyBody: { marginTop: 8, fontSize: 16, lineHeight: 24, color: '#8A8694', textAlign: 'center' },
  followingGrid: { paddingBottom: 30 },
  gridRow: { justifyContent: 'space-between' },
  artistCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EDEAF2', marginBottom: 12, overflow: 'hidden' },
  cardBanner: { height: 64, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'flex-end' },
  avatarRing: { width: 58, height: 58, borderRadius: 29, marginBottom: -18, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#FFC436', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 22, fontWeight: '700', color: '#2B2833' },
  cardContent: { paddingTop: 24, paddingHorizontal: 10, paddingBottom: 12, alignItems: 'center' },
  artistNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  artistName: { fontSize: 22, fontWeight: '700', color: '#2A2635' },
  artistRole: { marginTop: 4, fontSize: 14, color: '#6B6577' },
  artistStats: { marginTop: 8, fontSize: 14, color: '#AAA5B2' },
  artistGreen: { color: '#26A047' },
  messageButton: { marginTop: 10, borderRadius: 999, borderWidth: 1, borderColor: '#3F2FA0', paddingVertical: 7, width: '100%', alignItems: 'center' },
  messageButtonText: { color: '#3F2FA0', fontSize: 15, fontWeight: '600' },
});
