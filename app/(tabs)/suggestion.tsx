import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "choose" | "idea" | "bug";
type IdeaStep = "categories" | "detail";
type BugStep = "categories" | "detail";

const CATEGORIES = [
  "Notification",
  "Inbox",
  "Finding Services",
  "Order management",
];

// ─── Theme helper ─────────────────────────────────────────────────────────────
function useTheme(isDark: boolean) {
  return {
    bg: isDark ? "#121212" : "#F2F2F2",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subtext: isDark ? "#A0A0A0" : "#666666",
    border: isDark ? "#333333" : "#E6E6E6",
    inputBorder: isDark ? "#444444" : "#CCCCCC",
    primary: "#4B3A99",
    cardBg: isDark ? "#2A2A2A" : "#F7F6FF",
  };
}

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({
  visible,
  title,
  message,
  onClose,
  surface,
  text,
  subtext,
  insets,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  surface: string;
  text: string;
  subtext: string;
  insets: { bottom: number };
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.successSheet, { backgroundColor: surface, paddingBottom: insets.bottom + 24 }]}>
          {/* Header */}
          <View style={styles.successHeader}>
            <Text style={[styles.successHeaderTitle, { color: text }]}>Share an idea</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={text} />
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View style={styles.successIconWrap}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={34} color="#FFFFFF" />
            </View>
          </View>

          {/* Text */}
          <Text style={[styles.successTitle, { color: text }]}>{title}</Text>
          <Text style={[styles.successMsg, { color: subtext }]}>{message}</Text>

          {/* Button */}
          <TouchableOpacity style={styles.okayBtn} onPress={onClose}>
            <Text style={styles.okayTxt}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Choose screen (bottom sheet style) ──────────────────────────────────────
