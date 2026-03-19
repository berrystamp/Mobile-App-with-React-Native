import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import ProductCard from '../cards/ProductCard';

const { width } = Dimensions.get('window');
// Calculate card width accounting for padding and gap
const CARD_WIDTH = (width - 48) / 2;

interface ProductItem {
  id: string | number;
  title: string;
  artist: string;
  price: string;
  image: string;
}

interface ProductGridProps {
  title?: string;
  data: ProductItem[];
  onProductPress?: (item: ProductItem) => void;
  onFavoritePress?: (id: string | number) => void;
  showTitle?: boolean;
}

const ProductGrid = ({ title, data, onProductPress, onFavoritePress, showTitle = true }: ProductGridProps) => {
  return (
    <View style={styles.container}>
      {showTitle && title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.grid}>
        {data.map((item) => (
          <View key={item.id} style={{ width: CARD_WIDTH }}>
            <ProductCard
              product={item}
              onPress={() => onProductPress?.(item)}
              onFavoritePress={onFavoritePress}
              cardWidth={CARD_WIDTH}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
    // color removed to use inline dynamic theme
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
});

export default ProductGrid;
