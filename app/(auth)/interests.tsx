import { saveInterestsRequest } from '@/lib/api/authFlow';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

const INTERESTS = ['Branding', 'Fashion', 'Marketing', 'Sport'];

export default function InterestsScreen() {
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const { hasSelectedInterests, setHasSelectedInterests, role } = useAuthStore();

  if (role !== 'customer') {
    router.replace('/(tabs)');
    return null;
  }

  if (hasSelectedInterests) {
    router.replace('/(tabs)');
    return null;
  }

  const toggleInterest = (value: string) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveInterestsRequest(selected);
      setHasSelectedInterests(true);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Unable to save interests', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-[#F5F5F7] dark:bg-[#121212]">
      <Text className="text-[24px] font-bold text-center text-[#1a1a1a] dark:text-white mb-6">Choose your interests</Text>
      <View className="flex-row flex-wrap gap-2">
        {INTERESTS.map((item) => {
          const active = selected.includes(item);
          return (
            <TouchableOpacity
              key={item}
              className={`px-4 py-2 rounded-full ${active ? 'bg-[#4B3A99]' : 'bg-[#EFEAFE]'}`}
              onPress={() => toggleInterest(item)}>
              <Text className={active ? 'text-white' : 'text-[#4B3A99]'}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        className="mt-6 py-4 rounded-[30px] items-center bg-[#3D2E8E]"
        onPress={handleSave}
        disabled={!selected.length || saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-semibold">Save interests</Text>}
      </TouchableOpacity>
    </View>
  );
}
