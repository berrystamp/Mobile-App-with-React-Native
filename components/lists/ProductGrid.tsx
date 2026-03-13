// src/components/lists/ProductGrid.jsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ProductCard from '../cards/ProductCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductGrid = ({ 
  title, 
  data, 
  onProductPress, 
  onFavoritePress,
  showTitle = true,
}) => {
  return (
    <View style={styles.container}>
      {showTitle && title && (
        <Text style={styles.title}>{title}</Text>
      )}
      <View style={styles.grid}>
        {data.map((item) => (
          <View key={item.id} style={{ width: CARD_WIDTH }}>
            <ProductCard
              product={item}
              onPress={() => onProductPress?.(item)}
              onFavoritePress={onFavoritePress}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
});

export default ProductGrid;