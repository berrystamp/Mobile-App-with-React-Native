import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import ApiService from '@/services/apiClient';
import { mergeUserAndProfile, normalizeProfileResponse } from '@/lib/profile';

const PURPLE = '#3B2D85';

type MenuItem = { label: string; icon: keyof typeof Ionicons.glyphMap; route?: string };

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: 'My Account',
    items: [
      { label: 'Custom Designs', icon: 'document-text-outline' },
      { label: 'Manage Orders', icon: 'receipt-outline' },
      { label: 'Track Order', icon: 'heart-outline' },
      { label: 'Update Interests', icon: 'albums-outline' },
    ],
  },
  {
    title: 'Others',
    items: [
      { label: 'Settings and Privacy', icon: 'settings-outline' },
      { label: 'Terms and Condition', icon: 'newspaper-outline' },
      { label: 'Report a problem', icon: 'flag-outline' },
      { label: 'FAQ', icon: 'help-circle-outline' },
      { label: 'Update account', icon: 'add-outline' },
      { label: 'Payment details', icon: 'card-outline', route: '/payment-details' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [activeProfileType, setActiveProfileType] = useState<'CUSTOMER' | 'DESIGNER' | 'PRINTER'>('CUSTOMER');
  const [profile, setProfile] = useState(() => mergeUserAndProfile(user, {}));

  const loadProfile = useCallback(async () => {
    try {
      const [profileData, profileType] = await Promise.all([
        ApiService.getMyProfile(),
        ApiService.getActiveProfileType(),
      ]);
      setActiveProfileType(profileType as 'CUSTOMER' | 'DESIGNER' | 'PRINTER');
      setProfile(mergeUserAndProfile(user, normalizeProfileResponse(profileData)));
    } catch (error: any) {
      Alert.alert('Unable to load profile', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleSwitchRole = async () => {
    try {
      const nextType = activeProfileType === 'CUSTOMER' ? 'DESIGNER' : 'CUSTOMER';
      await ApiService.setActiveProfileType(nextType);
      setSwitchEnabled((v) => !v);
      setActiveProfileType(nextType);
      await loadProfile();
    } catch (error: any) {
      Alert.alert('Unable to switch account', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    }
  };

  const initials = useMemo(() => {
    const first = profile.fullName?.trim()?.charAt(0) || 'U';
    return first.toUpperCase();
  }, [profile.fullName]);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Profile</Text>
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}><Text style={styles.avatarText}>{initials}</Text></View>
        )}
        <Text style={styles.name}>{profile.fullName}</Text>
        <Text style={styles.role}>{activeProfileType}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stats}>{profile.orders} orders</Text>
          <Text style={styles.stats}>{profile.received} Received</Text>
        </View>
      </View>

      <View style={styles.switchCard}>
        <Text style={styles.switchLabel}>Switch Account</Text>
        <Switch value={switchEnabled} onValueChange={handleSwitchRole} trackColor={{ true: '#BDBDBD', false: '#E0E0E0' }} thumbColor="#C4C4C4" />
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
        <Text style={styles.editBtnText}>Edit profile</Text>
      </TouchableOpacity>

      {menuSections.map((section) => (
        <View key={section.title}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as never);
                }
              }}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={20} color="#8C8C8C" />
                <Text style={styles.menuText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color="#E53935" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F6' },
  content: { paddingBottom: 120 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F6' },
  hero: { backgroundColor: PURPLE, paddingTop: 48, paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '600', marginBottom: 18 },
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 10 },
  avatarFallback: { width: 72, height: 72, borderRadius: 36, marginBottom: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A5D6A7' },
  avatarText: { color: '#1A1A1A', fontSize: 26, fontWeight: '700' },
  name: { color: '#FFFFFF', fontSize: 30, fontWeight: '600' },
  role: { color: '#D8D4F2', fontSize: 18, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 16 },
  stats: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  switchCard: {
    marginHorizontal: 16,
    marginTop: -12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  switchLabel: { color: '#262626', fontSize: 17, fontWeight: '500' },
  editBtn: { marginTop: 16, marginHorizontal: 16, backgroundColor: '#ECEBF4', borderRadius: 20, paddingVertical: 12, alignItems: 'center' },
  editBtnText: { color: PURPLE, fontWeight: '600' },
  sectionTitle: { marginTop: 22, marginHorizontal: 16, marginBottom: 10, color: '#777777', fontSize: 32, fontWeight: '600' },
  menuItem: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { color: '#3D3D3D', fontSize: 17, fontWeight: '500' },
  logoutBtn: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoutText: { color: '#E53935', fontSize: 16, fontWeight: '600' },
});
