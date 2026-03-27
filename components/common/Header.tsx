import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  type?: string;
  title?: string;
  onBackPress?: () => void;
  rightAction?: boolean;
  rightActionText?: string;
  onRightAction?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  onNotificationPress,
  type,
  title,
  onBackPress,
  rightAction,
  rightActionText,
  onRightAction,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const pathname = usePathname();

  const hiddenRoutes = ['/cart', '/printers', '/products', '/chat', '/select-printer', '/checkout'];
  if (type !== 'back' && hiddenRoutes.includes(pathname)) {
    return null;
  }

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    iconBg: isDark ? '#1E1E1E' : '#F5F5F5',
    brand: '#4B3A99',
    action: isDark ? '#D9D9D9' : '#4B3A99',
  };

  if (type === 'back') {
    return (
      <View style={[styles.backContainer, { backgroundColor: theme.background, borderBottomColor: isDark ? '#222222' : '#F0F0F0' }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress || (() => router.back())}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.backTitle, { color: theme.text }]} numberOfLines={1}>
          {title || ''}
        </Text>
        <View style={styles.backRightWrap}>
          {rightAction ? (
            <TouchableOpacity onPress={onRightAction}>
              <Text style={[styles.rightActionText, { color: theme.action }]}>{rightActionText || 'Action'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: theme.brand }]}>
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
          onPress={onSearchPress || (() => router.push('/(tabs)/Search'))}>
          <Ionicons name="search-outline" size={22} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.iconBg }]}
          onPress={onNotificationPress || (() => console.log('Notifications'))}>
          <Ionicons name="notifications-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  backRightWrap: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  rightActionText: {
    fontSize: 15,
    fontWeight: '600',
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
  },
  logoArc: {
    width: 20,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 8,
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
