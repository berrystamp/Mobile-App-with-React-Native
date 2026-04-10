import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface HeaderProps {
  type?: 'main' | 'search' | 'back';
  title?: string;
  onSearchPress?: () => void;
  onBackPress?: () => void;
  rightAction?: boolean;
  rightActionText?: string;
  onRightAction?: () => void;
}

export default function Header({
  type = 'main',
  title,
  onSearchPress,
  onBackPress,
  rightAction,
  rightActionText,
  onRightAction,
}: HeaderProps) {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const theme = {
    text: isDark ? '#FFFFFF' : '#111111',
    border: isDark ? '#262626' : '#E5E7EB',
    surface: isDark ? '#121212' : '#FFFFFF',
    accent: '#4A3298',
  };

  if (type === 'back') {
    return (
      <View style={[styles.backHeader, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={onBackPress ?? (() => router.back())} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={[styles.backTitle, { color: theme.text }]}>
          {title ?? ''}
        </Text>
        {rightAction ? (
          <TouchableOpacity onPress={onRightAction} style={styles.rightActionWrap}>
            <Text style={[styles.rightActionText, { color: theme.accent }]}>{rightActionText ?? 'Action'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rightActionWrap} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.mainHeader}>
      <Text style={[styles.brandText, { color: theme.text }]}>{title ?? 'BerryStamp'}</Text>
      <TouchableOpacity onPress={onSearchPress ?? (() => router.push('/(tabs)/Search'))} style={styles.iconButton}>
        <Ionicons name="search-outline" size={22} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backHeader: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
  },
  backTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rightActionWrap: {
    alignItems: 'flex-end',
    minWidth: 56,
  },
  rightActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
