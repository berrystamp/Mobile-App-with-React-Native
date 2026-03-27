import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import ApiService from '@/services/apiClient';
import { normalizePaymentDetails } from '@/lib/profile';

const PURPLE = '#3B2D85';

const NIGERIAN_BANKS = [
  'GTBank',
  'Access Bank',
  'First Bank',
  'Zenith Bank',
  'UBA',
  'Fidelity Bank',
  'Union Bank',
  'Sterling Bank',
];

export default function PaymentDetailsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankName, setBankName] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await ApiService.getPaymentDetails();
      const normalized = normalizePaymentDetails(response);
      setBankName(normalized.bankName || 'GTBank');
      setAccountNumber(normalized.accountNumber || '');
      setAccountName(normalized.accountName || '');
    } catch (error: any) {
      Alert.alert('Unable to load payment details', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const isValid = useMemo(() => /^\d{10}$/.test(accountNumber), [accountNumber]);

  const save = async () => {
    if (!isValid) {
      Alert.alert('Validation', 'Account number must be exactly 10 digits.');
      return;
    }

    try {
      setSaving(true);
      await ApiService.savePaymentDetails({ bankName, accountNumber, accountName: accountName.trim() });
      Alert.alert('Success', 'Payment saved successfully.');
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
        <Text style={styles.headerText}>Payment details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Name of the bank</Text>
        <View style={styles.bankRow}>
          <TextInput
            style={styles.bankInput}
            value={bankName}
            onChangeText={setBankName}
            placeholder="Select bank"
            placeholderTextColor="#8F8F8F"
          />
          <Ionicons name="chevron-down" size={20} color="#7A7A7A" />
        </View>
        <Text style={styles.helper}>Common banks: {NIGERIAN_BANKS.slice(0, 4).join(', ')}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>Account Number</Text>
        <TextInput
          style={styles.input}
          value={accountNumber}
          onChangeText={(text) => setAccountNumber(text.replace(/\D/g, '').slice(0, 10))}
          keyboardType="numeric"
          placeholder="001164757223"
          placeholderTextColor="#8F8F8F"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Account Name</Text>
        <TextInput
          style={styles.input}
          value={accountName}
          onChangeText={setAccountName}
          placeholder="Resolved account name"
          placeholderTextColor="#8F8F8F"
        />

        <View style={styles.verifyRow}>
          <Ionicons name={isValid ? 'checkmark-circle' : 'refresh-circle'} size={20} color={isValid ? '#5AC88B' : PURPLE} />
          <Text style={[styles.verifyText, isValid && { color: '#2E7D32' }]}>
            {isValid ? 'Account number format valid' : 'Verifying account number'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.saveBtn, saving && styles.disabled]} onPress={save} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F8' },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F8' },
  header: { paddingHorizontal: 16, paddingTop: 54, paddingBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontSize: 22, fontWeight: '600', color: '#1D1D1D' },
  content: { paddingHorizontal: 16 },
  label: { color: PURPLE, fontSize: 14, fontWeight: '500', marginBottom: 8 },
  bankRow: { borderWidth: 1, borderColor: '#CFC6EE', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  bankInput: { flex: 1, fontSize: 16, color: '#242424', paddingVertical: 14 },
  helper: { marginTop: 6, color: '#8A8A8A', fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#DDDDDD', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: '#242424' },
  verifyRow: { marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F4F3FA', borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14 },
  verifyText: { color: PURPLE, fontSize: 14, fontWeight: '500' },
  saveBtn: { marginHorizontal: 16, marginTop: 'auto', marginBottom: 30, borderRadius: 28, backgroundColor: PURPLE, alignItems: 'center', paddingVertical: 16 },
  disabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
