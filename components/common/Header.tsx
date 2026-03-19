import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  if (type === 'main') {
    return (
      <View style={styles.headerMain}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="menu-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.logoText}>InkStamp</Text>
        <View style={styles.headerIcons}>
          {onSearchPress ? (
            <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
              <Ionicons name="search-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
          {onNotificationPress ? (
            <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.headerBack}>
      <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {rightAction ? (
        <TouchableOpacity onPress={onRightAction}>
          <Text style={styles.rightActionText}>{rightActionText}</Text>
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
    backgroundColor: '#262626',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerIcons: {
    minWidth: 56,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  headerBack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  rightActionText: {
    fontSize: 14,
    color: '#4A3298',
    fontWeight: '500',
  },
});
