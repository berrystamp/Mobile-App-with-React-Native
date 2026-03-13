import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  type?: string; // Added this since HomeScreen passes type="main"
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearchPress, 
  onNotificationPress,
  type
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const pathname = usePathname(); 

  // Cleaned up the hidden routes logic
  const hiddenRoutes = ['/cart', '/printers', '/products', '/chat', '/select-printer', '/checkout'];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    iconBg: isDark ? '#1E1E1E' : '#F5F5F5',
    brand: '#4B3A99', // Kept brand purple constant
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: theme.brand }]}>
          {/* FIX: Applied dynamic background here so the cutout works in dark mode */}
          <View style={[styles.logoCircle, { backgroundColor: theme.background }]} />
          <View style={[styles.logoArc, { backgroundColor: theme.brand }]} />
        </View>
        <Text style={[styles.logoText, { color: theme.text }]}>
          <Text style={{ color: theme.brand }}>Berry</Text>stamp
        </Text>
      </View>

      <View style={styles.iconsContainer}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.iconBg }]}
          onPress={onSearchPress || (() => router.push('/(tabs)/Search'))}
        >
          <Ionicons name="search-outline" size={22} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.iconBg }]}
          // Make sure you have a valid route for notifications, using a placeholder for now
          onPress={onNotificationPress || (() => console.log('Notifications'))}
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
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  logoCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    // Removed hardcoded '#FFFFFF'
  },
  logoArc: {
    width: 20,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 8,
    // Removed hardcoded brand color, applied inline
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
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