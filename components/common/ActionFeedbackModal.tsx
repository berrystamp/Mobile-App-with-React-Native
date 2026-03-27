import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme/appTheme';

interface ActionFeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function ActionFeedbackModal({ visible, title, message, onClose }: ActionFeedbackModalProps) {
  const theme = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center px-7" style={{ backgroundColor: theme.overlay }}>
        <View className="w-full max-w-[380px] rounded-2xl px-5 py-6" style={{ backgroundColor: theme.surface }}>
          <View className="items-center">
            <Ionicons name="checkmark-circle" size={52} color={theme.primary} />
            <Text className="mt-3 text-center text-[28px] font-semibold" style={{ color: theme.text }}>{title}</Text>
            <Text className="mt-2 text-center text-[22px] leading-8" style={{ color: theme.textMuted }}>{message}</Text>
          </View>

          <TouchableOpacity onPress={onClose} className="mt-6 items-center rounded-full py-3" style={{ backgroundColor: theme.primary }}>
            <Text className="text-[24px] font-semibold" style={{ color: theme.onPrimary }}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
