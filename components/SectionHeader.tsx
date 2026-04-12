import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  onViewAllPress?: () => void;
  showViewAll?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  onViewAllPress,
  showViewAll = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    link: '#4B3A99',
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title]}>{title}</Text>
      {showViewAll && onViewAllPress && (
        <TouchableOpacity onPress={onViewAllPress} activeOpacity={0.7}>
          <Text style={[styles.viewAll, { color: theme.link }]}>View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
});