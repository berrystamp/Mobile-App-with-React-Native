import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, RefreshControl, ScrollView,
  Share, Text, TextInput, TouchableOpacity, View, useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatNaira } from '@/lib/currency';
import ApiService from '@/services/apiClient';

type HistoryItem = {
  id: string;
  name: string;
  amount: string;
  date: string;
  status: 'PENDING' | 'COMPLETED';
};

const toList = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.histories)) return value.histories;
  return [];
};

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [referralCode, setReferralCode] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showRedeemOption, setShowRedeemOption] = useState(false);
  const [showCashSheet, setShowCashSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemMode, setRedeemMode] = useState<'WALLET' | 'CASH'>('WALLET');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const theme = {
    bg: isDark ? '#121212' : '#F7F7FB',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#2F2A39',
    subtext: isDark ? '#A0A0A0' : '#6F6982',
    border: isDark ? '#2A2A2A' : '#E8E5F3',
    primary: '#4330A2',
    input: isDark ? '#2A2A2A' : '#F5F3FA',
  };

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      // Use proper ApiService methods (not ApiService.get which doesn't exist)
      const [summaryResponse, historyResponse] = await Promise.all([
        ApiService.getReferralSummary().catch(() => ({})),
        ApiService.getReferralHistory(0, 20).catch(() => ({ responseBody: { content: [] } })),
      ]);

      const statsPayload =
        summaryResponse?.responseBody || summaryResponse || {};
      setStats(statsPayload);

      const code =
        statsPayload?.referralCode || statsPayload?.code || '';
      setReferralCode(code);

      const historyBody =
        historyResponse?.responseBody || historyResponse || {};
      const historyList = toList(historyBody);

      const mappedHistory: HistoryItem[] = historyList.map((item: any, index: number) => {
        const referred = item?.referred || item?.user || {};
        return {
          id: String(item?.id || index + 1),
          name: String(referred?.name || referred?.userName || referred?.firstName || 'Referral').trim(),
          amount: formatNaira(item?.referrerReward || item?.totalAmount || 0),
          date: String(item?.lastCreatedDate || item?.createdDate || '').slice(0, 10),
          status: String(item?.status || 'PENDING').toUpperCase().includes('PENDING') ? 'PENDING' : 'COMPLETED',
        };
      });

      setHistory(mappedHistory);
    } catch (error: any) {
      Alert.alert('Unable to load referrals', error?.response?.data?.responseMessage || error?.message || 'Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const referralLink = useMemo(
    () => referralCode ? 'https://berrystamp.com/auth/register?ref=' + referralCode : 'https://berrystamp.com',
    [referralCode],
  );

  const handleShare = async () => {
    try {
      await Share.share({ message: 'Join Berrystamp and get amazing designs! Use my referral link: ' + referralLink, url: referralLink });
    } catch { /* dismissed */ }
  };

  const handleRedeem = async () => {
    setSubmitting(true);
    try {
      const payload =
        redeemMode === 'WALLET'
          ? { mode: 'WALLET' as const }
          : { mode: 'CASH' as const, bankName, accountNumber, accountName };

      const result = await ApiService.redeemReferralReward(payload);
      if (result?.requestSuccessful === false) {
        throw new Error(result?.responseMessage || 'Unable to redeem reward.');
      }
      setShowCashSheet(false);
      setShowRedeemOption(false);
      setShowSuccess(true);
      await loadData();
    } catch (error: any) {
      Alert.alert('Redeem failed', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const totalReward = Number(stats?.totalReward || stats?.rewardBalance || stats?.balance || 0);
  const pendingReward = Number(stats?.pendingReward || 0);
  const totalCount = Number(stats?.totalCount || stats?.totalReferrals || 0);
  const completedReward = Number(stats?.completedReward || stats?.totalEarnings || 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#2A2A2A' : '#ECEAF7', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: '700', color: theme.text, flex: 1 }}>Referral</Text>
        <TouchableOpacity onPress={() => router.push('/referral-how-it-works')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isDark ? '#2A2A2A' : '#ECEAF7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
          <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>How it works</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Balance Card */}
        <View style={{ backgroundColor: theme.primary, borderRadius: 24, padding: 20, marginBottom: 14 }}>
          <Text style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Reward balance</Text>
          <Text style={{ textAlign: 'center', fontSize: 40, fontWeight: '700', color: '#FFFFFF', marginTop: 4 }}>
            {formatNaira(totalReward)}
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
            {stats?.lastModifiedDate ? new Date(stats.lastModifiedDate).toLocaleDateString() : 'Last updated: today'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity onPress={() => setShowRedeemOption(true)} style={{ flex: 1, borderRadius: 30, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>Redeem earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={{ flex: 1, borderRadius: 30, backgroundColor: '#FFFFFF', paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.primary }}>Refer people</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Total referrals', value: String(totalCount) },
            { label: 'Pending', value: formatNaira(pendingReward) },
            { label: 'Total earned', value: formatNaira(completedReward) },
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: theme.surface, borderRadius: 14, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 3, textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Referral History */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>Referral History</Text>
        </View>
        <View style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 16 }}>
          {history.length === 0 ? (
            <Text style={{ fontSize: 13, color: theme.subtext, textAlign: 'center', paddingVertical: 12 }}>No referral history yet.</Text>
          ) : (
            history.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? '#2A2A2A' : '#F0EEFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="person-outline" size={18} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>{item.date}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: item.status === 'COMPLETED' ? '#22B573' : '#F59E0B', textAlign: 'right' }}>{item.amount}</Text>
                  <View style={{ backgroundColor: item.status === 'COMPLETED' ? '#E8F8EF' : '#FFF7E6', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: item.status === 'COMPLETED' ? '#22B573' : '#F59E0B' }}>{item.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Referral link footer */}
      <View style={{ backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: insets.bottom + 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.input, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
          <Text style={{ flex: 1, fontSize: 12, color: theme.subtext }} numberOfLines={1}>{referralLink}</Text>
          <TouchableOpacity onPress={handleShare} style={{ backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Redeem option modal */}
      <Modal transparent visible={showRedeemOption} animationType="slide" onRequestClose={() => setShowRedeemOption(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Redeem Options</Text>
              <TouchableOpacity onPress={() => setShowRedeemOption(false)}>
                <Ionicons name="close" size={22} color={theme.subtext} />
              </TouchableOpacity>
            </View>
            {(['WALLET', 'CASH'] as const).map((mode) => (
              <TouchableOpacity key={mode} onPress={() => setRedeemMode(mode)} style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: redeemMode === mode ? theme.primary : theme.border, padding: 14, marginBottom: 10 }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: redeemMode === mode ? theme.primary : theme.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  {redeemMode === mode && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />}
                </View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>{mode === 'WALLET' ? 'Redeem to my wallet' : 'Redeem as cash (bank transfer)'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => { if (redeemMode === 'CASH') { setShowRedeemOption(false); setShowCashSheet(true); } else { handleRedeem(); } }} style={{ backgroundColor: theme.primary, borderRadius: 30, paddingVertical: 14, alignItems: 'center', marginTop: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>{submitting ? 'Processing...' : 'Proceed'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cash sheet modal */}
      <Modal transparent visible={showCashSheet} animationType="slide" onRequestClose={() => setShowCashSheet(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Bank details</Text>
              <TouchableOpacity onPress={() => setShowCashSheet(false)}><Ionicons name="close" size={22} color={theme.subtext} /></TouchableOpacity>
            </View>
            {[
              { label: 'Bank name', value: bankName, setter: setBankName, keyboard: 'default' as const },
              { label: 'Account number', value: accountNumber, setter: setAccountNumber, keyboard: 'number-pad' as const, maxLength: 10 },
            ].map((field) => (
              <View key={field.label} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: theme.subtext, marginBottom: 5 }}>{field.label}</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.keyboard}
                  maxLength={field.maxLength}
                  placeholder={'Enter ' + field.label.toLowerCase()}
                  placeholderTextColor={theme.subtext}
                  style={{ backgroundColor: theme.input, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: theme.text }}
                />
              </View>
            ))}
            {accountName ? <Text style={{ fontSize: 13, color: '#22B573', marginBottom: 12, fontWeight: '600' }}>{accountName}</Text> : null}
            <TouchableOpacity
              disabled={submitting || !bankName || accountNumber.length !== 10}
              onPress={handleRedeem}
              style={{ backgroundColor: !bankName || accountNumber.length !== 10 ? '#C5C1DA' : theme.primary, borderRadius: 30, paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                {submitting ? 'Processing...' : 'Withdraw ' + formatNaira(totalReward)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success modal */}
      <Modal transparent visible={showSuccess} animationType="fade" onRequestClose={() => setShowSuccess(false)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 32 }}>
          <View style={{ backgroundColor: theme.surface, borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#EDE9FF', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark-circle" size={36} color={theme.primary} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: theme.text, marginTop: 14, textAlign: 'center' }}>Congratulations!</Text>
            <Text style={{ fontSize: 14, color: theme.subtext, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
              Your referral reward has been redeemed successfully.
            </Text>
            <TouchableOpacity onPress={() => setShowSuccess(false)} style={{ backgroundColor: theme.primary, borderRadius: 30, paddingVertical: 14, paddingHorizontal: 32, marginTop: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Great!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
