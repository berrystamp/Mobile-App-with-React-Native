import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { DEFAULT_DESIGN_THEMES } from '@/lib/customDesign';
import { useAppTheme } from '@/lib/theme/appTheme';
import { mergeUserAndProfile, normalizeProfileResponse } from '@/lib/profile';
import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';

const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4e?w=400';

const toImage = (path?: string) => {
  if (!path || path === 'string') return '';
  if (path.startsWith('http') || path.startsWith('file:') || path.startsWith('content:')) return path;
  return `https://berrystamp-backend-dev-4cn29.ondigitalocean.app/${path.replace(/^\/+/, '')}`;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const role = useAuthStore((state) => toProfileType(state.role));
  const theme = useAppTheme();
  const { uploading, uploadFile } = useFileUpload();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [bio, setBio] = useState('');
  const [specifications, setSpecifications] = useState<string[]>([""]);
  const [avatarUri, setAvatarUri] = useState(defaultAvatar);
  const [coverUri, setCoverUri] = useState('');
  const [showSpecs, setShowSpecs] = useState(false);
  const [storedAvatarPath, setStoredAvatarPath] = useState('');
  const [storedCoverPath, setStoredCoverPath] = useState('');
  const initialSnapshot = useRef('');

  const title = role === 'PRINTER' ? 'Printer Account' : 'Account';
  const identifierLabel = role === 'CUSTOMER' ? 'Username' : 'Brand Name';
  const identifierPlaceholder = role === 'CUSTOMER' ? 'Enter username' : 'Enter brand name';

  const snapshot = useMemo(
    () => JSON.stringify({ fullName, identifier, bio, specifications, avatarUri, coverUri }),
    [avatarUri, bio, coverUri, fullName, identifier, specifications],
  );

  const selectedSpecLabel = useMemo(() => {
    if (!specifications.length) return '';
    return specifications.slice(0, 3).join(', ');
  }, [specifications]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await ApiService.getMyProfile();
      const normalized = normalizeProfileResponse(profileData);
      const merged = mergeUserAndProfile(user, normalized);
      const currentProfile =
        role === 'DESIGNER' ? merged.designerProfile :
        role === 'PRINTER' ? merged.printerProfile :
        merged.customerProfile;

      const avatarPath =
        currentProfile?.profileImage?.url ||
        currentProfile?.profilePic ||
        normalized.profilePicturePath ||
        merged.avatar ||
        user?.profilePicturePath ||
        '';
      const nextCoverPath =
        currentProfile?.coverPic ||
        currentProfile?.coverPhotoPath ||
        currentProfile?.coverImage?.url ||
        normalized.coverPic ||
        '';

      const nextState = {
        fullName: merged.fullName || '',
        identifier: merged.username || '',
        bio: currentProfile?.bio || '',
        specifications: currentProfile?.categories || [],
        avatarUri: toImage(avatarPath) || defaultAvatar,
        coverUri: toImage(nextCoverPath),
      };

      setFullName(nextState.fullName);
      setIdentifier(nextState.identifier);
      setBio(nextState.bio);
      setSpecifications(nextState.specifications);
      setAvatarUri(nextState.avatarUri);
      setCoverUri(nextState.coverUri);
      setStoredAvatarPath(String(avatarPath || '').trim());
      setStoredCoverPath(String(nextCoverPath || '').trim());
      initialSnapshot.current = JSON.stringify(nextState);
    } catch (error: any) {
      console.log('Unable to load profile', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const pickImage = async (onSelect: (uri: string) => void, aspect: [number, number]) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow photo access to update your images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        onSelect(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Image selection failed', error?.message || 'Please try again.');
    }
  };

  const saveChanges = useCallback(async (showSuccess = false) => {
    if (!fullName.trim()) {
      throw new Error('Full name is required.');
    }

    let profilePic = storedAvatarPath;
    if (avatarUri && (avatarUri.startsWith('file:') || avatarUri.startsWith('content:'))) {
      const uploaded = await uploadFile(avatarUri);
      profilePic = uploaded.path;
    }

    let coverPic = storedCoverPath;
    if (coverUri && (coverUri.startsWith('file:') || coverUri.startsWith('content:'))) {
      const uploaded = await uploadFile(coverUri);
      coverPic = uploaded.path;
    }
    
    await ApiService.updateMyProfile({
      name: fullName.trim(),
      bio: bio.trim(),
      categories: specifications,
      profilePic: profilePic.replace("https://berry-stamp-prod.s3.amazonaws.com/", "") || '',
      coverPic: coverPic.replace("https://berry-stamp-prod.s3.amazonaws.com/", "")   || '',
    });

    await refreshUser();
    await loadProfile();
    setStoredAvatarPath(profilePic || '');
    setStoredCoverPath(coverPic || '');
    initialSnapshot.current = snapshot;
    if (showSuccess) {
      Alert.alert('Success', 'Changes saved successfully.');
    }
  }, [avatarUri, bio, coverUri, fullName, loadProfile, refreshUser, snapshot, specifications, storedAvatarPath, storedCoverPath, uploadFile]);

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

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.coverWrap, { backgroundColor: theme.surfaceMuted }]}>
          {coverUri ? <Image source={{ uri: coverUri }} style={styles.coverImage} /> : null}
          <View style={styles.coverOverlay} />
          <View style={styles.coverHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleManualSave} disabled={saving || uploading} style={styles.saveButton}>
              <Text style={styles.saveText}>{saving || uploading ? '...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => pickImage(setCoverUri, [16, 9])}
            style={styles.coverAction}>
            <Ionicons name="image-outline" size={16} color="#FFFFFF" />
            <Text style={styles.coverActionText}>{coverUri ? 'Change cover image' : 'Add cover image'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => pickImage(setAvatarUri, [1, 1])} activeOpacity={0.85} style={styles.avatarWrap}>
            <Image source={{ uri: avatarUri || defaultAvatar }} style={styles.avatar} />
            <View style={[styles.avatarCamera, { borderColor: theme.background, backgroundColor: theme.primary }]}>
              <Ionicons name="camera-outline" size={15} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <FormField label="Full Name" themeMuted={theme.textMuted}>
              <ThemedInput value={fullName} onChangeText={setFullName} placeholder="Enter full name" theme={theme} />
            </FormField>

            <FormField label={identifierLabel} themeMuted={theme.textMuted}>
              <ThemedInput value={identifier} onChangeText={setIdentifier} placeholder={identifierPlaceholder} theme={theme} />
            </FormField>

            <FormField label="Bio" themeMuted={theme.textMuted}>
              <ThemedInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself"
                theme={theme}
                multiline
                inputStyle={styles.bioInput}
              />
            </FormField>

            {(role === 'DESIGNER' || role === 'PRINTER') ? (
              <TouchableOpacity onPress={() => setShowSpecs(true)} style={[styles.specCard, { backgroundColor: theme.surfaceMuted }]}>
                <View style={[styles.specIconWrap, { backgroundColor: theme.surface }]}>
                  <Ionicons name="add" size={20} color={theme.primary} />
                </View>
                <View style={styles.specTextWrap}>
                  <Text style={[styles.specTitle, { color: theme.text }]}>Add Specification</Text>
                  {selectedSpecLabel ? <Text numberOfLines={1} style={[styles.specSubtitle, { color: theme.textMuted }]}>{selectedSpecLabel}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ) : null}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Management</Text>
            <ManagementCard label="Edit payment details" onPress={() => router.push('/payment-details')} theme={theme} />
            <ManagementCard label="Deactivate" onPress={() => {}} theme={theme} />
            <ManagementCard label="Deletion" onPress={() => {}} theme={theme} />

            <TouchableOpacity onPress={logout} style={[styles.managementCard, { backgroundColor: theme.surfaceMuted }]}>
              <Ionicons name="log-out-outline" size={18} color="#FF6B63" />
              <Text style={styles.logoutText}>Logout</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={showSpecs} animationType="slide" onRequestClose={() => setShowSpecs(false)}>
        <View style={[styles.modalScreen, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSpecs(false)}>
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add specification</Text>
            <TouchableOpacity onPress={() => setShowSpecs(false)} style={[styles.modalSave, { backgroundColor: theme.primary }]}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={[styles.searchStub, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="search-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.searchStubText, { color: theme.textMuted }]}>Search Category</Text>
            </View>

            {DEFAULT_DESIGN_THEMES.map((item) => {
              const selected = specifications.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() =>
                    setSpecifications((current) => (
                      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]
                    ))
                  }
                  style={styles.modalOption}>
                  <Text style={[styles.modalOptionText, { color: selected ? theme.primary : theme.text }]}>{item}</Text>
                  <View
                    style={[
                      styles.modalCheck,
                      {
                        borderColor: selected ? theme.primary : theme.border,
                        backgroundColor: selected ? theme.primary : 'transparent',
                      },
                    ]}>
                    {selected ? <Ionicons name="checkmark" size={14} color={theme.onPrimary} /> : null}
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

function ThemedInput({
  value,
  onChangeText,
  placeholder,
  theme,
  multiline,
  inputStyle,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  theme: ReturnType<typeof useAppTheme>;
  multiline?: boolean;
  inputStyle?: object;
}) {
  return (
    <TextInput
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textMuted}
      style={[
        styles.input,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
        },
        inputStyle,
      ]}
      textAlignVertical={multiline ? 'top' : 'center'}
      value={value}
    />
  );
}

function FormField({
  label,
  children,
  themeMuted,
}: {
  label: string;
  children: React.ReactNode;
  themeMuted: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: themeMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

function ManagementCard({
  label,
  onPress,
  theme,
}: {
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.managementCard, { backgroundColor: theme.surfaceMuted }]}>
      <Text style={[styles.managementText, { color: theme.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  coverWrap: {
    height: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 16,
    position: 'absolute',
    right: 16,
    top: 48,
    alignItems: 'center',
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  coverAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.36)',
    borderRadius: 18,
    bottom: 16,
    flexDirection: 'row',
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    position: 'absolute',
  },
  coverActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileSection: {
    marginTop: -30,
    paddingHorizontal: 16,
  },
  avatarWrap: {
    height: 84,
    marginLeft: 8,
    width: 84,
  },
  avatar: {
    borderColor: '#FFFFFF',
    borderRadius: 42,
    borderWidth: 4,
    height: '100%',
    width: '100%',
  },
  avatarCamera: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
  },
  card: {
    borderRadius: 26,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bioInput: {
    minHeight: 120,
  },
  specCard: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  specIconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  specTextWrap: {
    flex: 1,
  },
  specTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  specSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 28,
  },
  managementCard: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  managementText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutText: {
    color: '#FF6B63',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalScreen: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 48,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSave: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalContent: {
    paddingHorizontal: 16,
  },
  searchStub: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchStubText: {
    fontSize: 14,
    marginLeft: 8,
  },
  modalOption: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalCheck: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
});
