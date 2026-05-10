import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertType = 'success' | 'error' | 'warning' | 'confirm';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AppAlertConfig {
  type: AlertType;
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AppAlertProps extends AppAlertConfig {
  visible: boolean;
  onClose: () => void;
}

// ─── Visual config per type ───────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AlertType,
  { icon: keyof typeof Ionicons.glyphMap; iconBg: string; iconColor: string; accent: string }
> = {
  success: {
    icon: 'checkmark-circle',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    accent: '#16a34a',
  },
  error: {
    icon: 'close-circle',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    accent: '#dc2626',
  },
  warning: {
    icon: 'warning',
    iconBg: '#fef9c3',
    iconColor: '#ca8a04',
    accent: '#ca8a04',
  },
  confirm: {
    icon: 'help-circle',
    iconBg: '#ede9fe',
    iconColor: '#4A3298',
    accent: '#4A3298',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AppAlert({ visible, onClose, type, title, message, buttons }: AppAlertProps) {
  const isDark = useColorScheme() === 'dark';
  const cfg = TYPE_CONFIG[type];

  const resolvedButtons: AlertButton[] =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: 'OK', style: 'default', onPress: onClose }];

  const handlePress = (btn: AlertButton) => {
    onClose();
    btn.onPress?.();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 360,
            borderRadius: 24,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 8,
          }}>
          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: cfg.iconBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name={cfg.icon} size={36} color={cfg.iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              textAlign: 'center',
              color: isDark ? '#f1f5f9' : '#0f172a',
              marginBottom: message ? 8 : 20,
            }}>
            {title}
          </Text>

          {/* Message */}
          {message ? (
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                color: isDark ? '#94a3b8' : '#64748b',
                lineHeight: 22,
                marginBottom: 20,
              }}>
              {message}
            </Text>
          ) : null}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: isDark ? '#334155' : '#e2e8f0', marginBottom: 12 }} />

          {/* Buttons */}
          <View style={{ flexDirection: resolvedButtons.length > 1 ? 'row' : 'column', gap: 8 }}>
            {resolvedButtons.map((btn, i) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              const isPrimary = !isDestructive && !isCancel;

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.75}
                  style={{
                    flex: resolvedButtons.length > 1 ? 1 : undefined,
                    paddingVertical: 13,
                    borderRadius: 14,
                    alignItems: 'center',
                    backgroundColor: isDestructive
                      ? '#dc2626'
                      : isCancel
                      ? isDark ? '#334155' : '#f1f5f9'
                      : cfg.accent,
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: isCancel && !isDark ? '#475569' : '#ffffff',
                    }}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Hook for easy imperative usage ──────────────────────────────────────────

export function useAppAlert() {
  const [config, setConfig] = React.useState<AppAlertConfig | null>(null);

  const show = React.useCallback((cfg: AppAlertConfig) => setConfig(cfg), []);
  const hide = React.useCallback(() => setConfig(null), []);

  const element = config ? (
    <AppAlert visible={true} onClose={hide} {...config} />
  ) : null;

  return { show, hide, element };
}
