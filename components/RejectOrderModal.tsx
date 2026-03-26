import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

interface RejectOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmReject: () => void;
}

export default function RejectOrderModal({ visible, onClose, onConfirmReject }: RejectOrderModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Reject order?</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.body}>
            Are you sure you want to reject this offer? Rejecting offer means you won't be able to proceed with your negotiation.
          </Text>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={onConfirmReject}
            activeOpacity={0.85}
          >
            <Text style={styles.rejectBtnText}>Reject Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  closeBtn: { padding: SPACING.xs },
  closeX: { fontSize: 16, color: COLORS.textSecondary },
  content: { padding: SPACING.lg },
  body: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  rejectBtn: {
    backgroundColor: COLORS.reject,
    borderRadius: RADIUS.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
