import { useAppAlert } from '@/components/common/AppAlert';
import { normalizePaymentDetails } from '@/lib/profile';
import { useAppTheme } from '@/lib/theme/appTheme';
import type { BankOption } from '@/services/apiClient';
import ApiService from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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

type CurrencyType = 'NGN' | 'USD';

export default function PaymentDetailsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { show: showAlert, element: alertElement } = useAppAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  
  // Currency toggle state
  const [activeCurrency, setActiveCurrency] = useState<CurrencyType>('NGN');
  
  // NGN Payment Details
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await ApiService.getPaymentDetails();
      const normalized = normalizePaymentDetails(response);
      
      if (normalized.bankName && normalized.bankCode && normalized.accountNumber) {
        setBankName(normalized.bankName);
        setBankCode(normalized.bankCode);
        setAccountNumber(normalized.accountNumber);
        setAccountName(normalized.accountName || '');
      }
    } catch (error: any) {
      showAlert({ type: 'error', title: 'Unable to load payment details', message: error?.response?.data?.responseMessage || error?.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBanks = useCallback(async () => {
    try {
      setBanksLoading(true);
      const bankList = await ApiService.getBanks();
      setBanks(bankList);
    } catch (error: any) {
      showAlert({ type: 'error', title: 'Unable to load banks', message: error?.response?.data?.responseMessage || error?.message || 'Please try again.' });
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
      if (!banks.length) {
        loadBanks();
      }
    }, [banks.length, load, loadBanks])
  );

  // Auto-verify bank when account number is 10 digits and bank is selected
  useEffect(() => {
    const verifyAccount = async () => {
      if (
        accountNumber.length === 10 &&
        bankCode &&
        !accountName &&
        activeCurrency === 'NGN'
      ) {
        try {
          setVerifying(true);
          setVerifyError(false);
          
          // Verify using api/v1/banks/verify endpoint
          const response = await ApiService.verifyBankAccount({ accountNumber, bankCode });
          
          // Extract account name from response
          const resolvedName = 
            response?.responseBody?.accountName || 
            response?.data?.responseBody?.accountName ||
            response?.data?.accountName || 
            response?.accountName;
          
          if (resolvedName) {
            setAccountName(resolvedName);
          } else {
            setVerifyError(true);
          }
        } catch (error: any) {
          setVerifyError(true);
          showAlert({ type: 'error', title: 'Verification Failed', message: error?.response?.data?.responseMessage || 'Unable to verify account number' });
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyAccount();
  }, [accountNumber, bankCode, accountName, activeCurrency]);

  const isValidAccountNumber = useMemo(
    () => /^\d{10}$/.test(accountNumber),
    [accountNumber]
  );

  const filteredBanks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const currencyBanks =
      activeCurrency === 'NGN'
        ? banks.filter((bank) => bank.currency === 'NGN' || !bank.currency)
        : banks;

    return currencyBanks.filter((bank) =>
      bank.name.toLowerCase().includes(normalizedQuery)
    );
  }, [activeCurrency, banks, searchQuery]);

  const handleBankSelect = (bank: BankOption) => {
    setBankName(bank.name);
    setBankCode(bank.code);
    setAccountName(''); // Clear account name when bank changes
    setModalVisible(false);
    setSearchQuery('');
  };

  const openBankModal = async () => {
    setModalVisible(true);

    if (banks.length || banksLoading) return;

    await loadBanks();
  };

  const handleSave = async () => {
    if (!isValidAccountNumber) {
      showAlert({ type: 'warning', title: 'Validation', message: 'Account number must be exactly 10 digits.' });
      return;
    }

    if (!accountName.trim()) {
      showAlert({ type: 'warning', title: 'Validation', message: 'Account name is required.' });
      return;
    }

    if (!bankCode || !bankName) {
      showAlert({ type: 'warning', title: 'Validation', message: 'Please select a bank.' });
      return;
    }

    try {
      setSaving(true);
      await ApiService.savePaymentDetails({
        bankName,
        bankCode,
        accountNumber,
        accountName: accountName.trim(),
      });
      showAlert({ type: 'success', title: 'Success', message: 'Payment details saved successfully.' });
      router.back();
    } catch (error: any) {
      showAlert({ type: 'error', title: 'Save failed', message: error?.response?.data?.responseMessage || error?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddUSDDetails = () => {
    showAlert({ type: 'warning', title: 'USD Details', message: 'USD payment details functionality is coming soon. Please check back later.' });
  };

  if (loading) {
    return (
      <View style={[styles.loaderWrap, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>
          Loading Payment Details
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.text }]}>
          Payment Details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Currency Toggle Buttons */}
        <View style={styles.currencyToggleContainer}>
          <TouchableOpacity
            style={[
              styles.currencyButton,
              {
                backgroundColor: activeCurrency === 'NGN' ? theme.primary : '#9CA3AF',
                borderRadius: 30,
              },
            ]}
            onPress={() => setActiveCurrency('NGN')}
          >
            <Text style={styles.currencyButtonText}>NGN Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.currencyButton,
              {
                backgroundColor: activeCurrency === 'USD' ? theme.primary : '#9CA3AF',
                borderRadius: 30,
                marginLeft: 12,
              },
            ]}
            onPress={() => setActiveCurrency('USD')}
          >
            <Text style={styles.currencyButtonText}>USD Details</Text>
          </TouchableOpacity>
        </View>

        {/* USD Box - Hidden by default */}
        {activeCurrency === 'USD' && (
          <View style={[styles.usdBox, { backgroundColor: theme.surface }]}>
            <View style={styles.usdPlaceholder}>
              <Ionicons name="wallet" size={80} color={theme.textMuted} />
            </View>
            <Text style={[styles.usdHeading, { color: theme.text }]}>
              You have not added USD details
            </Text>
            <Text
              style={[
                styles.usdSubtext,
                { color: theme.textMuted },
              ]}
            >
              You have not yet added your USD payments details. Click the button
              below to add details
            </Text>
            <TouchableOpacity
              style={[styles.addUSDBtn, { backgroundColor: theme.primary }]}
              onPress={handleAddUSDDetails}
            >
              <Text style={styles.addUSDBtnText}>+ Add Payment Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* NGN Box - Shown by default */}
        {activeCurrency === 'NGN' && (
          <View style={styles.ngnBox}>
            {/* Bank Name */}
            <Text style={[styles.label, { color: theme.primary }]}>
              Bank Name
            </Text>
            <TouchableOpacity
              style={[
                styles.bankRow,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
              onPress={openBankModal}
            >
              <Text
                style={[
                  styles.bankText,
                  { color: bankName ? theme.text : theme.textMuted },
                ]}
              >
                {bankName || 'Select Bank'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.textMuted}
              />
            </TouchableOpacity>

            {/* Account Number */}
            <Text
              style={[
                styles.label,
                { marginTop: 24, color: theme.primary },
              ]}
            >
              Account Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  color: theme.text,
                },
              ]}
              value={accountNumber}
              onChangeText={(text) => {
                const numeric = text.replace(/\D/g, '').slice(0, 10);
                setAccountNumber(numeric);
                if (numeric.length !== 10) {
                  setAccountName(''); // Clear name if account number changes
                }
              }}
              keyboardType="numeric"
              placeholder="001164757223"
              placeholderTextColor={theme.textMuted}
              maxLength={10}
            />

            {/* Verification Status */}
            <View
              style={[
                styles.verifyRow,
                { backgroundColor: theme.surfaceMuted || '#F3F4F6' },
              ]}
            >
              {verifying ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={theme.primary}
                  />
                  <Text
                    style={[
                      styles.verifyText,
                      { color: theme.primary },
                    ]}
                  >
                    Verifying...
                  </Text>
                </>
              ) : verifyError ? (
                <>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="#EF4444"
                  />
                  <Text
                    style={[
                      styles.verifyText,
                      { color: '#EF4444' },
                    ]}
                  >
                    Failed to verify
                  </Text>
                </>
              ) : accountName ? (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#5AC88B"
                  />
                  <Text
                    style={[
                      styles.verifyText,
                      { color: '#5AC88B', fontWeight: '600' },
                    ]}
                  >
                    {accountName}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="refresh-circle"
                    size={20}
                    color={theme.primary}
                  />
                  <Text
                    style={[
                      styles.verifyText,
                      { color: theme.primary },
                    ]}
                  >
                    Enter 10-digit account number
                  </Text>
                </>
              )}
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: !accountName || saving ? 0.7 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={!accountName || saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Bank
            </Text>
            <View style={{ width: 45 }} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Search banks..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>

          <ScrollView>
            {banksLoading ? (
              <View style={styles.bankListState}>
                <ActivityIndicator color={theme.primary} size="small" />
                <Text style={[styles.bankListStateText, { color: theme.textMuted }]}>
                  Loading banks...
                </Text>
              </View>
            ) : filteredBanks.length ? (
              filteredBanks.map((bank) => (
              <TouchableOpacity
                key={`${bank.code}-${bank.name}`}
                style={[
                  styles.bankItem,
                  { borderBottomColor: theme.border },
                ]}
                onPress={() => handleBankSelect(bank)}
              >
                <Text
                  style={[
                    styles.bankItemText,
                    {
                      color: theme.text,
                      fontWeight: bank.code === bankCode ? '700' : '400',
                    },
                  ]}
                >
                  {bank.name}
                </Text>
                {bank.code === bankCode && (
                  <Ionicons name="checkmark" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
              ))
            ) : (
              <View style={styles.bankListState}>
                <Text style={[styles.bankListStateText, { color: theme.textMuted }]}>
                  No banks found.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
      {alertElement}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 14 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: { fontSize: 22, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30, flex: 1 },
  
  // Currency Toggle
  currencyToggleContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  currencyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 148,
    alignItems: 'center',
  },
  currencyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // USD Box
  usdBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  usdPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  usdHeading: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  usdSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  addUSDBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  addUSDBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // NGN Box
  ngnBox: {
    flex: 1,
    paddingTop: 20,
  },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  bankRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  bankText: { fontSize: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  verifyRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  verifyText: { fontSize: 14, fontWeight: '500', marginLeft: 4 },
  saveBtn: {
    marginTop: 40,
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 16,
    minWidth: 148,
    alignSelf: 'flex-start',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },

  // Modal Styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  searchContainer: { padding: 16, position: 'relative', justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 28, zIndex: 1 },
  searchInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bankItemText: { fontSize: 16 },
  bankListState: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bankListStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
