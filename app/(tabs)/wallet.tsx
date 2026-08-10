import { formatNaira } from '@/lib/currency';
import { normalizePaymentDetails } from '@/lib/profile';
import { useAppTheme } from '@/lib/theme/appTheme';
import ApiService from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const PRIMARY = '#4B3A99';
const SUCCESS_GREEN = '#22B573';
const ERROR_RED = '#FF5B5B';

function generateRef(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function formatDateStr(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateObj(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

function normaliseHistory(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.responseBody?.content)) return raw.responseBody.content;
  if (Array.isArray(raw?.responseBody)) return raw.responseBody;
  return [];
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Screen = 'wallet' | 'withdraw' | 'success';

interface PaymentDetail {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

interface WithdrawResult {
  amount: number;
  reference: string;
  beneficiary: string;
  date: string;
  status: string;
}


export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const amountInputRef = useRef<TextInput>(null);

  const [screen, setScreen] = useState<Screen>('wallet');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<WithdrawResult | null>(null);

  const numericAmount = parseFloat(amountStr.replace(/[^0-9]/g, '') || '0');
  const hasPaymentDetails = !!(paymentDetail?.accountName && paymentDetail?.accountNumber);
  const canWithdraw = numericAmount > 0 && hasPaymentDetails && numericAmount <= balance;

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const [walletRes, historyRes, paymentRes] = await Promise.all([
        ApiService.getWallet().catch(() => null),
        ApiService.getWalletHistory(0, 50).catch(() => null),
        ApiService.getPaymentDetails().catch(() => null),
      ]);
      const walletBody = walletRes?.responseBody || walletRes || {};
      setBalance(Number(walletBody?.amount ));
      setTransactions(normaliseHistory(historyRes));
      if (paymentRes) {
        const pd = normalizePaymentDetails(paymentRes);
        if (pd.accountNumber) setPaymentDetail(pd);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.responseMessage || err?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = useCallback(() => { setRefreshing(true); load(true); }, [load]);

  const handleWithdrawPress = () => { if (canWithdraw) setConfirmModalVisible(true); };
  const handleProceed = () => { setConfirmModalVisible(false); setWithdrawModalVisible(true); };

  const handleFinalWithdraw = async () => {
    try {
      setWithdrawing(true);
      const res = await ApiService.withdrawFromWallet(numericAmount);
      const body = res?.responseBody || res || {};
      setWithdrawResult({
        amount: numericAmount,
        reference: body.reference || body.transactionRef || body.ref || generateRef(),
        beneficiary: paymentDetail?.accountName || '',
        date: formatDateObj(new Date()),
        status: body.status || 'Completed',
      });
      setWithdrawModalVisible(false);
      setConfirmModalVisible(false);
      setAmountStr('');
      setScreen('success');
      load(true);
    } catch (err: any) {
      setWithdrawModalVisible(false);
      Alert.alert('Withdrawal failed', err?.response?.data?.responseMessage || err?.message || 'Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  // ─── WALLET SCREEN ──────────────────────────────────────────────────────────
  if (screen === 'wallet') {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Wallet</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
        >
          <LinearGradient
            colors={['#3D2DB5', '#4B3A99', '#2A1E7A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.cardCircle1} />
            <View style={styles.cardCircle2} />
            <Text style={styles.balanceLabelText}>Main Balance</Text>
            <Text style={styles.balanceAmount}>{formatNaira(balance)}</Text>
            <TouchableOpacity style={styles.withdrawCardBtn} onPress={() => setScreen('withdraw')}>
              <Text style={styles.withdrawCardBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.txHeader}>
            <Text style={[styles.txTitle, { color: theme.text }]}>Transactions</Text>
            <Text style={[styles.txCount, { color: theme.textMuted }]}>{transactions.length} records</Text>
          </View>

          {transactions.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.surface }]}>
              <Ionicons name="receipt-outline" size={40} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map((tx, index) => {
              const isCredit = String(tx.transactionType ?? '').toUpperCase() === 'CREDIT';
              const amount = Number(tx.amount ?? 0);
              return (
                <View
                  key={String(tx.id ?? index)}
                  style={[styles.txItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={[styles.txIconWrap, { backgroundColor: isCredit ? '#E6F9F1' : '#FFF0F0' }]}>
                    <Ionicons name={isCredit ? 'arrow-down' : 'arrow-up'} size={18} color={isCredit ? SUCCESS_GREEN : ERROR_RED} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txDesc, { color: theme.text }]} numberOfLines={1}>
                      {tx.description || tx.narration || (isCredit ? 'Credit' : 'Debit')}
                    </Text>
                    <Text style={[styles.txDate, { color: theme.textMuted }]}>
                      {formatDateStr(tx.createdAt || tx.createdDate || tx.date)}
                      {tx.reference ? `  ·  ${String(tx.reference).slice(0, 12)}` : ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txAmount, { color: isCredit ? SUCCESS_GREEN : ERROR_RED }]}>
                      {isCredit ? '+' : '-'}{formatNaira(Math.abs(amount))}
                    </Text>
                    <View style={[styles.txBadge, { backgroundColor: isCredit ? 'rgba(34,181,115,0.1)' : 'rgba(255,91,91,0.1)' }]}>
                      <Text style={[styles.txBadgeText, { color: isCredit ? SUCCESS_GREEN : ERROR_RED }]}>
                        {String(tx.status ?? (isCredit ? 'CREDIT' : 'DEBIT')).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  }

  // ─── WITHDRAW SCREEN ────────────────────────────────────────────────────────
  if (screen === 'withdraw') {
    return (
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setScreen('wallet')} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Withdraw Money</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.withdrawScrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* "To" section */}
          <View style={styles.withdrawSection}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>To</Text>
            <View style={[styles.accountBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {hasPaymentDetails ? (
                <>
                  <View style={[styles.accountIconWrap, { backgroundColor: PRIMARY }]}>
                    <Text style={styles.accountIconText}>{getInitials(paymentDetail!.accountName)}</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: theme.text }]}>{paymentDetail!.accountName}</Text>
                    <Text style={[styles.accountSub, { color: theme.textMuted }]}>
                      {paymentDetail!.accountNumber} · {paymentDetail!.bankName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/payment-details' as any)}>
                    <Text style={[styles.editLink, { color: PRIMARY }]}>Edit</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.accountSub, { color: theme.textMuted, flex: 1 }]}>No payment details</Text>
                  <TouchableOpacity onPress={() => router.push('/payment-details' as any)}>
                    <Text style={[styles.editLink, { color: PRIMARY }]}>Add</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Amount section */}
          <View style={styles.withdrawSection}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Amount</Text>
            <Text style={[styles.amountSubtitle, { color: theme.textMuted }]}>
              How much do you want to withdraw?
            </Text>
            {/* Tappable display — tapping opens the real phone keyboard */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => amountInputRef.current?.focus()}
              style={styles.amountDisplayWrap}
            >
              <Text style={[styles.amountDisplay, { color: amountStr ? theme.text : theme.textMuted }]}>
                {amountStr ? formatNaira(numericAmount) : '₦0'}
              </Text>
            </TouchableOpacity>
            {/* Real phone keyboard — hidden visually, drives input */}
            <TextInput
              ref={amountInputRef}
              value={amountStr}
              onChangeText={(t) => setAmountStr(t.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="number-pad"
              style={styles.hiddenInput}
              caretHidden
              maxLength={10}
              autoFocus
            />
            {numericAmount > balance && numericAmount > 0 && (
              <Text style={[styles.errorHint, { color: ERROR_RED }]}>
                Amount exceeds your balance of {formatNaira(balance)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.withdrawBtn, { backgroundColor: canWithdraw ? PRIMARY : theme.border }]}
            onPress={handleWithdrawPress}
            disabled={!canWithdraw}
          >
            <Text style={[styles.withdrawBtnText, { color: canWithdraw ? '#FFFFFF' : theme.textMuted }]}>
              Withdraw
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Confirm Account Modal */}
        <Modal visible={confirmModalVisible} transparent animationType="slide" onRequestClose={() => setConfirmModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setConfirmModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalAmount, { color: theme.text }]}>{formatNaira(numericAmount)}</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                Confirm account details before proceeding with this process
              </Text>
              <View style={[styles.modalAccountRow, { borderColor: theme.border }]}>
                <View style={[styles.avatarCircle, { backgroundColor: PRIMARY }]}>
                  <Text style={styles.avatarInitials}>{getInitials(paymentDetail?.accountName ?? '')}</Text>
                </View>
                <View style={styles.modalAccountInfo}>
                  <Text style={[styles.accountName, { color: theme.text }]}>{paymentDetail?.accountName}</Text>
                  <Text style={[styles.accountSub, { color: theme.textMuted }]}>
                    {paymentDetail?.accountNumber} · {paymentDetail?.bankName}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => { setConfirmModalVisible(false); router.push('/payment-details' as any); }}>
                  <Text style={[styles.editLink, { color: PRIMARY }]}>Change</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.proceedBtn, { backgroundColor: PRIMARY }]} onPress={handleProceed}>
                <Text style={styles.proceedBtnText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Withdraw Cash Modal */}
        <Modal visible={withdrawModalVisible} transparent animationType="slide" onRequestClose={() => setWithdrawModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Withdraw Cash</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                Are you sure you want to withdraw {formatNaira(numericAmount)} from your wallet? This amount will be deducted from your OnPoint wallet.
              </Text>
              <TouchableOpacity
                style={[styles.proceedBtn, { backgroundColor: withdrawing ? theme.border : PRIMARY }]}
                onPress={handleFinalWithdraw}
                disabled={withdrawing}
              >
                {withdrawing
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={styles.proceedBtnText}>Share Receipt</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewDetailsBtn} onPress={handleFinalWithdraw} disabled={withdrawing}>
                <Text style={[styles.viewDetailsText, { color: PRIMARY }]}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  // ─── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerBtn} />
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.successContent, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.successCircle, { backgroundColor: PRIMARY }]}>
          <Ionicons name="checkmark" size={32} color="#FFFFFF" />
        </View>
        <Text style={[styles.successTitle, { color: theme.text }]}>Withdrawal successful</Text>
        <Text style={[styles.successSubtitle, { color: theme.textMuted }]}>
          The money will reflect in your bank after few minutes
        </Text>

        <View style={styles.successAmountRow}>
          <Text style={[styles.successAmount, { color: theme.text }]}>{formatNaira(withdrawResult?.amount ?? 0)}</Text>
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        </View>
        <Text style={[styles.amountLabel, { color: theme.textMuted }]}>Amount</Text>

        <View style={[styles.detailsCard, { backgroundColor: theme.surfaceMuted }]}>
          {[
            { label: 'Beneficiary', value: withdrawResult?.beneficiary ?? paymentDetail?.accountName ?? '' },
            { label: 'Date', value: withdrawResult?.date ?? formatDateObj(new Date()) },
            { label: 'Sender', value: 'BerryStomp' },
            { label: 'Reference', value: withdrawResult?.reference ?? '' },
            { label: 'Status', value: 'Completed', isStatus: true },
          ].map((row, i, arr) => (
            <View
              key={row.label}
              style={[styles.detailRow, { borderBottomColor: theme.border, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0 }]}
            >
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{row.label}</Text>
              <Text style={[styles.detailValue, { color: row.isStatus ? SUCCESS_GREEN : theme.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.shareBtn, { backgroundColor: PRIMARY }]}>
          <Text style={styles.shareBtnText}>Share Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportBtn}>
          <Text style={[styles.reportBtnText, { color: PRIMARY }]}>Report a problem</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  // Balance card
  balanceCard: { borderRadius: 20, padding: 24, marginBottom: 28, alignItems: 'center', overflow: 'hidden' },
  cardCircle1: { position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)' },
  cardCircle2: { position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' },
  balanceLabelText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 6 },
  balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '700', marginBottom: 20 },
  withdrawCardBtn: { backgroundColor: '#FFFFFF', borderRadius: 50, paddingVertical: 12, alignSelf: 'stretch', alignItems: 'center' },
  withdrawCardBtnText: { color: PRIMARY, fontSize: 16, fontWeight: '600' },
  // Transactions
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  txTitle: { fontSize: 16, fontWeight: '600' },
  txCount: { fontSize: 13 },
  emptyBox: { borderRadius: 16, padding: 32, alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 14 },
  txItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 10 },
  txIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo: { flex: 1, marginRight: 8 },
  txDesc: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  txDate: { fontSize: 12 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  txBadge: { marginTop: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  txBadgeText: { fontSize: 10, fontWeight: '600' },
  // Withdraw screen
  withdrawScrollContent: { paddingTop: 8 },
  withdrawSection: { paddingHorizontal: 16, paddingTop: 20, marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  accountBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14 },
  accountIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  accountIconText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  accountSub: { fontSize: 12 },
  editLink: { fontSize: 14, fontWeight: '600' },
  amountSubtitle: { fontSize: 13, marginBottom: 12 },
  amountDisplayWrap: { alignItems: 'center', paddingVertical: 8 },
  amountDisplay: { fontSize: 40, fontWeight: '700' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  errorHint: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  withdrawBtn: { marginHorizontal: 16, marginTop: 24, borderRadius: 50, paddingVertical: 15, alignItems: 'center' },
  withdrawBtnText: { fontSize: 16, fontWeight: '600' },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalClose: { alignSelf: 'flex-end', padding: 4, marginBottom: 8 },
  modalAmount: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalAccountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 24 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarInitials: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  modalAccountInfo: { flex: 1 },
  proceedBtn: { borderRadius: 50, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  proceedBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  viewDetailsBtn: { alignItems: 'center', paddingVertical: 8 },
  viewDetailsText: { fontSize: 15, fontWeight: '600' },
  // Success screen
  successContent: { paddingHorizontal: 20, paddingTop: 32, alignItems: 'center' },
  successCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  successSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  successAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  successAmount: { fontSize: 28, fontWeight: '700' },
  completedBadge: { backgroundColor: '#E6F9F1', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  completedBadgeText: { color: SUCCESS_GREEN, fontSize: 12, fontWeight: '600' },
  amountLabel: { fontSize: 13, marginBottom: 24 },
  detailsCard: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 28 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  shareBtn: { width: '100%', borderRadius: 50, paddingVertical: 15, alignItems: 'center', marginBottom: 14 },
  shareBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  reportBtn: { paddingVertical: 8 },
  reportBtnText: { fontSize: 14, fontWeight: '500' },
});
