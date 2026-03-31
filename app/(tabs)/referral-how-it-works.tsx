import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ReferralHowItWorksScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pb-4 pt-14">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-xl bg-[#ECEAF7]">
          <Ionicons name="arrow-back" size={22} color="#2B2833" />
        </TouchableOpacity>
        <Text className="ml-3 text-2xl font-semibold text-[#1F1B2A]">How does it work?</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="mb-5 text-lg text-[#444054]">This is how Berrystamp referral works</Text>

        <Text className="mb-2 text-2xl font-semibold text-[#242030]">Share your referral link with your friends</Text>
        <Text className="mb-5 text-lg leading-8 text-[#646078]">
          Invite your friends to join Berrystamp using your unique referral link. The more friends you invite, the more rewards you earn.
        </Text>

        <Text className="mb-2 text-2xl font-semibold text-[#242030]">Your friends sign up and start using Berrystamp</Text>
        <Text className="mb-5 text-lg leading-8 text-[#646078]">
          Once your friends create an account and start buying, selling, or printing through Berrystamp, they become part of your referral network.
        </Text>

        <Text className="mb-2 text-2xl font-semibold text-[#242030]">Earn 10% for every successful referral</Text>
        <Text className="text-lg leading-8 text-[#646078]">
          You’ll get 10% of their first transaction credited to your referral wallet each time someone you referred successfully completes a transaction on Berrystamp.
        </Text>
      </ScrollView>

      <View className="bg-white px-4 pb-8 pt-2">
        <TouchableOpacity onPress={() => router.push('/referral')} className="rounded-full bg-[#4330A2] py-4">
          <Text className="text-center text-xl font-semibold text-white">Refer People</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
