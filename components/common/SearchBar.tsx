import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  autoFocus?: boolean;
}

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search Design',
  onFilterPress,
  autoFocus = false,
}: SearchBarProps) => {
  const isDark = useColorScheme() === 'dark';

  const theme = {
    inputBg: isDark ? '#1E1E1E' : '#F5F5F5',
    text: isDark ? '#FFFFFF' : '#000000',
    placeholder: isDark ? '#8D8D8D' : '#999999',
    icon: isDark ? '#D0D0D0' : '#555555',
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.inputBg }]}> 
        <Ionicons name="search-outline" size={20} color={theme.placeholder} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
        />
      </View>
      {onFilterPress ? (
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
          <Ionicons name="options-outline" size={24} color={theme.icon} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterBtn: {
    padding: 8,
  },
});

export default SearchBar;
