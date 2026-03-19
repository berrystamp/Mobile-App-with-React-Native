// src/components/common/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface HeaderProps {
  type?: 'main' | 'search' | 'back';
  title?: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onBackPress?: () => void;
  rightAction?: boolean;
  rightActionText?: string;
  onRightAction?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  type = 'main',
  title,
  onSearchPress,
  onNotificationPress,
  onBackPress,
  rightAction,
  rightActionText,
  onRightAction,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#2A2A2A' : '#F0F0F0',
    brand: '#4A3F8F',
  };

  if (type === 'main') {
    return (
      <View style={[styles.headerMain, { backgroundColor: theme.background }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: theme.brand }]}>
            {/* Make sure the cutout matches the background theme */}
            <View style={[styles.logoShape, { backgroundColor: theme.background }]} />
          </View>
          <Text style={[styles.logoText, { color: theme.text }]}>Berrystamp</Text>
        </View>
        <View style={styles.headerIcons}>
          {onSearchPress && (
            <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
              <Ionicons name="search-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
          {onNotificationPress && (
            <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress}>
              <Ionicons name="notifications-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (type === 'back') {
    return (
      <View style={[
        styles.headerBack, 
        { backgroundColor: theme.background, borderBottomColor: theme.border }
      ]}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
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

export default Header;
const styles = StyleSheet.create({
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoShape: {
    width: 20,
    height: 20,
    borderRadius: 10,
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
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
    color: '#4A3F8F', // Keeping brand color constant for action text
    fontWeight: '500',
  },
});
