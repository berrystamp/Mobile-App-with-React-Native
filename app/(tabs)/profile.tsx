import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    getAvailableProfileTypes,
    mergeUserAndProfile,
    normalizeProfileResponse,
} from "@/lib/profile";
import ApiService from "@/services/apiClient";
import { toAccountType, toProfileType, useAuthStore } from "@/store/authStore";
import type { TProfileType, User } from "@/types";

const defaultAvatar =
  "https://images.unsplash.com/photo-1472099645785-5658abf4e?w=400";

const toAvatar = (path?: string) => {
  if (!path || path === "string") return defaultAvatar;
  if (path.startsWith("http")) return path;
  return `https://backend-prod-api.berrystamp.com/${path.replace(/^\/+/, "")}`;
};

const profileLabels: Record<TProfileType, string> = {
  CUSTOMER: "Customer",
  DESIGNER: "Designer",
  PRINTER: "Printer",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { role, setAccountType } = useAuthStore();
  const tabBarHeight = 40;
  const [user, setUser] = useState<User | null>(null);
  const [profilePayload, setProfilePayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const activeRole = toProfileType(role) as TProfileType;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [current, profileResponse, notificationsResponse] =
        await Promise.all([
          ApiService.getCurrentUser() as Promise<User | null>,
          ApiService.getMyProfile(),
          ApiService.getNotifications(0, 50).catch(() => null),
        ]);
      const normalized = normalizeProfileResponse(profileResponse);
      const merged = {
        ...(current || {}),
        ...normalized,
        profileType: activeRole,
      } as User;
      const notificationsBody =
        notificationsResponse?.responseBody ||
        notificationsResponse?.content ||
        notificationsResponse ||
        [];
      const notifications = Array.isArray(notificationsBody)
        ? notificationsBody
        : Array.isArray(notificationsBody?.content)
          ? notificationsBody.content
          : [];
      setProfilePayload(normalized);
      setUser(merged);
      setNotificationCount(
        notifications.filter(
          (item: any) => !(item?.read ?? item?.isRead ?? false),
        ).length,
      );
    } catch (error: any) {
      Alert.alert(
        "Unable to load profile",
        error?.response?.data?.responseMessage ||
          error?.message ||
          "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [activeRole]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const profile = useMemo(() => mergeUserAndProfile(user, {}), [user]);
  const availableProfiles = useMemo(
    () => getAvailableProfileTypes(user, profilePayload || {}),
    [profilePayload, user],
  );
  const switchTargets = useMemo(
    () => availableProfiles.filter((item) => item !== activeRole),
    [activeRole, availableProfiles],
  );

  const accountItems = useMemo(() => {
    if (activeRole === "DESIGNER") {
      return [
        {
          icon: "document-text-outline" as const,
          label: "Manage Order",
          onPress: () => router.push("/manage-order"),
        },
        {
          icon: "storefront-outline" as const,
          label: "My Shop",
          onPress: () => router.push("/my-shop"),
        },
        {
          icon: "wallet-outline" as const,
          label: "Wallet",
          onPress: () => router.push("/payment-details"),
        },
      ];
    }

    if (activeRole === "PRINTER") {
      return [
        {
          icon: "document-text-outline" as const,
          label: "Manage Order",
          onPress: () => router.push("/manage-order"),
        },
        {
          icon: "print-outline" as const,
          label: "Print Jobs",
          onPress: () => router.push("/printers"),
        },
        {
          icon: "wallet-outline" as const,
          label: "Wallet",
          onPress: () => router.push("/payment-details"),
        },
      ];
    }

    return [
      {
        icon: "color-palette-outline" as const,
        label: "Custom Designs",
        onPress: () => router.push("/custom-design"),
      },
      {
        icon: "document-text-outline" as const,
        label: "Manage Orders",
        onPress: () => router.push("/manage-order"),
      },
      {
        icon: "people-outline" as const,
        label: "Refer a friend",
        onPress: () => router.push("/referral"),
      },
      {
        icon: "heart-outline" as const,
        label: "Track Order",
        onPress: () => router.push("/track-order"),
      },
      {
        icon: "copy-outline" as const,
        label: "Update Interests",
        onPress: () => router.push("/update-interest"),
      },
    ];
  }, [activeRole, router]);

  const otherItems = useMemo(() => {
    return [
      {
        icon: "settings-outline" as const,
        label: "Settings and privacy",
        onPress: () => router.push("https://berrystamp.com/privacy-policy"),
      },
      {
        icon: "document-text-outline" as const,
        label: "Terms and Condition",
        onPress: () => router.push("https://berrystamp.com/terms-of-service"),
      },
      {
        icon: "flag-outline" as const,
        label:
          activeRole === "DESIGNER"
            ? "Make suggestion/Report"
            : "Report a problem",
        onPress: () => router.push("mailto:support@berrystamp.com"),
      },
      {
        icon: "help-circle-outline" as const,
        label: "FAQ",
        onPress: () => router.push("https://berrystamp.com/faqs"),
      },
    ];
  }, [activeRole, router]);

  const handleSwitchAccount = async (target: TProfileType) => {
    const accountType = toAccountType(target);
    setAccountType(accountType);
    await ApiService.setActiveProfileType(target);
    router.replace("/(tabs)");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F8FB] dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#4732A1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F8FB] dark:bg-[#121212]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-b-[28px] bg-[#4330A2] px-5 pb-5 pt-12">
          <View className="absolute inset-0">
            <View className="absolute -left-10 top-4 h-36 w-36 rounded-full border border-white/10" />
            <View className="absolute left-24 top-0 h-32 w-32 rounded-full border border-white/10" />
            <View className="absolute right-2 top-6 h-40 w-40 rounded-full border border-white/10" />
            <View className="absolute right-16 top-28 h-28 w-28 rounded-full border border-white/10" />
          </View>

          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-base font-medium text-white">Profile</Text>
            <TouchableOpacity
              onPress={() => router.push("/notification")}
              className="relative h-9 w-9 items-center justify-center rounded-xl bg-white/10"
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#FFFFFF"
              />
              {notificationCount > 0 ? (
                <View className="absolute -right-0.5 -top-0.5 h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF6B63] px-1">
                  <Text className="text-[10px] font-bold text-white">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <Image
              source={{ uri: toAvatar(profile.avatar) }}
              className="h-[66px] w-[66px] rounded-full border-2 border-white/15"
            />
            <View className="ml-3 flex-1">
              <Text className="text-lg font-semibold text-white">
                {profile.fullName}
              </Text>
              <Text className="mt-0.5 text-xs text-white/75">
                {profileLabels[activeRole]}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/edit-profile")}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
            >
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {activeRole !== "CUSTOMER" ? (
            <View className="mt-5 flex-row items-center justify-end">
              <View className="items-end">
                <Text className="text-sm font-semibold text-white">
                  {profile.orders} orders
                </Text>
                <Text className="mt-1 text-xs text-white/70">
                  {profile.received} Received
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View className="px-4 pt-3">
          <ProfileSection
            title="My Account"
            items={accountItems}
            footer={
              <View className="pt-2">
                {/* <TouchableOpacity onPress={() => router.push('/switch-account')} className="mb-3 rounded-2xl border border-[#E5E0F5] px-4 py-3 dark:border-[#403A58]">
                  <Text className="text-sm font-semibold text-[#4B3A99] dark:text-[#B8ADFF]">Switch account</Text>
                </TouchableOpacity> */}
                {switchTargets.length
                  ? switchTargets.map((target) => (
                      <TouchableOpacity
                        key={target}
                        onPress={() => handleSwitchAccount(target)}
                        className="mb-3 rounded-2xl bg-[#F5F4F9] px-4 py-3 dark:bg-[#2A2A2A]"
                      >
                        <Text className="text-sm font-semibold text-[#4B3A99] dark:text-[#B8ADFF]">
                          Switch to {target.toLowerCase()} account
                        </Text>
                      </TouchableOpacity>
                    ))
                  : null}
              </View>
            }
          />

          <View className="mt-6">
            <Text className="mb-3 text-base font-medium text-[#74707D] dark:text-gray-400">
              Others
            </Text>
            <ProfileSection items={otherItems} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileSection({
  title,
  items,
  footer,
}: {
  title?: string;
  items: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  }[];
  footer?: React.ReactNode;
}) {
  return (
    <View>
      {title ? (
        <Text className="mb-3 text-base font-medium text-[#74707D] dark:text-gray-400">
          {title}
        </Text>
      ) : null}
      <View className="rounded-[22px] bg-white px-4 py-2 shadow-sm dark:bg-[#1E1E1E]">
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            className={`flex-row items-center py-4 ${index !== items.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}
          >
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-[#F5F4F9] dark:bg-[#2A2A2A]">
              <Ionicons name={item.icon} size={18} color="#9693A1" />
            </View>
            <Text className="flex-1 text-sm font-medium text-[#2E2939] dark:text-white">
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#A09BAE" />
          </TouchableOpacity>
        ))}
        {footer}
      </View>
    </View>
  );
}
