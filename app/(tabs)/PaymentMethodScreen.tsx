import { Button } from "@/components/UIComponents";
import { PaymentFunder, RootStackParamList } from "@/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SHADOW, SPACING } from "../../utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentMethod">;

export default function PaymentMethodScreen({ navigation, route }: Props) {
  const { offer } = route.params;
  const [funder, setFunder] = useState<PaymentFunder>("self");

  const proceed = () => {
    navigation.navigate("PaymentMethodSelect", { funder, offer });
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      />

      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment method</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          >
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Select how you would like to pay for the products ordered
          </Text>

          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.option, funder === "self" && styles.optionActive]}
              onPress={() => setFunder("self")}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>💳</Text>
              <Text style={styles.optionLabel}>Pay by yourself</Text>
              <View
                style={[styles.radio, funder === "self" && styles.radioActive]}
              >
                {funder === "self" && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                funder === "sponsored" && styles.optionActive,
              ]}
              onPress={() => setFunder("sponsored")}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>💳</Text>
              <Text style={styles.optionLabel}>Sponsored payment</Text>
              <View
                style={[
                  styles.radio,
                  funder === "sponsored" && styles.radioActive,
                ]}
              >
                {funder === "sponsored" && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Button title="Proceed" onPress={proceed} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...SHADOW.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  closeBtn: { padding: SPACING.xs },
  closeX: { fontSize: 16, color: COLORS.textSecondary },
  content: { padding: SPACING.lg },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  options: { gap: SPACING.md },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  optionActive: { borderColor: COLORS.primary, backgroundColor: "#F5F3FF" },
  optionIcon: { fontSize: 20 },
  optionLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  footer: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
});
