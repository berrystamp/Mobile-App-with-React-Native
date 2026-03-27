import { Button, ScreenHeader } from "@/components/UIComponents";
import { RootStackParamList } from "@/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../../utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "CardPayment">;

export default function CardPaymentScreen({ navigation, route }: Props) {
  const { offer } = route.params;
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 16);
    return clean.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 2) return clean.slice(0, 2) + "/" + clean.slice(2);
    return clean;
  };

  const isValid =
    cardNumber.replace(/\s/g, "").length === 16 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  const handlePay = () => {
    if (!isValid) return;
    setShowConfirm(true);
  };

  const confirmPay = async () => {
    setLoading(true);
    setShowConfirm(false);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Enter your card details to pay"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card Number */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>CARD NUMBER</Text>
            <TextInput
              style={[
                styles.input,
                cardNumber.length > 0 && styles.inputFocused,
              ]}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={COLORS.textMuted}
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          {/* Expiry + CVV */}
          <View style={styles.row}>
            <View style={[styles.fieldWrap, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>CARD EXPIRY</Text>
              <TextInput
                style={[styles.input, expiry.length > 0 && styles.inputFocused]}
                placeholder="MM / YY"
                placeholderTextColor={COLORS.textMuted}
                value={expiry}
                onChangeText={(t) => setExpiry(formatExpiry(t))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View
              style={[styles.fieldWrap, { flex: 1, marginLeft: SPACING.md }]}
            >
              <Text style={styles.fieldLabel}>CVV</Text>
              <TextInput
                style={[styles.input, cvv.length > 0 && styles.inputFocused]}
                placeholder="123"
                placeholderTextColor={COLORS.textMuted}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={loading ? "Processing..." : "Pay"}
            onPress={handlePay}
            disabled={!isValid}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.confirmSheet}>
            <View style={styles.confirmHeader}>
              <Text style={styles.confirmTitle}>Make Payment?</Text>
              <TouchableOpacity onPress={() => setShowConfirm(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.confirmBody}>
              Are you sure you want to Make a payment of ₦
              {offer.designAmount.toLocaleString()} for printing the designs?
              This amount will be deducted from the selected mode of payment
            </Text>
            <View style={styles.confirmActions}>
              <Button title="Proceed" onPress={confirmPay} />
              <Button
                title="Cancel"
                onPress={() => setShowConfirm(false)}
                variant="outline"
                style={{ marginTop: SPACING.md }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.successSheet}>
            <View style={styles.successIcon}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Payment successful!!</Text>
            <Text style={styles.successBody}>
              Thanks for placing an order. Your payment is successful
            </Text>
            <View style={styles.successActions}>
              <Button
                title="Go to order"
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate("CustomDesign");
                }}
              />
              <Button
                title="Back to home"
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate("CustomDesign");
                }}
                variant="outline"
                style={{ marginTop: SPACING.md }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  fieldWrap: { marginBottom: SPACING.lg },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    height: 52,
    fontSize: 15,
    color: COLORS.text,
  },
  inputFocused: { borderColor: COLORS.primary, borderWidth: 1.5 },
  row: { flexDirection: "row" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  confirmSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  confirmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  closeX: { fontSize: 16, color: COLORS.textSecondary, padding: SPACING.xs },
  confirmBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  confirmActions: {},
  successSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    alignItems: "center",
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
    marginTop: SPACING.xl,
  },
  successCheck: { fontSize: 28, color: COLORS.primary },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  successActions: { width: "100%" },
});
