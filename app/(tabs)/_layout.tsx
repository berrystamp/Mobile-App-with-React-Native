import { Header } from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme, View } from 'react-native';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    tabBar: isDark ? '#1E1E1E' : '#FFFFFF',
    activeTint: '#4B3A99',
    inactiveTint: isDark ? '#7A7A7A' : '#B0B0B0',
  };

  return (
    
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Header />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.activeTint,
            tabBarInactiveTintColor: theme.inactiveTint,
            tabBarStyle: {
              backgroundColor: theme.tabBar,
              borderTopWidth: 1,
              borderTopColor: isDark ? '#2A2A2A' : '#F0F0F0',
              height: 65, 
              paddingBottom: 10, 
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          {/* Visible Tabs */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: 'Messages',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="mail-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="favorites"
            options={{
              title: 'Favorites',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="heart-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: 'Cart',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cart-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
          
          {/* ======================================= */}
          {/* Hidden Screens (Deep Links / Sub-pages) */}
          {/* ======================================= */}
          
          <Tabs.Screen
            name="select-printer"
            options={{
              href: null, 
            }}
          />

          {/* On-Demand Printers Page */}
          <Tabs.Screen
            name="printers"
            options={{
              href: null, 
              tabBarStyle: { display: 'none' }, // Hides the tab bar on this screen
            }}
          />

          {/* Chat / Negotiation Page */}
          <Tabs.Screen
            name="chat"
            options={{
              href: null, 
              tabBarStyle: { display: 'none' }, // Hides the tab bar so chat input is visible
            }}
          />

          {/* Products Overview Page */}
          <Tabs.Screen
            name="products"
            options={{
              href: null, 
              tabBarStyle: { display: 'none' }, // Hides the tab bar on this screen
            }}
          />
          <Tabs.Screen
            name="checkout"
            options={{
              href: null, 
              tabBarStyle: { display: 'none' }, // Hides the tab bar on this screen
            }}
          />
        </Tabs>
      </View>
  );
}