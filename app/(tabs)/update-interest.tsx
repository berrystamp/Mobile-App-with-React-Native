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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme/appTheme';
import ApiService from '@/services/apiClient';

const MAX_INTERESTS = 10;

const FALLBACK_INTERESTS = [
  'Nature', 'Abstract', 'Minimalist', 'Conceptual', 'Sticker', 'Masculine',
  'Kiddies', 'Playful', 'Party', 'Mugs', 'Typographic', 'Fun',
  'Health', 'Accessory', 'Anime', 'Face Mask', 'Living', 'Phone Case',
  'Crypto', 'Wall art', 'Feminine', 'Drawing', 'Tote', 'Clothing',
];

// Extracts a string label from a string OR object shape.
function extractInterestLabel(item: any): string {
  if (item == null) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'number') return String(item);
  if (typeof item === 'object') {
    const candidate =
      item.name ??
      item.interest ??
      item.interestName ??
      item.label ??
      item.title ??
      item.value ??
      '';
    return String(candidate).trim();
  }
  return '';
}

export default function UpdateInterestScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] = useState<string[]>(FALLBACK_INTERESTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [currentInterests, options] = await Promise.all([
          ApiService.getMyInterests().catch((e) => {
            console.warn('[Interests] getMyInterests failed:', e);
            return [] as string[];
          }),
          ApiService.getInterestOptions().catch(() => FALLBACK_INTERESTS),
        ]);

        // currentInterests is now guaranteed to be string[] from the service.
        const normalizedCurrent: string[] = (Array.isArray(currentInterests)
          ? currentInterests
          : []
        )
          .map(extractInterestLabel)
          .filter(Boolean);

        const normalizedOptions: string[] = (Array.isArray(options)
          ? options
          : []
        )
          .map(extractInterestLabel)
          .filter(Boolean);

        const baseOptions =
          normalizedOptions.length ? normalizedOptions : FALLBACK_INTERESTS;

        // Case-insensitive canonicalization: if API returns 'nature' but
        // options list has 'Nature', store 'Nature' so chip highlights.
        const optionLookup = new Map<string, string>();
        baseOptions.forEach((opt) => optionLookup.set(opt.toLowerCase(), opt));

        const canonicalSelected: string[] = [];
        for (const item of normalizedCurrent) {
          const canonical = optionLookup.get(item.toLowerCase()) ?? item;
          if (!canonicalSelected.some((s) => s.toLowerCase() === canonical.toLowerCase())) {
            canonicalSelected.push(canonical);
          }
        }

        setSelected(canonicalSelected.slice(0, MAX_INTERESTS));

        // Merge: options + any selected interests not in options
        const mergedOptions = Array.from(
          new Map(
            [...baseOptions, ...canonicalSelected].map((v) => [v.toLowerCase(), v])
          ).values()
        );
        setInterestOptions(mergedOptions);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleInterest = (interest: string) => {
    setSelected((current) => {
      const lower = interest.toLowerCase();
      const exists = current.some((i) => i.toLowerCase() === lower);
      if (exists) {
        return current.filter((item) => item.toLowerCase() !== lower);
      }
      if (current.length >= MAX_INTERESTS) {
        Alert.alert(
          'Maximum reached',
          'You can select up to ' + MAX_INTERESTS + ' interests.'
        );
        return current;
      }
      return [...current, interest];
    });
  };

  const handleUpdate = async () => {
    if (saving) return;
    try {
      setSaving(true);
      await ApiService.updateMyInterests(selected);
      Alert.alert('Success', 'Interests updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Unable to update interests',
        error?.response?.data?.responseMessage ||
          error?.message ||
          'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedLookup = new Set(selected.map((s) => s.toLowerCase()));

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Update Interests</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              What are your{'\n'}interests?
            </Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Choose up to {MAX_INTERESTS} interests for personalized results.
            </Text>

            <View
              style={[
                styles.counter,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={selected.length >= MAX_INTERESTS ? '#EF4444' : theme.primary}
              />
              <Text
                style={[
                  styles.counterText,
                  {
                    color:
                      selected.length >= MAX_INTERESTS ? '#EF4444' : theme.primary,
                  },
                ]}
              >
                {selected.length}/{MAX_INTERESTS} selected
              </Text>
            </View>

            <View style={styles.tagWrap}>
              {interestOptions.map((interest) => {
                const isSelected = selectedLookup.has(interest.toLowerCase());
                const isDisabled = !isSelected && selected.length >= MAX_INTERESTS;
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
                        opacity: isDisabled ? 0.45 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.background,
                paddingBottom: insets.bottom + 8,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUpdate}
              disabled={!selected.length || saving}
              style={[
                styles.cta,
                {
                  backgroundColor: selected.length ? theme.primary : theme.border,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.ctaText}>
                  Update Interests ({selected.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  loaderWrap: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingBottom: 140 },
  title: { fontSize: 28, fontWeight: '800', lineHeight: 36, marginBottom: 10 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 16, paddingRight: 8 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  counterText: { fontSize: 13, fontWeight: '600' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tagText: { fontSize: 14, fontWeight: '600' },
  footer: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 24,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  cta: { alignItems: 'center', borderRadius: 28, justifyContent: 'center', minHeight: 54 },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});