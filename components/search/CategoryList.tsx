import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';

interface CategoryItem {
  id: number;
  name: string;
  image: string;
}

interface CategoryListProps {
  categories: CategoryItem[];
  onCategoryPress: (category: CategoryItem) => void;
  title?: string;
}

const CategoryList = ({ categories, onCategoryPress, title }: CategoryListProps) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      {title ? <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>{title}</Text> : null}
      {categories.map((category) => (
        <TouchableOpacity key={category.id} style={styles.item} onPress={() => onCategoryPress(category)}>
          <Image source={{ uri: category.image }} style={styles.image} />
          <Text style={[styles.name, { color: isDark ? '#FFFFFF' : '#000000' }]}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    fontSize: 16,
  },
});

export default CategoryList;
