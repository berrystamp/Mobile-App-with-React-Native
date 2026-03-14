// src/components/cards/ProductCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = (width - 48) / 2;

// 1. Define the shape of your product data
export interface ProductType {
  id: string | number;
  image: string;
  title: string;
  artist: string;
  price: string; // e.g., "$24.99"
  [key: string]: any;
}

// 2. Define component props
export interface ProductCardProps {
  product: ProductType;
  onPress?: () => void;
  onFavoritePress?: (id: string | number) => void;
  cardWidth?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  onFavoritePress, 
  cardWidth 
}) => {
  const finalWidth = cardWidth || DEFAULT_CARD_WIDTH;
  
  // 3. Setup dynamic theme
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#AAAAAA' : '#999999',
    imageBg: isDark ? '#1E1E1E' : '#F5F5F5',
    favButtonBg: isDark ? 'rgba(0,0,0,0.5)' : '#FFFFFF',
    favIcon: isDark ? '#FFFFFF' : '#666666',
  };

  return (
    <TouchableOpacity style={[styles.container, { width: finalWidth }]} onPress={onPress}>
      <View style={[styles.imageContainer, { width: finalWidth, height: finalWidth, backgroundColor: theme.imageBg }]}>
        {/* Added a fallback in case the image URI is empty or missing */}
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : null}
        
        <TouchableOpacity 
          style={[styles.favorite, { backgroundColor: theme.favButtonBg }]}
          onPress={() => onFavoritePress?.(product.id)}
        >
          <Ionicons name="heart-outline" size={20} color={theme.favIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={[styles.artist, { color: theme.subText }]}>By {product.artist}</Text>
        <Text style={[styles.price, { color: theme.text }]}>{product.price}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  artist: {
    fontSize: 11,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductCard;