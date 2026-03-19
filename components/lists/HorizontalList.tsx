import React, { ReactElement } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ViewStyle } from 'react-native';

interface HorizontalListProps<T extends { id: string | number }> {
  title: string;
  data: T[];
  renderItem: ({ item }: { item: T }) => ReactElement | null;
  onViewAll?: () => void;
  showViewAll?: boolean;
  contentContainerStyle?: ViewStyle;
}

const HorizontalList = <T extends { id: string | number }>({
  title,
  data,
  renderItem,
  onViewAll,
  showViewAll = false,
  contentContainerStyle,
}: HorizontalListProps<T>) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showViewAll ? (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.list, contentContainerStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  viewAll: {
    fontSize: 14,
    color: '#4A3F8F',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
  },
});

export default HorizontalList;
