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

import { formatNaira } from "@/lib/currency";
import { normalizeDesign, normalizeDesignListResponse } from "@/lib/designs";
import { upsertLocalConversation } from "@/lib/localConversations";
import { addRecentDesign, getRecentDesignIds } from "@/lib/localStorage";
import {
    getPrintPreferences,
    savePrintPreferences,
} from "@/lib/printPreferences";
import ApiService from "@/services/apiClient";
import { isCustomerRole, useAuthStore } from "@/store/authStore";
import type { Design } from "@/types";
import { useAppAlert } from "@/components/common/AppAlert";

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
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [role, router]);

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

  const handleClearCart = async () => {
    try {
      await ApiService.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const previousItems = [...cartItems];
    setCartItems((current) => current.filter((item) => item.id !== itemId));

    try {
      await ApiService.deleteCartItem(itemId);
    } catch {
      setCartItems(previousItems);
      showAlert({ type: 'error', title: 'Error', message: 'Could not remove item. Please try again.' });
    }
  };

  const handleUpdateQuantity = async (
    itemId: string,
    type: "increase" | "decrease",
  ) => {
    const item = cartItems.find((entry) => entry.id === itemId);
    if (!item) return;

    const nextQuantity =
      type === "increase" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
    if (nextQuantity === item.quantity) return;

    const previousItems = [...cartItems];
    setCartItems((current) =>
      current.map((entry) =>
        entry.id === itemId ? { ...entry, quantity: nextQuantity } : entry,
      ),
    );

    try {
      await ApiService.updateCartQuantity(
        item.designId,
        item.mockId,
        nextQuantity,
        item.colour,
        item.size,
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      setCartItems(previousItems);
      showAlert({ type: 'error', title: 'Error', message: 'Could not update quantity.' });
    }
  };

  const handleToggleCheck = (itemId: string) => {
    setCartItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android" || event.type === "dismissed") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
      setDeliveryDate(selectedDate.toISOString().slice(0, 10));
      setPrefErrors((current) => ({ ...current, deliveryDate: undefined }));
    }
  };

  const validatePreferences = () => {
    const nextErrors: PreferenceErrors = {};

    if (!estimatedAmount.trim())
      nextErrors.estimatedAmount = "Estimated amount is required.";
    if (!deliveryDate.trim())
      nextErrors.deliveryDate = "Preferred delivery date is required.";
    if (!deliveryAddress.trim())
      nextErrors.deliveryAddress = "Delivery address is required.";
    if (hasOwnItem === null)
      nextErrors.hasOwnItem = "Choose how the products will be sourced.";
    if (hasOwnItem && !pickupAddress.trim())
      nextErrors.pickupAddress = "Pickup address is required.";

    setPrefErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!selectedItems.length) {
      showAlert({ type: 'warning', title: 'No item selected', message: 'Select at least one item to continue.' });
      return;
    }

    if (!validatePreferences()) {
      return;
    }

    await savePrintPreferences({
      estimatedAmount,
      deliveryDate,
      deliveryAddress,
      pickupAddress: hasOwnItem ? pickupAddress : "",
      hasOwnItem: Boolean(hasOwnItem),
    });

    setPrefModalVisible(false);
    // Navigate to select-printer with the selected cart items encoded as params
    setTimeout(() => {
      router.push({
        pathname: '/(tabs)/select-printer',
        params: {
          cartItems: JSON.stringify(
            selectedItems.map((item) => ({
              id: item.id,
              name: item.name,
              imageUrl: item.imageUrl,
              price: item.price,
              quantity: item.quantity,
              colour: item.colour,
              size: item.size,
              variantText: item.variantText,
              designerName: item.designerName,
              budget: estimatedAmount,
              deliveryDate,
              deliveryAddress,
              pickupAddress: hasOwnItem ? pickupAddress : '',
              hasOwnItem: Boolean(hasOwnItem),
            }))
          ),
        },
      });
    }, 200);
  };

  const sendOrderToDesigners = async () => {
    if (!selectedItems.length) {
      showAlert({ type: 'warning', title: 'No item selected', message: 'Select at least one item to continue.' });
      return;
    }

    const groupedByDesigner = selectedItems.reduce<
      Record<string, CartItemType[]>
    >((acc, item) => {
      const key = String(item.designerId || item.designerName || "designer");
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});

    for (const group of Object.values(groupedByDesigner)) {
      const designer = group[0];

      await upsertLocalConversation({
        participantId: designer.designerId,
        name: designer.designerName || "Unknown artist",
        role: "Designer",
        initialMessages: [
          {
            id: `bundle-${designer.designerId || designer.designerName || "artist"}-${Date.now()}`,
            type: "bundle",
            text: "[Product gallery]",
            previewText: "[Product gallery]",
            author: "me",
            createdAt: new Date().toISOString(),
            status: "sent",
            bundle: {
              title: "Selected products",
              productCount: group.length,
              footerLabel: group.length > 1 ? "View all product details" : "View product details",
              items: group.map((item, index) => ({
                id: item.id,
                imageUrl: item.imageUrl,
                overlayText:
                  index === 3 && group.length > 4
                    ? `+${group.length - 3} Items`
                    : undefined,
                name: item.name,
                title: item.name,
                price: item.price,
                quantity: item.quantity,
                colour: item.colour,
                color: item.colour,
                size: item.size,
                variantText: item.variantText,
                designerName: item.designerName,
                printingType: estimatedAmount ? "Custom designer review" : "",
                budget: estimatedAmount,
                deliveryDate,
                preferredDeliveryDate: deliveryDate,
                deliveryAddress,
                pickupAddress: hasOwnItem ? pickupAddress : "",
                itemAvailability: hasOwnItem ? "Customer supplied item" : "Designer/printer inventory",
                inventorySource: hasOwnItem ? "Customer supplied item" : "Designer/printer inventory",
                hasOwnItem: Boolean(hasOwnItem),
              })),
            },
          },
        ],
      });
    }

    const selectedItemIds = new Set(selectedItems.map((item) => item.id));

    try {
      if (selectedItems.length === cartItems.length) {
        await ApiService.clearCart();
      } else {
        await Promise.allSettled(
          selectedItems.map((item) => ApiService.deleteCartItem(item.id)),
        );
      }
      setCartItems((current) =>
        current.filter((item) => !selectedItemIds.has(item.id)),
      );
    } catch (error) {
      console.error("Error clearing sent cart items:", error);
    }

    setConfirmVisible(false);
    router.push("/messages");
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#3B2D85" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#121212]">
      <ScrollView
        className="flex-1 pt-12"
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-[#333333] dark:text-white">
            Cart
          </Text>
          <TouchableOpacity onPress={handleClearCart}>
            <Text className="text-lg font-semibold text-[#EB5757]">Clear</Text>
          </TouchableOpacity>
        </View>

        {cartItems.length === 0 ? (
          <View className="items-center justify-center px-8 pt-24">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-[#1E1E1E]">
              <Ionicons
                name="cart-outline"
                size={44}
                color={isDark ? "#A0A0A0" : "#BDBDBD"}
              />
            </View>
            <Text className="mt-5 text-xl font-semibold text-[#333333] dark:text-white">
              Your cart is empty
            </Text>
            <Text className="mt-3 text-center text-sm leading-6 text-[#828282] dark:text-gray-400">
              Add designs you love to your cart and they will show up here for
              printing and checkout.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/products")}
              className="mt-6 rounded-full bg-[#3B2D85] px-6 py-3"
            >
              <Text className="font-semibold text-white">Explore products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map((item) => (
              <View key={item.id} className="items-center">
                <View className="my-2 flex-row w-[92%] rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-[#1E1E1E]">
                  <TouchableOpacity
                    onPress={() => handleToggleCheck(item.id)}
                    className="my-auto mr-3 py-1"
                  >
                    {item.checked ? (
                      <View className="h-6 w-6 items-center justify-center rounded-md border border-[#3B2D85] bg-[#3B2D85]">
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    ) : (
                      <View className="h-6 w-6 rounded-md border-2 border-[#BDBDBD]" />
                    )}
                  </TouchableOpacity>

                  <View
                    style={{ height: 90, width: 80 }}
                    className="mr-3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <Image
                      source={item.imageSource}
                      resizeMode="cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>

                  <View className="flex-1 justify-between py-1.5">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text
                          className="mb-1 text-sm font-bold text-[#333333] dark:text-white"
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text className="mb-2 text-sm font-extrabold text-[#333333] dark:text-white">
                          {formatNaira(item.price)}
                        </Text>
                        <Text className="text-xs text-[#86808F] dark:text-[#B0ACBA]">
                          {item.designerName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(item.id)}
                        className="pl-2"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EB5757"
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="mt-2 flex-row items-center justify-between">
                      <View className="mr-2 flex-1 flex-row flex-wrap items-center gap-2">
                        {item.size ? (
                          <View className="h-8 items-center justify-center rounded-full border border-gray-200 bg-[#F5F5F5] px-3 dark:border-gray-600 dark:bg-gray-700">
                            <Text className="text-xs text-[#333333] dark:text-white">
                              Size: {item.size}
                            </Text>
                          </View>
                        ) : null}
                        {item.colour ? (
                          <View
                            style={{ backgroundColor: item.colour }}
                            className={`h-8 flex-row items-center rounded-full border border-gray-200 bg-[${item.colour}] px-3 dark:border-gray-600 `}
                          >
                            <Text className="text-xs text-[#333333] dark:text-white">
                              {item.colour}
                            </Text>
                          </View>
                        ) : null}
                        {!item.size && !item.colour ? (
                          <View className="h-8 items-center justify-center rounded-full border border-gray-200 bg-[#F5F5F5] px-3 dark:border-gray-600 dark:bg-gray-700">
                            <Text className="text-xs text-[#333333] dark:text-white">
                              {item.variantText}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                          onPress={() =>
                            handleUpdateQuantity(item.id, "decrease")
                          }
                          className="h-7 w-7 items-center justify-center rounded-md bg-[#2D71E3]"
                        >
                          <Ionicons
                            name="remove-outline"
                            size={16}
                            color="white"
                          />
                        </TouchableOpacity>
                        <Text className="w-4 text-center text-base font-bold text-black dark:text-white">
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            handleUpdateQuantity(item.id, "increase")
                          }
                          className="h-7 w-7 items-center justify-center rounded-md bg-[#2D71E3]"
                        >
                          <Ionicons
                            name="add-outline"
                            size={16}
                            color="white"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <View className="mb-8 mt-6 px-6">
              <Text className="mb-5 text-lg font-bold text-[#333333] dark:text-white">
                Cart Summary
              </Text>
              <View className="mb-3 flex-row justify-between">
                <Text className="text-[#828282] dark:text-gray-400">
                  Design cost
                </Text>
                <Text className="font-semibold text-[#333333] dark:text-white">
                  {formatNaira(designCost)}
                </Text>
              </View>
              <View className="mb-3 flex-row justify-between">
                <Text className="text-[#828282] dark:text-gray-400">
                  Printing cost
                </Text>
                <Text className="font-semibold text-[#333333] dark:text-white">
                  -
                </Text>
              </View>
              <View className="mb-5 flex-row justify-between border-b border-gray-200 pb-5 dark:border-gray-800">
                <Text className="text-[#828282] dark:text-gray-400">
                  Pickup/delivery
                </Text>
                <Text className="font-semibold text-[#333333] dark:text-white">
                  -
                </Text>
              </View>
              <View className="mb-4 flex-row justify-between">
                <Text className="text-lg font-bold text-[#333333] dark:text-white">
                  Subtotal
                </Text>
                <Text className="text-lg font-bold text-[#333333] dark:text-white">
                  {formatNaira(designCost)}
                </Text>
              </View>
              <View className="mb-6 flex-row items-start gap-x-2">
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#2D71E3"
                />
                <Text className="flex-1 text-xs leading-5 text-[#2D71E3]">
                  Your order will be sent to the designer first. The designer
                  will confirm quantity, timeline and then work with a printer
                  for production.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPrefModalVisible(true)}
                disabled={designCost === 0}
                className={`items-center justify-center rounded-full py-4 ${designCost === 0 ? "bg-gray-400" : "bg-[#3B2D85]"}`}
              >
                <Text className="text-base font-bold text-white">
                  Print Product
                </Text>
              </TouchableOpacity>
            </View>

            {recentDesigns.length ? (
              <View className="mb-4 px-6">
                <Text className="mb-4 text-lg font-bold text-[#333333] dark:text-white">
                  Explore recent designs
                </Text>
                <View className="flex-row flex-wrap justify-between">
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
                        className="relative mb-4 w-[48%] rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-[#1E1E1E]"
                        onPress={async () => {
                          await addRecentDesign(design.id);
                          router.push({
                            pathname: "/products",
                            params: { designId: String(design.id) },
                          });
                        }}
                      >
                        <View className="mb-2 h-32 items-center justify-center overflow-hidden rounded-lg bg-[#F8F9FA] dark:bg-gray-800">
                          {imageUri ? (
                            <Image
                              source={{ uri: imageUri }}
                              resizeMode="cover"
                              className="h-full w-full"
                            />
                          ) : null}
                        </View>
                        <TouchableOpacity className="absolute right-4 top-4 rounded-full bg-white/80 p-1.5 dark:bg-black/50">
                          <Ionicons
                            name={design.liked ? "heart" : "heart-outline"}
                            size={18}
                            color={
                              design.liked
                                ? "#FF4D67"
                                : isDark
                                  ? "#FFF"
                                  : "#828282"
                            }
                          />
                        </TouchableOpacity>
                        <Text
                          className="mb-1 text-sm font-semibold text-[#333333] dark:text-white"
                          numberOfLines={1}
                        >
                          {design.title}
                        </Text>
                        <Text className="mb-2 text-[10px] text-[#828282] dark:text-gray-400">
                          By {artistName}
                        </Text>
                        <Text className="text-sm font-bold text-[#333333] dark:text-white">
                          {formatNaira(lowestPrice)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* ✅ FIX: Changed behavior from 'height' to undefined for Android */}
      <Modal
        animationType="slide"
        transparent
        visible={isPrefModalVisible}
        onRequestClose={() => setPrefModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{ maxHeight: screenHeight * 0.9, paddingBottom: 40 }}
            className="w-full rounded-t-[32px] bg-white shadow-lg dark:bg-[#1E1E1E]"
          >
            <View className="relative flex-row items-center justify-center border-b border-gray-100 px-6 pb-4 pt-6 dark:border-gray-800">
              <TouchableOpacity
                onPress={() => setPrefModalVisible(false)}
                className="absolute left-6 top-6"
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={isDark ? "#FFF" : "#333"}
                />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-[#333333] dark:text-white">
                Printing Preferences
              </Text>
            </View>

            <ScrollView
              className="px-6 pt-4"
              showsVerticalScrollIndicator={false}
            >
              <Text className="mb-6 text-sm leading-5 text-[#828282] dark:text-gray-400">
                Enter the specifications you want the designer to review before
                production starts.
              </Text>

              <Field label="Estimated Amount">
                <TextInput
                  value={estimatedAmount}
                  onChangeText={(value) => {
                    setEstimatedAmount(value);
                    setPrefErrors((current) => ({
                      ...current,
                      estimatedAmount: undefined,
                    }));
                  }}
                  keyboardType="numeric"
                  className={`rounded-xl border px-4 py-3.5 text-[#333] dark:text-white ${prefErrors.estimatedAmount ? "border-[#EB5757]" : "border-[#3B2D85] dark:border-[#5E4CBA]"}`}
                />
                {prefErrors.estimatedAmount ? (
                  <ErrorText message={prefErrors.estimatedAmount} />
                ) : null}
              </Field>

              <Field label="Preferred Delivery Date">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 ${prefErrors.deliveryDate ? "border-[#EB5757]" : "border-[#3B2D85] dark:border-[#5E4CBA]"}`}
                >
                  <Text
                    className={
                      deliveryDate
                        ? "flex-1 text-[#333] dark:text-white"
                        : "flex-1 text-[#BDBDBD]"
                    }
                  >
                    {deliveryDate || "yyyy-mm-dd"}
                  </Text>
                  <Feather
                    name="calendar"
                    size={20}
                    color={isDark ? "#A0A0A0" : "#828282"}
                  />
                </TouchableOpacity>
                {prefErrors.deliveryDate ? (
                  <ErrorText message={prefErrors.deliveryDate} />
                ) : null}
                {showDatePicker ? (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={onChangeDate}
                    minimumDate={new Date()}
                  />
                ) : null}
              </Field>

              <Field label="Delivery Address">
                <View
                  className={`flex-row items-center rounded-xl border px-4 py-3.5 ${prefErrors.deliveryAddress ? "border-[#EB5757]" : "border-[#3B2D85] dark:border-[#5E4CBA]"}`}
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
                    className={`flex-row items-center rounded-xl border px-4 py-3.5 ${prefErrors.pickupAddress ? "border-[#EB5757]" : "border-[#3B2D85] dark:border-[#5E4CBA]"}`}
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
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-[#3B2D85]" : "border-gray-300"}`}
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
  