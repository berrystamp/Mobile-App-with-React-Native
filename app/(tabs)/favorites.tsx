import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { useAppAlert } from "@/components/common/AppAlert";
import { formatNaira } from "@/lib/currency";
import { normalizeDesignListResponse } from "@/lib/designs";
import ApiService from "@/services/apiClient";
import { isCustomerRole, useAuthStore } from "@/store/authStore";
import type { Design } from "@/types";

export default function FavoritesScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const role = useAuthStore((state) => state.role);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { show: showAlert, element: alertElement } = useAppAlert();

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const favoriteRes = await ApiService.getFavoriteDesigns(100, 0);
      const favoriteDesigns = normalizeDesignListResponse(favoriteRes).filter(
        (design) => design.liked,
      );
      setDesigns(favoriteDesigns);
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Unable to load favorites',
        message: error?.message || 'Please try again later.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isCustomerRole(role)) {
      router.replace("/manage-order");
      return;
    }
    fetchData();
  }, [fetchData, role, router]);

  const confirmRemoveFavorite = useCallback((design: Design) => {
    showAlert({
      type: 'confirm',
      title: 'Remove item',
      message: 'Are you sure you want to remove this item from favorite?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDesigns((prev) => prev.filter((item) => item.id !== design.id));
            try {
              await ApiService.toggleFavorite(String(design.id));
            } catch {
              setDesigns((prev) => [design, ...prev]);
              showAlert({
                type: 'error',
                title: 'Action failed',
                message: 'Could not update favorite at the moment.',
              });
            }
          },
        },
      ],
    });
  }, [showAlert]);

  const clearFavorites = useCallback(() => {
    if (!designs.length) return;

    showAlert({
      type: 'confirm',
      title: 'Clear favorites',
      message: 'This will remove all items in your favorites list.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const current = [...designs];
            setDesigns([]);
            try {
              await Promise.all(
                current.map((item) => ApiService.toggleFavorite(String(item.id))),
              );
            } catch {
              setDesigns(current);
              showAlert({
                type: 'error',
                title: 'Action failed',
                message: 'Unable to clear favorites right now.',
              });
            }
          },
        },
      ],
    });
  }, [designs, showAlert]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#121212]">
      <View className="flex-1 px-6 pt-12">
        <View className="mb-6 flex-row items-center justify-between py-4">
          <TouchableOpacity
            onPress={() =>
              router.canGoBack() ? router.back() : router.push("/")
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-[#333333] dark:text-white">
            Favorite {designs.length ? `(${designs.length})` : ""}
          </Text>
          <TouchableOpacity onPress={clearFavorites} disabled={!designs.length}>
            <Text
              className={`text-base font-semibold ${designs.length ? "text-[#EB5757]" : "text-[#EB5757]/40"}`}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B2D85" />
          </View>
        ) : (
          <FlatList
            data={designs}
            keyExtractor={(item) => String(item.id)}
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 28,
              flexGrow: designs.length ? 0 : 1,
            }}
            renderItem={({ item }) => {
              const artistName =
                item.designerName ||
                `${item.profile.firstName} ${item.profile.lastName}`.trim() ||
                item.profile.username;
              const imageUri = item.imagePath?.startsWith("http")
                ? item.imagePath
                : item.imagePath
                  ? `https://berrystamp-backend-production.up.railway.app/${item.imagePath.replace(/^\/+/, "")}`
                  : "";

              return (
                <View className="mb-3 flex-row rounded-2xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-[#1E1E1E]">
                  <View className="mr-3 h-24 w-24 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                    {imageUri ? (
                      <Image
                        source={{ uri: imageUri }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : null}
                  </View>

                  <View className="flex-1 justify-between">
                    <View>
                      <Text
                        numberOfLines={1}
                        className="text-base font-semibold text-[#1E1B2B] dark:text-white"
                      >
                        {item.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-1 text-sm text-[#8F889D] dark:text-gray-400"
                      >
                        By {artistName}
                      </Text>
                    </View>

                    <View className="mt-3 flex-row items-end justify-between">
                      <Text className="text-lg font-bold text-[#1D1A2B] dark:text-white">
                        {formatNaira(item.amount || 0)}
                      </Text>
                      <View className="items-end">
                        <TouchableOpacity
                          onPress={() => confirmRemoveFavorite(item)}
                        >
                          <Ionicons name="heart" size={22} color="#FF4D67" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: "/products",
                              params: { designId: String(item.id) },
                            })
                          }
                        >
                          <Text className="mt-3 text-sm font-semibold text-[#3F2FA0]">
                            See details
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-6">
                <Ionicons
                  name="heart-outline"
                  size={84}
                  color={isDark ? "#7A7A7A" : "#B8B6BF"}
                />
                <Text className="mt-4 text-center text-xl font-semibold text-[#2B2833] dark:text-white">
                  Favorite is empty
                </Text>
                <Text className="mt-3 text-center text-sm leading-6 text-[#8A8694] dark:text-gray-400">
                  You have not yet added any item to your favorite list. Explore
                  beautiful designs and save the ones you love.
                </Text>
              </View>
            }
          />
        )}
      </View>
      {alertElement}
    </SafeAreaView>
  );
}