function ChooseScreen({
  onSelect,
  onClose,
  surface,
  text,
  subtext,
  border,
  cardBg,
  primary,
  insets,
}: {
  onSelect: (m: "idea" | "bug") => void;
  onClose: () => void;
  surface: string;
  text: string;
  subtext: string;
  border: string;
  cardBg: string;
  primary: string;
  insets: { bottom: number };
}) {
  return (
    <View style={[styles.chooseSheet, { backgroundColor: surface, paddingBottom: insets.bottom + 16 }]}>
      {/* Header */}
      <View style={styles.chooseHeader}>
        <Text style={[styles.chooseTitle, { color: text }]}>Make suggestion/report</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color={text} />
        </TouchableOpacity>
      </View>

      {/* Share an idea card */}
      <TouchableOpacity
        onPress={() => onSelect("idea")}
        activeOpacity={0.8}
        style={[styles.chooseCard, { backgroundColor: cardBg, borderColor: border }]}
      >
        <View style={[styles.chooseCardIcon, { backgroundColor: surface }]}>
          <Ionicons name="bulb-outline" size={22} color={primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.chooseCardTitle, { color: primary }]}>Share an idea</Text>
          <Text style={[styles.chooseCardSub, { color: subtext }]}>
            We are always ready to hear your awesome and creative idea
          </Text>
        </View>
      </TouchableOpacity>

      {/* Report a bug card */}
      <TouchableOpacity
        onPress={() => onSelect("bug")}
        activeOpacity={0.8}
        style={[styles.chooseCard, { backgroundColor: cardBg, borderColor: border }]}
      >
        <View style={[styles.chooseCardIcon, { backgroundColor: surface }]}>
          <Ionicons name="bug-outline" size={22} color={primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.chooseCardTitle, { color: primary }]}>Report a bug</Text>
          <Text style={[styles.chooseCardSub, { color: subtext }]}>
            Let&apos;s know where it itches, our customer support is always available.
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Category list screen (shared by idea + bug) ──────────────────────────────
function CategoryScreen({
  mode,
  onSelect,
  onBack,
  isDark,
  insets,
}: {
  mode: "idea" | "bug";
  onSelect: (cat: string | null) => void;
  onBack: () => void;
  isDark: boolean;
  insets: { top: number; bottom: number };
}) {
  const { bg, surface, text, subtext, border, primary } = useTheme(isDark);
  const [customArea, setCustomArea] = useState("");
  const [customIdea, setCustomIdea] = useState("");

  const isIdea = mode === "idea";
  const title = isIdea ? "Share an idea" : "Report a bug";
  const subtitle = isIdea
    ? "We are always ready to hear your awesome and creative idea"
    : "Let's know where it itches, our customer support is always available.";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, paddingTop: insets.top + 12, borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Subtitle */}
        <Text style={[styles.pageSubtitle, { color: subtext }]}>{subtitle}</Text>

        {/* Category rows */}
        <View style={[styles.catCard, { backgroundColor: surface, borderColor: border }]}>
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelect(cat)}
              activeOpacity={0.7}
              style={[
                styles.catRow,
                { borderBottomColor: border, borderBottomWidth: i < CATEGORIES.length - 1 ? StyleSheet.hairlineWidth : 0 },
              ]}
            >
              <Text style={[styles.catLabel, { color: text }]}>{cat}</Text>
              <Ionicons name="chevron-forward" size={16} color={subtext} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Can't find subject */}
        <Text style={[styles.cantFindLabel, { color: subtext }]}>
          Can&apos;t find the subject? let us know here
        </Text>

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <TextInput
            value={customArea}
            onChangeText={setCustomArea}
            placeholder="Area of consideration"
            placeholderTextColor={subtext}
            style={[styles.customInput, { color: text, borderColor: border, backgroundColor: surface }]}
          />
          <View>
            <TextInput
              value={customIdea}
              onChangeText={(v) => v.length <= 2500 && setCustomIdea(v)}
              placeholder="Let us here your idea."
              placeholderTextColor={subtext}
              multiline
              style={[styles.customTextarea, { color: text, borderColor: border, backgroundColor: surface }]}
            />
            <Text style={[styles.charCount, { color: subtext }]}>{customIdea.length}/2500</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit button */}
      <View style={[styles.btnBar, { backgroundColor: bg }]}>
        <TouchableOpacity
          onPress={() => {
            if (!customArea.trim() && !customIdea.trim()) {
              Alert.alert("Empty", "Please fill in the area or your idea.");
              return;
            }
            onSelect(null); // null = custom submission
          }}
          style={styles.submitBtn}
        >
          <Text style={styles.submitTxt}>{isIdea ? "Submit idea" : "Report bug"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Detail screen (after picking a category) ────────────────────────────────
function DetailScreen({
  mode,
  category,
  onSubmit,
  onBack,
  isDark,
  insets,
}: {
  mode: "idea" | "bug";
  category: string;
  onSubmit: () => void;
  onBack: () => void;
  isDark: boolean;
  insets: { top: number; bottom: number };
}) {
  const { bg, surface, text, subtext, border, primary } = useTheme(isDark);
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);

  const isIdea = mode === "idea";
  const title = isIdea ? "Idea on notification" : "Report a bug";
  const subtitle = isIdea
    ? "We are always ready to hear your awesome and creative idea"
    : "Let's know where it itches, our customer support is always available.";

  const handleSubmit = async () => {
    if (!idea.trim()) {
      Alert.alert("Empty", "Please enter your idea.");
      return;
    }
    try {
      setLoading(true);
      // Simulate API call — replace with real endpoint when available
      await new Promise((r) => setTimeout(r, 800));
      onSubmit();
    } catch {
      Alert.alert("Error", "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={[styles.header, { backgroundColor: surface, paddingTop: insets.top + 12, borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={[styles.pageSubtitle, { color: subtext }]}>{subtitle}</Text>

        <View style={{ paddingHorizontal: 16 }}>
          <View>
            <TextInput
              value={idea}
              onChangeText={(v) => v.length <= 2500 && setIdea(v)}
              placeholder="Let us here your idea."
              placeholderTextColor={subtext}
              multiline
              style={[styles.detailTextarea, { color: text, borderColor: border, backgroundColor: surface }]}
            />
            <Text style={[styles.charCount, { color: subtext }]}>{idea.length}/2500</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.btnBar, { backgroundColor: bg }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" size="small" />
            : <Text style={styles.submitTxt}>{isIdea ? "Submit idea" : "Report bug"}</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function SuggestionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useTheme(isDark);

  const [mode, setMode] = useState<Mode>("choose");
  const [step, setStep] = useState<IdeaStep | BugStep>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectMode = (m: "idea" | "bug") => {
    setMode(m);
    setStep("categories");
  };

  const handleSelectCategory = (cat: string | null) => {
    if (cat) {
      setSelectedCategory(cat);
      setStep("detail");
    } else {
      // custom submission from category screen
      setShowSuccess(true);
    }
  };

  const handleSubmit = () => {
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.back();
  };

  const successConfig = mode === "idea"
    ? {
        title: "Thanks Mohh_Jumah!!",
        message: "Great! You have successfully send idea to our customer service unit. Thanks",
      }
    : {
        title: "Bug reported successfully!",
        message: "Thanks! our customer service will see to the problem as soon as possible.",
      };

  // ── Render ──
  if (mode === "choose") {
    return (
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}>
        {/* Tappable backdrop */}
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => router.back()} />
        <ChooseScreen
          onSelect={handleSelectMode}
          onClose={() => router.back()}
          surface={theme.surface}
          text={theme.text}
          subtext={theme.subtext}
          border={theme.border}
          cardBg={theme.cardBg}
          primary={theme.primary}
          insets={insets}
        />
      </View>
    );
  }

  if (step === "categories") {
    return (
      <>
        <CategoryScreen
          mode={mode as "idea" | "bug"}
          onSelect={handleSelectCategory}
          onBack={() => setMode("choose")}
          isDark={isDark}
          insets={insets}
        />
        <SuccessModal
          visible={showSuccess}
          title={successConfig.title}
          message={successConfig.message}
          onClose={handleSuccessClose}
          surface={theme.surface}
          text={theme.text}
          subtext={theme.subtext}
          insets={insets}
        />
      </>
    );
  }

  return (
    <>
      <DetailScreen
        mode={mode as "idea" | "bug"}
        category={selectedCategory}
        onSubmit={handleSubmit}
        onBack={() => setStep("categories")}
        isDark={isDark}
        insets={insets}
      />
      <SuccessModal
        visible={showSuccess}
        title={successConfig.title}
        message={successConfig.message}
        onClose={handleSuccessClose}
        surface={theme.surface}
        text={theme.text}
        subtext={theme.subtext}
        insets={insets}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // shared header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600" },

  // page subtitle
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 20,
  },

  // category card
  catCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 20,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  catLabel: { fontSize: 15 },

  // can't find
  cantFindLabel: {
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // custom inputs
  customInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  customTextarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 32,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
  },
  charCount: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 11,
  },

  // detail textarea
  detailTextarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
    fontSize: 14,
    minHeight: 200,
    textAlignVertical: "top",
  },

  // submit button bar
  btnBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  submitBtn: {
    backgroundColor: "#4B3A99",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  // choose sheet
  chooseSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  chooseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chooseTitle: { fontSize: 16, fontWeight: "600" },
  chooseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  chooseCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chooseCardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  chooseCardSub: { fontSize: 13, lineHeight: 18 },

  // overlay
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },

  // success sheet
  successSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  successHeaderTitle: { fontSize: 16, fontWeight: "600" },
  successIconWrap: { marginBottom: 16 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4B3A99",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  successMsg: { fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 28, paddingHorizontal: 8 },
  okayBtn: {
    backgroundColor: "#4B3A99",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  okayTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
