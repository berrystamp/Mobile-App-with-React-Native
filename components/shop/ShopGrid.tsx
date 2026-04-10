import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import type { GridItem } from './types';

export function ShopGrid({
  items,
  bg,
  text,
  muted,
  onMenu,
  emptyMessage,
}: {
  items: GridItem[];
  bg: string;
  text: string;
  muted: string;
  emptyMessage: string;
  onMenu: (item: GridItem) => void;
}) {
  if (!items.length) {
    return <Text style={{ textAlign: 'center', marginVertical: 24, color: muted }}>{emptyMessage}</Text>;
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 }}>
      {items.map((item) => (
        <View key={String(item.id)} style={{ width: '48.5%', borderRadius: 12, padding: 10, marginBottom: 12, minHeight: 180, backgroundColor: bg }}>
          <TouchableOpacity
            style={{ position: 'absolute', zIndex: 1, top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#DBDBDB', alignItems: 'center', justifyContent: 'center' }}
            onPress={() => onMenu(item)}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
          </TouchableOpacity>
          {item.imagePath ? (
            <Image source={{ uri: item.imagePath }} style={{ width: '100%', height: 104, borderRadius: 10, backgroundColor: '#ECECF1' }} />
          ) : (
            <View style={{ width: '100%', height: 104, borderRadius: 10, backgroundColor: '#ECECF1', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={item.type === 'design' ? 'image-outline' : 'albums-outline'} size={20} color={muted} />
            </View>
          )}
          <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '500', color: text }} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={{ marginTop: 3, fontSize: 14, color: muted }}>{item.subtitle}</Text>
        </View>
      ))}
    </View>
  );
}
