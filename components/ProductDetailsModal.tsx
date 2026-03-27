import { CustomDesignSpec, OrderOffer } from "@/types";
import React from "react";
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, RADIUS, SHADOW, SPACING } from "../utils/theme";
import { Button } from "./UIComponents";

interface Props {
  visible: boolean;
  onClose: () => void;
  spec: CustomDesignSpec;
  offer: OrderOffer;
  onEditSpecs?: () => void;
}

const { height: SCREEN_H } = Dimensions.get("window");

export default function ProductDetailsModal({
  visible,
  onClose,
  spec,
  offer,
  onEditSpecs,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        {/* Handle + Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Product details and specifications</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Design Preview */}
          <View style={styles.imgWrap}>
            <Image
              source={{ uri: offer.designImage }}
              style={styles.img}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.imgTitle}>{offer.title}</Text>

          {/* Specs */}
          <View style={styles.specSection}>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Design for</Text>
              <Text style={styles.specVal}>{spec.designFor}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Preferred Design Theme</Text>
              <Text style={styles.specVal}>{spec.designTheme}</Text>
            </View>
            <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.specKey}>Print on</Text>
              <Text style={styles.specVal}>{spec.printItems.join(", ")}</Text>
            </View>
          </View>
        </ScrollView>

        {onEditSpecs && (
          <View style={styles.footer}>
            <Button title="Edit specifications" onPress={onEditSpecs} />
          </View>
        )}
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_H * 0.85,
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
  title: { fontSize: 15, fontWeight: "600", color: COLORS.text, flex: 1 },
  closeBtn: { padding: SPACING.xs },
  closeX: { fontSize: 16, color: COLORS.textSecondary },
  content: { padding: SPACING.lg, paddingBottom: 20 },
  imgWrap: {
    alignSelf: "center",
    width: 120,
    height: 90,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  img: { width: "100%", height: "100%" },
  imgTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  specSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specRow: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specKey: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  specVal: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  footer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
});
