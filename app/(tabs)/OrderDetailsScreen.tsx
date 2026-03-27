import { Button } from "@/components/UIComponents";
import { RootStackParamList } from "@/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, RADIUS, SHADOW, SPACING } from "../../utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "OrderDetails">;

const { height: SCREEN_H } = Dimensions.get("window");

interface RowProps {
  label: string;
  value: string;
}
const DetailRow = ({ label, value }: RowProps) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowVal}>{value}</Text>
  </View>
);

export default function OrderDetailsScreen({ navigation, route }: Props) {
  const { offer, designer } = route.params;

  const formatCurrency = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Semi-transparent backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Order details</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          >
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.reviewNote}>
            Review information to ensure details is exactly as agreed with
            printer before accepting
          </Text>

          <DetailRow
            label="Order title"
            value={`Design for fashion show on :Design for Fashion show on (Flier, T-shirt and Hoodie);`}
          />
          <DetailRow
            label="Brief description of order agreed specifications"
            value="Design for fashion show base on my inspiration and initiatives. The design will be oriented to fun as indicated"
          />
          <DetailRow
            label="Design amount"
            value={formatCurrency(offer.designAmount)}
          />
          <DetailRow
            label="Printing amount"
            value={formatCurrency(offer.printingAmount)}
          />
          <DetailRow
            label="Delivery amount"
            value={formatCurrency(offer.deliveryAmount)}
          />
          <DetailRow label="Agreed date of delivery" value={offer.dueDate} />
          <DetailRow
            label="Need pickup logistics"
            value={offer.needPickupLogistics ? "Yes" : "No"}
          />
        </ScrollView>

        {/* Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() =>
              navigation.navigate("DesignerMessage", {
                designer,
                spec: {
                  designFor: "Fashion Show",
                  designTheme: "Fun",
                  printItems: ["Flier", "Tshirt", "Hoodie"],
                },
              })
            }
          >
            <Text style={styles.rejectBtnText}>Reject Order</Text>
          </TouchableOpacity>
          <Button
            title="Pay for Order"
            onPress={() => navigation.navigate("PaymentMethod", { offer })}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
    maxHeight: SCREEN_H * 0.88,
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
  reviewNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  row: {
    marginBottom: SPACING.lg,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  rowVal: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.text },
});
