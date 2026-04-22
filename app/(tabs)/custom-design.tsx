import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, RefreshControl,
  StyleSheet, Text, TouchableOpacity, View, useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatNaira } from '@/lib/currency';
import ApiService from '@/services/apiClient';

const BASE_URL = 'https://backend-prod-api.berrystamp.com';

const toImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return BASE_URL + '/' + path.replace(/^\/+/, '');
};

export default function CustomDesignHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bg = isDark ? '#121212' : '#F8F8FB';
  const surface = isDark ? '#1E1E1E' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#2D273A';
  const subtext = isDark ? '#A0A0A0' : '#7B7696';
  const border = isDark ? '#2A2A2A' : '#F0EEF7';
  const primary = '#4A34A5';

  const loadDesigns = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await ApiService.getCustomDesigns(0, 20);
      const body = response?.responseBody || response?.data || response || {};
      const list = Array.isArray(body) ? body
        : Array.isArray(body?.content) ? body.content
        : [];
      setDesigns(list);
    } catch {
      setDesigns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadDesigns(); }, [loadDesigns]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDesigns(true);
  }, [loadDesigns]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: text }}>Custom Designs</Text>
        <TouchableOpacity
          onPress={() => router.push('/create-custom-design')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 }}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <FlatList
          data={designs}
          keyExtractor={(item, i) => String(item?.id || i)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
          columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? '#2A2A2A' : '#F0EEFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="color-wand-outline" size={36} color={primary} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: text, textAlign: 'center', marginBottom: 8 }}>No custom designs yet</Text>
              <Text style={{ fontSize: 14, color: subtext, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
                Create your first custom design request and connect with talented designers.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/create-custom-design')}
                style={{ backgroundColor: primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Create Custom Design</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const imageUrl = toImageUrl(item?.frontImageUrl || item?.imagePath || item?.imageUrl);
            const price = Number(item?.amount || item?.price || 0);
            return (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/product', params: { designId: String(item.id) } })}
                style={{ flex: 1, backgroundColor: surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: border }}
                activeOpacity={0.85}
              >
                <View style={{ height: 140, backgroundColor: isDark ? '#2A2A2A' : '#F2F0FB', alignItems: 'center', justifyContent: 'center' }}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Ionicons name="image-outline" size={32} color={subtext} />
                  )}
                </View>
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: text, marginBottom: 3 }} numberOfLines={1}>
                    {item?.name || item?.title || 'Custom Design'}
                  </Text>
                  {price > 0 && (
                    <Text style={{ fontSize: 13, fontWeight: '700', color: primary }}>{formatNaira(price)}</Text>
                  )}
                  <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item?.status === 'ACTIVE' ? '#22B573' : '#F59E0B' }} />
                    <Text style={{ fontSize: 11, color: subtext }}>
                      {item?.status === 'ACTIVE' ? 'Active' : item?.status || 'Pending'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
