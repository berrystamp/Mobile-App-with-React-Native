import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

interface AvatarBadgeProps {
  color: string;
  emoji?: string;
  imageUrl?: string;
  label?: string;
  size?: number;
}

export function AvatarBadge({ color, emoji, imageUrl, label, size = 54 }: AvatarBadgeProps) {
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
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />
      ) : (
        <Text style={[styles.label, { fontSize: size * 0.34 }]}>
          {String(label || emoji || '?').slice(0, 2).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#1E293B',
  },
});
