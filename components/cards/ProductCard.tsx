import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: {
    id: string | number;
    title: string;
    artist: string;
    price: string;
    image: string;
  };
  onPress?: () => void;
  onFavoritePress?: (id: string | number) => void;
  cardWidth?: number;
}

const ProductCard = ({ product, onPress, onFavoritePress, cardWidth }: ProductCardProps) => {
  const finalWidth = cardWidth || CARD_WIDTH;

  return (
    <TouchableOpacity style={[styles.container, { width: finalWidth }]} onPress={onPress}>
      <View style={[styles.imageContainer, { width: finalWidth, height: finalWidth }]}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <TouchableOpacity style={styles.favorite} onPress={() => onFavoritePress?.(product.id)}>
          <Ionicons name="heart-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.artist}>By {product.artist}</Text>
        <Text style={styles.price}>{product.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  imageContainer: {
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favorite: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  artist: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default ProductCard;
