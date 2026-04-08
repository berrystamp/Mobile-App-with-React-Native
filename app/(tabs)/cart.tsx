import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
} from 'react-native';

import { formatNaira } from '@/lib/currency';
import { normalizeDesign, normalizeDesignListResponse } from '@/lib/designs';
import { addRecentDesign, getRecentDesignIds } from '@/lib/localStorage';
import { upsertLocalConversation } from '@/lib/localConversations';
import { getPrintPreferences, savePrintPreferences } from '@/lib/printPreferences';
import ApiService from '@/services/apiClient';
import { isCustomerRole, useAuthStore } from '@/store/authStore';
import type { Design } from '@/types';

type CartItemType = {
  id: string;
  designId: string;
  mockId: string;
  name: string;
  price: number;
  quantity: number;
  imageSource: any;
  colour: string;
  size: string;
  variantText: string;
  checked: boolean;
  designerId?: number;
  designerName?: string;
};

export default function CartScreen() {
  const router = useRouter();
  const { openPrintPrefs } = useLocalSearchParams<{ openPrintPrefs?: string }>();
  const isDark = useColorScheme() === 'dark';
  const { height: screenHeight } = useWindowDimensions();
  const role = useAuthStore((state) => state.role);

  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [recentDesigns, setRecentDesigns] = useState<Design[]>([]);
  const [isPrefModalVisible, setPrefModalVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [hasOwnItem, setHasOwnItem] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!isCustomerRole(role)) {
      router.replace('/manage-order');
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
        setHasOwnItem(storedPreferences.hasOwnItem);

        const data = response?.responseBody || response?.data || response || [];
        const list = Array.isArray(data) ? data : [];
        const formattedItems = list.map((item: any) => {
          const variants = [];
          if (item.size) variants.push(item.size);
          if (item.colour) variants.push(item.colour);

          return {
            id: String(item.id),
            designId: String(item.designId || item.design?.id),
            mockId: String(item.mock?.id || ''),
            name: item.design?.title || item.design?.name || item.mock?.name || 'Custom Design',
            price: Number(item.amount || item.mock?.price || item.design?.amount || 0),
            quantity: Number(item.quantity || 1),
            colour: item.colour || '',
            size: item.size || '',
            variantText: variants.join(', ') || 'No specification',
            imageSource: item.mock?.image?.url
              ? { uri: item.mock.image.url }
              : item.design?.imageUrlFront
                ? { uri: item.design.imageUrlFront }
                : require('@/assets/images/item1.png'),
            checked: true,
            designerId: item.design?.profile?.id || item.design?.designer?.id,
            designerName:
              `${item.design?.profile?.firstName || ''} ${item.design?.profile?.lastName || ''}`.trim() ||
              item.design?.designerName ||
              item.design?.profile?.username ||
              'Designer',
          } satisfies CartItemType;
        });
        setCartItems(formattedItems);

        if (recentIds.length > 0) {
          const recentResponses = await Promise.allSettled(recentIds.slice(0, 4).map((designId) => ApiService.fetchDesignById(designId)));
          const nextRecentDesigns = recentResponses
            .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
            .map((result) => normalizeDesign(result.value?.responseBody || result.value))
            .filter((design) => Boolean(design?.id));
          setRecentDesigns(nextRecentDesigns);
        } else {
          const recentResponse = await ApiService.getRecentDesigns(4);
          setRecentDesigns(normalizeDesignListResponse(recentResponse).slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [role, router]);

  useEffect(() => {
    if (!isLoading && openPrintPrefs === '1' && cartItems.length > 0) {
      setPrefModalVisible(true);
    }
  }, [cartItems.length, isLoading, openPrintPrefs]);

  const designCost = useMemo(
    () => cartItems.reduce((sum, item) => (item.checked ? sum + item.price * item.quantity : sum), 0),
    [cartItems],
  );

  const selectedItems = useMemo(() => cartItems.filter((item) => item.checked), [cartItems]);

  const handleClearCart = async () => {
    try {
      await ApiService.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const previousItems = [...cartItems];
    setCartItems((current) => current.filter((item) => item.id !== itemId));

    try {
      await ApiService.deleteCartItem(itemId);
    } catch {
      setCartItems(previousItems);
      Alert.alert('Error', 'Could not remove item. Please try again.');
    }
  };

  const handleUpdateQuantity = async (itemId: string, type: 'increase' | 'decrease') => {
    const item = cartItems.find((entry) => entry.id === itemId);
    if (!item) return;

    const nextQuantity = type === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
    if (nextQuantity === item.quantity) return;

    const previousItems = [...cartItems];
    setCartItems((current) => current.map((entry) => (entry.id === itemId ? { ...entry, quantity: nextQuantity } : entry)));

    try {
      await ApiService.updateCartQuantity(item.designId, item.mockId, nextQuantity, item.colour, item.size);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setCartItems(previousItems);
      Alert.alert('Error', 'Could not update quantity.');
    }
  };

  const handleToggleCheck = (itemId: string) => {
    setCartItems((current) => current.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)));
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android' || event.type === 'dismissed') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
      setDeliveryDate(selectedDate.toISOString().slice(0, 10));
    }
  };

  const handleContinue = async () => {
    if (!selectedItems.length) {
      Alert.alert('No item selected', 'Select at least one item to continue.');
      return;
    }

    await savePrintPreferences({
      estimatedAmount,
      deliveryDate,
      deliveryAddress,
      pickupAddress,
      hasOwnItem,
    });

    setPrefModalVisible(false);
    setTimeout(() => setConfirmVisible(true), 200);
  };

  const sendOrderToDesigners = async () => {
    if (!selectedItems.length) {
      Alert.alert('No item selected', 'Select at least one item to continue.');
      return;
    }

    const groupedByDesigner = selectedItems.reduce<Record<string, CartItemType[]>>((acc, item) => {
      const key = String(item.designerId || item.designerName || 'designer');
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});

    for (const group of Object.values(groupedByDesigner)) {
      const designer = group[0];
      const itemSummary = group.map((item) => `${item.name} x${item.quantity}`).join(', ');

      await upsertLocalConversation({
        participantId: designer.designerId,
        name: designer.designerName || 'Designer',
        role: 'Designer',
        initialMessage:
          `New order request: ${itemSummary}. Budget ${estimatedAmount ? formatNaira(Number(estimatedAmount)) : 'not set'}, ` +
          `delivery date ${deliveryDate || 'not set'}, delivery address ${deliveryAddress || 'not set'}, ` +
          `${hasOwnItem ? `pickup address ${pickupAddress || 'not set'}` : 'printer inventory requested'}.`,
      });
    }

    setConfirmVisible(false);
    router.push('/messages');
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
      <ScrollView className="flex-1 pt-12" contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-[#333333] dark:text-white">Cart</Text>
          <TouchableOpacity onPress={handleClearCart}>
            <Text className="text-lg font-semibold text-[#EB5757]">Clear</Text>
          </TouchableOpacity>
        </View>

        {cartItems.length === 0 ? (
          <View className="items-center justify-center px-8 pt-24">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-[#1E1E1E]">
              <Ionicons name="cart-outline" size={44} color={isDark ? '#A0A0A0' : '#BDBDBD'} />
            </View>
            <Text className="mt-5 text-xl font-semibold text-[#333333] dark:text-white">Your cart is empty</Text>
            <Text className="mt-3 text-center text-sm leading-6 text-[#828282] dark:text-gray-400">
              Add designs you love to your cart and they will show up here for printing and checkout.
            </Text>
            <TouchableOpacity onPress={() => router.push('/products')} className="mt-6 rounded-full bg-[#3B2D85] px-6 py-3">
              <Text className="font-semibold text-white">Explore products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map((item) => (
              <View key={item.id} className="items-center">
                <View className="my-2 flex-row w-[92%] rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-[#1E1E1E]">
                  <TouchableOpacity onPress={() => handleToggleCheck(item.id)} className="my-auto mr-3 py-1">
                    {item.checked ? (
                      <View className="h-6 w-6 items-center justify-center rounded-md border border-[#3B2D85] bg-[#3B2D85]">
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    ) : (
                      <View className="h-6 w-6 rounded-md border-2 border-[#BDBDBD]" />
                    )}
                  </TouchableOpacity>

                  <View style={{ height: 90, width: 80 }} className="mr-3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Image source={item.imageSource} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                  </View>

                  <View className="flex-1 justify-between py-1.5">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="mb-1 text-sm font-bold text-[#333333] dark:text-white" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text className="mb-2 text-sm font-extrabold text-[#333333] dark:text-white">{formatNaira(item.price)}</Text>
                        <Text className="text-xs text-[#86808F] dark:text-[#B0ACBA]">{item.designerName}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} className="pl-2">
                        <Ionicons name="trash-outline" size={20} color="#EB5757" />
                      </TouchableOpacity>
                    </View>

                    <View className="mt-2 flex-row items-center justify-between">
                      <View className="mr-2 h-8 items-center justify-center rounded-full border border-gray-200 bg-[#F5F5F5] px-3 dark:border-gray-600 dark:bg-gray-700">
                        <Text className="text-xs text-[#333333] dark:text-white">{item.variantText}</Text>
                      </View>

                      <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, 'decrease')} className="h-7 w-7 items-center justify-center rounded-md bg-[#2D71E3]">
                          <Ionicons name="remove-outline" size={16} color="white" />
                        </TouchableOpacity>
                        <Text className="w-4 text-center text-base font-bold text-black dark:text-white">{item.quantity}</Text>
                        <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, 'increase')} className="h-7 w-7 items-center justify-center rounded-md bg-[#2D71E3]">
                          <Ionicons name="add-outline" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <View className="mb-8 mt-6 px-6">
              <Text className="mb-5 text-lg font-bold text-[#333333] dark:text-white">Cart Summary</Text>
              <View className="mb-3 flex-row justify-between">
                <Text className="text-[#828282] dark:text-gray-400">Design cost</Text>
                <Text className="font-semibold text-[#333333] dark:text-white">{formatNaira(designCost)}</Text>
              </View>
              <View className="mb-3 flex-row justify-between">
                <Text className="text-[#828282] dark:text-gray-400">Printing cost</Text>
                <Text className="font-semibold text-[#333333] dark:text-white">-</Text>
              </View>
              <View className="mb-5 flex-row justify-between border-b border-gray-200 pb-5 dark:border-gray-800">
                <Text className="text-[#828282] dark:text-gray-400">Pickup/delivery</Text>
                <Text className="font-semibold text-[#333333] dark:text-white">-</Text>
              </View>
              <View className="mb-4 flex-row justify-between">
                <Text className="text-lg font-bold text-[#333333] dark:text-white">Subtotal</Text>
                <Text className="text-lg font-bold text-[#333333] dark:text-white">{formatNaira(designCost)}</Text>
              </View>
              <View className="mb-6 flex-row items-start gap-x-2">
                <Ionicons name="information-circle-outline" size={18} color="#2D71E3" />
                <Text className="flex-1 text-xs leading-5 text-[#2D71E3]">
                  Your order will be sent to the designer first. The designer will confirm quantity, timeline and then work with a printer for production.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPrefModalVisible(true)}
                disabled={designCost === 0}
                className={`items-center justify-center rounded-full py-4 ${designCost === 0 ? 'bg-gray-400' : 'bg-[#3B2D85]'}`}>
                <Text className="text-base font-bold text-white">Print Product</Text>
              </TouchableOpacity>
            </View>

            {recentDesigns.length ? (
              <View className="mb-4 px-6">
                <Text className="mb-4 text-lg font-bold text-[#333333] dark:text-white">Explore recent designs</Text>
                <View className="flex-row flex-wrap justify-between">
                  {recentDesigns.map((design) => {
                    const imageUri = design.imagePath?.startsWith('http')
                      ? design.imagePath
                      : design.imagePath
                        ? `https://berrystamp-backend-dev-4cn29.ondigitalocean.app/${design.imagePath}`
                        : '';
                    const artistName = `${design.profile.firstName} ${design.profile.lastName}`.trim() || design.profile.username;
                    const mockPrices = design.mocks.map((mock) => mock.price).filter((price) => price > 0);
                    const lowestPrice = mockPrices.length > 0 ? Math.min(...mockPrices) : design.amount || 0;

                    return (
                      <TouchableOpacity
                        key={design.id}
                        className="relative mb-4 w-[48%] rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-[#1E1E1E]"
                        onPress={async () => {
                          await addRecentDesign(design.id);
                          router.push({ pathname: '/products', params: { designId: String(design.id) } });
                        }}>
                        <View className="mb-2 h-32 items-center justify-center overflow-hidden rounded-lg bg-[#F8F9FA] dark:bg-gray-800">
                          {imageUri ? <Image source={{ uri: imageUri }} resizeMode="cover" className="h-full w-full" /> : null}
                        </View>
                        <TouchableOpacity className="absolute right-4 top-4 rounded-full bg-white/80 p-1.5 dark:bg-black/50">
                          <Ionicons name={design.liked ? 'heart' : 'heart-outline'} size={18} color={design.liked ? '#FF4D67' : isDark ? '#FFF' : '#828282'} />
                        </TouchableOpacity>
                        <Text className="mb-1 text-sm font-semibold text-[#333333] dark:text-white" numberOfLines={1}>
                          {design.title}
                        </Text>
                        <Text className="mb-2 text-[10px] text-[#828282] dark:text-gray-400">By {artistName}</Text>
                        <Text className="text-sm font-bold text-[#333333] dark:text-white">{formatNaira(lowestPrice)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent visible={isPrefModalVisible} onRequestClose={() => setPrefModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ maxHeight: screenHeight * 0.9, paddingBottom: 40 }} className="w-full rounded-t-[32px] bg-white shadow-lg dark:bg-[#1E1E1E]">
            <View className="relative flex-row items-center justify-center border-b border-gray-100 px-6 pb-4 pt-6 dark:border-gray-800">
              <TouchableOpacity onPress={() => setPrefModalVisible(false)} className="absolute left-6 top-6">
                <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#333'} />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-[#333333] dark:text-white">Printing Preferences</Text>
            </View>

            <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false}>
              <Text className="mb-6 text-sm leading-5 text-[#828282] dark:text-gray-400">
                Enter the specifications you want the designer to review before production starts.
              </Text>

              <Field label="Estimated Amount (₦)">
                <TextInput value={estimatedAmount} onChangeText={setEstimatedAmount} keyboardType="numeric" className="rounded-xl border border-[#3B2D85] px-4 py-3.5 text-[#333] dark:border-[#5E4CBA] dark:text-white" />
              </Field>

              <Field label="Preferred Delivery Date">
                <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center justify-between rounded-xl border border-[#3B2D85] px-4 py-3.5 dark:border-[#5E4CBA]">
                  <Text className={deliveryDate ? 'flex-1 text-[#333] dark:text-white' : 'flex-1 text-[#BDBDBD]'}>
                    {deliveryDate || 'yyyy-mm-dd'}
                  </Text>
                  <Feather name="calendar" size={20} color={isDark ? '#A0A0A0' : '#828282'} />
                </TouchableOpacity>
                {showDatePicker ? (
                  <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={onChangeDate} minimumDate={new Date()} />
                ) : null}
              </Field>

              <Field label="Delivery Address">
                <View className="flex-row items-center rounded-xl border border-[#3B2D85] px-4 py-3.5 dark:border-[#5E4CBA]">
                  <Ionicons name="location-outline" size={20} color={isDark ? '#A0A0A0' : '#828282'} />
                  <TextInput
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Enter address"
                    placeholderTextColor="#BDBDBD"
                    className="ml-3 flex-1 text-[#333] dark:text-white"
                  />
                </View>
              </Field>

              <Text className="mb-4 text-base font-bold text-[#333333] dark:text-white">Do you have your own item?</Text>
              <ChoiceRow label="Yes, I have my items and I would like a pickup and delivery service" selected={hasOwnItem} onPress={() => setHasOwnItem(true)} />
              <ChoiceRow label="No, get item from the printer&apos;s inventory with delivery service" selected={!hasOwnItem} onPress={() => setHasOwnItem(false)} />

              {hasOwnItem ? (
                <Field label="Pickup Address">
                  <View className="flex-row items-center rounded-xl border border-[#3B2D85] px-4 py-3.5 dark:border-[#5E4CBA]">
                    <Ionicons name="location-outline" size={20} color={isDark ? '#A0A0A0' : '#828282'} />
                    <TextInput
                      value={pickupAddress}
                      onChangeText={setPickupAddress}
                      placeholder="Enter address"
                      placeholderTextColor="#BDBDBD"
                      className="ml-3 flex-1 text-[#333] dark:text-white"
                    />
                  </View>
                </Field>
              ) : null}

              <TouchableOpacity onPress={handleContinue} className="mb-8 mt-2 items-center justify-center rounded-full bg-[#3B2D85] py-4">
                <Text className="text-base font-bold text-white">Continue</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal animationType="slide" transparent visible={isConfirmVisible} onRequestClose={() => setConfirmVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }} className="w-full items-center rounded-t-[32px] bg-white px-6 pt-6 dark:bg-[#1E1E1E]">
            <View className="relative mb-8 flex-row items-center">
              <Text className="mx-auto text-lg font-semibold text-[#333333] dark:text-white">Send to Designer</Text>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} className="absolute right-0">
                <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>

            <View className="mb-6 h-28 w-28 items-center justify-center">
              <Image source={require('@/assets/images/printer-icon.png')} resizeMode="contain" style={{ width: '100%', height: '100%', tintColor: isDark ? '#A0A0A0' : '#BDBDBD' }} />
            </View>

            <Text className="mb-10 px-4 text-center text-[15px] leading-6 text-[#828282] dark:text-gray-400">
              Your selected order and preferences will be sent to the designer. The designer can then confirm the quantity with you and continue production with a printer.
            </Text>

            <TouchableOpacity onPress={sendOrderToDesigners} className="mb-4 w-full items-center justify-center rounded-full bg-[#3B2D85] py-4">
              <Text className="w-full text-center text-base font-bold text-white">Send to Designer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="absolute left-3 top-[-8px] z-10 bg-white px-1 text-xs text-[#333333] dark:bg-[#1E1E1E] dark:text-white">{label}</Text>
      {children}
    </View>
  );
}

function ChoiceRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="mb-4 flex-row items-start gap-x-3">
      <View className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-[#3B2D85]' : 'border-gray-300'}`}>
        {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#3B2D85]" /> : null}
      </View>
      <Text className="flex-1 text-sm leading-5 text-[#828282] dark:text-gray-300">{label}</Text>
    </TouchableOpacity>
  );
}
