import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";

import { useAppAlert } from "@/components/common/AppAlert";
import { formatNaira } from "@/lib/currency";
import { normalizeDesign, normalizeDesignListResponse } from "@/lib/designs";
import { upsertLocalConversation } from "@/lib/localConversations";
import { clearCartItems, getCartItems, getRecentDesignIds, saveCartItems } from "@/lib/localStorage";
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

  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
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
              printingType: item.printingType || item.printType || "",
              budget: item.budget || "",
              deliveryDate: item.deliveryDate || "",
              deliveryAddress: item.deliveryAddress || "",
              pickupAddress: item.pickupAddress || "",
              itemAvailability: item.itemAvailability || "",
              hasOwnItem: typeof item.hasOwnItem === "boolean" ? item.hasOwnItem : undefined,
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

  // ✅ NEW: Persist cart items whenever they change
  useEffect(() => {
    if (cartItems.length > 0) {
      saveCartItems(cartItems);
    }
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
    () => cartItems.filter((item) => item.checked),
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

      // ✅ NEW: Clear cart after successful order submission
      await clearCartItems();
      setCartItems([]);

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
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#3B2D85" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F8FB] dark:bg-[#121212]">
      <View className="flex-row items-center justify-between border-b border-[#E8E8EC] bg-white px-4 py-4 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]">
        <Text className="text-lg font-bold text-[#1C1C1E] dark:text-white">
          Shopping Cart
        </Text>
        <Text className="text-[13px] text-[#828282]">
          {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
        </Text>
      </View>

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
              {cartItems.map((item) => (
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
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="white"
                        />
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
                            onPress={() =>
                              handleQuantityChange(item.id, -1)
                            }
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
                            onPress={() =>
                              handleQuantityChange(item.id, 1)
                            }
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

          <View className="border-t border-[#E8E8EC] bg-white px-4 py-4 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]">
            <View className="mb-4 flex-row justify-between">
              <Text className="text-[15px] text-[#828282]">Design Cost:</Text>
              <Text className="font-semibold text-[#1C1C1E] dark:text-white">
                {formatNaira(designCost)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setConfirmVisible(true)}
              disabled={selectedItems.length === 0}
              className={`items-center rounded-full py-4 ${
                selectedItems.length === 0
                  ? "bg-gray-300"
                  : "bg-[#3B2D85]"
              }`}
            >
              <Text className="text-base font-bold text-white">
                Send to Designer ({selectedItems.length})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        animationType="slide"
        transparent
        visible={isPrefModalVisible}
        onRequestClose={() => {}}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
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
                  Printing Preferences
                </Text>
                <TouchableOpacity
                  onPress={() => setPrefModalVisible(false)}
                  className="absolute right-0"
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#FFF" : "#333"}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: screenHeight * 0.7 }}
                className="w-full"
              >
                <Field label="Budget (Estimated Amount)">
                  <View
                    className={`flex-row items-center rounded-xl border px-4 py-3.5 ${
                      prefErrors.estimatedAmount
                        ? "border-[#EB5757]"
                        : "border-[#3B2D85] dark:border-[#5E4CBA]"
                    }`}
                  >
                    <Ionicons
                      name="pricetags-outline"
                      size={20}
                      color={isDark ? "#A0A0A0" : "#828282"}
                    />
                    <TextInput
                      value={estimatedAmount}
                      onChangeText={(value) => {
                        setEstimatedAmount(value);
                        setPrefErrors((current) => ({
                          ...current,
                          estimatedAmount: undefined,
                        }));
                      }}
                      placeholder="e.g., ₦50,000 - ₦100,000"
                      placeholderTextColor="#BDBDBD"
                      className="ml-3 flex-1 text-[#333] dark:text-white"
                    />
                  </View>
                  {prefErrors.estimatedAmount ? (
                    <ErrorText message={prefErrors.estimatedAmount} />
                  ) : null}
                </Field>

                <Field label="Delivery Date">
                  <View
                    className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 ${
                      prefErrors.deliveryDate
                        ? "border-[#EB5757]"
                        : "border-[#3B2D85] dark:border-[#5E4CBA]"
                    }`}
                  >
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      className="flex-1 flex-row items-center"
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={isDark ? "#A0A0A0" : "#828282"}
                      />
                      <Text className="ml-3 text-[#333] dark:text-white">
                        {deliveryDate || "Select date"}
                      </Text>
                    </TouchableOpacity>
                    <Feather
                      name="chevron-right"
                      size={20}
                      color={isDark ? "#A0A0A0" : "#828282"}
                    />
                  </View>
                  {prefErrors.deliveryDate ? (
                    <ErrorText message={prefErrors.deliveryDate} />
                  ) : null}
                </Field>

                {showDatePicker ? (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={onChangeDate}
                    minimumDate={new Date()}
                  />
                ) : null}

                <Field label="Delivery Address">
                  <View
                    className={`flex-row items-center rounded-xl border px-4 py-3.5 ${
                      prefErrors.deliveryAddress
                        ? "border-[#EB5757]"
                        : "border-[#3B2D85] dark:border-[#5E4CBA]"
                    }`}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={isDark ? "#A0A0A0" : "#828282"}
                    />
                    <TextInput
                      value={deliveryAddress}
                      onChangeText={(value) => {
                        setDeliveryAddress(value);
                        setPrefErrors((current) => ({
                          ...current,
                          deliveryAddress: undefined,
                        }));
                      }}
                      placeholder="Enter address"
                      placeholderTextColor="#BDBDBD"
                      className="ml-3 flex-1 text-[#333] dark:text-white"
                    />
                  </View>
                  {prefErrors.deliveryAddress ? (
                    <ErrorText message={prefErrors.deliveryAddress} />
                  ) : null}
                </Field>

                <Text className="mb-4 text-base font-bold text-[#333333] dark:text-white">
                  Do you have your own item?
                </Text>
                <ChoiceRow
                  label="Yes, I have my items and I would like a pickup and delivery service"
                  selected={hasOwnItem === true}
                  onPress={() => {
                    setHasOwnItem(true);
                    setPrefErrors((current) => ({
                      ...current,
                      hasOwnItem: undefined,
                    }));
                  }}
                />
                <ChoiceRow
                  label="No, get item from the printer's inventory with delivery service"
                  selected={hasOwnItem === false}
                  onPress={() => {
                    setHasOwnItem(false);
                    setPrefErrors((current) => ({
                      ...current,
                      hasOwnItem: undefined,
                      pickupAddress: undefined,
                    }));
                  }}
                />
                {prefErrors.hasOwnItem ? (
                  <ErrorText message={prefErrors.hasOwnItem} />
                ) : null}

                {hasOwnItem ? (
                  <Field label="Pickup Address">
                    <View
                      className={`flex-row items-center rounded-xl border px-4 py-3.5 ${
                        prefErrors.pickupAddress
                          ? "border-[#EB5757]"
                          : "border-[#3B2D85] dark:border-[#5E4CBA]"
                      }`}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={isDark ? "#A0A0A0" : "#828282"}
                      />
                      <TextInput
                        value={pickupAddress}
                        onChangeText={(value) => {
                          setPickupAddress(value);
                          setPrefErrors((current) => ({
                            ...current,
                            pickupAddress: undefined,
                          }));
                        }}
                        placeholder="Enter address"
                        placeholderTextColor="#BDBDBD"
                        className="ml-3 flex-1 text-[#333] dark:text-white"
                      />
                    </View>
                    {prefErrors.pickupAddress ? (
                      <ErrorText message={prefErrors.pickupAddress} />
                    ) : null}
                  </Field>
                ) : null}
                <TouchableOpacity
                  onPress={handleContinue}
                  className="mb-8 mt-2 items-center justify-center rounded-full bg-[#3B2D85] py-4"
                >
                  <Text className="text-base font-bold text-white">Continue</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
    </View>
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