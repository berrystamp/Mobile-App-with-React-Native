// src/components/common/Header.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface HeaderProps {
  type?: 'main' | 'search' | 'back';
  title?: string;
  onSearchPress?: () => void;
  type?: string;
  title?: string;
  onBackPress?: () => void;
  rightAction?: boolean;
  rightActionText?: string;
  onRightAction?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  type,
  title,
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

  if (type === 'back') {
    return (
      <View 
        className="flex-row items-center justify-between pb-[14px] px-4 border-b bg-transparent"
        style={{ borderBottomColor: theme.border, paddingTop: Math.max(insets.top, 16) + 10 }}
      >
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center" 
          onPress={onBackPress || (() => router.back())}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        
        <Text 
          className="flex-1 text-center text-lg font-bold mx-3" 
          style={{ color: theme.text }} 
          numberOfLines={1}
        >
          {title || ''}
        </Text>
        
        <View className="min-w-[40px] items-end">
          {rightAction ? (
            <TouchableOpacity onPress={onRightAction}>
              <Text 
                className="text-[15px] font-semibold" 
                style={{ color: theme.primary }}
              >
                {rightActionText || 'Action'}
              </Text>
            </TouchableOpacity>
          ) : null}
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
    <View className="flex-row justify-between items-center px-5 pb-6 bg-transparent" style={{ paddingTop: Math.max(insets.top, 16) + 12 }}> 
      <View>
        <Image 
          source={logoSource} 
    
           style={{width: 140, height: 30}}
          contentFit="contain" 
        />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="w-10 h-10 rounded-full justify-center items-center"

          onPress={onSearchPress || (() => router.push('/(tabs)/Search'))}
        >
          <Ionicons name="search-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
