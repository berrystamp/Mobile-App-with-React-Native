import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    subtext: isDark ? '#A0A0A0' : '#7A7A7A',
    button: '#4B3A99',
    buttonText: '#FFFFFF',
  };

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={theme.subtext} />
      <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.button }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { color: theme.buttonText }]}>
            Try Again
          </Text>
        </TouchableOpacity>
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
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});