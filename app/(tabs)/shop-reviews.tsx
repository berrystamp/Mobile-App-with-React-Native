import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View, useColorScheme } from 'react-native';

import ApiService from '@/services/apiClient';
import { FALLBACK_AVATAR, toAbsoluteImage, toDisplayName, unwrapList } from '@/components/shop/utils';

export default function ShopReviewsScreen() {
  const router = useRouter();
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  const theme = {
    background: isDark ? '#111113' : '#F6F6F8',
    surface: isDark ? '#1A1A1E' : '#FFFFFF',
    text: isDark ? '#F3F3F5' : '#282433',
    muted: isDark ? '#A9A9B1' : '#7A7687',
    border: isDark ? '#2B2B31' : '#E9E6F3',
  };

  const load = useCallback(async () => {
    setLoading(true);
    const response = await ApiService.getShopReviews(profileId, 0, 60).catch(() => ({ responseBody: { content: [] } }));
    setReviews(unwrapList(response));
    setLoading(false);
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Ionicons name="arrow-back" size={20} color={theme.text} onPress={() => router.back()} />
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>Review</Text>
        <View style={{ width: 20 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#4732A1" /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {reviews.map((item: any, index) => {
            const author = toDisplayName(item?.profile || item?.user || item?.author || {});
            const comment = String(item?.comment || item?.review || item?.message || '');
            const stars = Number(item?.stars || item?.rating || item?.rate || 0);
            const avatar = toAbsoluteImage(item?.profile?.profilePicturePath || item?.user?.profilePicturePath || item?.avatar);

            return (
              <View key={`${item?.id || index}`} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.surface }}>
                <Image source={{ uri: avatar || FALLBACK_AVATAR }} style={{ width: 42, height: 42, borderRadius: 21 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>{author}</Text>
                  <Text style={{ color: theme.muted, fontSize: 12 }}>{'★'.repeat(Math.max(0, Math.min(5, Math.round(stars))))}</Text>
                  <Text style={{ color: theme.text, fontSize: 15, lineHeight: 22, marginTop: 8 }}>{comment || 'No comment provided.'}</Text>
                </View>
              </View>
            );
          })}
          {!reviews.length ? <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 24 }}>No reviews yet.</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}
