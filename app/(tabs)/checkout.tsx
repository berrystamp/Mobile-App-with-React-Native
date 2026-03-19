import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Platform, useColorScheme, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import '../global.css'; // Ensure global styles are imported
export default function CheckoutScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  // Step Management
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form States - Personal Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);

  // Form States - Shipping
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Form States - Payment
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Payoneer' | 'PayPal'>('Card');
  const [selectedCard, setSelectedCard] = useState<'mastercard' | 'visa' | null>('mastercard');
  const [isCartSummaryExpanded, setIsCartSummaryExpanded] = useState(false);

  // Modal States
  const [isAddCardVisible, setAddCardVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isSuccessVisible, setSuccessVisible] = useState(false);

  // Add Card Form States
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [saveNewCard, setSaveNewCard] = useState(false);

  // Totals (Mock Data)
  const cartTotals = { design: 11600, printing: 10000, logistics: 5000, total: 26600 };

  // Navigation Handlers
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setConfirmVisible(true); // Open confirmation modal instead of immediate processing
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  // ==========================================
  // BACKEND INTEGRATION HANDLERS
  // ==========================================

  const submitPayment = async () => {
    setConfirmVisible(false);
    setIsProcessing(true);

    const orderPayload = {
      personal: { firstName, lastName, email, phone, saveAddress },
      shipping: { address, country, stateRegion, city, zipCode },
      payment: { method: paymentMethod, card: selectedCard },
      totalAmount: cartTotals.total
    };

    // TODO: IMPLEMENT BACKEND CHECKOUT / PAYMENT API CALL HERE
    // try {
    //   const response = await fetch('YOUR_API_ENDPOINT/orders/create', {
    //     method: 'POST',
    //     body: JSON.stringify(orderPayload)
    //   });
    //   const result = await response.json();
    //   if(result.success) {
    //      setIsProcessing(false);
    //      setSuccessVisible(true);
    //   }
    // } catch(error) {
    //   console.error("Payment failed", error);
    //   setIsProcessing(false);
    // }

    console.log("Processing Order Payload:", orderPayload);

    // Simulated Backend Delay
    setTimeout(() => {
        setIsProcessing(false);
        setSuccessVisible(true); // Show success modal
    }, 2000);
  };

  const handleAddNewCardAndPay = () => {
    // Validate card inputs here
    setAddCardVisible(false);
    // Once card is added successfully to backend, trigger confirmation
    setTimeout(() => setConfirmVisible(true), 300);
  };

  // --- RENDER HELPERS ---

  const renderProgressBar = () => (
    <View className="flex-row items-center justify-center w-full px-12 mb-8">
      {[1, 2, 3].map((item, index) => (
        <React.Fragment key={item}>
          <View className={`w-4 h-4 rounded-full items-center justify-center border-2 ${step >= item ? 'border-[#3B2D85]' : 'border-gray-200 dark:border-gray-700'}`}>
            {step >= item && <View className="w-1.5 h-1.5 bg-[#3B2D85] rounded-full" />}
          </View>
          {index < 2 && <View className={`flex-1 h-[2px] ${step > item ? 'bg-[#3B2D85]' : 'bg-gray-100 dark:bg-gray-800'}`} />}
        </React.Fragment>
      ))}
    </View>
  );

  const renderCartSummaryBlock = () => (
      <View className="w-full">
          <TouchableOpacity 
              onPress={() => setIsCartSummaryExpanded(!isCartSummaryExpanded)}
              className="flex-row justify-between items-center w-full border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3.5 mb-2 bg-[#F8F9FA] dark:bg-[#1E1E1E]"
          >
              <View className="flex-row items-center gap-x-2">
                  <Ionicons name="cart-outline" size={20} color={isDark ? "#A0A0A0" : "#828282"} />
                  <Text className="text-[#333333] dark:text-white font-semibold">Cart Summary</Text>
                  <Ionicons name={isCartSummaryExpanded ? "chevron-up" : "chevron-down"} size={16} color={isDark ? "#A0A0A0" : "#828282"} />
              </View>
              <Text className="text-[#3B2D85] dark:text-[#7A6AE6] font-bold text-base">₦ {cartTotals.total.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Expanded Summary Details */}
          {isCartSummaryExpanded && (
              <View className="w-full px-4 py-4 mb-4 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
                  <View className="flex-row justify-between mb-2">
                      <Text className="text-[#828282] dark:text-gray-400 text-sm">Design cost</Text>
                      <Text className="text-[#333333] dark:text-white font-semibold text-sm">₦ {cartTotals.design.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                      <Text className="text-[#828282] dark:text-gray-400 text-sm">Printing cost</Text>
                      <Text className="text-[#333333] dark:text-white font-semibold text-sm">₦ {cartTotals.printing.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                      <Text className="text-[#828282] dark:text-gray-400 text-sm">Pickup/delivery</Text>
                      <Text className="text-[#333333] dark:text-white font-semibold text-sm">₦ {cartTotals.logistics.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between">
                      <Text className="text-[#333333] dark:text-white font-bold">Total</Text>
                      <Text className="text-[#3B2D85] font-bold">₦ {cartTotals.total.toLocaleString()}</Text>
                  </View>
              </View>
          )}
      </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#121212]">
      {/* Header */}
      <View className="w-full flex-row items-center justify-between px-6 pt-14 pb-4 bg-white dark:bg-[#121212] z-10">
        <TouchableOpacity onPress={handleBack} className="-ml-2 p-2"><Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} /></TouchableOpacity>
        <Text className="text-[#333333] dark:text-white text-lg font-bold">Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: isCartSummaryExpanded ? 220 : 160 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {renderProgressBar()}

          {step === 1 && (
            <View className="w-full">
                <Text className="text-center font-bold text-[#333333] dark:text-white mb-6">Personal Details</Text>
                <TextInput placeholder="First Name" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={firstName} onChangeText={setFirstName} className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 mb-4 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                <TextInput placeholder="Last Name" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={lastName} onChangeText={setLastName} className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 mb-4 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                <TextInput placeholder="Enter Email" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={email} onChangeText={setEmail} keyboardType="email-address" className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 mb-4 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                <View className="w-full border border-gray-200 dark:border-gray-800 rounded-xl flex-row items-center mb-4 bg-white dark:bg-[#1E1E1E] overflow-hidden">
                    <View className="flex-row items-center px-4 py-3.5 border-r border-gray-200 dark:border-gray-800"><Text className="text-lg mr-1">🇳🇬</Text><Ionicons name="chevron-down" size={14} color={isDark ? "#828282" : "#333"} /></View>
                    <TextInput placeholder="Phone Number" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={phone} onChangeText={setPhone} keyboardType="phone-pad" className="flex-1 px-4 py-3.5 text-[#333] dark:text-white" />
                </View>
                <TouchableOpacity onPress={() => setSaveAddress(!saveAddress)} className="flex-row items-center gap-x-2 mt-2">
                    <View className={`w-5 h-5 rounded border items-center justify-center ${saveAddress ? 'border-[#3B2D85] bg-[#3B2D85]' : 'border-gray-300 dark:border-gray-600'}`}>
                        {saveAddress && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text className="text-sm text-[#828282] dark:text-gray-400">Save shipping address</Text>
                </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
             <View className="w-full">
                <Text className="text-center font-bold text-[#333333] dark:text-white mb-6">Shipping details</Text>
                <TextInput placeholder="Shipping Address" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={address} onChangeText={setAddress} className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 mb-4 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                <View className="flex-row justify-between w-full mb-4">
                    <TextInput placeholder="Country" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={country} onChangeText={setCountry} className="w-[48%] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                    <TextInput placeholder="State" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={stateRegion} onChangeText={setStateRegion} className="w-[48%] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                </View>
                <View className="flex-row justify-between w-full">
                    <TextInput placeholder="City" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={city} onChangeText={setCity} className="w-[48%] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                    <TextInput placeholder="Zip Code" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={zipCode} onChangeText={setZipCode} keyboardType="numeric" className="w-[48%] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                </View>
             </View>
          )}

          {step === 3 && (
            <View className="w-full">
                <Text className="text-center font-bold text-[#333333] dark:text-white mb-6">Payment method</Text>
                
                <View className="flex-row justify-between items-center w-full mb-8">
                    {(['Card', 'Payoneer', 'PayPal'] as const).map((method) => (
                    <TouchableOpacity key={method} onPress={() => setPaymentMethod(method)} className="flex-row items-center gap-x-2">
                        <View className="w-4 h-4 rounded-full border-2 border-[#3B2D85] items-center justify-center">
                        {paymentMethod === method && <View className="w-2 h-2 rounded-full bg-[#3B2D85]" />}
                        </View>
                        <Text className={`text-sm ${paymentMethod === method ? 'text-[#333333] dark:text-white font-semibold' : 'text-[#828282] dark:text-gray-400'}`}>{method}</Text>
                    </TouchableOpacity>
                    ))}
                </View>

                {paymentMethod === 'Card' && (
                    <View className="w-full">
                        <TouchableOpacity onPress={() => setSelectedCard('mastercard')} className="w-full flex-row items-center justify-between border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-4 mb-4 bg-white dark:bg-[#1E1E1E] shadow-sm">
                            <View className="flex-row items-center gap-x-4">
                            <FontAwesome5 name="cc-mastercard" size={24} color="#EB001B" />
                            <Text className="text-[#333333] dark:text-white tracking-widest font-semibold">**** **** **** 1211</Text>
                            </View>
                            <View className={`w-5 h-5 rounded-full border-2 ${selectedCard === 'mastercard' ? 'border-[#3B2D85]' : 'border-gray-300'} items-center justify-center`}>
                            {selectedCard === 'mastercard' && <View className="w-2.5 h-2.5 rounded-full bg-[#3B2D85]" />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setSelectedCard('visa')} className="w-full flex-row items-center justify-between border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-4 mb-6 bg-white dark:bg-[#1E1E1E] shadow-sm">
                            <View className="flex-row items-center gap-x-4">
                            <FontAwesome5 name="cc-visa" size={24} color="#1A1F71" />
                            <Text className="text-[#333333] dark:text-white tracking-widest font-semibold">**** **** **** 1211</Text>
                            </View>
                            <View className={`w-5 h-5 rounded-full border-2 ${selectedCard === 'visa' ? 'border-[#3B2D85]' : 'border-gray-300'} items-center justify-center`}>
                            {selectedCard === 'visa' && <View className="w-2.5 h-2.5 rounded-full bg-[#3B2D85]" />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setAddCardVisible(true)} className="w-full items-center justify-center py-2">
                            <Text className="text-[#2D71E3] font-semibold text-sm">+ Add new Card</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E1E1E] px-6 py-6 border-t border-gray-100 dark:border-gray-800 shadow-lg">
        {renderCartSummaryBlock()}
        <TouchableOpacity 
            onPress={handleNext} 
            disabled={isProcessing}
            className="w-full bg-[#3B2D85] rounded-full py-4 items-center justify-center mb-3"
        >
            {isProcessing ? <ActivityIndicator color="#FFF" /> : <Text className="text-white font-bold text-base">Proceed</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack} className="w-full py-2 items-center justify-center">
            <Text className="text-[#3B2D85] dark:text-[#7A6AE6] font-semibold text-sm">Back</Text>
        </TouchableOpacity>
      </View>


      {/* ========================================== */}
      {/* MODAL 1: ADD NEW PAYMENT CARD              */}
      {/* ========================================== */}
      <Modal animationType="slide" transparent={true} visible={isAddCardVisible} onRequestClose={() => setAddCardVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }} className="bg-white dark:bg-[#1E1E1E] rounded-t-[32px] px-6 pt-6 w-full shadow-lg">
            
            <View className="flex-row justify-between items-center w-full mb-6 relative">
                <Text className="text-lg font-semibold text-[#333333] dark:text-white mx-auto">Add Payment card</Text>
                <TouchableOpacity onPress={() => setAddCardVisible(false)} className="absolute right-0">
                    <Ionicons name="close" size={24} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>
            </View>

            <Text className="text-lg font-bold text-[#333333] dark:text-white text-center mb-6">Input card Information</Text>

            <ScrollView showsVerticalScrollIndicator={false} className="w-full mb-4">
                <TextInput placeholder="Card Number" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={newCardNumber} onChangeText={setNewCardNumber} keyboardType="numeric" className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 mb-4 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                <View className="flex-row justify-between w-full mb-4">
                    <TextInput placeholder="CVC/CVV" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={newCardCvv} onChangeText={setNewCardCvv} keyboardType="numeric" secureTextEntry className="w-[48%] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                    <TextInput placeholder="Expiry Date" placeholderTextColor={isDark ? "#828282" : "#BDBDBD"} value={newCardExpiry} onChangeText={setNewCardExpiry} className="w-[48%] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-[#333] dark:text-white bg-white dark:bg-[#1E1E1E]" />
                </View>

                <TouchableOpacity onPress={() => setSaveNewCard(!saveNewCard)} className="flex-row items-center gap-x-2 mb-8">
                    <View className={`w-5 h-5 rounded border items-center justify-center ${saveNewCard ? 'border-[#3B2D85] bg-[#3B2D85]' : 'border-gray-300 dark:border-gray-600'}`}>
                        {saveNewCard && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text className="text-sm text-[#828282] dark:text-gray-400">Save card details for future payment</Text>
                </TouchableOpacity>

                {renderCartSummaryBlock()}

                <TouchableOpacity onPress={handleAddNewCardAndPay} className="w-full bg-[#3B2D85] rounded-full py-4 items-center justify-center mt-2">
                    <Text className="text-white font-bold text-sm">Make Payment</Text>
                </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 2: CONFIRM PAYMENT                   */}
      {/* ========================================== */}
      <Modal animationType="fade" transparent={true} visible={isConfirmVisible} onRequestClose={() => setConfirmVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }} className="bg-white dark:bg-[#1E1E1E] rounded-t-[32px] px-6 pt-8 w-full shadow-lg">
            
            <Text className="text-[#F2994A] font-bold text-lg mb-4">Make payment?</Text>
            <Text className="text-[#828282] dark:text-gray-400 text-sm leading-6 mb-8">
                Are you sure you want to Make a payment of <Text className="font-bold text-[#333] dark:text-white">₦ {cartTotals.total.toLocaleString()}</Text> for printing the designs? This amount will be deducted from the selected mode of payment
            </Text>

            <TouchableOpacity 
                onPress={submitPayment} 
                className="w-full bg-[#3B2D85] rounded-full py-4 items-center justify-center mb-4"
            >
                <Text className="text-white font-bold text-base">Proceed</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setConfirmVisible(false)} className="w-full py-2 items-center justify-center mb-2">
                <Text className="text-[#3B2D85] dark:text-[#7A6AE6] font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 3: PAYMENT SUCCESS                   */}
      {/* ========================================== */}
      <Modal animationType="fade" transparent={true} visible={isSuccessVisible}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }} className="bg-white dark:bg-[#1E1E1E] rounded-t-[32px] px-6 pt-10 w-full shadow-lg items-center">
            
            <View className="w-20 h-20 rounded-full border-4 border-[#3B2D85] items-center justify-center mb-6">
                <Ionicons name="checkmark" size={40} color="#3B2D85" />
            </View>

            <Text className="text-xl font-bold text-[#333333] dark:text-white mb-2">Payment successful!!</Text>
            <Text className="text-[#828282] dark:text-gray-400 text-sm text-center px-4 leading-5 mb-10">
                Thanks for placing an order. Your payment is successful
            </Text>

            <TouchableOpacity 
                onPress={() => {
                    setSuccessVisible(false);
                    // Navigate to orders history tab/page
                    router.push('/orders'); 
                }} 
                className="w-full bg-[#3B2D85] rounded-full py-4 items-center justify-center mb-4"
            >
                <Text className="text-white font-bold text-base">Go to Order</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => {
                    setSuccessVisible(false);
                    router.push('/(tabs)'); // Navigate back to main home tab
                }} 
                className="w-full py-2 items-center justify-center mb-2"
            >
                <Text className="text-[#828282] dark:text-gray-400 font-semibold text-sm">Back to home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}