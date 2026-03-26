import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, PrintItem } from '../types';
import { COLORS, SPACING, PRINT_ITEMS } from '../utils/theme';
import { ScreenHeader, CheckboxItem } from '../components/UIComponents';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectItems'>;

export default function SelectItemsScreen({ navigation, route }: Props) {
  const [selected, setSelected] = useState<PrintItem[]>(route.params.current || []);

  const toggle = (item: PrintItem) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Select items"
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
        {PRINT_ITEMS.map((item) => (
          <CheckboxItem
            key={item}
            label={item}
            checked={selected.includes(item as PrintItem)}
            onPress={() => toggle(item as PrintItem)}
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
