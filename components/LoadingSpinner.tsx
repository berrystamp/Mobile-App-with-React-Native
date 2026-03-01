import React from 'react';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message,
  size = 'large',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    text: isDark ? '#FFFFFF' : '#1A1A1A',
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#4B3A99" />
      {message && (
        <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
});