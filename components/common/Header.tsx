import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  type?: 'main' | 'back';
  title?: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onBackPress?: () => void;
  rightAction?: boolean;
  rightActionText?: string;
  onRightAction?: () => void;
}

export default function Header({
  type = 'main',
  title,
  onSearchPress,
  onNotificationPress,
  onBackPress,
  rightAction,
  rightActionText,
  onRightAction,
}: HeaderProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = {
    mainBg: isDark ? '#121212' : '#FFFFFF',
    card: isDark ? '#1E1E1E' : '#F5F5F5',
    text: isDark ? '#FFFFFF' : '#111111',
    icon: isDark ? '#FFFFFF' : '#111111',
    subtleBorder: isDark ? '#262626' : '#F0F0F0',
    accent: '#4A3298',
  };

  if (type === 'main') {
    return (
      <View style={[styles.headerMain, { backgroundColor: theme.mainBg }]}> 
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card }]}> 
          <Ionicons name="menu-outline" size={24} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.logoText, { color: theme.text }]}>BerryStamp</Text>
        <View style={styles.headerIcons}>
          {onSearchPress ? (
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card }]} onPress={onSearchPress}>
              <Ionicons name="search-outline" size={22} color={theme.icon} />
            </TouchableOpacity>
          ) : null}
          {onNotificationPress ? (
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card }]} onPress={onNotificationPress}>
              <Ionicons name="notifications-outline" size={22} color={theme.icon} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.headerBack, { backgroundColor: theme.mainBg, borderBottomColor: theme.subtleBorder }]}> 
      <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={theme.icon} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
      {rightAction ? (
        <TouchableOpacity onPress={onRightAction}>
          <Text style={[styles.rightActionText, { color: theme.accent }]}>{rightActionText}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 60 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerIcons: {
    minWidth: 96,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    padding: 10,
    borderRadius: 20,
  },
  headerBack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
