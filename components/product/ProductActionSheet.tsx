import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductActionSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ProductActionSheet({ visible, title, onClose, children }: ProductActionSheetProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-[28px] bg-white px-6 pb-10 pt-4">
          <View className="mb-5 items-center">
            <View className="mb-4 h-1.5 w-16 rounded-full bg-[#D9D9D9]" />
            <View className="w-full flex-row items-center justify-between">
              <View style={{ width: 24 }} />
              <Text className="text-lg font-semibold text-[#2F2F2F]">{title}</Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel={`Close ${title}`}>
                <Ionicons name="close" size={22} color="#5F5F5F" />
              </TouchableOpacity>
            </View>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
