// src/components/cards/TrendingCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. Define the shape of your design data
export interface DesignType {
  id: string | number;
  image: string;
  title: string;
  artist: string;
  [key: string]: any;
}

// 2. Define component props
export interface TrendingCardProps {
  design: DesignType;
  onPress?: () => void;
  onFavoritePress?: (id: string | number) => void;
}

const TrendingCard: React.FC<TrendingCardProps> = ({ 
  design, 
  onPress, 
  onFavoritePress 
}) => {
  // 3. Setup dynamic theme for the fallback background
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    // This background only shows while the image is loading or if the URI is broken
    fallbackBg: isDark ? '#1E1E1E' : '#EAEAEA', 
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.fallbackBg }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {design.image ? (
        <Image source={{ uri: design.image }} style={styles.image} />
      ) : null}
      
      <TouchableOpacity 
        style={styles.favoriteIcon}
        onPress={() => onFavoritePress?.(design.id)}
      >
        <Ionicons name="heart-outline" size={24} color="#FFF" />
      </TouchableOpacity>
      
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={1}>{design.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>By {design.artist}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    // Optional: Add a subtle shadow so the icon pops on light images
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3, 
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    // The dark overlay ensures the white text is always readable
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  artist: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.9,
  },
});

export default TrendingCard;