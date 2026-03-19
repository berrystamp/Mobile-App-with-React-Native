import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchHistoryProps {
  items: string[];
  onItemPress: (item: string) => void;
}

const SearchHistory = ({ items, onItemPress }: SearchHistoryProps) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity key={`${item}-${index}`} style={styles.item} onPress={() => onItemPress(item)}>
          <Ionicons name="time-outline" size={20} color={isDark ? '#AFAFAF' : '#999'} />
          <Text style={[styles.text, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  text: {
    fontSize: 16,
  },
});

export default SearchHistory;
