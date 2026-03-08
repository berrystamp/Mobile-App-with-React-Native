import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator,
  Modal,
} from "react-native";

export interface ChatMessage {
  id: string;
  senderId: "me" | "printer"; 
  type: "text" | "product_bundle" | "offer"; 
  text?: string;
  timestamp: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { printerId } = useLocalSearchParams(); 
  const isDark = useColorScheme() === "dark";
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isOfferModalVisible, setOfferModalVisible] = useState(false);
  const [isCartSummaryModalVisible, setCartSummaryModalVisible] = useState(false);
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // ==========================================
  // BACKEND INTEGRATION HANDLERS
  // ==========================================

  useEffect(() => {
    const fetchMessages = async () => {
      // --- SIMULATED BACKEND DATA ---
      setTimeout(() => {
        setMessages([
          { id: "msg_1", senderId: "me", type: "product_bundle", timestamp: "12:01 PM" },
          { id: "msg_2", senderId: "me", type: "text", text: "Hi, Good day.\nI'd like to hire you for printing service", timestamp: "12:02 PM" },
          { id: "msg_3", senderId: "printer", type: "text", text: "Hi Mohh_Jumah. i used AlphaWorld app to come up wth the animation", timestamp: "12:02 PM" },
          { id: "msg_4", senderId: "printer", type: "offer", timestamp: "12:05 PM" },
        ]);
        setIsLoading(false);
      }, 800);
    };
    fetchMessages();
  }, [printerId]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: "me",
      type: "text",
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // TODO: IMPLEMENT BACKEND SEND MESSAGE HERE

    setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Flow: Accept Offer -> Show Cart Summary
  const handleAcceptOfferClick = () => {
      setOfferModalVisible(false);
      setTimeout(() => setCartSummaryModalVisible(true), 300);
  };

  // Flow: Reject Offer -> Show Confirmation Dialog
  const handleRejectOfferClick = () => {
      setOfferModalVisible(false);
      setTimeout(() => setRejectModalVisible(true), 300);
  };

  // Final Action: Proceed to Payment
  const proceedToPayment = async () => {
      // TODO: IMPLEMENT BACKEND PAYMENT / CHECKOUT INITIALIZATION HERE
      console.log("Proceeding to payment...");
      setCartSummaryModalVisible(false);
      router.push('/checkout');
  };

  // Final Action: Confirm Rejection
  const confirmRejectOffer = async () => {
      // TODO: IMPLEMENT BACKEND OFFER REJECTION HERE
      console.log("Offer Rejected");
      setRejectModalVisible(false);
      // You might want to add a system message to the chat array here saying "Offer Rejected"
  };

  // ==========================================
  // RENDERERS
  // ==========================================

  const renderMessage = (msg: ChatMessage) => {
    if (msg.type === "product_bundle") {
      return (
        <View key={msg.id} className="self-end mb-6 w-[75%] bg-white dark:bg-[#1E1E1E] rounded-2xl rounded-tr-none border border-gray-100 dark:border-gray-800 p-3 shadow-sm">
          <View className="flex-row flex-wrap justify-between mb-2">
            <Image source={require("@/assets/images/item1.png")} className="w-[48%] h-24 bg-gray-100 rounded-lg mb-2" resizeMode="cover" />
            <Image source={require("@/assets/images/item2.png")} className="w-[48%] h-24 bg-gray-100 rounded-lg mb-2" resizeMode="cover" />
            <Image source={require("@/assets/images/item3.png")} className="w-[48%] h-24 bg-gray-100 rounded-lg" resizeMode="cover" />
            <View className="w-[48%] h-24 bg-gray-800 rounded-lg items-center justify-center relative overflow-hidden">
              <Image source={require("@/assets/images/item4.png")} className="w-full h-full opacity-50 absolute" resizeMode="cover" />
              <Text className="text-white font-bold z-10">+2 Items</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/products")} className="w-full py-2 items-center justify-center border-t border-gray-100 dark:border-gray-800 mt-1">
            <Text className="text-[#3B2D85] dark:text-[#7A6AE6] font-semibold text-sm">View the 5 Products</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (msg.type === "offer") {
      return (
        <View key={msg.id} className="self-start ml-10 mb-6 w-[80%] bg-white dark:bg-[#1E1E1E] rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <View className="flex-row gap-x-2 mb-3 items-center">
            <View className="w-8 h-8 border border-[#E5E5EA] bg-[#F8F8F8] dark:bg-gray-800 items-center justify-center rounded-lg">
              <Ionicons name="document-text-outline" size={16} color="#3B2D85" />
            </View>
            <View className="flex-1">
              <Text className="text-[#828282] dark:text-gray-400 text-xs">Offer from Mohh_Jumah</Text>
              <Text className="text-[#333333] dark:text-white font-semibold text-xs mt-0.5" numberOfLines={1}>Screen printing on items (Long Sleeve, Bags, rou...)</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-x-3 mb-4">
            <Text className="text-[#2D71E3] font-bold text-lg">₦10,000</Text>
            <Text className="text-[#828282] dark:text-gray-400 text-xs">Due on 23/12/2022</Text>
          </View>
          <View className="flex-row justify-between gap-x-2">
            <TouchableOpacity onPress={() => setOfferModalVisible(true)} className="flex-1 bg-[#3B2D85] py-2.5 rounded-lg items-center">
              <Text className="text-white font-semibold text-sm">See details</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRejectOfferClick} className="flex-1 bg-white border border-[#EB5757] py-2.5 rounded-lg items-center">
              <Text className="text-[#EB5757] font-semibold text-sm">Reject Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const isMe = msg.senderId === "me";
    return (
      <View key={msg.id} className={`flex-row items-end gap-x-2 mb-6 ${isMe ? 'self-end' : 'self-start'}`}>
        {!isMe && <Image source={require("@/assets/images/item1.png")} className="w-8 h-8 rounded-full mb-2" />}
        <View className={`${isMe ? 'bg-[#3B2D85] rounded-tr-none' : 'bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-tl-none'} rounded-2xl p-4 max-w-[80%] shadow-sm`}>
          <Text className={`${isMe ? 'text-white' : 'text-[#333333] dark:text-white'} text-sm leading-5 font-bold`}>{msg.text}</Text>
          <Text className={`${isMe ? 'text-[#D1CDE8] self-end' : 'text-[#828282] dark:text-gray-400'} text-[10px] mt-1 font-normal`}>
            {isMe ? `Seen • ${msg.timestamp}` : `${msg.timestamp} • Seen`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0} className="bg-gray-50 dark:bg-[#121212]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-white dark:bg-[#1E1E1E] shadow-sm z-10">
        <View className="flex-row items-center gap-x-3">
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} /></TouchableOpacity>
          <Image source={require("@/assets/images/item2.png")} className="w-10 h-10 rounded-full" />
          <View>
            <Text className="text-[#333333] dark:text-white font-bold text-base">De_Sportman</Text>
            <Text className="text-[#828282] dark:text-gray-400 text-xs">2hrs ago</Text>
          </View>
        </View>
        <TouchableOpacity><Ionicons name="ellipsis-vertical" size={20} color={isDark ? "#FFFFFF" : "#000000"} /></TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#3B2D85" /></View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled" 
          className="flex-1 px-4 py-6"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
        </ScrollView>
      )}

      {/* Input Area */}
      <View className="px-4 py-3 bg-white dark:bg-[#1E1E1E] border-t border-gray-100 dark:border-gray-800 flex-row items-end gap-x-2">
        <View className="flex-1 flex-row items-end bg-gray-50 dark:bg-[#2C2C2C] rounded-3xl px-4 py-1 gap-x-2 border border-gray-200 dark:border-gray-700 min-h-[48px] max-h-[120px]">
          <Feather name="smile" size={20} color={isDark ? "#A0A0A0" : "#828282"} className="mb-2.5" />
          <TextInput multiline={true} placeholder="Send message" placeholderTextColor={isDark ? "#A0A0A0" : "#828282"} value={message} onChangeText={setMessage} className="flex-1 text-[#333] dark:text-white font-bold py-3" style={{ maxHeight: 100 }} />
          <Feather name="image" size={20} color={isDark ? "#A0A0A0" : "#828282"} className="mb-2.5" />
          <Feather name="paperclip" size={20} color={isDark ? "#A0A0A0" : "#828282"} className="mb-2.5" />
        </View>
        <TouchableOpacity onPress={handleSendMessage} disabled={!message.trim()} className={`w-12 h-12 rounded-full items-center justify-center mb-0.5 ${message.trim() ? 'bg-[#3B2D85]' : 'bg-gray-400 dark:bg-gray-700'}`}>
          <Ionicons name="send" size={18} color="white" className="ml-1" />
        </TouchableOpacity>
      </View>

      {/* ========================================== */}
      {/* MODAL 1: ORDER DETAIL (Review before accepting) */}
      {/* ========================================== */}
      <Modal animationType="slide" transparent={true} visible={isOfferModalVisible} onRequestClose={() => setOfferModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' }} className="bg-white dark:bg-[#1E1E1E] rounded-t-[32px] px-6 pt-6 w-full shadow-lg">
            <View className="flex-row justify-between items-center w-full mb-4 relative">
                <Text className="text-lg font-bold text-[#333333] dark:text-white mx-auto">Order Detail</Text>
                <TouchableOpacity onPress={() => setOfferModalVisible(false)} className="absolute right-0"><Ionicons name="close" size={24} color={isDark ? "#FFF" : "#333"} /></TouchableOpacity>
            </View>
            <Text className="text-[#828282] dark:text-gray-400 text-sm text-center mb-6 leading-5 px-4">Review information to ensure details is exactly as agreed with printer before accepting</Text>

            <ScrollView showsVerticalScrollIndicator={false} className="w-full">
                <View className="mb-4">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm mb-1">Order title</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs leading-5">Screen printing on items (Hoodie and Towel)</Text>
                </View>
                <View className="mb-4">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm mb-1">Brief description of order agreed specifications</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs leading-5">Printing design on hoodie and towel to be provided from my inventory. Hoodie should be blue colour in medium size at 10pieces in which 8 will be medium size and 2 will be small size. Same as towel.</Text>
                </View>
                <View className="mb-4">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm mb-1">Agreed amount</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs leading-5">₦10,000</Text>
                </View>
                <View className="mb-4">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm mb-1">Selected agreed item source</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs leading-5">Hoodie to be provided by printer and towel to be picked up from customer</Text>
                </View>
                <View className="mb-8">
                    <Text className="text-[#333333] dark:text-white font-bold text-sm mb-1">Need pickup logistics</Text>
                    <Text className="text-[#828282] dark:text-gray-400 text-xs leading-5">Yes</Text>
                </View>

                {/* Actions */}
                <TouchableOpacity onPress={handleAcceptOfferClick} className="w-full bg-[#3B2D85] rounded-full py-4 items-center justify-center mb-3">
                    <Text className="text-white font-bold text-sm">Accept offer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRejectOfferClick} className="w-full bg-white dark:bg-[#1E1E1E] border border-[#EB5757] rounded-full py-4 items-center justify-center mb-6">
                    <Text className="text-[#EB5757] font-bold text-sm">Reject Offer</Text>
                </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 2: CART SUMMARY (After Accepting)    */}
      {/* ========================================== */}
      <Modal animationType="slide" transparent={true} visible={isCartSummaryModalVisible} onRequestClose={() => setCartSummaryModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }} className="bg-white dark:bg-[#1E1E1E] rounded-t-[32px] px-6 pt-8 w-full shadow-lg relative mt-12">
            


            {/* Header */}
            <View className="flex-row items-center w-full mb-8 relative">
                       <Text className="text-lg font-semibold text-[#333333] dark:text-white mx-auto">
                           Cart Summary
                       </Text>
                       <TouchableOpacity onPress={() => setCartSummaryModalVisible(false)} className="absolute right-0">
                           <Ionicons name="close" size={24} color={isDark ? "#FFF" : "#333"} />
                       </TouchableOpacity>
                     
                   </View>
{/* 
            <Text className="text-xl font-bold text-[#333333] dark:text-white text-center mb-8">Your Cart Summary</Text> */}

            <View className="w-full mb-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-[#828282] dark:text-gray-400 text-sm">Design cost</Text>
                    <Text className="text-[#333333] dark:text-white font-semibold text-sm">₦ 11,600</Text>
                </View>
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-[#828282] dark:text-gray-400 text-sm">Printing cost</Text>
                    <Text className="text-[#333333] dark:text-white font-semibold text-sm">₦ 10,000</Text>
                </View>
                <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <Text className="text-[#828282] dark:text-gray-400 text-sm">Pickup/delivery</Text>
                    <Text className="text-[#333333] dark:text-white font-semibold text-sm">₦ 5,000</Text>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-[#333333] dark:text-white font-bold text-base">Total</Text>
                    <Text className="text-[#333333] dark:text-white font-bold text-base">₦ 26,600</Text>
                </View>
            </View>

            <TouchableOpacity onPress={proceedToPayment} className="w-full bg-[#3B2D85] rounded-full py-4 items-center justify-center mb-4">
                <Text className="text-white font-bold text-sm">Proceed to Payment</Text>
            </TouchableOpacity>

            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mt-2 mx-auto" />
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 3: REJECT CONFIRMATION DIALOG        */}
      {/* ========================================== */}
      <Modal animationType="fade" transparent={true} visible={isRejectModalVisible} onRequestClose={() => setRejectModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <View className="bg-white dark:bg-[#1E1E1E] w-[85%] rounded-[24px] p-6 shadow-lg relative">
                
                {/* Close Button top right */}
                <TouchableOpacity onPress={() => setRejectModalVisible(false)} className="absolute top-4 right-4 z-10">
                    <Ionicons name="close" size={20} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>

                {/* Logo Area */}
                <View className="flex-row items-center mb-6">
                    <Ionicons name="chatbubbles" size={18} color="#3B2D85" className="mr-1" />
                    <Text className="font-extrabold text-[#3B2D85] text-sm tracking-wider">Berrystamp</Text>
                </View>

                <Text className="text-[#333333] dark:text-gray-300 text-[15px] leading-6 mb-8">
                    Are you sure you want to reject this offer? Rejecting offer means you won&apos;t be able to proceed with your negotiation.
                </Text>

                <View className="flex-row border-t border-gray-100 dark:border-gray-800 pt-4 -mx-6 px-2">
                    <TouchableOpacity onPress={() => setRejectModalVisible(false)} className="flex-1 items-center justify-center border-r border-gray-100 dark:border-gray-800">
                        <Text className="text-[#828282] dark:text-gray-400 font-semibold text-[15px]">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmRejectOffer} className="flex-1 items-center justify-center">
                        <Text className="text-[#EB5757] font-semibold text-[15px]">Reject</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}