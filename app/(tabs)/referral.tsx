import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ReferralHistoryItem, { type ReferralHistoryItemModel } from '@/components/referral/ReferralHistoryItem';
import ReferralMetricCard from '@/components/referral/ReferralMetricCard';
import { formatNaira } from '@/lib/currency';
import ApiService from '@/services/apiClient';

const toList = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.histories)) return value.histories;
  return [];
};

export default function ReferralScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [referralCode, setReferralCode] = useState('');
  const [history, setHistory] = useState<ReferralHistoryItemModel[]>([]);
  const [showRedeemOption, setShowRedeemOption] = useState(false);
  const [showCashSheet, setShowCashSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemMode, setRedeemMode] = useState<'WALLET' | 'CASH'>('WALLET');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const loadData = useCallback(async () => {
    try {
      // Fetch from three separate endpoints as per backend structure
      const [statsResponse, codeResponse, historyResponse] = await Promise.all([
        ApiService.get('api/v1/referral/stats'),
        ApiService.get('api/v1/referral/code'),
        ApiService.get('api/v1/referral'),
      ]);

      // Extract stats from response
      const statsPayload = statsResponse?.data?.responseBody || statsResponse?.data || statsResponse || {};
      setStats(statsPayload);

      // Extract referral code from response
      const codePayload = codeResponse?.data?.responseBody || codeResponse?.data || codeResponse || {};
      const code = codePayload?.referralCode || codePayload?.code || '';
      setReferralCode(code);

      // Extract history list from response
      const historyBody = historyResponse?.data?.responseBody || historyResponse?.data || historyResponse || {};
      const historyList = toList(historyBody);

      // Map history items to match UI structure
      const mappedHistory: ReferralHistoryItemModel[] = historyList.map((item: any, index: number) => {
        const referred = item?.referred || item?.user || {};
        return {
          id: String(item?.id || index + 1),
          name: String(referred?.name || referred?.userName || 'Referral').trim(),
          amount: formatNaira(item?.referrerReward || item?.totalAmount || 0),
          date: String(item?.lastCreatedDate || item?.createdDate || item?.redemption?.lastModifiedDate || '').slice(0, 10),
          status: (item?.status || item?.redemption?.status || 'PENDING').toUpperCase().includes('PENDING') ? 'PENDING' : 'COMPLETED',
          avatar: referred?.profilePic || referred?.profilePicture,
        };
      });

      setHistory(mappedHistory);
    } catch (error: any) {
      Alert.alert('Unable to load referrals', error?.response?.data?.responseMessage || error?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const referralLink = useMemo(
    () => (referralCode ? `https://berrystamp.com/auth/register?ref=${referralCode}` : 'https://berrystamp.com'),
    [referralCode],
  );

  const handleShare = async () => {
    try {
      await Share.share({ message: referralLink, url: referralLink });
    } catch {
      // user may dismiss dialog
    }
  };

  const handleCopy = async () => {
    await Share.share({ message: referralLink, url: referralLink });
  };

  const handleRedeem = async () => {
    setSubmitting(true);
    try {
      let result;
      const redeemAmount = Number(stats?.totalReward || stats?.rewardBalance || 0);

      if (redeemMode === 'WALLET') {
        // POST to api/v1/referral/redeem/wallet
        result = await ApiService.post('api/v1/referral/redeem/wallet', {
          method: 'WALLET',
          beneficiary: {},
        });
      } else {
        // POST to api/v1/referral/redeem/bank
        result = await ApiService.post('api/v1/referral/redeem/bank', {
          amount: redeemAmount,
          bankCode: bankCode,
          accountNumber: accountNumber,
          bankName: bankName,
          accountName: accountName,
        });
      }

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
      <View className="flex-1 items-center justify-center bg-[#F7F7FB]">
        <ActivityIndicator size="large" color="#4732A1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F7FB]">
      <View className="flex-row items-center px-4 pb-4 pt-14">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-[#ECEAF7]">
          <Ionicons name="arrow-back" size={22} color="#2B2833" />
        </TouchableOpacity>
        <Text className="ml-3 text-xl font-semibold text-[#1F1B2A]">Referral</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="rounded-3xl bg-[#4330A2] p-4">
          <Text className="text-center text-sm text-white/75">Reward balance</Text>
          <Text className="mt-1 text-center text-5xl font-semibold text-white">
            {formatNaira(stats?.totalReward || stats?.rewardBalance || 0)}
          </Text>
          <Text className="mt-1 text-center text-xs text-white/80">
            Last updated: {String(stats?.lastModifiedDate ? new Date(stats.lastModifiedDate).toLocaleDateString() : new Date().toLocaleDateString())}
          </Text>

          <View className="mt-4 flex-row">
            <TouchableOpacity onPress={() => setShowRedeemOption(true)} className="mr-2 flex-1 rounded-full border border-white/70 px-3 py-3">
              <Text className="text-center text-sm font-medium text-white">Redeem earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} className="ml-2 flex-1 rounded-full bg-white px-3 py-3">
              <Text className="text-center text-sm font-medium text-[#4330A2]">Refer people</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/referral-how-it-works')} className="mt-3 self-center">
            <Text className="text-sm text-white/80">See how referrals work</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 flex-row gap-2">
          <ReferralMetricCard label="Total referrals" value={String(stats?.totalCount || 0)} />
          <ReferralMetricCard label="Pending rewards" value={formatNaira(stats?.pendingReward || 0)} />
          <ReferralMetricCard label="Total earnings" value={formatNaira(stats?.completedReward || stats?.totalEarnings || 0)} />
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-[#302B3A]">Referral History</Text>
          <TouchableOpacity>
            <Text className="text-base text-[#6F6982]">View all</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3 rounded-2xl bg-white p-4">
          {history.length ? history.map((item) => <ReferralHistoryItem key={item.id} item={item} />) : <Text className="text-sm text-[#7E7A8C]">No referral history yet.</Text>}
        </View>
      </ScrollView>

      <Modal transparent visible={showRedeemOption} animationType="slide" onRequestClose={() => setShowRedeemOption(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-[26px] bg-white px-4 pb-8 pt-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-semibold text-[#2F2A39]">Select option</Text>
              <TouchableOpacity onPress={() => setShowRedeemOption(false)}><Ionicons name="close" size={24} color="#88839A" /></TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setRedeemMode('CASH')} className="mb-3 flex-row items-center rounded-2xl border border-[#E8E5F3] p-4">
              <Text className="flex-1 text-base text-[#2B2833]">Redeem as cash</Text>
              <Ionicons name={redeemMode === 'CASH' ? 'radio-button-on' : 'radio-button-off'} size={20} color="#4732A1" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setRedeemMode('WALLET')} className="flex-row items-center rounded-2xl border border-[#E8E5F3] p-4">
              <Text className="flex-1 text-base text-[#2B2833]">Redeem to your wallet</Text>
              <Ionicons name={redeemMode === 'WALLET' ? 'radio-button-on' : 'radio-button-off'} size={20} color="#4732A1" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => (redeemMode === 'CASH' ? setShowCashSheet(true) : handleRedeem())} className="mt-6 rounded-full bg-[#4330A2] py-4">
              <Text className="text-center text-lg font-semibold text-white">Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showCashSheet} animationType="slide" onRequestClose={() => setShowCashSheet(false)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-[26px] bg-white px-4 pb-8 pt-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-semibold text-[#2F2A39]">Account information</Text>
              <TouchableOpacity onPress={() => setShowCashSheet(false)}><Ionicons name="close" size={24} color="#88839A" /></TouchableOpacity>
            </View>

            <Text className="mb-3 text-center text-sm text-[#6F6982]">
              Input correct details of the beneficiary account
            </Text>

            <TextInput value={bankName} onChangeText={setBankName} placeholder="Bank name" className="mb-3 rounded-xl border border-[#E3E0EE] px-4 py-3 text-base" />
            <TextInput value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" maxLength={10} placeholder="Account number" className="mb-3 rounded-xl border border-[#E3E0EE] px-4 py-3 text-base" />
            
            {accountName ? (
              <Text className="mb-3 text-base text-[#2B2833]">{accountName}</Text>
            ) : null}

            <TouchableOpacity 
              disabled={submitting || !bankName || !accountNumber || accountNumber.length !== 10} 
              onPress={handleRedeem} 
              className="mt-2 rounded-full bg-[#4330A2] py-4 disabled:opacity-50"
            >
              <Text className="text-center text-lg font-semibold text-white">
                {submitting ? 'Processing...' : `Withdraw ${formatNaira(stats?.totalReward || 0)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showSuccess} animationType="fade" onRequestClose={() => setShowSuccess(false)}>
        <View className="flex-1 items-center justify-center bg-black/35 px-8">
          <View className="w-full rounded-3xl bg-white p-6">
            <View className="mx-auto h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FF]"><Ionicons name="checkmark" size={34} color="#4330A2" /></View>
            <Text className="mt-5 text-center text-3xl font-semibold text-[#2B2833]">Congratulations!</Text>
            <Text className="mt-2 text-center text-base text-[#6F6982]">Your referral reward has been redeemed successfully.</Text>
            <TouchableOpacity onPress={() => setShowSuccess(false)} className="mt-6 rounded-full bg-[#4330A2] py-4">
              <Text className="text-center text-lg font-semibold text-white">Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="border-t border-[#ECEAF4] bg-white px-4 py-3">
        <View className="flex-row items-center rounded-xl border border-[#E2DFEC] px-3 py-2">
          <Text className="flex-1 text-sm text-[#4C4859]" numberOfLines={1}>{referralLink}</Text>
          <TouchableOpacity onPress={handleCopy} className="rounded-full bg-[#4330A2] px-4 py-2"><Text className="text-sm font-semibold text-white">Copy</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
