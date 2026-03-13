// src/components/cards/ArtistCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. Updated Interface to match your Backend JSON structure + Mock Data
export interface ArtistType {
  id: string | number;
  name?: string;
  userName?: string;
  avatar?: string;          // For mock data fallback
  profilePic?: string;      // From backend
  profileImage?: {          // From backend (nested)
    url?: string;
    [key: string]: any;
  };
  rating?: number;          // For mock data fallback
  insight?: {               // From backend (nested)
    rating?: {
      avgStars?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  bgColor?: string;
  [key: string]: any;
}

export interface ArtistCardProps {
  artist: ArtistType;
  onPress?: () => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    text: isDark ? '#DDDDDD' : '#666666',
    starEmpty: isDark ? '#444444' : '#E0E0E0',
    defaultAvatarBg: isDark ? '#2A2A2A' : '#F0F0F0',
  };

  // --- Safely extract data from the backend structure ---
  // Tries profilePic first, then profileImage.url, then falls back to avatar
  const avatarUrl = artist.profilePic || artist?.profileImage?.url || artist.avatar;
  
  // Tries the nested avgStars, falls back to flat rating, defaults to 0
  const displayRating = artist.insight?.rating?.avgStars ?? artist.rating ?? 0;
  
  // Prefers userName, falls back to name
  const displayName = artist.userName || artist.name || 'Unknown';

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name="star"
            size={12}
            color={i < rating ? '#FFD700' : theme.starEmpty}
          />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: artist.bgColor || theme.defaultAvatarBg }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.image} />
        ) : null}
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