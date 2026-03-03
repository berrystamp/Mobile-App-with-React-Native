import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}
 
export const Header: React.FC<HeaderProps> = ({ 
  onSearchPress, 
  onNotificationPress 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    iconBg: isDark ? '#1E1E1E' : '#F5F5F5',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <View style={styles.logoCircle} />
          <View style={styles.logoArc} />
        </View>
        <Text style={[styles.logoText, { color: theme.text }]}>
          <Text style={styles.logoTextPurple}>Berry</Text>stamp
        </Text>
      </View>

      <View style={styles.iconsContainer}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.iconBg }]}
          onPress={onSearchPress || (() => router.push('/search'))}
        >
          <Ionicons name="search-outline" size={22} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.iconBg }]}
          onPress={onNotificationPress || (() => router.push('/notifications'))}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: '#4B3A99',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  logoCircle: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    position: 'absolute',
  },
  logoArc: {
    width: 20,
    height: 10,
    backgroundColor: '#4B3A99',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
  },
  logoTextPurple: {
    color: '#4B3A99',
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});