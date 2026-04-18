import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService from '@/services/apiClient';

type FaqItem = { id: string; question: string; answer: string };

export default function FaqScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const bg = isDark ? '#121212' : '#F7F7FB';
  const surface = isDark ? '#1E1E1E' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#1F1B2A';
  const subtext = isDark ? '#A0A0A0' : '#686479';
  const border = isDark ? '#2A2A2A' : '#F0EEF7';
  const primary = '#4732A1';
  const numBg = isDark ? '#2A2147' : primary;

  useEffect(() => {
    const load = async () => {
      try {
        const response = await ApiService.getFaqItems();
        setItems(response);
      } catch (error: any) {
        Alert.alert('Unable to load FAQs', error?.response?.data?.responseMessage || error?.message || 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#2A2A2A' : '#ECEAF7', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : '#2B2833'} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 20, fontWeight: '700', color: text }}>FAQ</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {items.map((item, index) => {
            const expanded = openId === item.id;
            return (
              <View key={item.id} style={{ marginBottom: 10, borderRadius: 16, backgroundColor: surface, overflow: 'hidden', borderWidth: 1, borderColor: border }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                  onPress={() => setOpenId(expanded ? null : item.id)}
                  activeOpacity={0.75}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: numBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: text, lineHeight: 20 }}>{item.question}</Text>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={subtext} />
                </TouchableOpacity>
                {expanded && (
                  <View style={{ borderTopWidth: 1, borderTopColor: border, paddingHorizontal: 16, paddingVertical: 14 }}>
                    <Text style={{ fontSize: 13, lineHeight: 22, color: subtext }}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
          {items.length === 0 && (
            <View style={{ backgroundColor: surface, borderRadius: 16, padding: 24, alignItems: 'center' }}>
              <Ionicons name="help-circle-outline" size={40} color={subtext} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: text, marginTop: 12 }}>No FAQs available</Text>
              <Text style={{ fontSize: 13, color: subtext, marginTop: 6, textAlign: 'center' }}>Please check back later.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
