import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOW } from '../utils/theme';

// ─── Primary Button ──────────────────────────────────────────────
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: object;
  textStyle?: object;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isPrimary && styles.btnPrimary,
        isOutline && styles.btnOutline,
        isDanger && styles.btnDanger,
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? '#fff' : COLORS.primary} size="small" />
      ) : (
        <Text
          style={[
            styles.btnText,
            isPrimary && styles.btnTextPrimary,
            isOutline && styles.btnTextOutline,
            isDanger && styles.btnTextDanger,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ─── Screen Header ───────────────────────────────────────────────
interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  rightColor?: string;
}

export const ScreenHeader: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightLabel,
  onRightPress,
  rightColor,
}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.headerBack} activeOpacity={0.7}>
      <Text style={styles.headerBackArrow}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    {rightLabel ? (
      <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
        <Text style={[styles.headerRight, { color: rightColor ?? COLORS.primary }]}>
          {rightLabel}
        </Text>
      </TouchableOpacity>
    ) : (
      <View style={{ width: 56 }} />
    )}
  </View>
);

// ─── Radio Item ──────────────────────────────────────────────────
interface RadioItemProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export const RadioItem: React.FC<RadioItemProps> = ({ label, selected, onPress, color }) => (
  <TouchableOpacity style={styles.radioRow} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.radioLabel, selected && { color: color ?? COLORS.primary, fontWeight: '500' }]}>
      {label}
    </Text>
    <View style={[styles.radioOuter, selected && { borderColor: color ?? COLORS.primary }]}>
      {selected && <View style={[styles.radioInner, { backgroundColor: color ?? COLORS.primary }]} />}
    </View>
  </TouchableOpacity>
);

// ─── Checkbox Item ───────────────────────────────────────────────
interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

export const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked, onPress }) => (
  <TouchableOpacity style={styles.checkRow} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.checkLabel, checked && { color: COLORS.primary, fontWeight: '500' }]}>
      {label}
    </Text>
    <View style={[styles.checkBox, checked && styles.checkBoxActive]}>
      {checked && <Text style={styles.checkMark}>✓</Text>}
    </View>
  </TouchableOpacity>
);

// ─── Dropdown Trigger ────────────────────────────────────────────
interface DropdownTriggerProps {
  label: string;
  value?: string;
  onPress: () => void;
  focused?: boolean;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  label,
  value,
  onPress,
  focused,
}) => (
  <TouchableOpacity
    style={[styles.dropdown, focused && styles.dropdownFocused]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
      {value || label}
    </Text>
    <Text style={styles.dropdownArrow}>⌄</Text>
  </TouchableOpacity>
);

// ─── Tag Chip ────────────────────────────────────────────────────
interface ChipProps {
  label: string;
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, onRemove }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
    {onRemove && (
      <TouchableOpacity onPress={onRemove} style={styles.chipRemove}>
        <Text style={styles.chipRemoveText}>×</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Divider ─────────────────────────────────────────────────────
export const Divider = ({ style }: { style?: object }) => (
  <View style={[styles.divider, style]} />
);

// ─── Section Label ───────────────────────────────────────────────
export const SectionLabel = ({ children }: { children: string }) => (
  <Text style={styles.sectionLabel}>{children}</Text>
);

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btn: {
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    ...SHADOW.sm,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: COLORS.reject,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { fontSize: 15, fontWeight: '600' },
  btnTextPrimary: { color: '#fff' },
  btnTextOutline: { color: COLORS.primary },
  btnTextDanger: { color: '#fff' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBack: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerBackArrow: { fontSize: 22, color: COLORS.text },
  headerTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1, textAlign: 'center' },
  headerRight: { fontSize: 15, fontWeight: '600', minWidth: 56, textAlign: 'right' },

  // Radio
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  radioLabel: { fontSize: 15, color: COLORS.text },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },

  // Checkbox
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkLabel: { fontSize: 15, color: COLORS.text },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    height: 52,
    backgroundColor: COLORS.background,
  },
  dropdownFocused: { borderColor: COLORS.primary, borderWidth: 1.5 },
  dropdownText: { fontSize: 14, color: COLORS.text },
  dropdownPlaceholder: { color: COLORS.textMuted },
  dropdownArrow: { fontSize: 18, color: COLORS.textMuted },

  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipText: { fontSize: 13, color: COLORS.text },
  chipRemove: { marginLeft: 4 },
  chipRemoveText: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 18 },

  // Divider
  divider: { height: 1, backgroundColor: COLORS.border },

  // Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
});
