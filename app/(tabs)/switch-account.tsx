import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';

export default function SwitchAccountScreen() {
  const router = useRouter();
  const { role } = useAuthStore();
  const current = toProfileType(role);
  const [enabled, setEnabled] = useState(current !== 'CUSTOMER');
  const [accountType, setAccountType] = useState<'DESIGNER' | 'PRINTER'>('DESIGNER');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtitle = useMemo(() => (accountType === 'DESIGNER' ? 'Sell your skills and earn big as a designer.' : 'Offer production services and earn as a printer.'), [accountType]);

  const createAccount = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter account display name.');
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.updateMyProfile({
        profileType: accountType,
        name: name.trim(),
        bio: bio.trim(),
      });
      Alert.alert('Success', `${accountType.toLowerCase()} account updated.`);
      router.back();
    } catch (error: any) {
      Alert.alert('Unable to add account', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F8FB] pt-12">
      <View className="flex-row items-center px-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-xl bg-[#ECEAF7]">
          <Ionicons name="arrow-back" size={20} color="#2B2833" />
        </TouchableOpacity>
        <Text className="ml-4 text-3xl font-semibold text-[#2A2636]">Switch Account</Text>
      </View>

      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="mb-6 rounded-2xl border border-[#E7E2F5] bg-white p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-medium text-[#2E2939]">Switch account mode</Text>
            <Switch value={enabled} onValueChange={setEnabled} />
          </View>
          <Text className="mt-2 text-sm text-[#7A7687]">Enable to add another seller account.</Text>
        </View>

        {enabled ? (
          <View className="rounded-2xl border border-[#E7E2F5] bg-white p-4">
            <Text className="text-2xl font-semibold text-[#2E2939]">Welcome To Berrystamp For Sellers</Text>
            <Text className="mt-2 text-sm text-[#7A7687]">{subtitle}</Text>

            <View className="mt-4 flex-row">
              <TouchableOpacity onPress={() => setAccountType('DESIGNER')} className={`mr-2 flex-1 rounded-xl border px-3 py-3 ${accountType === 'DESIGNER' ? 'border-[#4833A3] bg-[#F1EDFF]' : 'border-[#E8E5F2]'}`}>
                <Text className={`text-center font-medium ${accountType === 'DESIGNER' ? 'text-[#4833A3]' : 'text-[#6D6978]'}`}>Designer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAccountType('PRINTER')} className={`ml-2 flex-1 rounded-xl border px-3 py-3 ${accountType === 'PRINTER' ? 'border-[#4833A3] bg-[#F1EDFF]' : 'border-[#E8E5F2]'}`}>
                <Text className={`text-center font-medium ${accountType === 'PRINTER' ? 'text-[#4833A3]' : 'text-[#6D6978]'}`}>Printer</Text>
              </TouchableOpacity>
            </View>

            <TextInput value={name} onChangeText={setName} placeholder="Account display name" className="mt-4 rounded-xl border border-[#E3E0EE] px-4 py-3" />
            <TextInput value={bio} onChangeText={setBio} placeholder="Short bio" multiline className="mt-3 h-24 rounded-xl border border-[#E3E0EE] px-4 py-3" />

            <TouchableOpacity disabled={submitting} onPress={createAccount} className="mt-5 rounded-full bg-[#4833A3] py-4 disabled:opacity-60">
              <Text className="text-center text-base font-semibold text-white">{submitting ? 'Saving...' : 'Add Account'}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
