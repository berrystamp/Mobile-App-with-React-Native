import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, Modal, SafeAreaView,
  ScrollView, Text, TouchableOpacity, View, useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { getAvailableProfileTypes, mergeUserAndProfile, normalizeProfileResponse } from "@/lib/profile";
import ApiService from "@/services/apiClient";
import { toAccountType, toProfileType, useAuthStore } from "@/store/authStore";
import type { TProfileType, User } from "@/types";

const BASE_URL = "https://berrystamp-backend.onrender.app";

const defaultAvatar = "https://ui-avatars.com/api/?background=4B3A99&color=fff&size=128&name=U";

const toAvatar = (path?: string) => {
  if (!path || path === "string") return defaultAvatar;
  if (path.startsWith("http")) return path;
  return BASE_URL + "/" + path.replace(/^\/+/, "");
};

const profileLabels: Record<TProfileType, string> = {
  CUSTOMER: "Customer",
  DESIGNER: "Designer",
  PRINTER: "Printer",
};

// ─── In-App Browser Modal ────────────────────────────────────────────────────
function InAppBrowser({
  url,
  title,
  visible,
  onClose,
}: {
  url: string;
  title: string;
  visible: boolean;
  onClose: () => void;
}) {
  const isDark = useColorScheme() === "dark";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#FFFFFF" }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#2A2A2A" : "#F0EEF7",
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? "#2A2A2A" : "#F5F4F9",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="close" size={18} color={isDark ? "#FFFFFF" : "#2E2939"} />
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: "600",
              color: isDark ? "#FFFFFF" : "#2E2939",
            }}
          >
            {title}
          </Text>
        </View>

        {/* WebView */}
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#4B3A99" />
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const { role, setAccountType } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [profilePayload, setProfilePayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  // In-app browser state
  const [browserVisible, setBrowserVisible] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("");
  const [browserTitle, setBrowserTitle] = useState("");

  const openInBrowser = (url: string, title: string) => {
    setBrowserUrl(url);
    setBrowserTitle(title);
    setBrowserVisible(true);
  };

  const activeRole = toProfileType(role) as TProfileType;

  const theme = {
    bg: isDark ? "#121212" : "#F8F8FB",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#2E2939",
    subtext: isDark ? "#A0A0A0" : "#74707D",
    border: isDark ? "#2A2A2A" : "#F0EEF7",
    row: isDark ? "#2A2A2A" : "#F5F4F9",
    primary: "#4B3A99",
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [current, profileResponse, notificationsResponse] = await Promise.all([
        ApiService.getCurrentUser() as Promise<User | null>,
        ApiService.getMyProfile(),
        ApiService.getNotifications(0, 50).catch(() => null),
      ]);
      const normalized = normalizeProfileResponse(profileResponse);
      const merged = { ...(current || {}), ...normalized, profileType: activeRole } as User;
      const notificationsBody =
        notificationsResponse?.responseBody ||
        notificationsResponse?.content ||
        notificationsResponse || [];
      const notifications = Array.isArray(notificationsBody)
        ? notificationsBody
        : Array.isArray(notificationsBody?.content) ? notificationsBody.content : [];
      setProfilePayload(normalized);
      setUser(merged);
      setNotificationCount(notifications.filter((item: any) => !(item?.read ?? item?.isRead ?? false)).length);
    } catch (error: any) {
      Alert.alert("Unable to load profile", error?.response?.data?.responseMessage || error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeRole]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const profile = useMemo(() => mergeUserAndProfile(user, {}), [user]);
  const availableProfiles = useMemo(() => getAvailableProfileTypes(user, profilePayload || {}), [profilePayload, user]);
  const switchTargets = useMemo(() => availableProfiles.filter((item) => item !== activeRole), [activeRole, availableProfiles]);

  const displayName = useMemo(() => {
    if (!user) return profile.fullName || "User";
    if (activeRole === "DESIGNER") {
      return (user as any).designerProfile?.name || (user as any).designerProfile?.userName || profile.fullName;
    }
    if (activeRole === "PRINTER") {
      return (user as any).printerProfile?.name || (user as any).printerProfile?.userName || profile.fullName;
    }
    return profile.fullName || profile.username || "User";
  }, [user, activeRole, profile]);

  const accountItems = useMemo(() => {
    if (activeRole === "DESIGNER") {
      return [
        { icon: "storefront-outline" as const, label: "My Shop", onPress: () => router.push("/my-shop") },
        { icon: "document-text-outline" as const, label: "Orders", onPress: () => router.push("/manage-order") },
        { icon: "wallet-outline" as const, label: "Wallet", onPress: () => router.push("/wallet") },
      ];
    }
    if (activeRole === "PRINTER") {
      return [
        { icon: "document-text-outline" as const, label: "Manage Orders", onPress: () => router.push("/manage-order") },
        { icon: "print-outline" as const, label: "Print Jobs", onPress: () => router.push("/printers") },
        { icon: "wallet-outline" as const, label: "Wallet", onPress: () => router.push("/wallet") },
      ];
    }
    return [
      { icon: "color-palette-outline" as const, label: "Custom Designs", onPress: () => router.push("/custom-design") },
      { icon: "receipt-outline" as const, label: "My Orders", onPress: () => router.push("/manage-order") },
      { icon: "heart-outline" as const, label: "Favourites", onPress: () => router.push("/favorites") },
      { icon: "location-outline" as const, label: "Track Order", onPress: () => router.push("/track-order") },
      { icon: "people-outline" as const, label: "Refer a Friend", onPress: () => router.push("/referral") },
      { icon: "bookmark-outline" as const, label: "Update Interests", onPress: () => router.push("/update-interest") },
    ];
  }, [activeRole, router]);

  const supportItems = useMemo(() => [
    { icon: "settings-outline" as const, label: "Settings", onPress: () => router.push("/settings") },
    {
      icon: "help-circle-outline" as const,
      label: "FAQ",
      onPress: () => openInBrowser("https://berrystamp.com/faq", "FAQ"),
    },
    {
      icon: "document-text-outline" as const,
      label: "Terms & Conditions",
      onPress: () => openInBrowser("https://berrystamp.com/terms-of-service", "Terms & Conditions"),
    },
    {
      icon: "shield-checkmark-outline" as const,
      label: "Privacy Policy",
      onPress: () => openInBrowser("https://berrystamp.com/privacy-policy", "Privacy Policy"),
    },
    {
      icon: "flag-outline" as const,
      label: activeRole === "DESIGNER" ? "Make suggestion / Report" : "Report a problem",
      onPress: () => router.push("/suggestion"),
    },
  ], [activeRole, router]);

  const handleSwitchAccount = async (target: TProfileType) => {
    const accountType = toAccountType(target);
    setAccountType(accountType);
    await ApiService.setActiveProfileType(target);
    router.replace("/(tabs)");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* In-App Browser Modal */}
      <InAppBrowser
        url={browserUrl}
        title={browserTitle}
        visible={browserVisible}
        onClose={() => setBrowserVisible(false)}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Purple header banner */}
        <View style={{ backgroundColor: "#4330A2", paddingTop: insets.top + 12, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden" }}>
          <View style={{ position: "absolute", top: -10, left: -20, width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }} />
          <View style={{ position: "absolute", top: 20, right: -10, width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }} />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>Profile</Text>
            <TouchableOpacity onPress={() => router.push("/notification")} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
              {notificationCount > 0 && (
                <View style={{ position: "absolute", top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: "#FF6B63", alignItems: "center", justifyContent: "center", paddingHorizontal: 3 }}>
                  <Text style={{ fontSize: 9, fontWeight: "700", color: "#FFFFFF" }}>{notificationCount > 99 ? "99+" : notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {activeRole !== "CUSTOMER" ? (
              <Image
                source={{ uri: toAvatar(profile.avatar) }}
                style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" }}
                contentFit="cover"
              />
            ) : (
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="person" size={22} color="#FFFFFF" />
              </View>
            )}
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#FFFFFF" }}>{displayName}</Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{profileLabels[activeRole]}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/edit-profile")} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {activeRole !== "CUSTOMER" && (
            <View style={{ flexDirection: "row", marginTop: 16, gap: 16 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>{profile.orders || 0}</Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>Orders</Text>
              </View>
              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>{profile.received || 0}</Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>Received</Text>
              </View>
            </View>
          )}
        </View>

        {/* Switch account */}
        {switchTargets.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
            {switchTargets.map((target) => (
              <TouchableOpacity
                key={target}
                onPress={() => handleSwitchAccount(target)}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: isDark ? "#1E1E1E" : "#F0EEFF", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 }}
              >
                <Ionicons name="swap-horizontal-outline" size={18} color={theme.primary} />
                <Text style={{ marginLeft: 10, fontSize: 14, fontWeight: "600", color: theme.primary, flex: 1 }}>
                  Switch to {target.toLowerCase()} account
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Account section */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.subtext, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>My Account</Text>
          <View style={{ backgroundColor: theme.surface, borderRadius: 18, overflow: "hidden" }}>
            {accountItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: index < accountItems.length - 1 ? 1 : 0, borderBottomColor: theme.border }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.row, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Ionicons name={item.icon} size={18} color="#9693A1" />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: theme.text }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.subtext} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support & Settings section */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.subtext, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Support</Text>
          <View style={{ backgroundColor: theme.surface, borderRadius: 18, overflow: "hidden" }}>
            {supportItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: index < supportItems.length - 1 ? 1 : 0, borderBottomColor: theme.border }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.row, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Ionicons name={item.icon} size={18} color="#9693A1" />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: theme.text }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.subtext} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => Alert.alert("Log out", "Are you sure you want to log out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Log out", style: "destructive", onPress: async () => { await ApiService.logout(); router.replace("/(auth)/login"); } },
            ])}
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: isDark ? "#2A0D0D" : "#FFF0F0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 }}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={{ marginLeft: 10, fontSize: 14, fontWeight: "600", color: "#EF4444", flex: 1 }}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
