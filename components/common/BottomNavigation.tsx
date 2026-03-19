<<<<<<< HEAD
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
=======
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';

const NAV_ITEMS = [
  { name: 'Home', route: '/', icon: 'home', iconOutline: 'home-outline' },
  { name: 'Messages', route: '/messages', icon: 'mail', iconOutline: 'mail-outline' },
  { name: 'Favorites', route: '/favorites', icon: 'heart', iconOutline: 'heart-outline' },
  { name: 'Cart', route: '/cart', icon: 'cart', iconOutline: 'cart-outline' },
  { name: 'Profile', route: '/profile', icon: 'person', iconOutline: 'person-outline' },
] as const;

interface BottomNavigationProps {
  activeRoute?: string;
}

export default function BottomNavigation({ activeRoute }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const resolvedActiveRoute =
    activeRoute ?? NAV_ITEMS.find((item) => pathname === item.route)?.name ?? 'Home';
>>>>>>> f411c144b4f1aff85c4c9a8812776d0b173f68b5

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
<<<<<<< HEAD
    <View style={[
      styles.container, 
      { backgroundColor: theme.background, borderTopColor: theme.border }
    ]}>
      {navItems.map((item) => {
        const isActive = checkIsActive(item.link as string);
=======
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = resolvedActiveRoute === item.name;
>>>>>>> f411c144b4f1aff85c4c9a8812776d0b173f68b5

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
<<<<<<< HEAD
            onPress={() => {
              if (onNavigate) onNavigate(item.name);
              router.replace(item.link);
            }}
          >
            <Ionicons
              name={isActive ? item.icon : item.iconOutline}
              size={24}
              color={isActive ? theme.activeTint : theme.inactiveTint}
=======
            onPress={() => router.push(item.route)}>
            <Ionicons
              name={isActive ? item.icon : item.iconOutline}
              size={24}
              color={isActive ? '#4A3298' : '#9994A6'}
>>>>>>> f411c144b4f1aff85c4c9a8812776d0b173f68b5
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

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
