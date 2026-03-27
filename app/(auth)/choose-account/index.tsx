import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  StatusBar,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
} from "react-native";

export default function ChooseAccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  // Track selected role. Defaulting to customer.
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "DESIGNER" | "PRINTER">("CUSTOMER");

  const theme = {
    background: isDark ? "#121212" : "#FAFAFA",
    purple: "#4B3A99",
    lightPurple: isDark ? "#4B3A9930" : "#EFEAFE",
  };

  const handleContinue = () => {
    // Navigate to the signup screen and pass the selected role as a parameter
    router.push({
        pathname: "/signup",
        params: { profileType: selectedRole }
    });
  };

  return (
    <View className="flex-1 px-6 pt-24 pb-10" style={{ backgroundColor: theme.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Main Title */}
      <Text className="text-[26px] font-bold text-center text-[#1A1A1A] dark:text-white mb-10">
        Welcome to Berrystamp!
      </Text>

      {/* Overlapping Avatars (as seen in Figma) */}
      <View className="flex-row justify-center items-center mb-10 relative h-16">
         {/* You will need to add these local images to your assets folder, or use URLs */}
         <View className="w-12 h-12 rounded-full border-2 border-white dark:border-[#121212] overflow-hidden absolute left-[38%] z-10 bg-gray-200">
             {/* <Image source={require('@/assets/images/avatar1.png')} className="w-full h-full" /> */}
         </View>
         <View className="w-16 h-16 rounded-full border-2 border-white dark:border-[#121212] overflow-hidden absolute z-20 bg-gray-300">
             {/* <Image source={require('@/assets/images/avatar2.png')} className="w-full h-full" /> */}
         </View>
         <View className="w-12 h-12 rounded-full border-2 border-white dark:border-[#121212] overflow-hidden absolute right-[38%] z-10 bg-gray-400 items-center justify-center">
             <Text className="text-white font-bold text-lg">B</Text>
         </View>
      </View>

      <View className="flex-1 w-full flex-col gap-y-4 mt-6">
        
        {/* Customer Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedRole("CUSTOMER")}
          className={`flex-row items-center p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E] border ${selectedRole === "CUSTOMER" ? "border-[#4B3A99]" : "border-transparent dark:border-gray-800"}`}
          style={!isDark && { elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 15, shadowOffset: { width: 0, height: 4 } }}
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <Ionicons name="cart-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1 flex-col gap-y-1">
            <Text className="text-[15px] font-semibold" style={{ color: theme.purple }}>Sign up as a customer</Text>
            <Text className="text-[13px] text-[#7A7A7A] dark:text-gray-400">Get 10% off your first order</Text>
          </View>
        </TouchableOpacity>

        {/* Designer Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedRole("DESIGNER")}
          className={`flex-row items-center p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E] border ${selectedRole === "DESIGNER" ? "border-[#4B3A99]" : "border-transparent dark:border-gray-800"}`}
          style={!isDark && { elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 15, shadowOffset: { width: 0, height: 4 } }}
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <MaterialCommunityIcons name="palette-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1 flex-col gap-y-1">
            <Text className="text-[15px] font-semibold" style={{ color: theme.purple }}>Sign up as a designer</Text>
            <Text className="text-[13px] text-[#7A7A7A] dark:text-gray-400">Set up your shop, and sell your designs</Text>
          </View>
        </TouchableOpacity>

        {/* Printer Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedRole("PRINTER")}
          className={`flex-row items-center p-[18px] rounded-[16px] bg-white dark:bg-[#1E1E1E] border ${selectedRole === "PRINTER" ? "border-[#4B3A99]" : "border-transparent dark:border-gray-800"}`}
          style={!isDark && { elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 15, shadowOffset: { width: 0, height: 4 } }}
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.lightPurple }}>
            <MaterialCommunityIcons name="brush-outline" size={22} color={theme.purple} />
          </View>
          <View className="flex-1 flex-col gap-y-1">
            <Text className="text-[15px] font-semibold" style={{ color: theme.purple }}>Sign up as a printer</Text>
            <Text className="text-[13px] text-[#7A7A7A] dark:text-gray-400">Sign up and get linked up with customers</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="w-full mt-auto flex-col gap-y-4">
        <TouchableOpacity
          onPress={handleContinue}
          className="w-full rounded-full py-4 items-center justify-center"
          style={{ backgroundColor: theme.purple }}
        >
          <Text className="text-white font-bold text-base">Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/")}
          className="w-full py-2 items-center justify-center"
        >
          <Text className="font-bold text-[14px]" style={{ color: theme.purple }}>Back to home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
