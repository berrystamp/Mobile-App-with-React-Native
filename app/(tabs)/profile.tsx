import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#121212' : '#F3F3F3',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>Profile Screen</Text>
      <Text style={[styles.subtext, { color: theme.text }]}>
        Coming soon...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    opacity: 0.6,
  },
});