import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, DesignCategory, DesignTheme, PrintItem } from '../types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../utils/theme';
import { Button, ScreenHeader, DropdownTrigger, Chip } from '../components/UIComponents';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomDesign'>;

export default function CustomDesignScreen({ navigation, route }: Props) {
  const [designFor, setDesignFor] = useState<DesignCategory | ''>('');
  const [designTheme, setDesignTheme] = useState<DesignTheme | ''>('');
  const [printItems, setPrintItems] = useState<PrintItem[]>([]);

  const canProceed = designFor !== '' && designTheme !== '' && printItems.length > 0;

  const handleSelectDesigner = () => {
    if (!canProceed) return;
    navigation.navigate('OnDemandDesigners', {
      spec: {
        designFor: designFor as DesignCategory,
        designTheme: designTheme as DesignTheme,
        printItems,
      },
    });
  };

  const removeItem = (item: PrintItem) => {
    setPrintItems((prev) => prev.filter((i) => i !== item));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Custom Design"
        onBack={() => navigation.goBack()}
        rightLabel="Clear"
        onRightPress={() => {
          setDesignFor('');
          setDesignTheme('');
          setPrintItems([]);
        }}
        rightColor={COLORS.primary}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Design For */}
        <View style={styles.fieldGroup}>
          <DropdownTrigger
            label="What Are You Designing For"
            value={designFor || undefined}
            onPress={() =>
              navigation.navigate('SelectDesignFor', { current: designFor })
            }
            focused={!!designFor}
          />
        </View>

        {/* Design Theme */}
        <View style={styles.fieldGroup}>
          <DropdownTrigger
            label="Preferred Design Theme"
            value={designTheme || undefined}
            onPress={() =>
              navigation.navigate('SelectDesignTheme', { current: designTheme })
            }
            focused={!!designTheme}
          />
        </View>

        {/* Print Items */}
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsLabel}>What Item(s) would you like to print on?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SelectItems', { current: printItems })}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {printItems.length > 0 ? (
          <View style={styles.chips}>
            {printItems.map((item) => (
              <Chip key={item} label={item} onRemove={() => removeItem(item)} />
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addItemsBtn}
            onPress={() => navigation.navigate('SelectItems', { current: printItems })}
            activeOpacity={0.7}
          >
            <Text style={styles.addItemsText}>+ Select items to print on</Text>
          </TouchableOpacity>
        )}

        {/* Summary Card */}
        {canProceed && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Design Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Occasion</Text>
              <Text style={styles.summaryVal}>{designFor}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Theme</Text>
              <Text style={styles.summaryVal}>{designTheme}</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryKey}>Items</Text>
              <Text style={styles.summaryVal}>{printItems.join(', ')}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Select Designer"
          onPress={handleSelectDesigner}
          disabled={!canProceed}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  fieldGroup: { marginBottom: SPACING.md },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  itemsLabel: { fontSize: 14, color: COLORS.text },
  viewAll: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  addItemsBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    borderStyle: 'dashed',
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  addItemsText: { color: COLORS.primary, fontSize: 14 },
  summaryCard: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryKey: { fontSize: 13, color: COLORS.textSecondary },
  summaryVal: { fontSize: 13, color: COLORS.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
