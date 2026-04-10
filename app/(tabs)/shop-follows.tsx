import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

import ApiService from '@/services/apiClient';
import { FALLBACK_AVATAR, toAbsoluteImage, toDisplayName, unwrapList } from '@/components/shop/utils';

export default function ShopFollowsScreen() {
  const router = useRouter();
  const { profileId, tab } = useLocalSearchParams<{ profileId?: string; tab?: 'followers' | 'following' }>();
  const isDark = useColorScheme() === 'dark';

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(tab === 'following' ? 'following' : 'followers');
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  const theme = {
    background: isDark ? '#111113' : '#F6F6F8',
    text: isDark ? '#F3F3F5' : '#282433',
    muted: isDark ? '#A9A9B1' : '#7A7687',
    border: isDark ? '#2B2B31' : '#E9E6F3',
    primary: '#4732A1',
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [f1, f2] = await Promise.all([
      ApiService.getFollowers(profileId, 0, 100).catch(() => ({ responseBody: { content: [] } })),
      ApiService.getFollowing(profileId, 0, 100).catch(() => ({ responseBody: { content: [] } })),
    ]);
    setFollowers(unwrapList(f1));
    setFollowing(unwrapList(f2));
    setLoading(false);
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const items = useMemo(() => {
    const source = activeTab === 'followers' ? followers : following;
    const search = query.trim().toLowerCase();
    return source.filter((item) => {
      if (!search) return true;
      const text = `${toDisplayName(item?.profile || item)} ${item?.username || ''}`.toLowerCase();
      return text.includes(search);
    });
  }, [activeTab, followers, following, query]);

  const removePerson = async (item: any) => {
    const id = Number(item?.id || item?.profileId || item?.profile?.id);
    if (!id) return;

    try {
      await ApiService.unfollowProfile(id);
      if (activeTab === 'followers') setFollowers((prev) => prev.filter((p) => Number(p?.id || p?.profileId || p?.profile?.id) !== id));
      else setFollowing((prev) => prev.filter((p) => Number(p?.id || p?.profileId || p?.profile?.id) !== id));
    } catch (error: any) {
      Alert.alert('Action failed', error?.response?.data?.responseMessage || error?.message || 'Could not remove user.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Ionicons name="arrow-back" size={20} color={theme.text} onPress={() => router.back()} />
        <View style={{ width: 92, height: 4, borderRadius: 2, backgroundColor: '#CACAD0' }} />
        <View style={{ width: 20 }} />
      </View>

      <View style={{ marginHorizontal: 16, marginBottom: 14, height: 46, borderRadius: 24, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F3' }}>
        <Ionicons name="search-outline" size={18} color={theme.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search profile" placeholderTextColor={theme.muted} style={{ marginLeft: 8, flex: 1, color: theme.text }} />
      </View>

      <View style={{ flexDirection: 'row', marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TouchableOpacity style={{ flex: 1, alignItems: 'center', paddingBottom: 10 }} onPress={() => setActiveTab('followers')}>
          <Text style={{ color: activeTab === 'followers' ? theme.text : theme.muted, fontSize: 17 }}>Followers</Text>
          {activeTab === 'followers' ? <View style={{ marginTop: 8, height: 2, width: '100%', backgroundColor: theme.primary }} /> : null}
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, alignItems: 'center', paddingBottom: 10 }} onPress={() => setActiveTab('following')}>
          <Text style={{ color: activeTab === 'following' ? theme.text : theme.muted, fontSize: 17 }}>Following</Text>
          {activeTab === 'following' ? <View style={{ marginTop: 8, height: 2, width: '100%', backgroundColor: theme.primary }} /> : null}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={theme.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {items.map((item, index) => {
            const id = Number(item?.id || item?.profileId || item?.profile?.id || index);
            const avatar = toAbsoluteImage(item?.profilePicturePath || item?.profile?.profilePicturePath || item?.profilePic);
            return (
              <View key={`${id}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <Image source={{ uri: avatar || FALLBACK_AVATAR }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>{toDisplayName(item?.profile || item)}</Text>
                  <Text style={{ color: theme.muted, fontSize: 13 }}>Designer account</Text>
                </View>
                <TouchableOpacity style={{ borderWidth: 1.5, borderColor: theme.primary, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 }} onPress={() => removePerson(item)}>
                  <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '500' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {!items.length ? <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 24 }}>No profiles found.</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}
