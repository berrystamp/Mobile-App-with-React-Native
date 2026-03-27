import ProductDetailsModal from "@/components/ProductDetailsModal";
import { Message, RootStackParamList } from "@/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MOCK_OFFER } from "../../utils/mockData";
import { COLORS, RADIUS, SHADOW, SPACING } from "../../utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "DesignerMessage">;

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    senderId: "system_offer",
    text: "OFFER_CARD",
    timestamp: "2hrs ago",
    seen: true,
  },
];

export default function DesignerMessageScreen({ navigation, route }: Props) {
  const { designer, spec } = route.params;
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showProductDetails, setShowProductDetails] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = () => {
    if (!inputText.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: inputText.trim(),
      timestamp: "Just now",
      seen: false,
    };
    setMessages((prev) => [...prev, msg]);
    setInputText("");

    // Simulate designer reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: designer.id,
        text: "Hi, Good morning\nThank you for contacting Falcon prints. Let's discuss your printing preferences please",
        timestamp: "12:02 PM",
        seen: true,
      };
      setMessages((prev) => [...prev, reply]);

      // Simulate offer
      setTimeout(() => {
        const offerMsg: Message = {
          id: (Date.now() + 2).toString(),
          senderId: designer.id,
          text: "OFFER_FROM_DESIGNER",
          timestamp: "12:05 PM",
          seen: true,
        };
        setMessages((prev) => [...prev, offerMsg]);
      }, 2000);
    }, 1500);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = (msg: Message) => {
    if (msg.id === "1" && msg.senderId === "system_offer") {
      return (
        <View key={msg.id} style={styles.offerCard}>
          <Text style={styles.offerCardLabel}>Custom order offer</Text>
          <Image
            source={{ uri: MOCK_OFFER.designImage }}
            style={styles.offerImg}
            resizeMode="cover"
          />
          <Text style={styles.offerTitle}>{MOCK_OFFER.title}</Text>
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            onPress={() => setShowProductDetails(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.viewDetailsBtnText}>View Details</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (msg.text === "OFFER_FROM_DESIGNER") {
      return (
        <View key={msg.id} style={styles.designerOfferBubble}>
          <View style={styles.designerOfferHeader}>
            <Text style={styles.designerOfferIcon}>🎨</Text>
            <View style={styles.designerOfferInfo}>
              <Text style={styles.designerOfferLabel}>
                Offer from {designer.username}
              </Text>
              <Text style={styles.designerOfferDesc} numberOfLines={1}>
                Design for Fashion show on(Flier, Tshirt and ...
              </Text>
            </View>
          </View>
          <Text style={styles.designerOfferAmount}>
            ₦30,000 Due on 23/12/2022
          </Text>
          <TouchableOpacity
            style={styles.viewOrderBtn}
            onPress={() =>
              navigation.navigate("OrderDetails", {
                offer: MOCK_OFFER,
                designer,
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.viewOrderBtnText}>View order details</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const isMe = msg.senderId === "me";
    return (
      <View
        key={msg.id}
        style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}
      >
        <Text
          style={[
            styles.bubbleText,
            isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
          ]}
        >
          {msg.text}
        </Text>
        <Text
          style={[
            styles.bubbleMeta,
            isMe && { color: "rgba(255,255,255,0.6)" },
          ]}
        >
          {isMe ? `Seen • ${msg.timestamp}` : msg.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Image source={{ uri: designer.avatar }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{designer.username}</Text>
          <Text style={styles.headerTime}>2hrs ago</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: false })
          }
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.inputIcon}>
            <Text>🙂</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Write message"
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.inputIcon}>
            <Text>😄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon}>
            <Text>📎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={send}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Product Details Modal */}
      <ProductDetailsModal
        visible={showProductDetails}
        onClose={() => setShowProductDetails(false)}
        spec={spec}
        offer={MOCK_OFFER}
        onEditSpecs={() => {
          setShowProductDetails(false);
          navigation.navigate("CustomDesign");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  back: { marginRight: SPACING.md },
  backArrow: { fontSize: 22, color: COLORS.text },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.sm,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  headerTime: { fontSize: 12, color: COLORS.textSecondary },
  moreBtn: { padding: SPACING.sm },
  moreDots: { fontSize: 20, color: COLORS.textSecondary },

  messages: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  messagesContent: { padding: SPACING.lg, paddingBottom: 20 },

  offerCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  offerCardLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  offerImg: { width: "100%", height: 160 },
  offerTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  viewDetailsBtn: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  viewDetailsBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  bubble: {
    maxWidth: "75%",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: COLORS.background,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    ...SHADOW.sm,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: "#fff" },
  bubbleTextThem: { color: COLORS.text },
  bubbleMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: "right",
  },

  designerOfferBubble: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: "flex-start",
    maxWidth: "80%",
    ...SHADOW.sm,
  },
  designerOfferHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  designerOfferIcon: { fontSize: 20, marginRight: SPACING.sm },
  designerOfferInfo: { flex: 1 },
  designerOfferLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  designerOfferDesc: { fontSize: 12, color: COLORS.text },
  designerOfferAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  viewOrderBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    alignItems: "center",
  },
  viewOrderBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: SPACING.xs,
  },
  inputIcon: { padding: SPACING.xs },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendBtnIcon: { color: "#fff", fontSize: 16 },
});
