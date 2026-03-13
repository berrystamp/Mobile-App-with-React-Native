// src/components/lists/ProductGrid.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import ProductCard from '../cards/ProductCard';

const { width } = Dimensions.get('window');
// Calculate card width accounting for padding and gap
const CARD_WIDTH = (width - 48) / 2;

// 1. Define Props with generic type T
export interface ProductGridProps<T> {
  title?: string;
  data: T[];
  onProductPress?: (product: T) => void;
  onFavoritePress?: (id: string | number) => void;
  showTitle?: boolean;
}

// 2. Generic function component
function ProductGrid<T extends { id: string | number }>({ 
  title, 
  data, 
  onProductPress, 
  onFavoritePress,
  showTitle = true,
}: ProductGridProps<T>): React.ReactElement {
  
  // 3. Setup dynamic theme
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    text: isDark ? '#FFFFFF' : '#000000',
  };

  return (
    <View style={styles.container}>
      {showTitle && title && (
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
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