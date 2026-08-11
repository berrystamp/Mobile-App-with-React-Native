import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { decodeDraft, encodeDraft } from "@/lib/customDesign";
import { upsertLocalConversation } from "@/lib/localConversations";
import ApiService from "@/services/apiClient";

interface PrinterCard {
  id: number;
  name: string;
  avatar: string;
  cover: string;
  role: string;
  jobs: number;
  rating: string;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400";

const toAbsolutePath = (path?: string) => {
  if (!path) return fallbackImage;
  if (path.startsWith("http")) return path;
  return `https://backend-prod-api.berrystamp.com/${path.replace(/^\/+/, "")}`;
};

export default function SelectPrinterScreen() {
  const router = useRouter();
  const { draft, cartItems: cartItemsParam } = useLocalSearchParams<{
    draft?: string;
    cartItems?: string;
  }>();
  const parsed = useMemo(() => decodeDraft(draft), [draft]);

  // Parse cartItems passed from Print Now (products) or from cart print flow
  const cartItems = useMemo(() => {
    if (!cartItemsParam) return [];
    try {
      return JSON.parse(cartItemsParam);
    } catch {
      return [];
    }
  }, [cartItemsParam]);

  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [printers, setPrinters] = useState<PrinterCard[]>([]);

   const loadPrinters = useCallback(async () => {
    try {
      setLoading(true);
      
      // ✅ FIX: Try multiple endpoints and handle various response formats
      let printers: PrinterCard[] = [];
      let lastError: any = null;
 
      try {
        const response = await ApiService.getPrinters(0, 60);
        
        // ✅ FIX: Handle multiple possible response structures
        let content: any[] = [];
        
        if (response?.responseBody?.content) {
          content = response.responseBody.content;
        } else if (response?.content && Array.isArray(response.content)) {
          content = response.content;
        } else if (response?.responseBody && Array.isArray(response.responseBody)) {
          content = response.responseBody;
        } else if (Array.isArray(response)) {
          content = response;
        } else if (response && typeof response === 'object') {
          // If response is a single object, wrap it in an array
          content = [response];
        }
 
        // Filter out empty/null items
        const validContent = Array.isArray(content) 
          ? content.filter((item: any) => item && item.id) 
          : [];
 
        if (validContent.length > 0) {
          printers = validContent.map((item: any) => ({
            id: Number(item.id),
            name:
              `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
              item.username ||
              item.userName ||
              item.name ||
              item.displayName ||
              "Printer",
            avatar: toAbsolutePath(
              item.profilePicturePath || 
              item.avatar || 
              item.profileImage?.url ||
              item.profileImage?.thumbnailUrl ||
              item.thumbnail
            ),
            cover: toAbsolutePath(
              item.coverPhotoPath ||
              item.banner ||
              item.bannerImage?.url ||
              item.coverImage?.url ||
              item.profilePicturePath,
            ),
            role: item.bio || item.specialty || item.description || "Professional Printer",
            jobs: Number(
              item.totalJobs || 
              item.completedJobs || 
              item.totalDesigns || 
              item.jobsCompleted ||
              0,
            ),
            rating: item.rating 
              ? String(item.rating).length > 3 
                ? item.rating.toFixed(1)
                : String(item.rating)
              : "4.5",
          }));
        }
      } catch (apiError) {
        console.warn("First attempt to fetch printers failed:", apiError);
        lastError = apiError;
      }
 
      // ✅ FIX: If no printers found, show helpful message instead of just empty
      if (printers.length === 0) {
        console.warn("No printers returned from API. Last error:", lastError);
        setPrinters([]);
      } else {
        setPrinters(printers);
      }
    } catch (error) {
      console.error("Unable to fetch printers", error);
      setPrinters([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  const handleMessage = async (printer: PrinterCard) => {
    setSendingId(printer.id);
    try {
      // Build bundle message from cartItems if available, otherwise plain text
      const initialMessages =
        cartItems.length > 0
          ? [
              {
                id: `print-req-${printer.id}-${Date.now()}`,
                type: "bundle" as const,
                text: "[Print request]",
                previewText: "[Print request]",
                author: "me" as const,
                createdAt: new Date().toISOString(),
                status: "sent" as const,
                bundle: {
                  title: "Print request",
                  productCount: cartItems.length,
                  footerLabel:
                    cartItems.length > 1
                      ? "View all product details"
                      : "View product details",
                  items: cartItems.map((item: any, index: number) => ({
                    id: item.id,
                    imageUrl: item.imageUrl,
                    overlayText:
                      index === 3 && cartItems.length > 4
                        ? `+${cartItems.length - 3} Items`
                        : undefined,
                    name: item.name,
                    title: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    colour: item.colour,
                    color: item.colour,
                    size: item.size,
                    variantText: item.variantText,
                    budget: item.budget,
                    deliveryDate: item.deliveryDate,
                    deliveryAddress: item.deliveryAddress,
                    pickupAddress: item.pickupAddress,
                    hasOwnItem: item.hasOwnItem,
                  })),
                },
              },
            ]
          : [
              {
                id: `print-req-${printer.id}-${Date.now()}`,
                type: "text" as const,
                text: "Hi, I'd like to request printing services.",
                previewText: "Hi, I'd like to request printing services.",
                author: "me" as const,
                createdAt: new Date().toISOString(),
                status: "sent" as const,
              },
            ];

      await upsertLocalConversation({
        participantId: printer.id,
        name: printer.name,
        role: "Printers",
        initialMessages,
      });

      router.push({
        pathname: "/(tabs)/chat",
        params: {
          participantId: String(printer.id),
          participantName: printer.name,
          participantRole: "Printers",
        },
      });
    } catch (err) {
      console.error("[SelectPrinter] Failed to start conversation:", err);
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading printers..." />;
  }

  const encodedDraft = encodeDraft(
    parsed || { designFor: "", designTheme: "", items: [] },
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#252039" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Printer</Text>
        <TouchableOpacity onPress={loadPrinters}>
          <Ionicons name="refresh-outline" size={22} color="#252039" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Select and message a printer of your choice for printing preferences and
        cost negotiation
      </Text>

      <FlatList
        data={printers}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.cover }} style={styles.cover} />
            <View style={styles.avatarWrap}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            </View>

            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {item.role}
            </Text>
            <Text style={styles.stats}>
              {item.jobs} jobs | ★ {item.rating}
            </Text>

            <TouchableOpacity
              style={[
                styles.messageButton,
                sendingId === item.id && { opacity: 0.6 },
              ]}
              disabled={sendingId === item.id}
              onPress={() => handleMessage(item)}
            >
              <Text style={styles.messageButtonText}>
                {sendingId === item.id ? "Sending…" : "Message"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No printers available right now.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F7FA" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 30, fontWeight: "600", color: "#252039" },
  subtitle: {
    paddingHorizontal: 20,
    color: "#736E80",
    fontSize: 15,
    marginBottom: 8,
  },
  grid: { paddingHorizontal: 12, paddingBottom: 24 },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE8F3",
    overflow: "hidden",
    alignItems: "center",
    paddingBottom: 14,
  },
  cover: { width: "100%", height: 62 },
  avatarWrap: {
    marginTop: -24,
    borderRadius: 24,
    padding: 2,
    backgroundColor: "#FFFFFF",
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { marginTop: 8, fontSize: 16, fontWeight: "600", color: "#2A2537" },
  role: { marginTop: 2, fontSize: 13, color: "#8A8598" },
  stats: { marginTop: 6, fontSize: 12, color: "#928BA2" },
  messageButton: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#3C2D90",
    paddingVertical: 7,
    paddingHorizontal: 22,
  },
  messageButtonText: { color: "#3C2D90", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 40, fontSize: 15, color: "#888193" },
});
