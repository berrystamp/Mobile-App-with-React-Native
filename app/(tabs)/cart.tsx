import React, { useState, useMemo, useEffect } from 'react';
import { Image, ScrollView, Text, View, TouchableOpacity, useColorScheme, Modal, useWindowDimensions, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface CartItemType {
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
}

const API_BASE_URL = 'https://berrystamp-backend-dev-4cn29.ondigitalocean.app/api/v1';

export default function CartScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { height: screenHeight } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isPrefModalVisible, setPrefModalVisible] = useState(false);
  const [isSelectPrinterModalVisible, setSelectPrinterModalVisible] = useState(false);

  // Form States
  const [hasOwnItem, setHasOwnItem] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');

  // Date Picker States
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cart Data State
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  // Explore Recent Designs Data State (Dummy for now)
  const [recentDesigns, setRecentDesigns] = useState([
      { id: 'rd1', name: 'My Mind Mug', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item1.png') },
      { id: 'rd2', name: 'We Meuuve Slang design', author: 'Mohh_Jumah', price: 3000, image: require('@/assets/images/item2.png') },
  ]);

  // Auth Helper: Replace with your actual auth token retrieval logic
  const getAuthHeaders = () => {
    const token = "YOUR_ACTUAL_AUTH_TOKEN"; 
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };
  };

  // ==========================================
  // BACKEND INTEGRATION HANDLERS
  // ==========================================

  // 1. Fetch Cart Items (GET /api/v1/cart-items)
  useEffect(() => {
    const fetchCartData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/cart-items`, {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // MAP THE BACKEND JSON TO OUR UI STATE
          const formattedItems = data.map((item: any) => {
            
            // Format the variant text elegantly (e.g. "M, Blue")
            const variants = [];
            if (item.size) variants.push(item.size);
            if (item.colour) variants.push(item.colour);

            return {
              id: item.id?.toString(), 
              designId: item.designId?.toString(),
              mockId: item.mock?.id?.toString(),
              name: item.mock?.name || 'Custom Design', 
              price: item.amount || 0,
              quantity: item.quantity || 1,
              colour: item.colour || '',
              size: item.size || '',
              variantText: variants.join(', ') || 'N/A',
              imageSource: item.mock?.image?.url ? { uri: item.mock.image.url } : require('@/assets/images/item1.png'), 
              checked: true // Check all items by default for checkout
            };
          });
          
          setCartItems(formattedItems);
        } else {
          console.error("Failed to fetch cart data", response.status);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartData();
  }, []);

  // 2. Clear Entire Cart (DELETE /api/v1/cart-items)
  const handleClearCart = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cart-items`, { 
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (response.ok) {
          setCartItems([]);
        } else {
          Alert.alert("Error", "Failed to clear cart.");
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
  };

  // 3. Remove Single Item (DELETE /api/v1/cart-items/{itemId})
  const handleRemoveItem = async (itemId: string) => {
      const previousItems = [...cartItems];
      setCartItems(prev => prev.filter(item => item.id !== itemId));

      try {
        const response = await fetch(`${API_BASE_URL}/cart-items/${itemId}`, { 
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error("Failed to delete");
      } catch (error) {
        setCartItems(previousItems); // Rollback if failed
        Alert.alert("Error", "Could not remove item. Please try again.");
      }
  };

  // 4. Update Quantity (POST /api/v1/cart-items/{designId}/{mockId})
  const handleUpdateQuantity = async (itemId: string, type: 'increase' | 'decrease') => {
      const item = cartItems.find(i => i.id === itemId);
      if (!item) return;

      const newQuantity = type === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
      if (newQuantity === item.quantity) return; // Prevent going below 1

      const previousItems = [...cartItems];
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));

      try {
        const response = await fetch(`${API_BASE_URL}/cart-items/${item.designId}/${item.mockId}`, { 
           method: 'POST',
           headers: getAuthHeaders(),
           body: JSON.stringify({ 
             quantity: newQuantity,
             colour: item.colour || "", 
             size: item.size || ""
           })
        });

        if (!response.ok) throw new Error("Failed to update quantity");
      } catch (error) {
        setCartItems(previousItems); // Rollback if failed
        console.error("Error updating quantity:", error);
        Alert.alert("Error", "Could not update quantity.");
      }
  };

  // Checkbox toggle logic
  const handleToggleCheck = (itemId: string) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const navigateToPrinters = async () => {
      const preferencesPayload = {
          estimatedAmount,
          deliveryDate,
          deliveryAddress,
          pickupAddress,
          hasOwnItem,
          selectedItems: cartItems.filter(item => item.checked).map(i => i.id)
      };

      console.log("Proceeding to Printer Selection with:", preferencesPayload);
      setSelectPrinterModalVisible(false);
      router.push('/printers'); 
  };

  // Date Picker Handler
  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android' || event.type === 'dismissed') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const year = String(selectedDate.getFullYear()).slice(-2);
      setDeliveryDate(`${month}/${day}/${year}`);
    }
  };

  // Calculations
  const designCost = useMemo(() => cartItems.reduce((sum, item) => item.checked ? sum + (item.price * item.quantity) : sum, 0), [cartItems]);
  const subtotal = designCost;

  const openPreferences = () => setPrefModalVisible(true);
  const handleContinue = () => {
      setPrefModalVisible(false);
      setTimeout(() => setSelectPrinterModalVisible(true), 300);
  };


  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#3B2D85" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#121212]">
      <ScrollView className='w-full h-full pt-12 px-1' contentContainerStyle={{paddingBottom: 40}}>
        {/* Header */}
        <View className='w-full flex flex-row justify-between items-center px-6 py-4'>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} /></TouchableOpacity>
          <Text className='text-[#333333] dark:text-white text-xl font-semibold'>Cart</Text>
          <TouchableOpacity onPress={handleClearCart}><Text className="text-[#EB5757] text-lg font-semibold">Clear</Text></TouchableOpacity>
        </View> 

        {cartItems.length === 0 ? (
            <View className="flex-1 items-center justify-center pt-24">
                <Ionicons name="cart-outline" size={64} color={isDark ? "#A0A0A0" : "#BDBDBD"} />
                <Text className="text-[#828282] dark:text-gray-400 mt-4 text-base">Your cart is empty.</Text>
            </View>
        ) : (
            <>
                {/* Cart Items List */}
                {cartItems.map((item) => (
                <View key={item.id} className='items-center flex justify-center w-full'>
                    <View className='flex-row my-2 w-[92%] p-3.5 rounded-xl bg-white dark:bg-[#1E1E1E] shadow-sm border border-gray-100 dark:border-gray-800'>
                    
                    {/* Checkbox */}
                    <TouchableOpacity onPress={() => handleToggleCheck(item.id)} className='my-auto py-1 mr-3'>
                            {item.checked ? (
                                <View className='w-6 h-6 border border-[#3B2D85] rounded-md justify-center items-center bg-[#3B2D85]'><Ionicons name="checkmark" size={14} color="white" /></View>
                            ) : (
                                <View className='w-6 h-6 border-2 border-[#BDBDBD] rounded-md' />
                            )}
                    </TouchableOpacity>

                    <View style={{height: 90, width: 80}} className='bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden p-1 mr-3'>
                        <Image source={item.imageSource} resizeMode='contain' style={{ width: '100%', height: '100%' }} /> 
                    </View>

                    <View className='flex-1 flex-col py-1.5 justify-between'>
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                                <Text className='text-sm font-bold text-[#333333] dark:text-white mb-1' numberOfLines={1}>{item.name}</Text>
                                <Text className='text-sm font-extrabold text-[#333333] dark:text-white mb-2'>₦{(item.price).toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveItem(item.id)} className="pl-2">
                                <Ionicons name="trash-outline" size={20} color="#EB5757" />
                            </TouchableOpacity>
                        </View>

                        <View className='flex-row items-center justify-between mt-2'>
                        <View className="px-3 h-8 rounded-full bg-[#F5F5F5] dark:bg-gray-700 items-center justify-center mr-2 border border-gray-200 dark:border-gray-600">
                            <Text className="text-xs text-[#333] dark:text-white">{item.variantText}</Text>
                        </View>
                        
                        <View className='flex-row items-center gap-3'>
                            <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, 'decrease')} className='w-7 h-7 bg-[#2D71E3] rounded-md justify-center items-center'><Ionicons name="remove-outline" size={16} color="white" /></TouchableOpacity>
                            <Text className='text-base font-bold w-4 text-center text-black dark:text-white'>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, 'increase')} className='w-7 h-7 bg-[#2D71E3] rounded-md justify-center items-center'><Ionicons name="add-outline" size={16} color="white" /></TouchableOpacity>
                        </View>
                        </View>
                    </View>
                    </View>
                </View>
                ))}
            </>
        )}
      
        {/* Cart Summary */}
        <View className="px-6 mt-6 w-full mb-8">
            <Text className="text-lg font-bold text-[#333333] dark:text-white mb-5">Cart Summary</Text>
            
            <View className="flex-row justify-between mb-3">
                <Text className="text-[#828282] dark:text-gray-400">Design cost</Text>
                <Text className="text-[#333333] dark:text-white font-semibold">₦ {(designCost).toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
                <Text className="text-[#828282] dark:text-gray-400">Printing cost</Text>
                <Text className="text-[#333333] dark:text-white font-semibold">-</Text>
            </View>
            <View className="flex-row justify-between mb-5 border-b border-gray-200 dark:border-gray-800 pb-5">
                <Text className="text-[#828282] dark:text-gray-400">Pickup/delivery</Text>
                <Text className="text-[#333333] dark:text-white font-semibold">-</Text>
            </View>

            <View className="flex-row justify-between mb-4">
                <Text className="text-[#333333] dark:text-white font-bold text-lg">Subtotal</Text>
                <Text className="text-[#333333] dark:text-white font-bold text-lg">₦ {subtotal.toLocaleString()}</Text>
            </View>

            <View className="flex-row items-start gap-x-2 mb-6">
                <Ionicons name="information-circle-outline" size={18} color="#2D71E3" className="mt-0.5" />
                <Text className="text-[#2D71E3] text-xs leading-5 flex-1">
                    Items printing and pickup/delivery charge not included yet. Printing and delivery cost will be added after selecting a printer and negotiating printing cost. after which you&apos;d be directed to a checkout page
                </Text>
            </View>

            <TouchableOpacity 
              onPress={openPreferences} 
              disabled={designCost === 0}
              className={`w-full rounded-full py-4 items-center justify-center ${designCost === 0 ? 'bg-gray-400' : 'bg-[#3B2D85]'}`}
            >
                <Text className="text-white font-bold text-base">Print Product</Text>
            </TouchableOpacity>
        </View>

        {/* Explore Recent Designs Section */}
        <View className="px-6 w-full mb-4">
            <Text className="text-lg font-bold text-[#333333] dark:text-white mb-4">Explore recent designs</Text>
            
            <View className="flex-row flex-wrap justify-between">
                {recentDesigns.map((design) => (
                    <View key={design.id} className="w-[48%] bg-white dark:bg-[#1E1E1E] rounded-xl mb-4 p-2 shadow-sm border border-gray-100 dark:border-gray-800 relative">
                        <View className="w-full h-32 bg-[#F8F9FA] dark:bg-gray-800 rounded-lg overflow-hidden justify-center items-center mb-2">
                             <Image source={design.image} resizeMode="cover" className="w-full h-full" />
                        </View>
                        <TouchableOpacity className="absolute top-4 right-4 bg-white/80 dark:bg-black/50 p-1.5 rounded-full">
                            <Ionicons name="heart-outline" size={18} color={isDark ? "#FFF" : "#828282"} />
                        </TouchableOpacity>
                        
                        <Text className="text-[#333333] dark:text-white font-semibold text-sm mb-1" numberOfLines={1}>{design.name}</Text>
                        <Text className="text-[#828282] dark:text-gray-400 text-[10px] mb-2">By {design.author}</Text>
                        <Text className="text-[#333333] dark:text-white font-bold text-sm">₦{(design.price).toLocaleString()}</Text>
                    </View>
                ))}
            </View>
        </View>
      </ScrollView>

      {/* MODAL 1: PRINTING PREFERENCES */}
      <Modal animationType="slide" transparent={true} visible={isPrefModalVisible} onRequestClose={() => setPrefModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ maxHeight: screenHeight * 0.9, paddingBottom: 40 }} className="bg-white dark:bg-[#1E1E1E] rounded-t-[32px] w-full shadow-lg">
            
            {/* Header */}
            <View className="flex-row items-center justify-center pt-6 pb-4 px-6 relative border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => setPrefModalVisible(false)} className="absolute left-6 top-6">
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-[#333333] dark:text-white">Printing Preferences</Text>
            </View>

            <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false}>
                <Text className="text-[#828282] dark:text-gray-400 text-sm mb-6 leading-5">
                    Please enter preferred specifications for the choosen item
                </Text>

                <View className="mb-4 relative">
                    <Text className="text-xs text-[#333333] dark:text-white bg-white dark:bg-[#1E1E1E] absolute -top-2 left-3 z-10 px-1">Estimated Amount (₦)</Text>
                    <TextInput 
                        value={estimatedAmount} 
                        onChangeText={setEstimatedAmount} 
                        keyboardType="numeric" 
                        className="border border-[#3B2D85] dark:border-[#5E4CBA] rounded-xl px-4 py-3.5 text-[#333] dark:text-white" 
                    />
                </View>

                <View className="mb-4 relative">
                    <Text className="text-xs text-[#333333] dark:text-white bg-white dark:bg-[#1E1E1E] absolute -top-2 left-3 z-10 px-1">Preferred Delivery Date</Text>
                    <TouchableOpacity 
                        onPress={() => setShowDatePicker(true)}
                        className="border border-[#3B2D85] dark:border-[#5E4CBA] rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                    >
                        <Text className={deliveryDate ? "flex-1 text-[#333] dark:text-white" : "flex-1 text-[#BDBDBD]"}>
                            {deliveryDate || "mm/dd/yy"}
                        </Text>
                        <Feather name="calendar" size={20} color={isDark ? "#A0A0A0" : "#828282"} />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={onChangeDate}
                            minimumDate={new Date()} 
                        />
                    )}
                </View>

                <View className="mb-6 relative">
                    <Text className="text-xs text-[#333333] dark:text-white bg-white dark:bg-[#1E1E1E] absolute -top-2 left-3 z-10 px-1">Delivery Address</Text>
                    <View className="border border-[#3B2D85] dark:border-[#5E4CBA] rounded-xl px-4 py-3.5 flex-row items-center">
                        <Ionicons name="location-outline" size={20} color={isDark ? "#A0A0A0" : "#828282"} className="mr-2" />
                        <TextInput 
                            value={deliveryAddress} 
                            onChangeText={setDeliveryAddress} 
                            placeholder="Enter Address" 
                            placeholderTextColor="#BDBDBD" 
                            className="flex-1 text-[#333] dark:text-white" 
                        />
                    </View>
                </View>

                <Text className="text-[#333333] dark:text-white font-bold text-base mb-4">Do you have your own item?</Text>
                
                <TouchableOpacity onPress={() => setHasOwnItem(true)} className="flex-row items-start gap-x-3 mb-4">
                    <View className={`w-5 h-5 rounded-full border-2 ${hasOwnItem ? 'border-[#3B2D85]' : 'border-gray-300'} items-center justify-center mt-0.5`}>
                        {hasOwnItem && <View className="w-2.5 h-2.5 rounded-full bg-[#3B2D85]" />}
                    </View>
                    <Text className="text-[#828282] dark:text-gray-300 text-sm flex-1 leading-5">Yes, i have my items and i would like a pickup and delivery service</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setHasOwnItem(false)} className="flex-row items-start gap-x-3 mb-6">
                    <View className={`w-5 h-5 rounded-full border-2 ${!hasOwnItem ? 'border-[#3B2D85]' : 'border-gray-300'} items-center justify-center mt-0.5`}>
                        {!hasOwnItem && <View className="w-2.5 h-2.5 rounded-full bg-[#3B2D85]" />}
                    </View>
                    <Text className="text-[#828282] dark:text-gray-300 text-sm flex-1 leading-5">No, get item from the printer&apos;s inventory with delivery service</Text>
                </TouchableOpacity>

                {hasOwnItem && (
                    <View className="mb-6 relative">
                        <Text className="text-xs text-[#333333] dark:text-white bg-white dark:bg-[#1E1E1E] absolute -top-2 left-3 z-10 px-1">Pickup Address</Text>
                        <View className="border border-[#3B2D85] dark:border-[#5E4CBA] rounded-xl px-4 py-3.5 flex-row items-center">
                            <Ionicons name="location-outline" size={20} color={isDark ? "#A0A0A0" : "#828282"} className="mr-2" />
                            <TextInput 
                                value={pickupAddress} 
                                onChangeText={setPickupAddress} 
                                placeholder="Enter Address" 
                                placeholderTextColor="#BDBDBD" 
                                className="flex-1 text-[#333] dark:text-white" 
                            />
                        </View>
                    </View>
                )}

                <TouchableOpacity onPress={handleContinue} className="w-full bg-[#3B2D85] rounded-full py-4 items-center justify-center mt-2 mb-8">
                    <Text className="text-white font-bold text-base">Continue</Text>
                </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 2: SELECT PRINTER */}
      <Modal animationType="slide" transparent={true} visible={isSelectPrinterModalVisible} onRequestClose={() => setSelectPrinterModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }} className="bg-white dark:bg-[#1E1E1E] rounded-t-[32px] px-6 pt-6 w-full items-center relative">
            
            <View className="flex-row items-center w-full mb-8 relative">
                <Text className="text-lg font-semibold text-[#333333] dark:text-white mx-auto">Select Printer</Text>
                <TouchableOpacity onPress={() => setSelectPrinterModalVisible(false)} className="absolute right-0">
                    <Ionicons name="close" size={24} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>
            </View>

            <View className="w-28 h-28 justify-center items-center mb-6">
                 <Image source={require('@/assets/images/printer-icon.png')} resizeMode="contain" style={{ width: '100%', height: '100%', tintColor: isDark ? '#A0A0A0' : '#BDBDBD' }} />
            </View>

            <Text className="text-[#828282] text-center dark:text-gray-400 text-[15px] leading-6 px-4 mb-10">
              Select and message a printer of your choice for printing preferences and printing cost negotiation
            </Text>

            <TouchableOpacity onPress={navigateToPrinters} className="w-full bg-[#3B2D85] rounded-full py-4 items-center justify-center mb-4">
                <Text className="text-white text-center w-full font-bold text-base">Select Printer</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}