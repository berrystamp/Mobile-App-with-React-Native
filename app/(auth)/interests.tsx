import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const NAVY = '#2F2D8C';

const lightTheme = {
  bg: '#FFFFFF',
  textPrimary: '#1a1a2e',
  textMuted: '#888',
  iconColor: '#1a1a2e',
  chipBg: '#F2F2F5',
  chipBorder: '#E4E4EC',
  chipText: '#333',
};

const darkTheme = {
  bg: '#12122A',
  textPrimary: '#EEEEF8',
  textMuted: '#888899',
  iconColor: '#EEEEF8',
  chipBg: '#1E1E3A',
  chipBorder: '#2E2E50',
  chipText: '#CCCCDD',
};

const ALL_INTERESTS = [
  'Nature',
  'Abstra',
  'Minimalist',
  'Conceptual',
  'Sticker',
  'Masculine',
  'Kiddies',
  'Playful',
  'Party',
  'Mugs',
  'Typographic',
  'Fun',
  'Health',
  'Accessory',
  'Anime',
  'Face Mask',
  'living',
  'Phone Case',
  'Crypto',
  'Wall art',
  'Feminine',
  'Drawing',
  'Tote',
  'Clothing',
  'Nature',
];

export default function InterestsScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isDark = useColorScheme() === 'dark';
  const t = isDark ? darkTheme : lightTheme;

  function toggle(item: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="arrow-back" size={22} color={t.iconColor} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.textPrimary }]}>What are your{'\n'}interests</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            Choose your interests have a seamless experience on Berrystamp with personalize results
          </Text>
        </View>

        {/* Interest chips */}
        <View style={styles.chipsWrap}>
          {ALL_INTERESTS.map((item, index) => {
            const isSelected = selected.has(item);
            // Use item+index as key since 'Nature' appears twice
            return (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={[
                  styles.chip,
                  { backgroundColor: t.chipBg, borderColor: t.chipBorder },
                  isSelected && styles.chipSelected,
                ]}
                onPress={() => toggle(item)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, { color: t.chipText }, isSelected && styles.chipTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={[styles.footer, { backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[styles.submitButton, selected.size === 0 && styles.submitButtonDisabled]}
          activeOpacity={0.85}
          disabled={selected.size === 0}
          onPress={() => {
            router.push('/(tabs)');
          }}
        >
          <Text style={styles.submitButtonText}>Submit and proceed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginTop: 4,
    marginLeft: 20,
    alignSelf: 'flex-start',
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: NAVY,
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
