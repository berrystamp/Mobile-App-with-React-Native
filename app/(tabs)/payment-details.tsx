import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import ApiService from '@/services/apiClient';
import { normalizePaymentDetails } from '@/lib/profile';
import { useAppTheme } from '@/lib/theme/appTheme';

const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank', code: '023' },
  { name: 'Diamond Bank', code: '063' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank Nigeria', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Heritage Bank Plc', code: '030' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank Limited', code: '082' },
  { name: 'Providus Bank Plc', code: '101' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Stanbic IBTC Bank Nigeria Limited', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Suntrust Bank Nigeria Limited', code: '100' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa', code: '033' },
  { name: 'Unity Bank Plc', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];

export default function PaymentDetailsScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankName, setBankName] = useState('Guaranty Trust Bank');
  const [bankCode, setBankCode] = useState('058');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await ApiService.getPaymentDetails();
      const normalized = normalizePaymentDetails(response);
      setBankName(normalized.bankName || 'Guaranty Trust Bank');
      setBankCode(normalized.bankCode || '058');
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

  const filteredBanks = useMemo(() => {
    return NIGERIAN_BANKS.filter(bank => bank.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const handleBankSelect = (bank: typeof NIGERIAN_BANKS[0]) => {
    setBankName(bank.name);
    setBankCode(bank.code);
    setModalVisible(false);
    setSearchQuery('');
  };

  const save = async () => {
    if (!isValid) {
      Alert.alert('Validation', 'Account number must be exactly 10 digits.');
      return;
    }
    
    if (!accountName.trim()) {
       Alert.alert('Validation', 'Account name is required.');
       return;
    }

    try {
      setSaving(true);
      await ApiService.savePaymentDetails({ 
        bankName, 
        bankCode,
        accountNumber, 
        accountName: accountName.trim() 
      });
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
      <View style={[styles.loaderWrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.text }]}>Payment details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.label, { color: theme.primary }]}>Name of the bank</Text>
        <TouchableOpacity 
          style={[styles.bankRow, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.bankText, { color: bankName ? theme.text : theme.textMuted }]}>
            {bankName || 'Select bank'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
        </TouchableOpacity>
        
        <Text style={[styles.label, { marginTop: 16, color: theme.primary }]}>Account Number</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
          value={accountNumber}
          onChangeText={(text) => setAccountNumber(text.replace(/\D/g, '').slice(0, 10))}
          keyboardType="numeric"
          placeholder="001164757223"
          placeholderTextColor={theme.textMuted}
        />

        <Text style={[styles.label, { marginTop: 16, color: theme.primary }]}>Account Name</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
          value={accountName}
          onChangeText={setAccountName}
          placeholder="Resolved account name"
          placeholderTextColor={theme.textMuted}
        />

        <View style={[styles.verifyRow, { backgroundColor: theme.surfaceMuted }]}>
          <Ionicons name={isValid ? 'checkmark-circle' : 'refresh-circle'} size={20} color={isValid ? '#5AC88B' : theme.primary} />
          <Text style={[styles.verifyText, { color: isValid ? '#5AC88B' : theme.primary }]}>
            {isValid ? 'Account number format valid' : 'Verifying account number'}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }, saving && styles.disabled]} onPress={save} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
      
      {/* Bank Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
             <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{color: theme.primary, fontSize: 16, fontWeight: '500'}}>Cancel</Text>
             </TouchableOpacity>
             <Text style={[styles.modalTitle, {color: theme.text}]}>Select Bank</Text>
             <View style={{width: 45}} />
          </View>
          
          <View style={styles.searchContainer}>
             <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
             <TextInput 
                style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Search banks..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
             />
          </View>
          
          <ScrollView>
            {filteredBanks.map((bank) => (
               <TouchableOpacity 
                  key={bank.code}
                  style={[styles.bankItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleBankSelect(bank)}
               >
                  <Text style={[styles.bankItemText, { color: theme.text, fontWeight: bank.code === bankCode ? '700' : '400' }]}>
                     {bank.name}
                  </Text>
                  {bank.code === bankCode && <Ionicons name="checkmark" size={20} color={theme.primary} />}
               </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 54, paddingBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  headerText: { fontSize: 22, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30, flex: 1 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  bankRow: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 50 },
  bankText: { fontSize: 16 },
  helper: { marginTop: 6, fontSize: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  verifyRow: { marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14 },
  verifyText: { fontSize: 14, fontWeight: '500' },
  saveBtn: { marginHorizontal: 16, marginTop: 10, marginBottom: 30, borderRadius: 28, alignItems: 'center', paddingVertical: 16 },
  disabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  
  // Modal Styles
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  searchContainer: { padding: 16, position: 'relative', justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 28, zIndex: 1 },
  searchInput: { height: 44, borderRadius: 8, borderWidth: 1, paddingLeft: 40, paddingRight: 16, fontSize: 16 },
  bankItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  bankItemText: { fontSize: 16 }
});