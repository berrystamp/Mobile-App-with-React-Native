import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState, useMemo } from 'react';
import {
  ActivityIndicator, RefreshControl, ScrollView,
  StyleSheet, Text, TouchableOpacity, View, useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGrad, Stop, Rect } from 'react-native-svg';

import { formatNaira } from '@/lib/currency';
import ApiService from '@/services/apiClient';

type TxType = 'CREDIT' | 'DEBIT';
type FilterTab = 'All' | TxType;

const FILTERS: FilterTab[] = ['All', 'CREDIT', 'DEBIT'];

function normaliseHistory(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.responseBody?.content)) return raw.responseBody.content;
  if (Array.isArray(raw?.responseBody)) return raw.responseBody;
  return [];
}

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WalletScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  const bg = isDark ? '#0E0E16' : '#F4F3FA';
  const surface = isDark ? '#1A1830' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#1A1A2E';
  const subtext = isDark ? '#9B96BA' : '#7B7696';
  const border = isDark ? '#2A2848' : '#EBEBF5';
  const primary = '#4B3A99';

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const [walletRes, historyRes] = await Promise.all([
        ApiService.getWallet().catch(() => null),
        ApiService.getWalletHistory(0, 50).catch(() => null),
      ]);
      setWallet(walletRes?.responseBody || walletRes || null);
      setHistory(normaliseHistory(historyRes));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const balance = Number(wallet?.amount ?? 0);
  const ledgerBalance = Number(wallet?.ledgerBalance ?? wallet?.availableBalance ?? balance);

  const totalCredits = useMemo(
    () => history.filter((i) => String(i.transactionType).toUpperCase() === 'CREDIT')
      .reduce((s, i) => s + Number(i.amount || 0), 0),
    [history],
  );
  const totalDebits = useMemo(
    () => history.filter((i) => String(i.transactionType).toUpperCase() === 'DEBIT')
      .reduce((s, i) => s + Math.abs(Number(i.amount || 0)), 0),
    [history],
  );

  const filtered = useMemo(() =>
    activeFilter === 'All'
      ? history
      : history.filter((i) => String(i.transactionType).toUpperCase() === activeFilter),
    [history, activeFilter],
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#1A1830' : '#EBEBF5', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color={text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: text }}>My Wallet</Text>
        <TouchableOpacity
          onPress={() => router.push('/payment-details')}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#1A1830' : '#EBEBF5', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="card-outline" size={20} color={text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />}
      >
        {/* Balance card */}
        <View style={[styles.card, { marginBottom: 14, overflow: 'hidden' }]}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <SvgGrad id="walletGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#3D2DB5" stopOpacity="1" />
                <Stop offset="55%" stopColor="#4B3A99" stopOpacity="1" />
                <Stop offset="100%" stopColor="#2A1E7A" stopOpacity="1" />
              </SvgGrad>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#walletGrad)" rx={20} />
          </Svg>

          {/* Subtle circle decorations */}
          <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <View style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' }} />

          <View style={{ padding: 24, zIndex: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>Available Balance</Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5, marginBottom: 4 }}>
              {showBalance ? formatNaira(balance) : '₦ ••••••'}
            </Text>

            {ledgerBalance !== balance && (
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
                Ledger balance: {showBalance ? formatNaira(ledgerBalance) : '₦ ••••'}
              </Text>
            )}

            {/* Stats row */}
            <View style={{ flexDirection: 'row', marginTop: 20, gap: 1 }}>
              <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)', paddingRight: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(34,181,115,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-down" size={10} color="#22B573" />
                  </View>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Total Credits</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#22B573' }}>
                  {showBalance ? formatNaira(totalCredits) : '₦ ••••'}
                </Text>
              </View>
              <View style={{ flex: 1, paddingLeft: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,91,91,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-up" size={10} color="#FF5B5B" />
                  </View>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Total Debits</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FF5B5B' }}>
                  {showBalance ? formatNaira(totalDebits) : '₦ ••••'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/payment-details')}
            style={{ flex: 1, backgroundColor: primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
          >
            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Bank Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/referral')}
            style={{ flex: 1, backgroundColor: surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: border }}
          >
            <Ionicons name="gift-outline" size={18} color={primary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: primary }}>Referrals</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: text }}>Transactions</Text>
          <Text style={{ fontSize: 13, color: subtext }}>{filtered.length} records</Text>
        </View>

        {/* Filter tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: activeFilter === f ? primary : surface,
                borderWidth: activeFilter === f ? 0 : 1, borderColor: border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: activeFilter === f ? '#FFFFFF' : subtext }}>
                {f === 'CREDIT' ? 'Credits' : f === 'DEBIT' ? 'Debits' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction list */}
        {filtered.length === 0 ? (
          <View style={{ backgroundColor: surface, borderRadius: 16, padding: 32, alignItems: 'center' }}>
            <Ionicons name="receipt-outline" size={44} color={subtext} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: text, marginTop: 12 }}>No transactions yet</Text>
            <Text style={{ fontSize: 13, color: subtext, marginTop: 6, textAlign: 'center' }}>
              Your transaction history will appear here.
            </Text>
          </View>
        ) : (
          <View style={{ backgroundColor: surface, borderRadius: 16, overflow: 'hidden' }}>
            {filtered.map((item, index) => {
              const isCredit = String(item.type).toUpperCase() === 'CREDIT';
              const amount = Number(item.amount || 0);
              const isLast = index === filtered.length - 1;
              return (
                <View
                  key={String(item.id || index)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: isLast ? 0 : 1, borderBottomColor: border,
                  }}
                >
                  {/* Icon */}
                  <View style={{
                    width: 42, height: 42, borderRadius: 12, marginRight: 12,
                    backgroundColor: isCredit ? 'rgba(34,181,115,0.12)' : 'rgba(255,91,91,0.12)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons
                      name={isCredit ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                      size={22}
                      color={isCredit ? '#22B573' : '#FF5B5B'}
                    />
                  </View>

                  {/* Description */}
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: text }} numberOfLines={1}>
                      {item.description || item.narration || (isCredit ? 'Credit' : 'Debit')}
                    </Text>
                    <Text style={{ fontSize: 11, color: subtext, marginTop: 2 }}>
                      {formatDate(item.createdAt || item.createdDate || item.date)}
                      {item.reference ? '  ·  ' + String(item.reference).slice(0, 16) : ''}
                    </Text>
                  </View>

                  {/* Amount */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: isCredit ? '#22B573' : '#FF5B5B' }}>
                      {isCredit ? '+' : '-'}{formatNaira(Math.abs(amount))}
                    </Text>
                    <View style={{
                      marginTop: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
                      backgroundColor: isCredit ? 'rgba(34,181,115,0.1)' : 'rgba(255,91,91,0.1)',
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: isCredit ? '#22B573' : '#FF5B5B' }}>
                        {isCredit ? 'CREDIT' : 'DEBIT'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    shadowColor: '#3D2DB5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
});
