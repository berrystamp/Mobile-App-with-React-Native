import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { decodeDraft, encodeDraft } from '@/lib/customDesign';
import ApiService from '@/services/apiClient';

interface DesignerCard {
  id: number;
  name: string;
  avatar: string;
  cover: string;
  role: string;
  jobs: number;
  rating: string;
}

const fallbackImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400';

const toAbsolutePath = (path?: string) => {
  if (!path) return fallbackImage;
  if (path.startsWith('http')) return path;
  return `https://backend-prod-api.berrystamp.com/${path.replace(/^\/+/, '')}`;
};

const unwrapList = (response: any) => {
  const body = response?.responseBody || response?.data || response || {};
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  return [];
};

export default function SelectDesignerScreen() {
  const router = useRouter();
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  const parsed = useMemo(() => decodeDraft(draft), [draft]);

  const [loading, setLoading] = useState(true);
  const [designers, setDesigners] = useState<DesignerCard[]>([]);

  const loadDesigners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPublicProfiles('DESIGNER', 0, 60);
      const list = unwrapList(response);

      setDesigners(
        list.map((item: any) => ({
          id: Number(item.id),
          name: item.userName || item.name || 'Designer',
          avatar: toAbsolutePath(item.profileImage?.url || item.profilePic || item.previewProfilePic || item.thumbnailProfilePic),
          cover: toAbsolutePath(item.coverImage?.url || item.coverPic || item.previewCoverPic || item.thumbnailCoverPic || item.profileImage?.url),
          role: item.bio || 'Creative designer',
          jobs: Number(item.insight?.totalUploads || 0),
          rating: item.insight?.rating?.avgStars ? String(item.insight.rating.avgStars) : '4.5',
        })),
      );
    } catch (error) {
      console.error('Unable to fetch designers', error);
      setDesigners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDesigners();
  }, [loadDesigners]);

  if (loading) {
    return <LoadingSpinner message="Loading designers..." />;
  }

  const encodedDraft = encodeDraft(parsed || { designFor: '', designTheme: '', items: [] });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#252039" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Designer</Text>
        <TouchableOpacity onPress={loadDesigners}>
          <Ionicons name="refresh-outline" size={22} color="#252039" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Select a designer to discuss your idea, styling, and custom design direction.
      </Text>

      <FlatList
        data={designers}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.cover }} style={styles.cover} />
            <View style={styles.avatarWrap}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            </View>

            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.role} numberOfLines={1}>{item.role}</Text>
            <Text style={styles.stats}>{item.jobs} uploads | * {item.rating}</Text>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: {
                    participantId: String(item.id),
                    participantName: item.name,
                    participantRole: 'Designer',
                    draft: encodedDraft,
                  },
                })
              }>
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No designers available right now.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7FA' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 30, fontWeight: '600', color: '#252039' },
  subtitle: { paddingHorizontal: 20, color: '#736E80', fontSize: 15, marginBottom: 8 },
  grid: { paddingHorizontal: 12, paddingBottom: 24 },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE8F3',
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 14,
  },
  cover: { width: '100%', height: 62 },
  avatarWrap: { marginTop: -24, borderRadius: 24, padding: 2, backgroundColor: '#FFFFFF' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { marginTop: 8, fontSize: 16, fontWeight: '600', color: '#2A2537' },
  role: { marginTop: 2, fontSize: 13, color: '#8A8598' },
  stats: { marginTop: 6, fontSize: 12, color: '#928BA2' },
  messageButton: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3C2D90',
    paddingVertical: 7,
    paddingHorizontal: 22,
  },
  messageButtonText: { color: '#3C2D90', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 15, color: '#888193' },
});
