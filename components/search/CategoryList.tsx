// src/components/search/CategoryList.jsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const CategoryList = ({ categories, onCategoryPress, title }) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.item}
          onPress={() => onCategoryPress(category)}
        >
          <Image source={{ uri: category.image }} style={styles.image} />
          <Text style={styles.name}>{category.name}</Text>
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
    color: '#000',
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
    color: '#000',
  },
});

export default CategoryList;