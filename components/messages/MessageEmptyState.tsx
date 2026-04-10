import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

export function MessageEmptyState() {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <View style={[styles.iconShell, { borderColor: isDark ? '#3A3A3A' : '#D7D6DC' }]}>
        <Feather name="mail" size={78} color={isDark ? '#8F8B99' : '#BEBCC5'} />
      </View>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#2B2833' }]}>No message yet</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#A6A2B3' : '#8D8798' }]}>
        You have not yet received or sent a message to someone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 72,
  },
  iconShell: {
    width: 168,
    height: 168,
    borderRadius: 52,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    transform: [{ rotate: '-28deg' }],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
  },
});
