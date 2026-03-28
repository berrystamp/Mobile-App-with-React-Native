import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ApiService from '@/services/apiClient';

const PRIMARY = '#44309D';

type LoadState = 'idle' | 'loading' | 'saving';

export default function InterestsScreen() {
  const [state, setState] = useState<LoadState>('idle');
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const isSaving = state === 'saving';
  const isLoading = state === 'loading';

  const toggle = useCallback((value: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    try {
      setState('loading');
      const [interestOptions, userInterests] = await Promise.all([ApiService.getInterestOptions(), ApiService.getMyInterests()]);

      const mergedOptions = Array.from(new Set([...(interestOptions || []), ...(userInterests || [])]));
      setOptions(mergedOptions);
      setSelected(new Set(userInterests));
    } catch (error: any) {
      Alert.alert('Unable to load interests', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setState('idle');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const orderedOptions = useMemo(
    () => [...options].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    [options],
  );

  const handleSubmit = useCallback(async () => {
    try {
      setState('saving');
      await ApiService.updateMyInterests(Array.from(selected));
      router.back();
    } catch (error: any) {
      Alert.alert('Unable to update interests', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setState('idle');
    }
  }, [selected]);

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color="#2D2D2F" />
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.headerWrap}>
              <Text style={styles.title}>What are your interests</Text>
              <Text style={styles.subtitle}>
                Choose your interests and have a seamless experience on Berrystamp with personalized results.
              </Text>
            </View>

            <View style={styles.chipsContainer}>
              {orderedOptions.map((item) => {
                const active = selected.has(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    activeOpacity={0.8}
                    onPress={() => toggle(item)}>
                    <Text style={[styles.chipLabel, active ? styles.chipLabelActive : styles.chipLabelInactive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!orderedOptions.length ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No interests available right now. Pull to refresh or try again later.</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, (!selected.size || isSaving) && styles.submitButtonDisabled]}
              disabled={!selected.size || isSaving}
              onPress={handleSubmit}
              activeOpacity={0.85}>
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitLabel}>Update Interest</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7FA',
  },
  backButton: {
    marginLeft: 20,
    marginTop: 4,
    alignSelf: 'flex-start',
    padding: 4,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerWrap: {
    marginTop: 36,
    marginBottom: 22,
    alignItems: 'center',
  },
  title: {
    color: '#34323A',
    fontSize: 46,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 49,
    letterSpacing: -0.7,
  },
  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    color: '#7B7786',
    fontSize: 14,
    lineHeight: 23,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 10,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  chipInactive: {
    backgroundColor: '#ECE8F8',
  },
  chipActive: {
    backgroundColor: PRIMARY,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  chipLabelInactive: {
    color: '#4A399D',
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  emptyWrap: {
    marginTop: 28,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E899A',
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 26,
    paddingTop: 14,
    backgroundColor: '#F7F7FA',
  },
  submitButton: {
    borderRadius: 30,
    backgroundColor: PRIMARY,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitLabel: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '600',
  },
});
