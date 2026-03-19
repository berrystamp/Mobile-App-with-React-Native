import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AvatarBadgeProps {
  color: string;
  emoji: string;
  size?: number;
}

export function AvatarBadge({ color, emoji, size = 54 }: AvatarBadgeProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}>
      <Text style={[styles.emoji, { fontSize: size * 0.42 }]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
