import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Text,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, DESIGN_CATEGORIES } from '../utils/theme';
import { ScreenHeader, RadioItem } from '../components/UIComponents';
import { Button } from '../components/UIComponents';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectDesignFor'>;

export default function SelectDesignForScreen({ navigation, route }: Props) {
  const [selected, setSelected] = useState(route.params.current || '');
  const [custom, setCustom] = useState('');

  const handleApply = () => {
    const value = selected || custom;
    if (!value) return;
    // Pass value back via navigation state
    navigation.navigate('CustomDesign');
    // We'll use a simple approach: go back with result via navigation
    // In a full app this would use context or state manager
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="What are you designing  for?"
        onBack={() => navigation.goBack()}
        rightLabel="Apply"
        onRightPress={() => {
          if (selected || custom) {
            // For demo purposes, just go back
            // In production, pass via route params callback or state manager
            navigation.goBack();
          }
        }}
        rightColor={COLORS.primary}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {DESIGN_CATEGORIES.map((cat) => (
          <RadioItem
            key={cat}
            label={cat}
            selected={selected === cat}
            onPress={() => setSelected(cat)}
          />
        ))}

        <Text style={styles.cantSee}>Can't see your design Category?</Text>
        <TextInput
          style={styles.input}
          placeholder="Input Category"
          placeholderTextColor={COLORS.textMuted}
          value={custom}
          onChangeText={(t) => {
            setCustom(t);
            if (t) setSelected('');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  cantSee: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    height: 48,
    fontSize: 14,
    color: COLORS.text,
  },
});
