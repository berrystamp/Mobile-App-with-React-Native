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

  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  // We use the exact uppercase strings your backend requires
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
    <View className="flex-1 px-6 pt-20 pb-8" style={{ backgroundColor: theme.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <Text className="text-[22px] font-bold text-center text-[#1A1A1A] dark:text-white mb-8">
        Welcome to Berrystamp!
      </Text>

      <View className="flex-row justify-center items-center gap-x-8 mb-10">
        <TouchableOpacity 
          className="items-center gap-y-2"
          onPress={() => {
            setActiveTab("login");
            router.push("/login");
          }}
        >
          <Text className={`text-[15px] font-medium ${activeTab === "login" ? "text-[#4B3A99] dark:text-[#7A6AE6]" : "text-[#7A7A7A] dark:text-gray-400"}`}>
            Login
          </Text>
          {activeTab === "login" && <View className="w-8 h-[2px] rounded-full" style={{ backgroundColor: theme.purple }} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center gap-y-2"
          onPress={() => setActiveTab("register")}
        >
          <Text className={`text-[15px] font-medium ${activeTab === "register" ? "text-[#4B3A99] dark:text-[#7A6AE6]" : "text-[#7A7A7A] dark:text-gray-400"}`}>
            Register
          </Text>
          {activeTab === "register" && <View className="w-12 h-[2px] rounded-full" style={{ backgroundColor: theme.purple }} />}
        </TouchableOpacity>
      </View>

      <View className="flex-1 w-full flex-col gap-y-5">
        
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