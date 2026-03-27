import { ScreenHeader } from "@/components/UIComponents";
import { Designer, RootStackParamList } from "@/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MOCK_DESIGNERS } from "../../utils/mockData";
import { COLORS, RADIUS, SHADOW, SPACING } from "../../utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "OnDemandDesigners">;

export default function OnDemandDesignersScreen({ navigation, route }: Props) {
  const { spec } = route.params;

  const handleMessage = (designer: Designer) => {
    navigation.navigate("DesignerMessage", { designer, spec });
  };

  const renderDesignerCard = (designer: Designer) => (
    <View key={designer.id} style={styles.card}>
      {/* Cover + Avatar */}
      <View style={styles.cardCover}>
        <Image
          source={{ uri: designer.coverImage }}
          style={styles.coverImg}
          resizeMode="cover"
        />
        <View style={styles.avatarWrap}>
          <Image source={{ uri: designer.avatar }} style={styles.avatar} />
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.username}>{designer.username}</Text>
          {designer.verified && <Text style={styles.verified}> ✓</Text>}
        </View>
        <Text style={styles.specialty}>{designer.specialty}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>{designer.completedOrders}</Text>
          <Text style={styles.statSep}> | </Text>
          <Text style={styles.stat}>{designer.rating}%</Text>
          <Text style={styles.statSep}> | </Text>
          <Text style={styles.star}>★</Text>
          <Text style={styles.stat}> {designer.ratingScore}</Text>
        </View>

        <TouchableOpacity
          style={styles.messageBtn}
          onPress={() => handleMessage(designer)}
          activeOpacity={0.8}
        >
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Group into pairs
  const pairs: Designer[][] = [];
  for (let i = 0; i < MOCK_DESIGNERS.length; i += 2) {
    pairs.push(MOCK_DESIGNERS.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="On-demand designers"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Select and message a designer of your choice for design preferences
          and cost negotiation
        </Text>

        {pairs.map((pair, idx) => (
          <View key={idx} style={styles.row}>
            {pair.map(renderDesignerCard)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  cardCover: { position: "relative", height: 90 },
  coverImg: { width: "100%", height: "100%" },
  avatarWrap: {
    position: "absolute",
    bottom: -18,
    left: "50%",
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: COLORS.surfaceAlt,
  },
  avatar: { width: 36, height: 36 },
  cardBody: {
    padding: SPACING.sm,
    paddingTop: SPACING.xl + 4,
    alignItems: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center" },
  username: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  verified: { fontSize: 11, color: COLORS.primary },
  specialty: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  stat: { fontSize: 10, color: COLORS.textSecondary },
  statSep: { fontSize: 10, color: COLORS.border },
  star: { fontSize: 10, color: "#F59E0B" },
  messageBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.lg,
    width: "100%",
    alignItems: "center",
  },
  messageBtnText: { fontSize: 12, color: COLORS.text, fontWeight: "500" },
});
