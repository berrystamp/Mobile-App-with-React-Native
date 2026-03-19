import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ArtistCardProps {
  artist: {
    name: string;
    avatar: string;
    rating: number;
    bgColor?: string;
  };
  onPress?: () => void;
}

const ArtistCard = ({ artist, onPress }: ArtistCardProps) => {
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name="star" size={12} color={i < rating ? '#FFD700' : '#E0E0E0'} />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: artist.bgColor || '#EEE' }]}>
        <Image source={{ uri: artist.avatar }} style={styles.image} />
      </View>
      {renderStars(displayRating)}
      <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
        {displayName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden', // Ensures the image doesn't bleed out of the border radius
  },
  image: {
    width: '100%',
    height: '100%',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ArtistCard;
