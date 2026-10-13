import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatNaira } from '@/lib/currency';
import { useAppTheme } from '@/lib/theme/appTheme';
import { transactionAmount, transactionDirection } from '@/lib/wallet';

type Props = { transaction: any | null; onClose: () => void };

function formatDate(value: unknown) {
  if (!value) return 'Not provided';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-GB');
}

export function TransactionDetailsSheet({ transaction, onClose }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [amountVisibility, setAmountVisibility] = useState({ transaction, visible: true });
  if (amountVisibility.transaction !== transaction) {
    setAmountVisibility({ transaction, visible: true });
  }
  const showAmount = amountVisibility.transaction !== transaction || amountVisibility.visible;

  const direction = transactionDirection(transaction);
  const rows = [
    ['Description', transaction?.description || transaction?.narration || 'Transaction'],
    ['Type', direction === 'UNKNOWN' ? 'Not provided' : direction],
    ['Status', String(transaction?.status || 'Not provided').toUpperCase()],
    ['Reference', transaction?.transactionReference || transaction?.reference || transaction?.transactionRef || 'Not provided'],
    ['Date', formatDate(transaction?.createdAt || transaction?.createdDate || transaction?.date)],
    ['Bank', transaction?.accountDetails?.bankName || 'Not provided'],
    ['Account name', transaction?.accountDetails?.accountName || 'Not provided'],
    ['Account number', transaction?.accountDetails?.accountNumber || 'Not provided'],
  ];

  return (
    <Modal visible={transaction != null} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.overlay, { backgroundColor: theme.overlay, paddingTop: insets.top + 24 }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss transaction details" />
        <View style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, 16) }]} accessibilityViewIsModal>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">Transaction details</Text>
            <Pressable onPress={onClose} style={styles.button} accessibilityRole="button" accessibilityLabel="Close transaction details">
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.amountRow}>
              <Text style={[styles.amount, { color: theme.text }]}>{showAmount ? formatNaira(transactionAmount(transaction)) : '₦••••••'}</Text>
              <Pressable onPress={() => setAmountVisibility({ transaction, visible: !showAmount })} style={styles.button} accessibilityRole="button" accessibilityLabel={showAmount ? 'Hide transaction amount' : 'Show transaction amount'}>
                <Ionicons name={showAmount ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textMuted} />
              </Pressable>
            </View>
            {rows.map(([label, value]) => (
              <View key={label} style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
                <Text selectable style={[styles.value, { color: theme.text }]}>{String(value)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  handle: { width: 44, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 12 },
  title: { fontSize: 20, fontWeight: '700', flex: 1 },
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingBottom: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  amount: { fontSize: 30, fontWeight: '700', flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14, gap: 16 },
  label: { fontSize: 13, flex: 1 },
  value: { fontSize: 14, fontWeight: '500', flex: 2, textAlign: 'right' },
});
