import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // ✅ Added this import

import { useAppAlert } from "@/components/common/AppAlert";
import PrintPreferencesModal, {
    PrintPreferencesResult,
} from "@/components/PrintPreferencesModal";
import { formatNaira } from "@/lib/currency";
import { normalizeDesign, normalizeDesignListResponse } from "@/lib/designs";
import { upsertLocalConversation } from "@/lib/localConversations";
import {
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

export default function CartScreen() {
  const router = useRouter();
  const { openPrintPrefs } = useLocalSearchParams<{
    openPrintPrefs?: string;
  }>();
  const isDark = useColorScheme() === "dark";
  const { height: screenHeight } = useWindowDimensions();
  const role = useAuthStore((state) => state.role);
  const { show: showAlert, element: alertElement } = useAppAlert();

  // ✅ Get safe area insets to calculate bottom nav spacing dynamically
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
  // Print Now flow – separate from "Send to Designer"
  const [showPrintModal, setShowPrintModal] = useState(false);

  // ✅ MAIN FETCH EFFECT - Fetches from API and saves to localStorage
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

        // ✅ FIX: Wrapped map inside Promise.all so we wait for all API calls to resolve
        const formattedItems = await Promise.all(
          list.map(async (item: any) => {
            const variants = [];
            if (item.size) variants.push(item.size);
            if (item.colour) variants.push(item.colour);

            // ✅ FIX: Safely fetch the designer and handle potential undefined errors
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

        // ✅ NEW: Save to local storage for persistence
        await saveCartItems(formattedItems);

        // Now safely set state with resolved data
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
        // ✅ NEW: If API fails, try to use cached items
        const cachedItems = await getCartItems();
        if (cachedItems.length > 0) {
          setCartItems(cachedItems);
        } else {
          setCartItems([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [role, router]);

  // Keep the local cache in sync, including when the last item is removed.
  useEffect(() => {
    saveCartItems(cartItems);
  }, [cartItems]);

  useEffect(() => {
    if (!isLoading && openPrintPrefs === "1" && cartItems.length > 0) {
      setPrefModalVisible(true);
    }
  }, [cartItems.length, isLoading, openPrintPrefs]);

  const designCost = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => (item.checked ? sum + item.price * item.quantity : sum),
        0,
      ),
    [cartItems],
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
    // ✅ NEW: Save to localStorage
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

    if (!estimatedAmount?.trim()) {
      errors.estimatedAmount = "Budget is required";
    }

    if (!deliveryDate?.trim()) {
      errors.deliveryDate = "Delivery date is required";
    }

    if (!deliveryAddress?.trim()) {
      errors.deliveryAddress = "Delivery address is required";
    }

    if (hasOwnItem === null) {
      errors.hasOwnItem = "Please select an option";
    }

    if (hasOwnItem && !pickupAddress?.trim()) {
      errors.pickupAddress = "Pickup address is required";
    }

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
        estimatedAmount: result.estimatedAmount,
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
      const orderData = {
        items: selectedItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          designId: item.designId,
          mockId: item.mockId,
          colour: item.colour,
          size: item.size,
          price: item.price,
        })),
        preferences: {
          estimatedAmount,
          deliveryDate,
          deliveryAddress,
          pickupAddress,
          hasOwnItem,
        },
      };

      // Send to each unique designer
      const designerIds = new Set(
        selectedItems
          .map((item) => item.designerId)
          .filter((id) => Boolean(id)),
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

      // Remove only the ordered (selected) items from backend and local cart
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

      setTimeout(() => {
        router.replace("/");
      }, 2000);
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

  if (isLoading) {
    return (
      // ✅ Using SafeAreaView for loading screen
      <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B2D85" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    // ✅ Replaced main container View with SafeAreaView
    <SafeAreaView className="flex-1 bg-[#F8F8FB] dark:bg-[#121212]">
      <View className="flex-row items-center justify-between border-b border-[#E8E8EC] bg-white px-4 pt-14 pb-4 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]">
        <Text className="text-lg font-bold text-[#1C1C1E] dark:text-white">
          Shopping Cart
        </Text>
        <Text className="text-[13px] text-[#828282]">
          {visibleCartItems.length} item
          {visibleCartItems.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {cartItems.length > 0 && (
        <View className="flex-row border-b border-[#E8E8EC] bg-white px-4 pt-2 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]">
          {(
            [
              ["designated", "Locked Printing"],
              ["select", "Open Printing"],
            ] as const
          ).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setCartTab(key)}
              className={`mr-5 border-b-2 pb-3 ${cartTab === key ? "border-[#3B2D85]" : "border-transparent"}`}
            >
              <Text
                className={`text-[13px] font-semibold ${cartTab === key ? "text-[#3B2D85]" : "text-[#828282]"}`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {cartItems.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="bg-white dark:bg-[#121212]"
        >
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons
              name="cart-outline"
              size={56}
              color={isDark ? "#444" : "#CCC"}
            />
            <Text className="mt-4 text-center text-[15px] text-[#828282] dark:text-gray-400">
              Your cart is empty
            </Text>
            <Text className="mt-2 text-center text-[13px] text-[#BDBDBD] dark:text-gray-500">
              Start adding items to your order
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/")}
              className="mt-6 items-center rounded-full bg-[#3B2D85] px-6 py-3"
            >
              <Text className="text-sm font-semibold text-white">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View className="bg-white p-4 dark:bg-[#1C1C1E]">
              {visibleCartItems.map((item) => (
                <View
                  key={item.id}
                  className="mb-4 overflow-hidden rounded-lg border border-[#E8E8EC] bg-white dark:border-[#2C2C2E] dark:bg-[#121212]"
                >
                  <View className="flex-row gap-3 p-3">
                    <TouchableOpacity
                      onPress={() => handleCheckboxChange(item.id)}
                      className={`h-5 w-5 items-center justify-center rounded border-2 ${item.checked ? "border-[#3B2D85] bg-[#3B2D85]" : "border-[#D0D0D0]"}`}
                    >
                      {item.checked && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>

                    <Image
                      source={item.imageSource}
                      style={{ width: 80, height: 80 }}
                      className="rounded"
                    />

                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-semibold text-[#1C1C1E] dark:text-white"
                      >
                        {item.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-xs text-[#828282]"
                      >
                        {item.designerName}
                      </Text>
                      <Text className="mt-1 text-xs text-[#666] dark:text-gray-400">
                        {item.variantText}
                      </Text>
                      <View className="mt-2 flex-row items-center justify-between">
                        <Text className="font-semibold text-[#3B2D85]">
                          {formatNaira(item.price)}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, -1)}
                            className="h-6 w-6 items-center justify-center rounded bg-[#F0F0F0] dark:bg-[#2C2C2E]"
                          >
                            <Text className="font-bold text-[#333] dark:text-white">
                              −
                            </Text>
                          </TouchableOpacity>
                          <Text className="w-6 text-center font-semibold text-[#1C1C1E] dark:text-white">
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, 1)}
                            className="h-6 w-6 items-center justify-center rounded bg-[#F0F0F0] dark:bg-[#2C2C2E]"
                          >
                            <Text className="font-bold text-[#333] dark:text-white">
                              +
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      className="h-6 w-6 items-center justify-center"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#EB5757"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* ✅ Added dynamic paddingBottom based on the device insets and average bottom tab bar height (65px) */}
          <View
            className="border-t border-[#E8E8EC] bg-white px-4 pt-4 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 65 }}
          >
            <View className="mb-4 flex-row justify-between">
              <Text className="text-[15px] text-[#828282]">Design Cost:</Text>
              <Text className="font-semibold text-[#1C1C1E] dark:text-white">
                {formatNaira(designCost)}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handlePrintNow}
                disabled={selectedItems.length === 0}
                className={`flex-1 items-center rounded-full py-4 ${
                  selectedItems.length === 0 ? "bg-gray-300" : "bg-[#4A3298]"
                }`}
              >
                <Text className="text-sm font-bold text-white">
                  Print Now ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

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
            style={{ paddingBottom: Platform.OS === "ios" ? 40 : 24 }}
            className="w-full items-center rounded-t-[32px] bg-white px-6 pt-6 dark:bg-[#1E1E1E]"
          >
            <View className="relative mb-8 w-full flex-row items-center justify-center">
              <Text className="mx-auto text-lg font-semibold text-[#333333] dark:text-white">
                Send to Designer
              </Text>
              <TouchableOpacity
                onPress={() => setConfirmVisible(false)}
                className="absolute right-0"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#FFF" : "#333"}
                />
              </TouchableOpacity>
            </View>

            <View className="mb-6 h-28 w-28 items-center justify-center">
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

            <Text className="mb-10 px-4 text-center text-[15px] leading-6 text-[#828282] dark:text-gray-400">
              Your selected order and preferences will be sent to the designer.
              The designer can then confirm the quantity with you and continue
              production with a printer.
            </Text>

            <TouchableOpacity
              onPress={sendOrderToDesigners}
              className="mb-4 w-full items-center justify-center rounded-full bg-[#3B2D85] py-4"
            >
              <Text className="w-full text-center text-base font-bold text-white">
                Send to Designer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {alertElement}
      {/* Print Now flow – PrintPreferencesModal */}
      <PrintPreferencesModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onContinue={handlePrintPreferencesContinue}
      />
    </SafeAreaView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="absolute left-3 top-[-8px] z-10 bg-white px-1 text-xs text-[#333333] dark:bg-[#1E1E1E] dark:text-white">
        {label}
      </Text>
      {children}
    </View>
  );
}

function ChoiceRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 flex-row items-start gap-x-3"
    >
      <View
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? "border-[#3B2D85]" : "border-gray-300"
        }`}
      >
        {selected ? (
          <View className="h-2.5 w-2.5 rounded-full bg-[#3B2D85]" />
        ) : null}
      </View>
      <Text className="flex-1 text-sm leading-5 text-[#828282] dark:text-gray-300">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ErrorText({ message }: { message: string }) {
  return (
    <Text className="mt-2 text-xs font-medium text-[#EB5757]">{message}</Text>
  );
}
