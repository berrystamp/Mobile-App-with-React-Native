import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppAlert } from "@/components/common/AppAlert";
import PrintPreferencesModal, {
  PrintPreferencesResult,
} from "@/components/PrintPreferencesModal";
import { formatNaira } from "@/lib/currency";
import { normalizeDesign, normalizeDesignListResponse } from "@/lib/designs";
import { upsertLocalConversation } from "@/lib/localConversations";
import {
  addRecentDesign,
  getCartItems,
  getRecentDesignIds,
  saveCartItems,
} from "@/lib/localStorage";
import {
  getPrintPreferences,
  savePrintPreferences,
} from "@/lib/printPreferences";
import ApiService from "@/services/apiClient";
import { isCustomerRole, useAuthStore } from "@/store/authStore";
import type { Design } from "@/types";

type CartItemType = {
  id: string;
  designId: string;
  mockId: string;
  name: string;
  price: number;
  quantity: number;
  imageSource: any;
  imageUrl?: string;
  colour: string;
  size: string;
  variantText: string;
  checked: boolean;
  designerId?: number;
  designerName?: string;
  printerId?: number;
  printingType?: string;
  budget?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  pickupAddress?: string;
  itemAvailability?: string;
  hasOwnItem?: boolean;
};

type PreferenceErrors = {
  estimatedAmount?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  hasOwnItem?: string;
  pickupAddress?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function CartScreen() {
  const router = useRouter();
  const { openPrintPrefs } = useLocalSearchParams<{
    openPrintPrefs?: string;
  }>();
  const isDark = useColorScheme() === "dark";
  const role = useAuthStore((state) => state.role);
  const { show: showAlert, element: alertElement } = useAppAlert();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [cartTab, setCartTab] = useState<"designated" | "select">("designated");
  const [recentDesigns, setRecentDesigns] = useState<Design[]>([]);
  const [isPrefModalVisible, setPrefModalVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [hasOwnItem, setHasOwnItem] = useState<boolean | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [prefErrors, setPrefErrors] = useState<PreferenceErrors>({});
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    if (!isCustomerRole(role)) {
      router.replace("/manage-order");
      return;
    }

    const fetchCartData = async () => {
      setIsLoading(true);
      try {
        const [response, recentIds, storedPreferences] = await Promise.all([
          ApiService.getCartItems(),
          getRecentDesignIds(),
          getPrintPreferences(),
        ]);

        setEstimatedAmount(storedPreferences.estimatedAmount);
        setDeliveryDate(storedPreferences.deliveryDate);
        setDeliveryAddress(storedPreferences.deliveryAddress);
        setPickupAddress(storedPreferences.pickupAddress);
        setHasOwnItem(
          typeof storedPreferences.hasOwnItem === "boolean"
            ? storedPreferences.hasOwnItem
            : null,
        );

        const data = response?.responseBody || response?.data || response || [];
        const list = Array.isArray(data) ? data : [];

        const formattedItems = await Promise.all(
          list.map(async (item: any) => {
            const variants = [];
            if (item.size) variants.push(item.size);
            if (item.colour) variants.push(item.colour);

            let designerName = "Unknown artist";
            try {
              const designIdToFetch = item.designId || item.design?.id;
              if (designIdToFetch) {
                const designer = await ApiService.getDesigner(designIdToFetch);
                designerName =
                  designer?.responseBody?.designer.userName || designerName;
              }
            } catch (err) {
              console.warn("Failed to fetch designer for item", item.id, err);
            }

            return {
              id: String(item.id),
              designId: String(item.designId || item.design?.id),
              mockId: String(item.mock?.id || ""),
              name:
                item.design?.title ||
                item.design?.name ||
                item.mock?.name ||
                "Custom Design",
              price: Number(
                item.amount || item.mock?.price || item.design?.amount || 0,
              ),
              quantity: Number(item.quantity || 1),
              colour: item.colour || "",
              size: item.size || "",
              variantText: variants.join(", ") || "No specification",
              imageSource: item.mock?.image?.url
                ? { uri: item.mock.image.url }
                : item.design?.imageUrlFront
                  ? { uri: item.design.imageUrlFront }
                  : require("@/assets/images/item1.png"),
              imageUrl:
                item.mock?.image?.url ||
                item.design?.imageUrlFront ||
                item.design?.imagePath ||
                "",
              checked: true,
              designerId: item.design?.profile?.id || item.design?.designer?.id,
              designerName: designerName,
              printerId: item.printerId || item.printer?.id,
              printingType: item.printingType || item.printType || "",
              budget: item.budget || "",
              deliveryDate: item.deliveryDate || "",
              deliveryAddress: item.deliveryAddress || "",
              pickupAddress: item.pickupAddress || "",
              itemAvailability: item.itemAvailability || "",
              hasOwnItem:
                typeof item.hasOwnItem === "boolean"
                  ? item.hasOwnItem
                  : undefined,
            } satisfies CartItemType;
          }),
        );

        await saveCartItems(formattedItems);
        setCartItems(formattedItems);

        if (recentIds.length > 0) {
          const recentResponses = await Promise.allSettled(
            recentIds
              .slice(0, 4)
              .map((designId) => ApiService.fetchDesignById(designId)),
          );
          const nextRecentDesigns = recentResponses
            .filter(
              (result): result is PromiseFulfilledResult<any> =>
                result.status === "fulfilled",
            )
            .map((result) =>
              normalizeDesign(result.value?.responseBody || result.value),
            )
            .filter((design) => Boolean(design?.id));
          setRecentDesigns(nextRecentDesigns);
        } else {
          const recentResponse = await ApiService.getRecentDesigns(4);
          setRecentDesigns(
            normalizeDesignListResponse(recentResponse).slice(0, 4),
          );
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        const cachedItems = await getCartItems();
        setCartItems(cachedItems.length > 0 ? cachedItems : []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [role, router]);

  useEffect(() => {
    if (!isLoading) void saveCartItems(cartItems);
  }, [cartItems, isLoading]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading && openPrintPrefs === "1" && cartItems.length > 0) {
        setShowPrintModal(true);
        router.setParams({ openPrintPrefs: undefined });
      }
    }, [cartItems.length, isLoading, openPrintPrefs, router]),
  );

  const designCost = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          item.checked &&
          (cartTab === "designated" ? Boolean(item.printerId) : !item.printerId)
            ? sum + item.price * item.quantity
            : sum,
        0,
      ),
    [cartItems, cartTab],
  );

  const selectedItems = useMemo(
    () =>
      cartItems.filter(
        (item) =>
          item.checked &&
          (cartTab === "designated" ? item.printerId : !item.printerId),
      ),
    [cartItems, cartTab],
  );

  const visibleCartItems = useMemo(
    () =>
      cartItems.filter((item) =>
        cartTab === "designated" ? Boolean(item.printerId) : !item.printerId,
      ),
    [cartItems, cartTab],
  );

  // Counts per tab (for tab badges)
  const lockedCount = useMemo(
    () => cartItems.filter((i) => Boolean(i.printerId)).length,
    [cartItems],
  );
  const openCount = useMemo(
    () => cartItems.filter((i) => !i.printerId).length,
    [cartItems],
  );

  const handleQuantityChange = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const handleCheckboxChange = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const removeItem = async (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedItems);
    await saveCartItems(updatedItems);
    try {
      await ApiService.removeFromCart(id);
    } catch (err) {
      console.error("Failed to remove item from backend:", err);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      setDeliveryDate(selectedDate.toISOString().split("T")[0]);
      setShowDatePicker(false);
    }
  };

  const validatePreferences = (): boolean => {
    const errors: PreferenceErrors = {};
    if (!estimatedAmount?.trim()) errors.estimatedAmount = "Budget is required";
    if (!deliveryDate?.trim()) errors.deliveryDate = "Delivery date is required";
    if (!deliveryAddress?.trim())
      errors.deliveryAddress = "Delivery address is required";
    if (hasOwnItem === null) errors.hasOwnItem = "Please select an option";
    if (hasOwnItem && !pickupAddress?.trim())
      errors.pickupAddress = "Pickup address is required";
    setPrefErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = async () => {
    if (!validatePreferences()) return;
    await savePrintPreferences({
      estimatedAmount,
      deliveryDate,
      deliveryAddress,
      pickupAddress,
      hasOwnItem: hasOwnItem ?? false,
    });
    setPrefModalVisible(false);
  };

  const handlePrintNow = () => {
    if (selectedItems.length === 0) {
      showAlert({
        type: "warning",
        title: "No items selected",
        message: "Please select at least one item to print.",
      });
      return;
    }
    setShowPrintModal(true);
  };

  const handlePrintPreferencesContinue = (result: PrintPreferencesResult) => {
    setShowPrintModal(false);
    const printCartItems = selectedItems.map((item) => ({
      id: item.id,
      designId: Number(item.designId),
      mockId: Number(item.mockId),
      name: item.name,
      colour: item.colour,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      imageUrl: item.imageUrl || "",
      variantText: item.variantText,
      designerName: item.designerName,
    }));
    router.push({
      pathname: "/(tabs)/select-printer",
      params: {
        cartItems: JSON.stringify(printCartItems),
        dateOfDelivery: result.dateOfDelivery,
        deliveryAddress: JSON.stringify(result.deliveryAddress),
        hasOwnItem: String(result.hasOwnItem),
        ...(result.pickupAddress
          ? { pickupAddress: JSON.stringify(result.pickupAddress) }
          : {}),
      },
    });
  };

  const sendOrderToDesigners = async () => {
    setConfirmVisible(false);
    if (selectedItems.length === 0) {
      showAlert({
        type: "error",
        title: "No items selected",
        message: "Please select at least one item to send",
      });
      return;
    }

    try {
      const designerIds = new Set(
        selectedItems.map((item) => item.designerId).filter((id) => Boolean(id)),
      );

      for (const designerId of designerIds) {
        const designerItems = selectedItems.filter(
          (item) => item.designerId === designerId,
        );

        const initialMessages = [
          {
            id: `order-${designerId}-${Date.now()}`,
            type: "bundle" as const,
            text: "[Order request]",
            previewText: "[Order request]",
            author: "me" as const,
            createdAt: new Date().toISOString(),
            status: "sent" as const,
            bundle: {
              title: "Order request",
              productCount: designerItems.length,
              footerLabel:
                designerItems.length > 1
                  ? "View all product details"
                  : "View product details",
              items: designerItems.map((item) => ({
                id: item.id,
                imageUrl: item.imageUrl,
                name: item.name,
                title: item.name,
                price: item.price,
                quantity: item.quantity,
                colour: item.colour,
                color: item.colour,
                size: item.size,
                variantText: item.variantText,
                budget: estimatedAmount,
                deliveryDate,
                deliveryAddress,
                pickupAddress,
                hasOwnItem: hasOwnItem ?? undefined,
              })),
            },
          },
        ];

        await upsertLocalConversation({
          participantId: designerId,
          name: designerItems[0]?.designerName || "Designer",
          role: "Designer",
          initialMessages,
        });
      }

      await Promise.allSettled(
        selectedItems.map((item) =>
          ApiService.deleteCartItem(String(item.id)).catch(() => {}),
        ),
      );

      const orderedIds = new Set(selectedItems.map((i) => i.id));
      const remainingItems = cartItems.filter((i) => !orderedIds.has(i.id));
      await saveCartItems(remainingItems);
      setCartItems(remainingItems);

      showAlert({
        type: "success",
        title: "Order sent successfully",
        message:
          "Your order has been sent to the designer(s). They will review and get back to you.",
      });

      setTimeout(() => router.replace("/"), 2000);
    } catch (error) {
      showAlert({
        type: "error",
        title: "Failed to send order",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while sending your order",
      });
    }
  };

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#F9FAFB" }}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#3B2D85" />
        </View>
      </SafeAreaView>
    );
  }

  const totalItemCount = cartItems.length;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#F9FAFB" }}>
      {/* ================= HEADER ================= */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2C2C2E" : "#E8E8EC",
        }}
      >
        {/* Top row: back + title + clear */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? "#2C2C2E" : "#F2F2F5",
            }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#FFFFFF" : "#1C1C1E"}
            />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: isDark ? "#FFFFFF" : "#1C1C1E",
                letterSpacing: 0.3,
              }}
            >
              Cart
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: isDark ? "#8A8790" : "#8A8790",
                marginTop: 2,
              }}
            >
              {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
            </Text>
          </View>

          <TouchableOpacity
            disabled={totalItemCount === 0}
            onPress={async () => {
              try {
                await ApiService.clearCart();
                setCartItems([]);
                await saveCartItems([]);
              } catch {
                showAlert({
                  type: "error",
                  title: "Unable to clear cart",
                  message: "Please try again.",
                });
              }
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              opacity: totalItemCount === 0 ? 0.35 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#EB5757",
              }}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>

        {/* Segmented tabs */}
        {totalItemCount > 0 && (
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 20,
              paddingBottom: 12,
              gap: 8,
            }}
          >
            {(
              [
                { key: "designated", label: "Locked Printing", count: lockedCount },
                { key: "select", label: "Open Printing", count: openCount },
              ] as const
            ).map(({ key, label, count }) => {
              const active = cartTab === key;
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.8}
                  onPress={() => setCartTab(key)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 6,
                    backgroundColor: active
                      ? "#3B2D85"
                      : isDark
                        ? "#2C2C2E"
                        : "#F2F2F5",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: active ? "#FFFFFF" : isDark ? "#D0D0D0" : "#555",
                    }}
                  >
                    {label}
                  </Text>
                  {count > 0 && (
                    <View
                      style={{
                        minWidth: 18,
                        height: 18,
                        paddingHorizontal: 5,
                        borderRadius: 9,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: active
                          ? "rgba(255,255,255,0.25)"
                          : isDark
                            ? "#3A3A3C"
                            : "#E0E0E5",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: active
                            ? "#FFFFFF"
                            : isDark
                              ? "#D0D0D0"
                              : "#555",
                        }}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: cartItems.length > 0 ? 220 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty cart (no items at all) */}
        {totalItemCount === 0 && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: isDark ? "#2C2C2E" : "#F2F2F5",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons
                name="cart-outline"
                size={44}
                color={isDark ? "#555" : "#BDBDBD"}
              />
            </View>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: isDark ? "#FFFFFF" : "#1C1C1E",
                marginBottom: 6,
              }}
            >
              Your cart is empty
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#8A8790" : "#8A8790",
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              Looks like you haven't added anything yet. Explore designs to get
              started.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={{
                backgroundColor: "#3B2D85",
                paddingHorizontal: 24,
                paddingVertical: 13,
                borderRadius: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                Explore designs
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state for a specific tab */}
        {totalItemCount > 0 && visibleCartItems.length === 0 && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 50,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: isDark ? "#2C2C2E" : "#F2F2F5",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons
                name={
                  cartTab === "designated"
                    ? "lock-closed-outline"
                    : "lock-open-outline"
                }
                size={36}
                color={isDark ? "#555" : "#BDBDBD"}
              />
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: isDark ? "#FFFFFF" : "#1C1C1E",
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              No {cartTab === "designated" ? "locked" : "open"} printing items
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#8A8790" : "#8A8790",
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 20,
              }}
            >
              {cartTab === "designated"
                ? "Items assigned to a specific printer will appear here."
                : "Items that still need a printer will appear here."}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setCartTab(cartTab === "designated" ? "select" : "designated")
              }
              style={{
                paddingHorizontal: 20,
                paddingVertical: 11,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: "#3B2D85",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#3B2D85",
                }}
              >
                View {cartTab === "designated" ? "open" : "locked"} printing
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cart items */}
        {visibleCartItems.map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 14,
              padding: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: isDark ? "#2C2C2E" : "#EEE",
            }}
          >
            <TouchableOpacity
              onPress={() => handleCheckboxChange(item.id)}
              style={{ marginRight: 10 }}
            >
              {item.checked ? (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: "#3B2D85",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: isDark ? "#555" : "#BDBDBD",
                  }}
                />
              )}
            </TouchableOpacity>

            <Image
              source={item.imageSource}
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                backgroundColor: isDark ? "#2C2C2E" : "#F2F2F5",
              }}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDark ? "#FFFFFF" : "#1C1C1E",
                }}
              >
                {item.name}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  color: isDark ? "#8A8790" : "#8A8790",
                  marginTop: 2,
                }}
              >
                {item.designerName}
              </Text>
              {item.variantText && item.variantText !== "No specification" && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 11,
                    color: isDark ? "#A6A1B1" : "#666",
                    marginTop: 3,
                  }}
                >
                  {item.variantText}
                </Text>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#3B2D85",
                  }}
                >
                  {formatNaira(item.price)}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(item.id, -1)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isDark ? "#2C2C2E" : "#F2F2F5",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: isDark ? "#FFFFFF" : "#333",
                        fontSize: 14,
                      }}
                    >
                      −
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      width: 20,
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: "700",
                      color: isDark ? "#FFFFFF" : "#1C1C1E",
                    }}
                  >
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(item.id, 1)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isDark ? "#2C2C2E" : "#F2F2F5",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: isDark ? "#FFFFFF" : "#333",
                        fontSize: 14,
                      }}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              style={{ paddingLeft: 8, paddingVertical: 4 }}
            >
              <Ionicons name="trash-outline" size={18} color="#EB5757" />
            </TouchableOpacity>
          </View>
        ))}

        {/* ========== EXPLORE RECENT DESIGNS ========== */}
        {recentDesigns.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: isDark ? "#FFFFFF" : "#1C1C1E",
                }}
              >
                Explore recent designs
              </Text>
              <TouchableOpacity onPress={() => router.push("/")}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#3B2D85",
                  }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {recentDesigns.map((design) => {
                const imageUri = design.imagePath?.startsWith("http")
                  ? design.imagePath
                  : design.imagePath
                    ? `https://backend-prod-api.berrystamp.com/${design.imagePath}`
                    : "";
                const artistName =
                  `${design.profile.firstName} ${design.profile.lastName}`.trim() ||
                  design.profile.username;
                const mockPrices = design.mocks
                  .map((mock) => mock.price)
                  .filter((price) => price > 0);
                const lowestPrice =
                  mockPrices.length > 0
                    ? Math.min(...mockPrices)
                    : design.amount || 0;

                return (
                  <TouchableOpacity
                    key={design.id}
                    activeOpacity={0.85}
                    style={{
                      width: CARD_WIDTH,
                      marginBottom: 16,
                    }}
                    onPress={async () => {
                      await addRecentDesign(design.id);
                      router.push({
                        pathname: "/products",
                        params: { designId: String(design.id) },
                      });
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: CARD_WIDTH * 1.05,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: isDark ? "#1E1E1E" : "#F2F2F5",
                        marginBottom: 8,
                      }}
                    >
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons
                            name="image-outline"
                            size={28}
                            color={isDark ? "#555" : "#CCC"}
                          />
                        </View>
                      )}

                      {/* Heart badge */}
                      <TouchableOpacity
                        onPress={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.45)",
                        }}
                      >
                        <Ionicons
                          name={design.liked ? "heart" : "heart-outline"}
                          size={14}
                          color={design.liked ? "#FF3B30" : "#FFFFFF"}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isDark ? "#FFFFFF" : "#1C1C1E",
                        marginBottom: 2,
                      }}
                    >
                      {design.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 11,
                        color: isDark ? "#8A8790" : "#8A8790",
                        marginBottom: 4,
                      }}
                    >
                      By {artistName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isDark ? "#FFFFFF" : "#1C1C1E",
                      }}
                    >
                      {formatNaira(lowestPrice)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================= BOTTOM BAR ================= */}
      {totalItemCount > 0 && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2C2C2E" : "#E8E8EC",
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#A6A1B1" : "#6B6875",
              }}
            >
              Design cost
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: isDark ? "#FFFFFF" : "#1C1C1E",
              }}
            >
              {formatNaira(designCost)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePrintNow}
            disabled={selectedItems.length === 0}
            style={{
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 26,
              paddingVertical: 15,
              backgroundColor:
                selectedItems.length === 0 ? "#C7C7CC" : "#3B2D85",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              Print Now ({selectedItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <PrintPreferencesModal
        visible={isPrefModalVisible}
        onClose={() => setPrefModalVisible(false)}
        onContinue={() => setPrefModalVisible(false)}
      />

      <Modal
        animationType="slide"
        transparent
        visible={isConfirmVisible}
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              paddingBottom: Platform.OS === "ios" ? 40 : 24,
              width: "100%",
              alignItems: "center",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              paddingHorizontal: 24,
              paddingTop: 24,
            }}
          >
            <View
              style={{
                position: "relative",
                marginBottom: 32,
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: isDark ? "#FFFFFF" : "#1C1C1E",
                }}
              >
                Send to Designer
              </Text>
              <TouchableOpacity
                onPress={() => setConfirmVisible(false)}
                style={{ position: "absolute", right: 0 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#FFF" : "#333"}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                marginBottom: 24,
                width: 112,
                height: 112,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("@/assets/images/printer-icon.png")}
                resizeMode="contain"
                style={{
                  width: "100%",
                  height: "100%",
                  tintColor: isDark ? "#A0A0A0" : "#BDBDBD",
                }}
              />
            </View>

            <Text
              style={{
                marginBottom: 32,
                paddingHorizontal: 16,
                textAlign: "center",
                fontSize: 14,
                lineHeight: 22,
                color: isDark ? "#A6A1B1" : "#6B6875",
              }}
            >
              Your selected order and preferences will be sent to the designer.
              The designer can then confirm the quantity with you and continue
              production with a printer.
            </Text>

            <TouchableOpacity
              onPress={sendOrderToDesigners}
              style={{
                marginBottom: 16,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 26,
                backgroundColor: "#3B2D85",
                paddingVertical: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                Send to Designer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {alertElement}

      <PrintPreferencesModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onContinue={handlePrintPreferencesContinue}
      />
    </View>
  );
}