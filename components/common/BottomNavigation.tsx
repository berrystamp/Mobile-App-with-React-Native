import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, Href } from 'expo-router';
import { useAuthStore, isCustomerRole } from '@/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIGHT_BACKGROUND = ['rgba(255, 255, 255, 0.95)', 'rgba(245, 245, 255, 0.85)'] as const;
const DARK_BACKGROUND = ['rgba(20, 20, 30, 0.95)', 'rgba(30, 30, 40, 0.85)'] as const;

export interface BottomNavigationProps {
  onNavigate?: (route: string) => void;
}

type NavItem = {
  name: string;
  link: Href;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onNavigate }) => {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const role = useAuthStore((state) => state.role);
  const isCustomer = isCustomerRole(role);
  const insets = useSafeAreaInsets();

  const theme = {
    background: isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND,
    activeTint: '#4A3F8F',
    inactiveTint: isDark ? '#A0A0A0' : '#6C6C6C',
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
  };

  const navItems: NavItem[] = isCustomer
    ? [
        { name: 'Home', link: '/', icon: 'home', iconOutline: 'home-outline' },
        { name: 'Messages', link: '/messages', icon: 'mail', iconOutline: 'mail-outline' },
        { name: 'Favorites', link: '/favorites', icon: 'heart', iconOutline: 'heart-outline' },
        { name: 'Cart', link: '/cart', icon: 'cart', iconOutline: 'cart-outline' },
        { name: 'Profile', link: '/profile', icon: 'person', iconOutline: 'person-outline' },
      ]
    : [
        { name: 'Home', link: '/', icon: 'home', iconOutline: 'home-outline' },
        { name: 'Messages', link: '/messages', icon: 'mail', iconOutline: 'mail-outline' },
        { name: 'Manage Order', link: '/manage-order', icon: 'document-text', iconOutline: 'document-text-outline' },
        { name: 'Profile', link: '/profile', icon: 'person', iconOutline: 'person-outline' },
      ];

  const checkIsActive = (link: string) => {
    if (link === '/') {
      return pathname === '/' || pathname === '/index' || pathname === '/(tabs)';
    }
    if (link === '/manage-order') {
      return pathname === '/manage-order' || pathname.startsWith('/order/');
    }
    return pathname.startsWith(link);
  };

  return (
    <View style={styles.wrapper}>
      {/* Glassmorphic background with gradient */}
      <LinearGradient
        colors={theme.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.container,
          {
            borderTopColor: theme.borderColor,
            // Adjust height dynamically based on safe area insets
            height: 60 + Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8),
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8),
          },
        ]}
      >
        {/* Navigation items */}
        {navItems.map((item) => {
          const isActive = checkIsActive(item.link as string);

          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.7}
              style={styles.navItem}
              onPress={() => {
                if (onNavigate) onNavigate(item.name);
                router.replace(item.link);
              }}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? item.icon : item.iconOutline}
                  size={26}
                  color={isActive ? theme.activeTint : theme.inactiveTint}
                />
              </View>
              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: theme.activeTint }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

export default BottomNavigation;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    width: '100%',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  activeDot: {
    position: 'absolute',
    bottom: 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
  },
});