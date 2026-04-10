import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { formatNaira } from '@/lib/currency';
import { decodeSponsoredDraft, sponsoredOrderBreakdown } from '@/lib/sponsoredPayment';

export default function SponsoredPaymentStep11() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const draft = useMemo(() => decodeSponsoredDraft(flow), [flow]);
  const totals = useMemo(() => sponsoredOrderBreakdown(draft.quantity), [draft.quantity]);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paid, setPaid] = useState(false);

  const valid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3;

  const onCardNumber = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, 16);
    setCardNumber(clean.replace(/(\d{4})/g, '$1 ').trim());
  };

  const onExpiry = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, 4);
    setExpiry(clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean);
  };

  if (paid) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F6FB] px-5 dark:bg-[#121212]">
        <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-[#4A34A5]">
          <Ionicons name="checkmark" size={42} color="#4A34A5" />
        </View>
        <Text className="mt-6 text-2xl font-bold text-[#2D273A] dark:text-white">Payment successful!</Text>
        <Text className="mt-2 text-center text-sm text-[#7C768D] dark:text-[#A5A3AF]">Thanks for placing an order. Sponsored payment has been recorded.</Text>

        <TouchableOpacity onPress={() => router.replace('/payments')} className="mt-8 w-full items-center rounded-full bg-[#4A34A5] py-4">
          <Text className="text-base font-semibold text-white">Go to Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/')} className="mt-3 w-full items-center rounded-full border border-[#CFC9DE] py-4">
          <Text className="text-base font-semibold text-[#3A3448] dark:text-white">Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F6FB] px-5 pt-12 dark:bg-[#121212]">
      <View className="mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1E1E1E]">
          <Ionicons name="arrow-back" size={20} color="#2D273A" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-[#2D273A] dark:text-white">Sponsored Payment (11/11)</Text>
        <View className="w-10" />
      </View>

      <Text className="text-2xl font-bold text-[#2D273A] dark:text-white">Enter card details to pay</Text>
      <Text className="mt-2 text-sm text-[#7C768D] dark:text-[#A5A3AF]">Amount: {formatNaira(totals.total)}</Text>

      <View className="mt-6 rounded-3xl bg-white p-4 dark:bg-[#1E1E1E]">
        <Text className="mb-2 text-xs font-semibold text-[#8A8499] dark:text-[#A5A3AF]">CARD NUMBER</Text>
        <TextInput
          value={cardNumber}
          onChangeText={onCardNumber}
          keyboardType="numeric"
          maxLength={19}
          placeholder="0000 0000 0000 0000"
          placeholderTextColor="#A29CB1"
          className="mb-4 rounded-xl border border-[#DDD7EA] px-4 py-3 text-sm text-[#2D273A] dark:border-[#33333A] dark:text-white"
        />

        <View className="flex-row">
          <View className="mr-2 flex-1">
            <Text className="mb-2 text-xs font-semibold text-[#8A8499] dark:text-[#A5A3AF]">EXPIRY</Text>
            <TextInput
              value={expiry}
              onChangeText={onExpiry}
              keyboardType="numeric"
              maxLength={5}
              placeholder="MM/YY"
              placeholderTextColor="#A29CB1"
              className="rounded-xl border border-[#DDD7EA] px-4 py-3 text-sm text-[#2D273A] dark:border-[#33333A] dark:text-white"
            />
          </View>
          <View className="ml-2 flex-1">
            <Text className="mb-2 text-xs font-semibold text-[#8A8499] dark:text-[#A5A3AF]">CVV</Text>
            <TextInput
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              placeholder="123"
              placeholderTextColor="#A29CB1"
              className="rounded-xl border border-[#DDD7EA] px-4 py-3 text-sm text-[#2D273A] dark:border-[#33333A] dark:text-white"
            />
          </View>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECE8F4] bg-[#F7F6FB] px-5 pb-8 pt-4 dark:border-[#232327] dark:bg-[#121212]">
        <TouchableOpacity disabled={!valid} onPress={() => setPaid(true)} className={`items-center rounded-full py-4 ${valid ? 'bg-[#4A34A5]' : 'bg-[#CBC3E6]'}`}>
          <Text className="text-base font-semibold text-white">Pay {formatNaira(totals.total)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

