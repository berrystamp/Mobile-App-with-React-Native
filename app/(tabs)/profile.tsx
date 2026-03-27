import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { mergeUserAndProfile, normalizeProfileResponse } from '@/lib/profile';
import ApiService from '@/services/apiClient';
import type { TProfileType, User } from '@/types';

const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4e?w=400';

const toAvatar = (path?: string) => {
  if (!path || path === 'string') return defaultAvatar;
  if (path.startsWith('http')) return path;
  return `https://berrystamp-backend-dev-4cn29.ondigitalocean.app/${path.replace(/^\/+/, '')}`;
};

const profileLabels: Record<TProfileType, string> = {
  CUSTOMER: 'Customer',
  DESIGNER: 'Designer',
  PRINTER: 'Printer',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const tabBarHeight = 40;
  const [switchAccount, setSwitchAccount] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSwitchSheet, setShowSwitchSheet] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const current = (await ApiService.getCurrentUser()) as User | null;
        const profileResponse = await ApiService.getMyProfile();
        const normalized = normalizeProfileResponse(profileResponse);
        const merged = { ...(current || {}), ...normalized } as User;
        setUser(merged);
        setSwitchAccount((merged.profileType || 'CUSTOMER') !== 'CUSTOMER');
      } catch (error: any) {
        Alert.alert('Unable to load profile', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const profile = useMemo(() => mergeUserAndProfile(user, {}), [user]);

  const availableAccounts = useMemo<TProfileType[]>(() => {
    if (!user) return ['CUSTOMER'] as TProfileType[];
    const accounts: TProfileType[] = [];
    if (user.customerProfile || user.roles?.includes('ROLE_CUSTOMER') || user.profileType === 'CUSTOMER') accounts.push('CUSTOMER');
    if (user.printerProfile || user.roles?.includes('ROLE_PRINTER')) accounts.push('PRINTER');
    if (user.designerProfile || user.roles?.includes('ROLE_DESIGNER')) accounts.push('DESIGNER');
    return accounts.length ? accounts : ['CUSTOMER'];
  }, [user]);

  const activeRole = (user?.profileType || 'CUSTOMER') as TProfileType;
  const accountItems = useMemo(() => {
    if (activeRole === 'DESIGNER') {
      return [
        { icon: 'document-text-outline' as const, label: 'Manage Order', onPress: () => router.push('/messages') },
        { icon: 'storefront-outline' as const, label: 'My Shop', onPress: () => router.push('/custom-designs') },
        { icon: 'wallet-outline' as const, label: 'Wallet', onPress: () => router.push('/payment-details') },
      ];
    }

    if (activeRole === 'PRINTER') {
      return [
        { icon: 'document-text-outline' as const, label: 'Manage Order', onPress: () => router.push('/messages') },
        { icon: 'print-outline' as const, label: 'Print Jobs', onPress: () => router.push('/printers') },
        { icon: 'wallet-outline' as const, label: 'Wallet', onPress: () => router.push('/payment-details') },
      ];
    }

    return [
      { icon: 'color-palette-outline' as const, label: 'Custom Designs', onPress: () => router.push('/custom-designs') },
      { icon: 'document-text-outline' as const, label: 'Manage Orders', onPress: () => router.push('/messages') },
      { icon: 'heart-outline' as const, label: 'Track Order', onPress: () => router.push('/favorites') },
      { icon: 'copy-outline' as const, label: 'Update Interests', onPress: () => {} },
    ];
  }, [activeRole, router]);

  const otherItems = useMemo(() => {
    return [
      { icon: 'settings-outline' as const, label: 'Settings and privacy', onPress: () => {} },
      { icon: 'document-text-outline' as const, label: 'Terms and Condition', onPress: () => {} },
      { icon: 'flag-outline' as const, label: activeRole === 'DESIGNER' ? 'Make suggestion/Report' : 'Report a problem', onPress: () => {} },
      { icon: 'help-circle-outline' as const, label: 'FAQ', onPress: () => {} },
    ];
  }, [activeRole]);

  const handleSelectRole = async (nextType: TProfileType) => {
    try {
      await ApiService.setActiveProfileType(nextType);
      const refreshed = await ApiService.getMyProfile();
      const normalized = normalizeProfileResponse(refreshed);
      const latest = (await ApiService.getCurrentUser()) as User | null;
      const merged = { ...(latest || {}), ...normalized, profileType: nextType } as User;
      await refreshUser();
      setSwitchAccount(nextType !== 'CUSTOMER');
      setUser(merged);
      setShowSwitchSheet(false);
    } catch (error: any) {
      Alert.alert('Unable to switch account', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F8FB] dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#4732A1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F8FB] dark:bg-[#121212]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: tabBarHeight + 28 }} showsVerticalScrollIndicator={false}>
        <View className="overflow-hidden rounded-b-[28px] bg-[#4330A2] px-5 pb-5 pt-12">
          <View className="absolute inset-0">
            <View className="absolute -left-10 top-4 h-36 w-36 rounded-full border border-white/10" />
            <View className="absolute left-24 top-0 h-32 w-32 rounded-full border border-white/10" />
            <View className="absolute right-2 top-6 h-40 w-40 rounded-full border border-white/10" />
            <View className="absolute right-16 top-28 h-28 w-28 rounded-full border border-white/10" />
          </View>

          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-base font-medium text-white">Profile</Text>
            <TouchableOpacity onPress={() => router.push('/notification')} className="relative h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              <View className="absolute -right-0.5 -top-0.5 h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF6B63] px-1">
                <Text className="text-[10px] font-bold text-white">8</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <Image source={{ uri: toAvatar(profile.avatar) }} className="h-[66px] w-[66px] rounded-full border-2 border-white/15" />
            <View className="ml-3 flex-1">
              <Text className="text-lg font-semibold text-white">{profile.fullName}</Text>
              <Text className="mt-0.5 text-xs text-white/75">{profileLabels[activeRole]}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/edit-profile')}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {activeRole !== 'CUSTOMER' ? (
            <View className="mt-5 flex-row items-center justify-end">
              <View className="items-end">
                <Text className="text-sm font-semibold text-white">{profile.orders} orders</Text>
                <Text className="mt-1 text-xs text-white/70">{profile.received} Received</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View className="px-4 pt-3">
          <View className="mb-5 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-[#1E1E1E]">
            <Text className="text-sm font-medium text-[#2B2833] dark:text-white">Switch Account</Text>
            <Switch
              value={switchAccount}
              onValueChange={() => setShowSwitchSheet(true)}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#D8D8D8', true: '#C7C1E8' }}
            />
          </View>

          <ProfileSection
            title="My Account"
            items={accountItems}
          />

          <View className="mt-6">
            <Text className="mb-3 text-base font-medium text-[#74707D] dark:text-gray-400">Others</Text>
            <ProfileSection items={otherItems} />
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={showSwitchSheet} animationType="fade" onRequestClose={() => setShowSwitchSheet(false)}>
        <View className="flex-1 justify-end bg-black/25">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowSwitchSheet(false)} />
          <View className="rounded-t-[28px] bg-white px-6 pb-8 pt-4 dark:bg-[#1E1E1E]">
            <View className="mb-5 h-1.5 w-16 self-center rounded-full bg-[#DDD7F0] dark:bg-[#404040]" />
            {availableAccounts.map((account: TProfileType) => (
              <TouchableOpacity
                key={account}
                onPress={() => handleSelectRole(account)}
                className="border-b border-gray-100 py-4 dark:border-gray-800">
                <Text className={`text-base ${activeRole === account ? 'font-semibold text-[#4732A1]' : 'text-[#2B2833] dark:text-white'}`}>
                  {account === 'CUSTOMER' ? 'Customers' : account === 'PRINTER' ? 'Printer' : 'Designer'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProfileSection({
  title,
  items,
}: {
  title?: string;
  items: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  }[];
}) {
  return (
    <View>
      {title ? <Text className="mb-3 text-base font-medium text-[#74707D] dark:text-gray-400">{title}</Text> : null}
      <View className="rounded-[22px] bg-white px-4 py-2 shadow-sm dark:bg-[#1E1E1E]">
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            className={`flex-row items-center py-4 ${index !== items.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-[#F5F4F9] dark:bg-[#2A2A2A]">
              <Ionicons name={item.icon} size={18} color="#9693A1" />
            </View>
            <Text className="flex-1 text-sm font-medium text-[#2E2939] dark:text-white">{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#A09BAE" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
