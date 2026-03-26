import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, DESIGN_THEMES } from '../utils/theme';
import { ScreenHeader, RadioItem } from '../components/UIComponents';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectDesignTheme'>;

export default function SelectDesignThemeScreen({ navigation, route }: Props) {
  const [selected, setSelected] = useState(route.params.current || '');

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Select Design Theme"
        onBack={() => navigation.goBack()}
        rightLabel="Apply"
        onRightPress={() => navigation.goBack()}
        rightColor={COLORS.primary}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {DESIGN_THEMES.map((theme) => (
          <RadioItem
            key={theme}
            label={theme}
            selected={selected === theme}
            onPress={() => setSelected(theme)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
});
