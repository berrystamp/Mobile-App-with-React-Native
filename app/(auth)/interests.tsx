import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/lib/theme/appTheme';
import ApiService from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';

const FALLBACK_INTERESTS = [
  'Nature', 'Abstract', 'Minimalist', 'Conceptual', 'Sticker', 'Masculine',
  'Kiddies', 'Playful', 'Party', 'Mugs', 'Typographic', 'Fun',
  'Health', 'Accessory', 'Anime', 'Face Mask', 'Living', 'Phone Case',
  'Crypto', 'Wall art', 'Feminine', 'Drawing', 'Tote', 'Clothing',
];

export default function OnboardingInterestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const setHasSelectedInterests = useAuthStore((state) => state.setHasSelectedInterests);
  const setNeedsInterestOnboarding = useAuthStore((state) => state.setNeedsInterestOnboarding);
  const [selected, setSelected] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] = useState<string[]>(FALLBACK_INTERESTS);
  const [saving, setSaving] = useState(false);
  const { show: showAlert, element: alertElement } = useAppAlert();

  useEffect(() => {
    const loadInterestOptions = async () => {
      try {
        const options = await ApiService.getInterestOptions();
        const normalizedOptions = Array.isArray(options)
          ? options.map((item) => String(item).trim()).filter(Boolean)
          : [];
        if (normalizedOptions.length) setInterestOptions(normalizedOptions);
      } catch {
        setInterestOptions(FALLBACK_INTERESTS);
      }
    };

    loadInterestOptions();
  }, []);

  const toggleInterest = (interest: string) => {
    setSelected((current) => (
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    ));
  };

  const handleContinue = async () => {
    if (!selected.length || saving) return;

    try {
      setSaving(true);
      await ApiService.updateMyInterests(selected);
      setHasSelectedInterests(true);
      setNeedsInterestOnboarding(false);
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert({ type: 'error', title: 'Unable to save interests', message: error?.response?.data?.responseMessage || error?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surfaceMuted }]}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>What are your{'\n'}interests</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Choose your interests for a seamless experience on Berrystamp with personalized results.
        </Text>

        <View style={styles.tagWrap}>
          {interestOptions.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                activeOpacity={0.8}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <Text style={[styles.tagText, { color: isSelected ? theme.onPrimary : theme.text }]}>{interest}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!selected.length || saving}
          onPress={handleContinue}
          style={[
            styles.cta,
            { backgroundColor: selected.length ? theme.primary : theme.border },
          ]}>
          {saving ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={[styles.ctaText, { color: theme.onPrimary }]}>Continue</Text>}
        </TouchableOpacity>
      </View>
      {alertElement}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 140,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 28,
    paddingRight: 8,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  tagText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 24,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  cta: {
    alignItems: 'center',
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: 56,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
