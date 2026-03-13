// src/components/cards/ArtistCard.jsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ArtistCard = ({ artist, onPress }) => {
  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name="star"
            size={12}
            color={i < rating ? '#FFD700' : '#E0E0E0'}
          />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: artist.bgColor }]}>
        <Image source={{ uri: artist.avatar }} style={styles.image} />
      </View>
      {renderStars(artist.rating)}
      <Text style={styles.name}>{artist.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    color: '#666',
  },
});

export default ArtistCard;