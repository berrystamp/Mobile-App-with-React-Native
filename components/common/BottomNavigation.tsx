// src/components/common/BottomNavigation.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, Href } from "expo-router"; // Add usePathname

export interface BottomNavigationProps {
  onNavigate?: (route: string) => void;
}

type NavItem = {
  name: string;
  link: Href;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  onNavigate 
}) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current active path
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#1E1E1E' : '#FFFFFF',
    border: isDark ? '#2A2A2A' : '#F0F0F0',
    activeTint: '#4A3F8F',
    inactiveTint: isDark ? '#7A7A7A' : '#999999',
  };

  const navItems: NavItem[] = [
    // Note: changed link to '/' to better match root index routing
    { name: 'Home', link: '/', icon: 'home', iconOutline: 'home-outline' },
    { name: 'Messages', link: '/messages', icon: 'mail', iconOutline: 'mail-outline' },
    { name: 'Favorites', link: '/favorites', icon: 'heart', iconOutline: 'heart-outline' },
    { name: 'Cart', link: '/cart', icon: 'cart', iconOutline: 'cart-outline' },
    { name: 'Profile', link: '/profile', icon: 'person', iconOutline: 'person-outline' },
  ];

  // Helper function to figure out if this tab is the active one based on the URL
  const checkIsActive = (link: string) => {
    if (link === '/') {
      // Home is active if we are at the root, index, or the (tabs) group
      return pathname === '/' || pathname === '/index' || pathname === '/(tabs)';
    }
    // For other routes, check if the current pathname starts with the link
    return pathname.startsWith(link);
  };

  return (
    <View style={[
      styles.container, 
      { backgroundColor: theme.background, borderTopColor: theme.border }
    ]}>
      {navItems.map((item) => {
        const isActive = checkIsActive(item.link as string);

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => {
              if (onNavigate) onNavigate(item.name);
              router.replace(item.link);
            }}
          >
            <Ionicons
              name={isActive ? item.icon : item.iconOutline}
              size={24}
              color={isActive ? theme.activeTint : theme.inactiveTint}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  navItem: {
    padding: 8,
  },
});

export default BottomNavigation;