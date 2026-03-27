import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import ApiService from '@/services/apiClient';
import type { User } from '@/types';

const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400';

const toAvatar = (path?: string) => {
  if (!path) return defaultAvatar;
  if (path.startsWith('http')) return path;
  return `https://berrystamp-backend-dev-4cn29.ondigitalocean.app/${path.replace(/^\/+/, '')}`;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [switchAccount, setSwitchAccount] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const load = async () => {
      const current = await ApiService.getCurrentUser();
      if (current) {
        setUser(current as User);
      }
    };

    load();
  }, []);

  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Customer';

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Profile</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.identityRow}>
          <Image source={{ uri: toAvatar(user?.profilePicturePath) }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.role}>Customer</Text>
          </View>
          <View style={styles.orderStats}>
            <Text style={styles.orderText}>40 orders</Text>
            <Text style={styles.orderText}>30 Received</Text>
          </View>
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Switch Account</Text>
        <Switch value={switchAccount} onValueChange={setSwitchAccount} thumbColor="#FFFFFF" trackColor={{ false: '#D3CFDE', true: '#6A56D5' }} />
      </View>

      <View style={styles.menuBlock}>
        <Text style={styles.menuHeader}>My Account</Text>

        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/custom-designs')}>
          <View style={styles.menuIcon}><Ionicons name="color-palette-outline" size={18} color="#3B2D85" /></View>
          <Text style={styles.menuText}>Custom Designs</Text>
          <Ionicons name="chevron-forward" size={18} color="#7F7992" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/messages')}>
          <View style={styles.menuIcon}><Ionicons name="chatbubble-ellipses-outline" size={18} color="#3B2D85" /></View>
          <Text style={styles.menuText}>Messages</Text>
          <Ionicons name="chevron-forward" size={18} color="#7F7992" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/favorites')}>
          <View style={styles.menuIcon}><Ionicons name="heart-outline" size={18} color="#3B2D85" /></View>
          <Text style={styles.menuText}>Favorites</Text>
          <Ionicons name="chevron-forward" size={18} color="#7F7992" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F4F6' },
  hero: { backgroundColor: '#342684', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 18 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '600' },
  identityRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12, backgroundColor: '#E3E3E8' },
  name: { color: '#FFFFFF', fontSize: 24, fontWeight: '600' },
  role: { marginTop: 2, color: '#D9D3F3', fontSize: 14 },
  orderStats: { marginLeft: 'auto', alignItems: 'flex-end' },
  orderText: { color: '#DCD5F8', fontSize: 13, marginBottom: 2 },
  switchRow: { marginHorizontal: 16, marginTop: 14, borderRadius: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontSize: 17, color: '#2F2A39', fontWeight: '500' },
  menuBlock: { marginTop: 14, marginHorizontal: 16, borderRadius: 12, backgroundColor: '#FFFFFF', padding: 14 },
  menuHeader: { fontSize: 22, color: '#2D273A', fontWeight: '600', marginBottom: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEEAF5' },
  menuIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEEAFB', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  menuText: { flex: 1, fontSize: 16, color: '#2E2939', fontWeight: '500' },
});
