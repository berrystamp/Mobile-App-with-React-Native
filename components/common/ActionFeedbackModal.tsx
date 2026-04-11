import React from 'react';
import { Modal, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
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
  
  // Detect system/app theme to enforce pure black in dark mode
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const modalBackground = isDark ? '#000000' : theme.surface;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View 
        className="flex-1 items-center justify-center px-6" 
        style={{ backgroundColor: theme.overlay }}
      >
        <View 
          className="w-full max-w-[340px] rounded-3xl p-6 shadow-lg" 
          style={{ backgroundColor: modalBackground }}
        >
          <View className="items-center">
            {/* Soft background circle for the icon */}
            <View 
              className="mb-4 h-16 w-16 items-center justify-center rounded-full" 
              style={{ backgroundColor: `${theme.primary}15` }} // 15% opacity of primary color
            >
              <Ionicons name="checkmark-circle" size={40} color={theme.primary} />
            </View>

            <Text 
              className="mb-2 text-center text-xl font-bold" 
              style={{ color: theme.text }}
            >
              {title}
            </Text>
            
            <Text 
              className="mb-6 text-center text-base leading-6" 
              style={{ color: theme.textMuted }}
            >
              {message}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={onClose} 
            activeOpacity={0.8}
            className="w-full items-center rounded-xl py-3.5" 
            style={{ backgroundColor: theme.primary }}
          >
            <Text 
              className="text-base font-semibold" 
              style={{ color: theme.onPrimary }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}