import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

// 1. Define the data structure expected from the backend
export interface Printer {
  id: string;
  name: string;
  role: string;
  jobs: number;
  score: string;
  rating: number;
  location: string;
  verified: boolean;
  // Add image URLs here later when your backend supports them:
  // bannerUrl?: string;
  // avatarUrl?: string;
}

export default function PrintersListScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  // 2. Backend States
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Fetching Logic (Easy for Backend integration)
  const fetchPrinters = async () => {
    try {
      setError(null);
      // TODO: IMPLEMENT BACKEND FETCH HERE
      // const response = await fetch('YOUR_API_ENDPOINT/printers');
      // const data = await response.json();
      // setPrinters(data);

      // --- SIMULATED BACKEND DELAY & DATA FOR NOW ---
      setTimeout(() => {
        setPrinters([
          { id: "1", name: "Mohh_Jumah", role: "Abstract designer", jobs: 235, score: "98%", rating: 4.5, location: "Lagos state", verified: true },
          { id: "2", name: "Mohh_Jumah", role: "Abstract designer", jobs: 235, score: "98%", rating: 4.5, location: "Lagos state", verified: true },
          { id: "3", name: "Mohh_Jumah", role: "Abstract designer", jobs: 235, score: "98%", rating: 4.5, location: "Lagos state", verified: true },
          { id: "4", name: "Mohh_Jumah", role: "Abstract designer", jobs: 235, score: "98%", rating: 4.5, location: "Lagos state", verified: true },
        ]);
        setIsLoading(false);
      }, 1000);
      // ----------------------------------------------
    } catch (err) {
      console.error("Error fetching printers:", err);
      setError("Failed to load printers. Please try again.");
      setIsLoading(false);
    }
  };

  // Run once when screen mounts
  useEffect(() => {
    fetchPrinters();
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPrinters();
    setIsRefreshing(false);
  };

  // 4. Safe Go Back Logic
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back(); // Goes to the previous screen automatically
    } else {
      router.push("/cart"); // Fallback if there's no history
    }
  };

  const renderItem = ({ item }: { item: Printer }) => (
    <View className="flex-1 bg-white dark:bg-[#1E1E1E] rounded-2xl m-2 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
      <View className="h-16 bg-[#1A1A1A] w-full relative">
        <Image
          source={require("@/assets/images/item1.png")}
          className="w-full h-full opacity-80"
          resizeMode="cover"
        />
        <View className="absolute -bottom-6 left-1/2 -translate-x-6 w-12 h-12 bg-[#FFC107] rounded-full border-2 border-white dark:border-[#1E1E1E] items-center justify-center overflow-hidden">
          <Image
            source={require("@/assets/images/item2.png")}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>
      <View className="pt-8 pb-4 px-2 items-center">
        <View className="flex-row items-center gap-x-1">
          <Text className="text-[#333333] dark:text-white font-bold text-sm">
            {item.name}
          </Text>
          {item.verified && (
            <MaterialIcons name="verified" size={14} color="#2D71E3" />
          )}
        </View>
        <Text className="text-[#828282] dark:text-gray-400 text-xs mt-1">
          {item.role}
        </Text>
        <Text className="text-[#828282] dark:text-gray-400 text-xs mt-2">
          {item.jobs} | <Text className="text-green-500">{item.score}</Text> |
          ⭐ {item.rating}
        </Text>
        <View className="flex-row items-center gap-x-1 mt-1 mb-4">
          <Ionicons
            name="location-outline"
            size={12}
            color={isDark ? "#A0A0A0" : "#828282"}
          />
          <Text className="text-[#828282] dark:text-gray-400 text-xs">
            {item.location}
          </Text>
        </View>
        <TouchableOpacity
          // Pass the specific printer ID to the chat so the backend knows who you are talking to
          onPress={() => router.push({ pathname: "/chat", params: { printerId: item.id } })}
          className="w-11/12 py-1.5 rounded-full border border-[#3B2D85] items-center justify-center"
        >
          <Text className="text-[#3B2D85] dark:text-[#7A6AE6] font-semibold text-sm">
            Message
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#121212]">
      {/* Header */}
      <View className="w-full flex-row items-center justify-between px-6 pt-14 pb-4 bg-white dark:bg-[#121212] z-10">
        <TouchableOpacity onPress={handleGoBack} className="-ml-2 p-2">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
        <Text className="text-[#333333] dark:text-white text-lg font-bold">
          On-demand Printers
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B2D85" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={fetchPrinters} className="px-6 py-2 bg-[#3B2D85] rounded-full">
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={printers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 40,
            paddingTop: 10,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3B2D85"
              colors={["#3B2D85"]}
            />
          }
          ListEmptyComponent={
            <View className="py-20 items-center justify-center">
              <Text className="text-[#828282] dark:text-gray-400">No printers available right now.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}