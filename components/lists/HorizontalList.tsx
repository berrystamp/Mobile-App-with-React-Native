// src/components/lists/HorizontalList.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  useColorScheme,
  ListRenderItem,
  StyleProp,
  ViewStyle
} from 'react-native';

// 1. Define the props using a generic type T
export interface HorizontalListProps<T> {
  title: string;
  data: T[];
  renderItem: ListRenderItem<T>;
  onViewAll?: () => void;
  showViewAll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

// 2. Use a standard function definition to support the generic type <T>
function HorizontalList<T extends { id: string | number }>({ 
  title, 
  data, 
  renderItem, 
  onViewAll,
  showViewAll = false,
  contentContainerStyle,
}: HorizontalListProps<T>): React.ReactElement {
  
  // 3. Set up theme hooks
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    text: isDark ? '#FFFFFF' : '#000000',
    brand: '#4A3F8F', // Keep viewAll text in the brand color
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAll, { color: theme.brand }]}>View all</Text>
          </TouchableOpacity>
        )}
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
}

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
    // color removed to use inline dynamic theme
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    // color removed to use inline dynamic theme
  },
  list: {
    paddingHorizontal: 16,
  },
});

export default HorizontalList;