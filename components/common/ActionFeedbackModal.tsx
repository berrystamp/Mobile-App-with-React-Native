import React from 'react';
import { Modal, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionFeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function ActionFeedbackModal({ visible, title, message, onClose }: ActionFeedbackModalProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/45 px-7">
        <View className="w-full max-w-[380px] rounded-2xl bg-white px-5 py-6 dark:bg-[#1E1E1E]">
          <View className="items-center">
            <Ionicons name="checkmark-circle" size={52} color="#3B2D85" />
            <Text className="mt-3 text-center text-[28px] font-semibold text-[#2F2F2F] dark:text-white">{title}</Text>
            <Text className="mt-2 text-center text-[22px] leading-8 text-[#666666] dark:text-[#CFCFCF]">{message}</Text>
          </View>

          <TouchableOpacity onPress={onClose} className="mt-6 items-center rounded-full bg-[#3B2D85] py-3">
            <Text className="text-[24px] font-semibold text-white">{isDark ? 'Continue' : 'Okay'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
