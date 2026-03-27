import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxListProps {
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  label?: string;
}

const CheckboxList = ({ items, selectedItems, onToggle, label }: CheckboxListProps) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.list}>
        {items.map((item) => (
          <TouchableOpacity key={item} style={styles.item} onPress={() => onToggle(item)}>
            <Text style={styles.itemText}>{item}</Text>
            <View style={[styles.checkbox, selectedItems.includes(item) && styles.checkboxChecked]}>
              {selectedItems.includes(item) ? <Ionicons name="checkmark" size={16} color="#FFF" /> : null}
            </View>
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
  list: {
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemText: {
    fontSize: 15,
    color: '#000',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A3F8F',
    borderColor: '#4A3F8F',
  },
});

export default CheckboxList;
