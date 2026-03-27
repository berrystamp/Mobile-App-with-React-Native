import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { DEFAULT_DESIGN_THEMES } from '@/lib/customDesign';
import { mergeUserAndProfile, normalizeProfileResponse } from '@/lib/profile';
import ApiService from '@/services/apiClient';

const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4e?w=400';
const coverPattern = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80';

const toImage = (path?: string) => {
  if (!path || path === 'string') return defaultAvatar;
  if (path.startsWith('http') || path.startsWith('file:') || path.startsWith('content:')) return path;
  return `https://berrystamp-backend-dev-4cn29.ondigitalocean.app/${path.replace(/^\/+/, '')}`;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [bio, setBio] = useState('');
  const [specifications, setSpecifications] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState(defaultAvatar);
  const [showSpecs, setShowSpecs] = useState(false);
  const initialSnapshot = useRef('');

  const role = (user?.profileType || 'CUSTOMER') as 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
  const title = role === 'PRINTER' ? 'Printer Account' : 'Account';

  const snapshot = useMemo(
    () => JSON.stringify({ fullName, brandName, bio, specifications, avatarUri }),
    [avatarUri, bio, brandName, fullName, specifications],
  );

  const selectedSpecLabel = useMemo(() => {
    if (!specifications.length) return '';
    return specifications.slice(0, 3).join(', ');
  }, [specifications]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await ApiService.getMyProfile();
      const merged = mergeUserAndProfile(user, normalizeProfileResponse(profileData));
      const currentProfile =
        role === 'DESIGNER' ? merged.designerProfile :
        role === 'PRINTER' ? merged.printerProfile :
        merged.customerProfile;

      const nextState = {
        fullName: merged.fullName || '',
        brandName: merged.username || '',
        bio: currentProfile?.bio || '',
        specifications: currentProfile?.categories || [],
        avatarUri: toImage(
          currentProfile?.profileImage?.url ||
            currentProfile?.profilePic ||
            merged.avatar ||
            user?.profilePicturePath,
        ),
      };

      setFullName(nextState.fullName);
      setBrandName(nextState.brandName);
      setBio(nextState.bio);
      setSpecifications(nextState.specifications);
      setAvatarUri(nextState.avatarUri);
      initialSnapshot.current = JSON.stringify(nextState);
    } catch (error: any) {
      Alert.alert('Unable to load profile', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const saveChanges = useCallback(async (showSuccess = false) => {
    if (!fullName.trim()) {
      throw new Error('Full name is required.');
    }

    let profilePicture = user?.profilePicturePath || '';
    if (avatarUri && !avatarUri.startsWith('http')) {
      profilePicture = await ApiService.uploadProfileImage(avatarUri);
    }

    await ApiService.updateMyProfile({
      name: fullName.trim(),
      username: brandName.trim(),
      bio: bio.trim(),
      categories: specifications,
      profileType: role,
      ...(profilePicture ? { profilePicture } : {}),
    });

    initialSnapshot.current = snapshot;
    if (showSuccess) {
      Alert.alert('Success', 'Changes saved successfully.');
    }
  }, [avatarUri, bio, brandName, fullName, role, snapshot, specifications, user?.profilePicturePath]);

  const handleBack = async () => {
    if (snapshot === initialSnapshot.current) {
      router.back();
      return;
    }

    try {
      setSaving(true);
      await saveChanges();
      router.back();
    } catch (error: any) {
      Alert.alert('Save failed', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    try {
      setSaving(true);
      await saveChanges(true);
    } catch (error: any) {
      Alert.alert('Save failed', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pickProfileImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow photo access to update your profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Image selection failed', error?.message || 'Please try again.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F8FB] dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#4A34A5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#FAFAFC] dark:bg-[#121212]" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="h-[174px] overflow-hidden bg-[#1D1C25]">
          <Image source={{ uri: coverPattern }} className="absolute inset-0 h-full w-full" />
          <View className="absolute inset-0 bg-black/35" />
          <View className="px-4 pb-5 pt-12">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handleBack} className="h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="text-base font-medium text-white">{title}</Text>
              <TouchableOpacity onPress={handleManualSave} disabled={saving} className="min-w-[44px] items-end">
                <Text className="text-sm font-semibold text-white/95">{saving ? '...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="-mt-7 px-4">
          <TouchableOpacity onPress={pickProfileImage} activeOpacity={0.85} className="ml-2 h-[76px] w-[76px]">
            <Image source={{ uri: avatarUri }} className="h-full w-full rounded-full border-4 border-white dark:border-[#121212]" />
            <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#C6921C] dark:border-[#121212]">
              <Ionicons name="camera-outline" size={15} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View className="mt-4 rounded-[26px] bg-white px-4 pb-6 pt-3 dark:bg-[#18181B]">
            <FormField label="Full Name">
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor={isDark ? '#797884' : '#A19BAF'}
                className="rounded-xl border border-[#E7E3F2] bg-white px-4 py-3.5 text-[14px] text-[#2E2939] dark:border-[#34343A] dark:bg-[#18181B] dark:text-white"
              />
            </FormField>

            <FormField label="brand name">
              <TextInput
                value={brandName}
                onChangeText={setBrandName}
                placeholder="Enter brand name"
                placeholderTextColor={isDark ? '#797884' : '#A19BAF'}
                className="rounded-xl border border-[#E7E3F2] bg-white px-4 py-3.5 text-[14px] text-[#2E2939] dark:border-[#34343A] dark:bg-[#18181B] dark:text-white"
              />
            </FormField>

            <FormField label="Bio">
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself"
                placeholderTextColor={isDark ? '#797884' : '#A19BAF'}
                multiline
                textAlignVertical="top"
                className="min-h-[118px] rounded-xl border border-[#7A63D7] bg-white px-4 py-3.5 text-[14px] leading-6 text-[#2E2939] dark:border-[#5F4AB0] dark:bg-[#18181B] dark:text-white"
              />
            </FormField>

            {(role === 'DESIGNER' || role === 'PRINTER') ? (
              <TouchableOpacity
                onPress={() => setShowSpecs(true)}
                className="mt-2 flex-row items-center rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(73,53,133,0.08)] dark:bg-[#1F1F24]">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#F1ECFF] dark:bg-[#2C224F]">
                  <Ionicons name="add" size={20} color="#6C56D8" />
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-medium text-[#2E2939] dark:text-white">Add Specification</Text>
                  {selectedSpecLabel ? (
                    <Text numberOfLines={1} className="mt-1 text-[11px] text-[#A39BB2] dark:text-[#8F8FA1]">
                      {selectedSpecLabel}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#A39BB2" />
              </TouchableOpacity>
            ) : null}

            <Text className="mb-3 mt-8 text-[16px] font-medium text-[#18141F] dark:text-white">Account Management</Text>
            <ManagementCard label="Edit payment details" onPress={() => router.push('/payment-details')} />
            <ManagementCard label="Deactivate" onPress={() => {}} />
            <ManagementCard label="Deletion" onPress={() => {}} />

            <TouchableOpacity
              onPress={logout}
              className="mt-7 flex-row items-center rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(73,53,133,0.08)] dark:bg-[#1F1F24]">
              <Ionicons name="log-out-outline" size={18} color="#FF6B63" />
              <Text className="ml-3 flex-1 text-[14px] font-medium text-[#FF6B63]">Logout</Text>
              <Ionicons name="chevron-forward" size={18} color="#A39BB2" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={showSpecs} animationType="slide" onRequestClose={() => setShowSpecs(false)}>
        <View className="flex-1 bg-white dark:bg-[#121212]">
          <View className="flex-row items-center justify-between px-4 pb-4 pt-12">
            <TouchableOpacity onPress={() => setShowSpecs(false)}>
              <Ionicons name="arrow-back" size={22} color={isDark ? '#FFFFFF' : '#111111'} />
            </TouchableOpacity>
            <Text className="text-base font-medium text-[#2B2833] dark:text-white">Add specification</Text>
            <TouchableOpacity onPress={() => setShowSpecs(false)} className="rounded-full bg-[#4732A1] px-4 py-2">
              <Text className="text-xs font-semibold text-white">Save</Text>
            </TouchableOpacity>
          </View>

          <View className="px-4">
            <View className="mb-6 flex-row items-center rounded-full border border-[#E6E2F0] px-4 py-3 dark:border-[#353535]">
              <Ionicons name="search-outline" size={18} color="#A09BAE" />
              <Text className="ml-2 text-sm text-[#A09BAE]">Search Category</Text>
            </View>

            {DEFAULT_DESIGN_THEMES.map((theme) => {
              const selected = specifications.includes(theme);
              return (
                <TouchableOpacity
                  key={theme}
                  onPress={() =>
                    setSpecifications((current) =>
                      current.includes(theme) ? current.filter((item) => item !== theme) : [...current, theme],
                    )
                  }
                  className="flex-row items-center justify-between py-4">
                  <Text className={`text-sm ${selected ? 'text-[#4732A1]' : 'text-[#2E2939] dark:text-white'}`}>{theme}</Text>
                  <View className={`h-5 w-5 items-center justify-center rounded border ${selected ? 'border-[#6D57D9] bg-[#F0EBFF]' : 'border-[#DAD6E7] dark:border-[#4B4B4B]'}`}>
                    {selected ? <Ionicons name="checkmark" size={14} color="#6D57D9" /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 ml-2 text-[11px] font-medium text-[#887FA0] dark:text-[#8F8FA1]">{label}</Text>
      {children}
    </View>
  );
}

function ManagementCard({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-2xl bg-white px-4 py-4 shadow-[0_6px_18px_rgba(73,53,133,0.08)] dark:bg-[#1F1F24]">
      <Text className="flex-1 text-[14px] text-[#2E2939] dark:text-white">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#A39BB2" />
    </TouchableOpacity>
  );
}
