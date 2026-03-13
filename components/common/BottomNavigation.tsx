// src/components/common/BottomNavigation.jsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
const BottomNavigation = ({ activeRoute = 'Home', onNavigate }) => {
const router = useRouter(); 
 const navItems = [
    { name: 'Home', link: '(tabs)', icon: 'home', iconOutline: 'home-outline' },
    { name: 'Messages', link: '(tabs)/messages', icon: 'mail', iconOutline: 'mail-outline' },
    { name: 'Favorites', link: '(tabs)/favorites', icon: 'heart', iconOutline: 'heart-outline' },
    { name: 'Cart', link: '(tabs)/cart', icon: 'cart', iconOutline: 'cart-outline' },
    { name: 'Profile', link: '(tabs)/profile', icon: 'person', iconOutline: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => router.push(item.link)}
        >
          <Ionicons
            name={activeRoute === item.name ? item.icon : item.iconOutline}
            size={24}
            color={activeRoute === item.name ? '#4A3F8F' : '#999'}
          />
        </TouchableOpacity>
      ))}
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
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    padding: 8,
  },
});

export default BottomNavigation;