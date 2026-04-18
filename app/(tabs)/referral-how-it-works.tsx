import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const STEPS = [
  {
    icon: 'share-social-outline' as const,
    title: 'Share your referral link',
    body: 'Invite your friends to join Berrystamp using your unique referral link. The more friends you invite, the more rewards you earn.',
  },
  {
    icon: 'people-outline' as const,
    title: 'Friends sign up and use Berrystamp',
    body: 'Once your friends create an account and start buying, selling, or printing, they become part of your referral network.',
  },
  {
    icon: 'cash-outline' as const,
    title: 'Earn 10% on every successful referral',
    body: "You'll get 10% of their first transaction credited to your referral wallet each time someone you referred completes a transaction.",
  },
];

export default function ReferralHowItWorksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const bg = isDark ? '#121212' : '#FAFAFA';
  const surface = isDark ? '#1E1E1E' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#1F1B2A';
  const subtext = isDark ? '#A0A0A0' : '#646078';
  const primary = '#4330A2';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#2A2A2A' : '#ECEAF7', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color={text} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 20, fontWeight: '700', color: text }}>How it works</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 15, color: subtext, marginBottom: 28, lineHeight: 22 }}>
          Refer friends to Berrystamp and earn rewards every time they transact.
        </Text>

        {STEPS.map((step, index) => (
          <View
            key={index}
            style={{ flexDirection: 'row', marginBottom: 24, backgroundColor: surface, borderRadius: 16, padding: 16 }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? '#2A2147' : '#EDE8FF', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: primary }}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: text, marginBottom: 6 }}>{step.title}</Text>
              <Text style={{ fontSize: 13, color: subtext, lineHeight: 20 }}>{step.body}</Text>
            </View>
          </View>
        ))}

        <View style={{ backgroundColor: isDark ? '#1A1630' : '#F0EEFF', borderRadius: 16, padding: 20, marginTop: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: primary, textAlign: 'center', marginBottom: 6 }}>10%</Text>
          <Text style={{ fontSize: 14, color: subtext, textAlign: 'center', lineHeight: 20 }}>
            earned on every successful referral transaction
          </Text>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          onPress={() => router.push('/referral')}
          style={{ backgroundColor: primary, borderRadius: 30, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Refer People Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
