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

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = resolvedActiveRoute === item.name;

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => router.push(item.route)}>
            <Ionicons
              name={isActive ? item.icon : item.iconOutline}
              size={24}
              color={isActive ? '#4A3298' : '#9994A6'}
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
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    padding: 8,
  },
});
