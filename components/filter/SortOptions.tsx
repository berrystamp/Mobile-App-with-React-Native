import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SortOptionsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  label?: string;
}

const SortOptions = ({ options, selected, onSelect, label = 'Sort By' }: SortOptionsProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, selected === option && styles.optionActive]}
            onPress={() => onSelect(option)}>
            <Text style={[styles.optionText, selected === option && styles.optionTextActive]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  options: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  optionActive: {
    backgroundColor: '#4A3F8F',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
});

export default SortOptions;
