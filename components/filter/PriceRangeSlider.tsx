import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface PriceRangeSliderProps {
  range: [number, number];
  onRangeChange: (range: [number, number]) => void;
  min?: number;
  max?: number;
  label?: string;
}

const PriceRangeSlider = ({
  range,
  onRangeChange,
  min = 0,
  max = 9000,
  label = 'Price Range',
}: PriceRangeSliderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.rangeText}>
          ₦{range[0]} - ₦{range[1].toLocaleString()}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={range[1]}
        onValueChange={(value) => onRangeChange([min, Math.round(value)])}
        minimumTrackTintColor="#4A3F8F"
        maximumTrackTintColor="#E0E0E0"
        thumbTintColor="#4A3F8F"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  rangeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default PriceRangeSlider;
