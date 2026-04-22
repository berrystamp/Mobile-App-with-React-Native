import { ArtistCard } from "@/components/ArtistCard";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SectionHeader } from "@/components/SectionHeader";
import { useHomeData } from "@/hooks/useHomeData";
import { formatNaira } from "@/lib/currency";
import { addRecentDesign } from "@/lib/localStorage";
import { mergeUserAndProfile, normalizeProfileResponse } from "@/lib/profile";
import ApiService from "@/services/apiClient";
import { toProfileType, useAuthStore } from "@/store/authStore";
import type { Design, TProfileType, User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Path,
  Polyline,
  Rect,
  LinearGradient,
  Stop,
} from "react-native-svg";

function HomeDesignCard({
  design,
  onPress,
  onFavoriteToggle,
  width,
  imageHeight = 118,
}: {
  design: Design;
  onPress: () => void;
  onFavoriteToggle: (designId: number) => void;
  width: number;
  imageHeight?: number;
}) {
  const isDark = useColorScheme() === "dark";
  const imageUrl = design.imagePath?.startsWith("http")
    ? design.imagePath
    : design.imagePath
      ? `https://backend-prod-api.berrystamp.com/${design.imagePath}`
      : "";
  const artistName =
    `${design.profile.firstName} ${design.profile.lastName}`.trim() ||
    design.profile.username;
  const mockPrices = design.mocks
    .map((mock) => mock.price)
    .filter((price) => price > 0);
  const lowestPrice =
    mockPrices.length > 0 ? Math.min(...mockPrices) : design.amount || 0;

  return (
    <TouchableOpacity
      style={[
        styles.designCard,
        {
          width,
          backgroundColor: isDark ? "#1B1B1B" : "#FFFFFF",
          borderColor: isDark ? "#2B2B2B" : "#F1F1F1",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View
        style={[
          styles.designImageWrap,
          {
            backgroundColor: isDark ? "#232323" : "#F7F7F7",
            height: imageHeight,
          },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.designImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.designImage, styles.imagePlaceholder]}>
            <Ionicons
              name="image-outline"
              size={24}
              color={isDark ? "#9A9A9A" : "#B9B9B9"}
            />
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.45)"
                : "rgba(255,255,255,0.92)",
            },
          ]}
          onPress={() => onFavoriteToggle(design.id)}
        >
          <Ionicons
            name={design.liked ? "heart" : "heart-outline"}
            size={16}
            color={design.liked ? "#FF4D67" : "#767676"}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.designContent}>
        <Text
          style={[
            styles.designTitle,
            { color: isDark ? "#FFFFFF" : "#252525" },
          ]}
          numberOfLines={1}
        >
          {design.title}
        </Text>
        <Text
          style={[
            styles.designArtist,
            { color: isDark ? "#B3B3B3" : "#7F7F7F" },
          ]}
          numberOfLines={1}
        >
          By {artistName}
        </Text>
        <Text
          style={[
            styles.designPrice,
            { color: isDark ? "#FFFFFF" : "#252525" },
          ]}
        >
          {formatNaira(lowestPrice)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [profileLoading, setProfileLoading] = useState(true);
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [filterStage, setFilterStage] = useState<
    "hidden" | "range" | "calendar"
  >("hidden");
  const [, setRangeLabel] = useState("This Month");
  
  // NEW: State for toggling balance visibility
  const [showBalance, setShowBalance] = useState(true);

  const role = useAuthStore((state) => state.role);
  const activeRole = toProfileType(role) as TProfileType;
  const {
    topArtists,
    recentDesigns,
    featuredDesigns,
    isLoading,
    error,
    refreshing,
    refresh,
    toggleFavorite,
    retry,
  } = useHomeData(activeRole === "CUSTOMER");

  const loadProfileDashboard = useCallback(async () => {
    try {
      setProfileLoading(true);
      const [profileResponse, walletResponse, walletHistoryResponse] =
        await Promise.all([
          ApiService.getMyProfile(),
          ApiService.getWallet().catch(() => null),
          ApiService.getWalletHistory().catch(() => null),
        ]);
      const current = (await ApiService.getCurrentUser()) as User | null;
      const normalized = normalizeProfileResponse(profileResponse);

      // Preserve nested profile objects with their insight data intact
      const rawBody = profileResponse?.responseBody || profileResponse?.data || profileResponse || {};
      const merged = {
        ...(current || {}),
        ...normalized,
        profileType: activeRole,
        // Preserve nested profiles from raw response so insight data is not lost
        designerProfile: rawBody.designerProfile || normalized.designerProfile || (current as any)?.designerProfile,
        printerProfile: rawBody.printerProfile || normalized.printerProfile || (current as any)?.printerProfile,
        customerProfile: rawBody.customerProfile || normalized.customerProfile || (current as any)?.customerProfile,
      } as User;

      setCurrentUser(merged);
      setWallet(walletResponse?.responseBody || walletResponse || null);
      setWalletHistory(
        walletHistoryResponse?.responseBody?.content ||
          walletHistoryResponse?.responseBody ||
          walletHistoryResponse?.content ||
          [],
      );
    } finally {
      setProfileLoading(false);
      setDashboardRefreshing(false);
    }
  }, [activeRole]);

  useFocusEffect(
    useCallback(() => {
      loadProfileDashboard();
    }, [loadProfileDashboard]),
  );

  const theme = {
    background: isDark ? "#121212" : "#FAFAFA",
    surface: isDark ? "#1C1C1F" : "#FFFFFF",
    surfaceAlt: isDark ? "#232327" : "#F6F6F8",
    border: isDark ? "#2C2C31" : "#F1F1F1",
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subtext: isDark ? "#B8B8B8" : "#8A8A8A",
    accent: isDark ? "#A99BFF" : "#4A34A7",
  };

  const horizontalCardWidth = Math.min(Math.max(screenWidth * 0.52, 172), 196);
  const featuredCardWidth = Math.max((screenWidth - 40 - 12) / 2, 150);

  const openDesign = useCallback(
    async (design: Design) => {
      await addRecentDesign(design.id);
      router.push({
        pathname: "/product",
        params: { designId: String(design.id) },
      });
    },
    [router],
  );

  const mergedProfile = useMemo(
    () => mergeUserAndProfile(currentUser, {}),
    [currentUser],
  );
  const activeProfile = useMemo(() => {
    if (!currentUser) return null;
    if (activeRole === "DESIGNER") return currentUser.designerProfile;
    if (activeRole === "PRINTER") return currentUser.printerProfile;
    return currentUser.customerProfile;
  }, [activeRole, currentUser]);

  const insight = activeProfile?.insight || activeProfile?.insights || {};
  const totalEarnings = insight.totalEarnings || insight.earnings || wallet?.balance || 0;
  const rating = insight.rating?.avgStars || insight.avgRating || insight.averageRating || insight.rating || 0;
  const followers = insight.totalFollowers || insight.followers || 0;
  const following = insight.totalFollowing || insight.following || 0;
  const completedOrders = insight.totalCompletedOrders || insight.completedOrders || insight.totalOrders || 0;
  const cancelledOrders = insight.totalCancelledOrders || insight.cancelledOrders || 0;
  const totalOrders = completedOrders + cancelledOrders;
  const jobSuccess = insight.jobSuccessPercentage || insight.successRate || insight.successPercentage || 0;
  const activeName =
    activeProfile?.name ||
    activeProfile?.userName ||
    activeProfile?.brandName ||
    activeProfile?.shopName ||
    mergedProfile.username ||
    mergedProfile.fullName;
  const dashboardTopInset = Math.max(insets.top, StatusBar.currentHeight || 0);

  const paymentSegments = useMemo(() => {
    const credits = walletHistory
      .filter((item: any) => String(item.type).toUpperCase() === "CREDIT")
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const debits = walletHistory
      .filter((item: any) => String(item.type).toUpperCase() === "DEBIT")
      .reduce(
        (sum: number, item: any) => sum + Math.abs(Number(item.amount || 0)),
        0,
      );
    const balance = Number(wallet?.balance || 0);

    const rawSegments = [
      { label: "Paid", value: credits, color: "#322783" },
      { label: "Pending", value: debits, color: "#0A66C2" },
      { label: "Canceled", value: balance, color: "#F90A3F" },
    ].filter((item) => item.value > 0);

    return rawSegments.length
      ? rawSegments
      : [{ label: "Paid", value: 1, color: "#322783" }];
  }, [wallet?.balance, walletHistory]);

  const totalSegmentValue =
    paymentSegments.reduce((sum, item) => sum + item.value, 0) || 1;
  const paymentArcs = useMemo(() => {
    let rotation = -90;
    return paymentSegments.map((segment) => {
      const circumference = 2 * Math.PI * 45;
      const length = (segment.value / totalSegmentValue) * circumference;
      const arc = {
        ...segment,
        dash: `${length} ${circumference}`,
        rotation,
      };
      rotation += (segment.value / totalSegmentValue) * 360;
      return arc;
    });
  }, [paymentSegments, totalSegmentValue]);

  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    walletHistory.forEach((item: any) => {
      const date = new Date(item.createdAt || item.date || Date.now());
      const key = date.toLocaleString("en-US", { month: "short" });
      grouped.set(key, (grouped.get(key) || 0) + Number(item.amount || 0));
    });

    const entries = Array.from(grouped.entries()).slice(-6);
    return entries.length ? entries : [];
  }, [walletHistory]);

  const chartPoints = useMemo(() => {
    if (!chartData.length) return "";
    const maxValue = Math.max(...chartData.map((item) => item[1]), 1);
    return chartData
      .map(([_, value], index) => {
        const x = 20 + index * (300 / Math.max(chartData.length - 1, 1));
        const y = 110 - (value / maxValue) * 70;
        return `${x},${y}`;
      })
      .join(" ");
  }, [chartData]);

  const topChartValue = useMemo(() => {
    if (!chartData.length) return null;
    return Math.max(...chartData.map((item) => item[1]));
  }, [chartData]);

  if (profileLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (activeRole === "CUSTOMER") {
    if (isLoading) {
      return <LoadingSpinner message="Loading designs..." />;
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={retry} />;
    }

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.customerHeader, { paddingTop: dashboardTopInset + 8 }]}>
          <Image
            source={require("../img/logo-icon.webp")}
            style={styles.customerLogo}
            resizeMode="contain"
          />
          <View style={styles.customerHeaderIcons}>
            <TouchableOpacity onPress={() => router.push("/Search")} style={styles.headerActionButton}>
              <Ionicons name="search-outline" size={21} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/notification")} style={styles.headerActionButton}>
              <Ionicons name="notifications-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Top Artists" showViewAll={false} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistList}
          >
            {topArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onPress={() =>
                  router.push({
                    pathname: "/my-shop",
                    params: {
                      profileId: String(artist.id),
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Marketplace Banner */}
        <TouchableOpacity
          onPress={() => router.push("/products")}
          activeOpacity={0.88}
          style={{
            marginHorizontal: 16,
            marginBottom: 20,
            borderRadius: 18,
            overflow: "hidden",
            backgroundColor: "#3D2DB5",
          }}
        >
          <View style={{ padding: 20, flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.65)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                Marketplace
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 }}>
                Explore thousands{" "}of designs
              </Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 17 }}>
                Browse prints, clothing, accessories & more
              </Text>
            </View>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="grid-outline" size={24} color="#FFFFFF" />
            </View>
          </View>
          <View style={{ position: "absolute", top: -20, right: 60, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.05)" }} />
          <View style={{ position: "absolute", bottom: -30, right: -10, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.04)" }} />
        </TouchableOpacity>

        <View style={styles.section}>
          <SectionHeader
            title="Recent designs"
            onViewAllPress={() => router.push("/products")}
          />
          {recentDesigns.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No designs available right now.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {recentDesigns.map((design) => (
                <HomeDesignCard
                  key={design.id}
                  design={design}
                  width={horizontalCardWidth}
                  imageHeight={136}
                  onFavoriteToggle={toggleFavorite}
                  onPress={() => openDesign(design)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Feature designs"
            onViewAllPress={() => router.push("/products")}
          />
          {featuredDesigns.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No designs available right now.
            </Text>
          ) : (
            <View style={styles.featureGrid}>
              {featuredDesigns.map((design) => (
                <HomeDesignCard
                  key={design.id}
                  design={design}
                  width={featuredCardWidth}
                  imageHeight={featuredCardWidth * 0.86}
                  onFavoriteToggle={toggleFavorite}
                  onPress={() => openDesign(design)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: dashboardTopInset + 12,
          paddingBottom: 110,
        }}
        refreshControl={
          <RefreshControl
            refreshing={dashboardRefreshing}
            onRefresh={() => {
              setDashboardRefreshing(true);
              loadProfileDashboard();
            }}
          />
        }
      >
        {/* Top Balance Card - Updated to Minimalist Black Aesthetic */}
        <View style={styles.balanceCard}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="premiumDark" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#2A2A2A" stopOpacity="1" />
                <Stop offset="100%" stopColor="#080808" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#premiumDark)" rx={16} />
          </Svg>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <TouchableOpacity 
              onPress={() => setShowBalance(!showBalance)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons 
                name={showBalance ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {showBalance ? formatNaira(Number(wallet?.balance || 0)) : "********"}
          </Text>
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceUser}>{activeName || "Account"}</Text>
            <Text style={styles.balanceRole}>
              {activeRole === "DESIGNER"
                ? "Verified Account"
                : activeRole === "PRINTER"
                  ? "Printer Account"
                  : "Verified Account"}
            </Text>
          </View>
        </View>

        {/* Business Performance Stats Card */}
        <View
          style={[
            styles.dashboardCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Designer&apos;s statistics
          </Text>
          <View style={{ alignItems: "center", paddingVertical: 10 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#F4F0FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="stats-chart" size={20} color="#4A34A7" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#322783" }}>
              {jobSuccess}%
            </Text>
            <Text style={{ fontSize: 13, color: "#8A8A8A", marginTop: 4 }}>
              Business Performance
            </Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricGrid}>
          <MetricBox
            icon="bag-outline"
            color="#F2994A"
            value={completedOrders}
            label="Completed order"
            theme={theme}
          />
          <MetricBox
            icon="wallet-outline"
            color="#27AE60"
            value={showBalance ? formatNaira(Number(totalEarnings || 0)) : "****"}
            label="Overall Earning"
            theme={theme}
          />
          <MetricBox
            icon="star-outline"
            color="#9B51E0"
            value={rating.toFixed(1)}
            label="Overall Rating"
            theme={theme}
          />
          <MetricBox
            icon="checkbox-outline"
            color="#56CCF2"
            value={`${jobSuccess}%`}
            label="Job Success"
            theme={theme}
          />
          <MetricBox
            icon="close-circle-outline"
            color="#EB5757"
            value={cancelledOrders}
            label="Canceled order"
            theme={theme}
          />
          <MetricBox
            icon="cube-outline"
            color="#2F80ED"
            value={totalOrders}
            label="Total Order"
            theme={theme}
          />
        </View>

        {/* Column Stats Card */}
        <View
          style={[
            styles.dashboardCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Designer&apos;s statistics
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: theme.text }}
              >
                0%
              </Text>
              <Text
                style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}
              >
                Customer Retent.
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: theme.text }}
              >
                {followers >= 1000
                  ? (followers / 1000).toFixed(1) + "k"
                  : followers}
              </Text>
              <Text
                style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}
              >
                Followers
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: theme.text }}
              >
                {following}
              </Text>
              <Text
                style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}
              >
                Following
              </Text>
            </View>
          </View>
        </View>

        {/* Overall Payment Status */}
        <View
          style={[
            styles.dashboardCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text
            style={[styles.cardTitle, { color: theme.text, marginBottom: 20 }]}
          >
            Overall Payment Status
          </Text>
          <View style={{ alignItems: "center", paddingBottom: 20 }}>
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Circle
                cx="70"
                cy="70"
                r="45"
                stroke={isDark ? "#303038" : "#EFEAF8"}
                strokeWidth="10"
                fill="none"
              />
              {paymentArcs.map((segment) => (
                <Circle
                  key={segment.label}
                  cx="70"
                  cy="70"
                  r="45"
                  stroke={segment.color}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={segment.dash}
                  strokeLinecap="round"
                  rotation={segment.rotation}
                  origin="70,70"
                />
              ))}
            </Svg>
          </View>

          <View style={styles.legendRow}>
            {paymentSegments.map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={{ color: theme.subtext, fontSize: 12 }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => router.push("/payments")}
          >
            <Text style={styles.paymentButtonText}>My Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Account Overview */}
        <View
          style={[
            styles.dashboardCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.overviewHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.text, marginBottom: 0 },
                ]}
              >
                Account overview
              </Text>
              <Text style={styles.overviewSubtitle}> (this month)</Text>
            </View>
            <TouchableOpacity onPress={() => setFilterStage("range")}>
              <Ionicons name="chevron-down" size={16} color="#8A8A8A" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.overviewAmount, { color: theme.text }]}>
            {showBalance ? (topChartValue ? formatNaira(topChartValue) : formatNaira(0)) : "********"}
          </Text>

          {chartData.length > 0 ? (
            <View
              style={{
                alignItems: "center",
                position: "relative",
                marginTop: 30,
              }}
            >
              <View style={[styles.chartTooltip, { top: -15, left: "35%" }]}>
                <Text style={styles.tooltipAmount}>
                  {showBalance ? formatNaira(chartData[chartData.length - 1][1]) : "****"}
                </Text>
                <Text style={styles.tooltipMonth}>
                  {chartData[chartData.length - 1][0]}
                </Text>
              </View>
              <Svg width="100%" height="150" viewBox="0 0 345 150">
                <Path
                  d="M15 110 H330"
                  stroke={isDark ? "#303038" : "#F0EDF6"}
                  strokeWidth="1"
                />
                <Polyline
                  points={chartPoints}
                  fill="none"
                  stroke="#2970FF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 8,
                  width: "100%",
                  marginTop: -20,
                }}
              >
                {chartData.map(([month]) => (
                  <Text
                    key={month}
                    style={{ color: theme.subtext, fontSize: 11 }}
                  >
                    {month}
                  </Text>
                ))}
              </View>
            </View>
          ) : (
            <Text style={{ color: theme.subtext, fontSize: 13, marginTop: 20 }}>
              No wallet history available for account overview yet.
            </Text>
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={filterStage !== "hidden"}
        animationType="fade"
        onRequestClose={() => setFilterStage("hidden")}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setFilterStage("hidden")}
          />
          {filterStage === "range" ? (
            <View
              style={{
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: theme.surface,
                paddingHorizontal: 20,
                paddingTop: 18,
                paddingBottom: 28,
              }}
            >
              <View
                style={{
                  marginBottom: 20,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    textAlign: "center",
                    color: theme.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Account overview
                </Text>
                <TouchableOpacity onPress={() => setFilterStage("hidden")}>
                  <Ionicons name="close" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>
              {["Three Days", "This Week", "This Month"].map((label) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => {
                    setRangeLabel(label);
                    setFilterStage("hidden");
                  }}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                    paddingVertical: 16,
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 14 }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setFilterStage("calendar")}
                style={{ paddingVertical: 16 }}
              >
                <Text style={{ color: theme.text, fontSize: 14 }}>
                  Choose date
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: theme.surface,
                paddingHorizontal: 20,
                paddingTop: 18,
                paddingBottom: 28,
              }}
            >
              <View style={{ marginBottom: 20, alignItems: "center" }}>
                <Text
                  style={{ color: theme.text, fontSize: 15, fontWeight: "600" }}
                >
                  Account overview
                </Text>
              </View>
              <Text
                style={{
                  marginBottom: 16,
                  textAlign: "center",
                  color: theme.subtext,
                  fontSize: 12,
                }}
              >
                Please select the date range to filter your result
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: "47%",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ color: theme.subtext, fontSize: 12 }}>
                    From
                  </Text>
                </View>
                <View
                  style={{
                    width: "47%",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ color: theme.subtext, fontSize: 12 }}>To</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setRangeLabel("Monthly");
                  setFilterStage("hidden");
                }}
                style={{
                  borderRadius: 14,
                  backgroundColor: "#4A34A7",
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}
                >
                  Filter result
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function MetricBox({
  icon,
  color,
  value,
  label,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: string | number;
  label: string;
  theme: { surface: string; border: string; text: string; subtext: string };
}) {
  return (
    <View
      style={[
        styles.metricBox,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={[styles.metricIconWrap, { borderColor: color }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.metricTextWrap}>
        <Text
          style={[styles.metricValue, { color: theme.text }]}
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text
          style={[styles.metricLabel, { color: theme.subtext }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  customerHeader: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerLogo: {
    width: 112,
    height: 26,
  },
  customerHeaderIcons: {
    flexDirection: "row",
    gap: 10,
  },
  headerActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 28,
  },
  artistList: {
    paddingRight: 20,
  },
  recentList: {
    paddingRight: 20,
    gap: 12,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  designCard: {
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
  },
  designImageWrap: {
    width: "100%",
    position: "relative",
  },
  designImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  designContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  designTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  designArtist: {
    fontSize: 10,
    marginBottom: 8,
  },
  designPrice: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
  },

  // Dashboard Refined UI Styles
  balanceCard: {
    borderRadius: 16,
    backgroundColor: "#080808",
    padding: 24,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333333",
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceLabel: {
    color: "#B3B3B3",
    fontSize: 13,
    fontWeight: "500",
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 28,
  },
  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceUser: {
    color: "#B3B3B3",
    fontSize: 13,
  },
  balanceRole: {
    color: "#8A8A8A",
    fontSize: 13,
  },
  dashboardCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricBox: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  metricTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  paymentButton: {
    backgroundColor: "#322783",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: "center",
    marginTop: 16,
  },
  paymentButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  overviewSubtitle: {
    color: "#8A8A8A",
    fontSize: 13,
  },
  overviewAmount: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  chartTooltip: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
    zIndex: 10,
  },
  tooltipAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  tooltipMonth: {
    fontSize: 10,
    color: "#8A8A8A",
    marginTop: 2,
  },
});
