import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import ApiService from '@/services/apiClient';
import { mergeUserAndProfile, normalizeProfileResponse } from '@/lib/profile';

const PURPLE = '#3B2D85';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');

  const load = useCallback(async () => {
    try {
      const profileData = await ApiService.getMyProfile();
      const merged = mergeUserAndProfile(user, normalizeProfileResponse(profileData));
      const split = merged.fullName.split(' ');
      setFirstName(split[0] || '');
      setLastName(split.slice(1).join(' '));
      setUsername(merged.username || '');
      setAddress(merged.address || '');
    } catch (error: any) {
      Alert.alert('Unable to load profile', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const onSave = async () => {
    if (!firstName.trim() || !username.trim()) {
      Alert.alert('Validation', 'Full name and username are required.');
      return;
    }

    try {
      setSaving(true);
      await ApiService.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        address: address.trim(),
      });
      Alert.alert('Success', 'Changes saved successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Save failed', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={PURPLE} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Field label="Full Name">
          <TextInput style={styles.input} value={`${firstName} ${lastName}`.trim()} onChangeText={(text) => {
            const [first, ...rest] = text.split(' ');
            setFirstName(first || '');
            setLastName(rest.join(' '));
          }} placeholder="Enter full name" placeholderTextColor="#8F8F8F" />
        </Field>

        <Field label="Username">
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter username" placeholderTextColor="#8F8F8F" autoCapitalize="none" />
        </Field>

        <Field label="Address">
          <TextInput style={[styles.input, styles.multiline]} value={address} onChangeText={setAddress} placeholder="Enter address" placeholderTextColor="#8F8F8F" multiline />
        </Field>
      </ScrollView>

      <TouchableOpacity style={[styles.saveBtn, saving && styles.disabled]} onPress={onSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save change'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F8' },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F8' },
  header: { paddingHorizontal: 16, paddingTop: 54, paddingBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontSize: 22, fontWeight: '600', color: '#1D1D1D' },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 15, color: PURPLE, marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#DDDDDD', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: '#242424' },
  multiline: { minHeight: 86, textAlignVertical: 'top' },
  saveBtn: { marginHorizontal: 16, marginBottom: 30, borderRadius: 28, backgroundColor: PURPLE, alignItems: 'center', paddingVertical: 16 },
  disabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
