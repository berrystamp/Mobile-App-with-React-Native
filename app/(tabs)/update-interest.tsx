import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/lib/theme/appTheme';
import ApiService from '@/services/apiClient';

const FALLBACK_INTERESTS = [
  'Nature', 'Abstract', 'Minimalist', 'Conceptual', 'Sticker', 'Masculine',
  'Kiddies', 'Playful', 'Party', 'Mugs', 'Typographic', 'Fun',
  'Health', 'Accessory', 'Anime', 'Face Mask', 'Living', 'Phone Case',
  'Crypto', 'Wall art', 'Feminine', 'Drawing', 'Tote', 'Clothing',
];

export default function UpdateInterestScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] = useState<string[]>(FALLBACK_INTERESTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [currentInterests, options] = await Promise.all([
          ApiService.getMyInterests().catch(() => []),
          ApiService.getInterestOptions().catch(() => FALLBACK_INTERESTS),
        ]);
        const normalizedCurrent = Array.isArray(currentInterests)
          ? currentInterests.map((item) => String(item).trim()).filter(Boolean)
          : [];
        const normalizedOptions = Array.isArray(options)
          ? options.map((item) => String(item).trim()).filter(Boolean)
          : [];
        setSelected(normalizedCurrent);
        const mergedOptions = Array.from(new Set([...(normalizedOptions.length ? normalizedOptions : FALLBACK_INTERESTS), ...normalizedCurrent]));
        setInterestOptions(mergedOptions);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleInterest = (interest: string) => {
    setSelected((current) => (
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    ));
  };

  const handleUpdate = async () => {
    if (saving) return;
    try {
      setSaving(true);
      await ApiService.updateMyInterests(selected);
      Alert.alert('Success', 'Interests updated successfully.');
    } catch (error: any) {
      Alert.alert('Unable to update interests', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
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
              onPress={handleUpdate}
              style={[styles.cta, { backgroundColor: theme.primary }]}>
              {saving ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={[styles.ctaText, { color: theme.onPrimary }]}>Update Interest</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loaderWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
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
