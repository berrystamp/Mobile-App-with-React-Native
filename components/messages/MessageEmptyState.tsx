import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function MessageEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconShell}>
        <Feather name="mail" size={78} color="#BEBCC5" />
      </View>
      <Text style={styles.title}>No message yet</Text>
      <Text style={styles.subtitle}>
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
    borderColor: '#D7D6DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    transform: [{ rotate: '-28deg' }],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2B2833',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    color: '#8D8798',
  },
});
