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

const NAVY = '#2F2D8C';

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

  function toggle(item: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="arrow-back" size={22} color="#1a1a2e" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What are your{'\n'}interests</Text>
          <Text style={styles.subtitle}>
            Choose your interests have a seamless experience on Berrytamp with personalize results
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
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggle(item)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, selected.size === 0 && styles.submitButtonDisabled]}
          activeOpacity={0.85}
          disabled={selected.size === 0}
          onPress={() => {
            // TODO: navigate to home/dashboard after submitting interests
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
    backgroundColor: '#FFFFFF',
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
    color: '#1a1a2e',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
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
    backgroundColor: '#F2F2F5',
    borderWidth: 1,
    borderColor: '#E4E4EC',
  },
  chipSelected: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
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
