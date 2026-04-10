import { Button, ScreenHeader } from "@/components/UIComponents";
import { PaymentMethod, RootStackParamList } from "@/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../../utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentMethodSelect">;

interface MethodOption {
  id: PaymentMethod;
  label: string;
  icon: string;
  section?: string;
}

const METHODS: MethodOption[] = [
  { id: "debit", label: "Debit card", icon: "💳" },
  { id: "bank_transfer", label: "Bank transfer", icon: "🏦" },
  { id: "paypal", label: "Paypal", icon: "🅿", section: "Other method" },
  { id: "ussd", label: "USSD", icon: "*#" },
  { id: "opay", label: "Opay", icon: "🔵" },
];

export default function PaymentMethodSelectScreen({
  navigation,
  route,
}: Props) {
  const { offer } = route.params;
  const [selected, setSelected] = useState<PaymentMethod>("debit");

  const proceed = () => {
    if (selected === "debit" || selected === "bank_transfer") {
      navigation.navigate("CardPayment", { offer, method: selected });
    } else {
      // Handle other methods
      navigation.navigate("CardPayment", { offer, method: selected });
    }
  };

  let sectionRendered = false;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Select preferred payment method"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {METHODS.map((method) => {
          const showSection = method.section && !sectionRendered;
          if (method.section) sectionRendered = true;

          return (
            <View key={method.id}>
              {showSection && (
                <Text style={styles.sectionLabel}>{method.section}</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.option,
                  selected === method.id && styles.optionActive,
                ]}
                onPress={() => setSelected(method.id)}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>{method.icon}</Text>
                </View>
                <Text style={styles.optionLabel}>{method.label}</Text>
                <View
                  style={[
                    styles.radio,
                    selected === method.id && styles.radioActive,
                  ]}
                >
                  {selected === method.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Proceed" onPress={proceed} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  optionActive: { backgroundColor: "#F5F3FF", borderRadius: RADIUS.sm },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 18 },
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
});
