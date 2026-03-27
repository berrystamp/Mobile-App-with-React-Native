import { ArtistCard } from '@/components/ArtistCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionHeader } from '@/components/SectionHeader';
import { useHomeData } from '@/hooks/useHomeData';
import { formatNaira } from '@/lib/currency';
import { addRecentDesign } from '@/lib/localStorage';
import { mergeUserAndProfile, normalizeProfileResponse } from '@/lib/profile';
import ApiService from '@/services/apiClient';
import type { Design, TProfileType, User } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

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
  const isDark = useColorScheme() === 'dark';
  const imageUrl = design.imagePath?.startsWith('http')
    ? design.imagePath
    : design.imagePath
      ? `https://berrystamp-backend-dev-4cn29.ondigitalocean.app/${design.imagePath}`
      : '';
  const artistName = `${design.profile.firstName} ${design.profile.lastName}`.trim() || design.profile.username;
  const mockPrices = design.mocks.map((mock) => mock.price).filter((price) => price > 0);
  const lowestPrice = mockPrices.length > 0 ? Math.min(...mockPrices) : design.amount || 0;

  return (
    <TouchableOpacity
      style={[
        styles.designCard,
        {
          width,
          backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
          borderColor: isDark ? '#2B2B2B' : '#F1F1F1',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}>
      <View style={[styles.designImageWrap, { backgroundColor: isDark ? '#232323' : '#F7F7F7', height: imageHeight }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.designImage} resizeMode="cover" />
        ) : (
          <View style={[styles.designImage, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={24} color={isDark ? '#9A9A9A' : '#B9B9B9'} />
          </View>
        )}
        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)' }]}
          onPress={() => onFavoriteToggle(design.id)}>
          <Ionicons name={design.liked ? 'heart' : 'heart-outline'} size={16} color={design.liked ? '#FF4D67' : '#767676'} />
        </TouchableOpacity>
      </View>
      <View style={styles.designContent}>
        <Text style={[styles.designTitle, { color: isDark ? '#FFFFFF' : '#252525' }]} numberOfLines={1}>
          {design.title}
        </Text>
        <Text style={[styles.designArtist, { color: isDark ? '#B3B3B3' : '#7F7F7F' }]} numberOfLines={1}>
          By {artistName}
        </Text>
        <Text style={[styles.designPrice, { color: isDark ? '#FFFFFF' : '#252525' }]}>{formatNaira(lowestPrice)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  const [profileLoading, setProfileLoading] = useState(true);
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [filterStage, setFilterStage] = useState<'hidden' | 'range' | 'calendar'>('hidden');
  const [rangeLabel, setRangeLabel] = useState('This Month');
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
  } = useHomeData((currentUser?.profileType || 'CUSTOMER') === 'CUSTOMER');

  const loadProfileDashboard = useCallback(async () => {
    try {
      setProfileLoading(true);
      const [userResponse, walletResponse, walletHistoryResponse] = await Promise.all([
        ApiService.getMyProfile(),
        ApiService.getWallet().catch(() => null),
        ApiService.getWalletHistory().catch(() => null),
      ]);
      const current = (await ApiService.getCurrentUser()) as User | null;
      const normalized = normalizeProfileResponse(userResponse);
      const merged = {
        ...(current || {}),
        ...normalized,
        profileType: normalized.profileType || current?.profileType || 'CUSTOMER',
      } as User;
      setCurrentUser(merged);
      setWallet(walletResponse?.responseBody || walletResponse || null);
      setWalletHistory(walletHistoryResponse?.responseBody?.content || walletHistoryResponse?.responseBody || walletHistoryResponse?.content || []);
    } finally {
      setProfileLoading(false);
      setDashboardRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileDashboard();
    }, [loadProfileDashboard]),
  );

  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    surface: isDark ? '#1C1C1F' : '#FFFFFF',
    surfaceAlt: isDark ? '#232327' : '#F6F6F8',
    border: isDark ? '#2C2C31' : '#F1EDF6',
    text: isDark ? '#FFFFFF' : '#2F2A36',
    subtext: isDark ? '#B8B8B8' : '#6B6B6B',
    accent: isDark ? '#A99BFF' : '#4A34A7',
  };

  const horizontalCardWidth = Math.min(Math.max(screenWidth * 0.52, 172), 196);
  const featuredCardWidth = Math.max((screenWidth - 40 - 12) / 2, 150);

  const openDesign = useCallback(
    async (design: Design) => {
      await addRecentDesign(design.id);
      router.push({
        pathname: '/products',
        params: { designId: String(design.id) },
      });
    },
    [router],
  );

  const mergedProfile = useMemo(() => mergeUserAndProfile(currentUser, {}), [currentUser]);
  const activeRole = (currentUser?.profileType || 'CUSTOMER') as TProfileType;
  const activeProfile = useMemo(() => {
    if (!currentUser) return null;
    if (activeRole === 'DESIGNER') return currentUser.designerProfile;
    if (activeRole === 'PRINTER') return currentUser.printerProfile;
    return currentUser.customerProfile;
  }, [activeRole, currentUser]);

  const insight = activeProfile?.insight || {};
  const totalEarnings = insight.totalEarnings || wallet?.balance || 0;
  const rating = insight.rating?.avgStars || 0;
  const followers = insight.totalFollowers || 0;
  const following = insight.totalFollowing || 0;
  const completedOrders = insight.totalCompletedOrders || 0;
  const cancelledOrders = insight.totalCancelledOrders || 0;
  const totalOrders = completedOrders + cancelledOrders;
  const jobSuccess = insight.jobSuccessPercentage || 0;
  const activeName = activeProfile?.userName || activeProfile?.name || mergedProfile.username || mergedProfile.fullName;
  const historyItems = walletHistory.slice(0, 6);
  const paymentSegments = useMemo(() => {
    const credits = walletHistory
      .filter((item: any) => String(item.type).toUpperCase() === 'CREDIT')
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const debits = walletHistory
      .filter((item: any) => String(item.type).toUpperCase() === 'DEBIT')
      .reduce((sum: number, item: any) => sum + Math.abs(Number(item.amount || 0)), 0);
    const balance = Number(wallet?.balance || 0);

    const rawSegments = [
      { label: 'Credits', value: credits, color: '#4430A3' },
      { label: 'Debits', value: debits, color: '#F4BE1A' },
      { label: 'Available balance', value: balance, color: '#FF5A6B' },
    ].filter((item) => item.value > 0);

    return rawSegments.length ? rawSegments : [{ label: 'Available balance', value: 1, color: '#4430A3' }];
  }, [wallet?.balance, walletHistory]);
  const totalSegmentValue = paymentSegments.reduce((sum, item) => sum + item.value, 0) || 1;
  const paymentArcs = useMemo(() => {
    let rotation = -90;
    return paymentSegments.map((segment) => {
      const circumference = 2 * Math.PI * 32;
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
      const key = date.toLocaleString('en-US', { month: 'short' });
      grouped.set(key, (grouped.get(key) || 0) + Number(item.amount || 0));
    });

    const entries = Array.from(grouped.entries()).slice(-6);
    return entries.length ? entries : [];
  }, [walletHistory]);
  const chartPoints = useMemo(() => {
    if (!chartData.length) return '';
    const maxValue = Math.max(...chartData.map((item) => item[1]), 1);
    return chartData
      .map(([_, value], index) => {
        const x = 20 + index * (300 / Math.max(chartData.length - 1, 1));
        const y = 110 - (value / maxValue) * 70;
        return `${x},${y}`;
      })
      .join(' ');
  }, [chartData]);
  const topChartValue = useMemo(() => {
    if (!chartData.length) return null;
    return Math.max(...chartData.map((item) => item[1]));
  }, [chartData]);

  if (profileLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (activeRole === 'CUSTOMER') {
    if (isLoading) {
      return <LoadingSpinner message="Loading designs..." />;
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={retry} />;
    }

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionHeader title="Top Artists" showViewAll={false} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistList}>
            {topArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onPress={() =>
                  router.push({
                    pathname: '/products',
                    params: {
                      artistId: String(artist.id),
                      artistName: `${artist.firstName} ${artist.lastName}`.trim(),
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Recent designs" onViewAllPress={() => router.push('/products')} />
          {recentDesigns.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No designs available right now.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
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
          <SectionHeader title="Feature designs" onViewAllPress={() => router.push('/products')} />
          {featuredDesigns.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No designs available right now.</Text>
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
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={dashboardRefreshing}
            onRefresh={() => {
              setDashboardRefreshing(true);
              loadProfileDashboard();
            }}
          />
        }>
        <View style={{ borderRadius: 18, backgroundColor: '#4832A8', padding: 18, overflow: 'hidden' }}>
          <View style={styles.dashboardPatternCircleLg} />
          <View style={styles.dashboardPatternCircleSm} />
          <View style={styles.dashboardPatternDot} />
          <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>{activeName || 'Account'}</Text>
          <Text style={{ marginTop: 4, textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
            {activeRole === 'DESIGNER' ? 'Verified Account' : activeRole === 'PRINTER' ? 'Printer Account' : 'Account'}
          </Text>
          <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <DashboardStat label="Earnings" value={formatNaira(Number(totalEarnings || 0))} />
            <DashboardStat label="Rating" value={rating.toFixed(1)} />
            <DashboardStat label="Followers" value={String(followers)} />
          </View>
        </View>

        <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.dashboardCardTitle, { color: theme.text }]}>Designer&apos;s statistics</Text>
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#2B2448' : '#EEE8FF' }}>
              <Ionicons name="stats-chart-outline" size={18} color={theme.accent} />
            </View>
            <Text style={{ marginTop: 10, color: theme.accent, fontSize: 28, fontWeight: '700' }}>{jobSuccess || 0}%</Text>
            <Text style={{ marginTop: 4, color: theme.subtext, fontSize: 12 }}>Business Performance</Text>
          </View>
        </View>

        <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.dashboardCardTitle, { color: theme.text }]}>Insights and analytics</Text>
            <TouchableOpacity onPress={() => setFilterStage('range')}>
              <Ionicons name="options-outline" size={18} color={theme.subtext} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <MetricBox icon="people-outline" color={isDark ? '#2C224F' : '#C9B9FF'} value={following} label="Following you" theme={theme} />
            <MetricBox icon="person-add-outline" color={isDark ? '#33295A' : '#E1D7FF'} value={followers} label="You follow" theme={theme} />
            <MetricBox icon="briefcase-outline" color={isDark ? '#4A2D24' : '#FFE2D0'} value={completedOrders} label="Completed order" theme={theme} />
            <MetricBox icon="cash-outline" color={isDark ? '#1F403A' : '#D5FFF5'} value={formatNaira(Number(totalEarnings || 0))} label="Overall Earning" theme={theme} />
            <MetricBox icon="star-outline" color={isDark ? '#34254D' : '#F0E4FF'} value={rating.toFixed(1)} label="Overall Rating" theme={theme} />
            <MetricBox icon="shield-checkmark-outline" color={isDark ? '#1F3347' : '#DDF4FF'} value={`${jobSuccess}%`} label="Job Success" theme={theme} />
            <MetricBox icon="close-circle-outline" color={isDark ? '#482A33' : '#FFE0E6'} value={cancelledOrders} label="Canceled order" theme={theme} />
            <MetricBox icon="cube-outline" color={isDark ? '#22324C' : '#E2F0FF'} value={totalOrders} label="Total Order" theme={theme} />
          </View>
        </View>

        <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.dashboardCardTitle, { color: theme.text }]}>Overall Payment Status</Text>
            <TouchableOpacity onPress={() => router.push('/payments')} style={{ borderRadius: 8, backgroundColor: '#4A34A7', paddingHorizontal: 12, paddingVertical: 7 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Wallet history</Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Svg width="120" height="120" viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="32" stroke={isDark ? '#303038' : '#EFEAF8'} strokeWidth="8" fill="none" />
              {paymentArcs.map((segment) => (
                <Circle
                  key={segment.label}
                  cx="60"
                  cy="60"
                  r="32"
                  stroke={segment.color}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={segment.dash}
                  strokeLinecap="round"
                  rotation={segment.rotation}
                  origin="60,60"
                />
              ))}
            </Svg>
          </View>

          <View style={{ marginTop: 8 }}>
            {paymentSegments.map((item) => (
              <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 10, height: 2, backgroundColor: item.color, marginRight: 8 }} />
                <Text style={{ color: theme.subtext, fontSize: 12 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.dashboardCardTitle, { color: theme.text }]}>Account Overview</Text>
            <TouchableOpacity onPress={() => setFilterStage('range')} style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 10, backgroundColor: theme.surfaceAlt, paddingHorizontal: 12, paddingVertical: 7 }}>
              <Text style={{ color: theme.subtext, fontSize: 12, marginRight: 6 }}>{rangeLabel}</Text>
              <Ionicons name="chevron-down" size={14} color={theme.subtext} />
            </TouchableOpacity>
          </View>
          {chartData.length ? (
            <>
              <Text style={{ marginBottom: 12, color: theme.subtext, fontSize: 10 }}>{topChartValue ? formatNaira(topChartValue) : ''}</Text>
              <Svg width="100%" height="150" viewBox="0 0 345 150">
                <Path d="M15 110 H330" stroke={isDark ? '#303038' : '#F0EDF6'} strokeWidth="1" />
                <Polyline points={chartPoints} fill="none" stroke="#2970FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}>
                {chartData.map(([month]) => (
                  <Text key={month} style={{ color: theme.subtext, fontSize: 11 }}>{month}</Text>
                ))}
              </View>
            </>
          ) : (
            <Text style={{ color: theme.subtext, fontSize: 13 }}>No wallet history available for account overview yet.</Text>
          )}
        </View>

        {historyItems.length ? (
          <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.dashboardCardTitle, { marginBottom: 12, color: theme.text }]}>Recent Payments</Text>
            {historyItems.map((item: any, index: number) => (
              <View
                key={String(item.id || index)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  borderBottomWidth: index === historyItems.length - 1 ? 0 : 1,
                  borderBottomColor: theme.border,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#2970FF', marginRight: 10 }} />
                  <View>
                    <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{item.description || 'Wallet transaction'}</Text>
                    <Text style={{ marginTop: 4, color: theme.subtext, fontSize: 11 }}>{item.reference || item.createdAt || 'Wallet'}</Text>
                  </View>
                </View>
                <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '700' }}>{formatNaira(Number(item.amount || 0))}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <Modal transparent visible={filterStage !== 'hidden'} animationType="fade" onRequestClose={() => setFilterStage('hidden')}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setFilterStage('hidden')} />
          {filterStage === 'range' ? (
            <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.surface, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 }}>
              <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ flex: 1, textAlign: 'center', color: theme.text, fontSize: 15, fontWeight: '600' }}>Account overview</Text>
                <TouchableOpacity onPress={() => setFilterStage('hidden')}>
                  <Ionicons name="close" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>
              {['Three Days', 'This Week', 'This Month'].map((label) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => {
                    setRangeLabel(label);
                    setFilterStage('hidden');
                  }}
                  style={{ borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 16 }}>
                  <Text style={{ color: theme.text, fontSize: 14 }}>{label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setFilterStage('calendar')} style={{ paddingVertical: 16 }}>
                <Text style={{ color: theme.text, fontSize: 14 }}>Choose date</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.surface, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 }}>
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>Account overview</Text>
              </View>
              <Text style={{ marginBottom: 16, textAlign: 'center', color: theme.subtext, fontSize: 12 }}>Please select the date range to filter your result</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <View style={{ width: '47%', borderRadius: 8, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 12, paddingVertical: 12 }}>
                  <Text style={{ color: theme.subtext, fontSize: 12 }}>From</Text>
                </View>
                <View style={{ width: '47%', borderRadius: 8, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 12, paddingVertical: 12 }}>
                  <Text style={{ color: theme.subtext, fontSize: 12 }}>To</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setRangeLabel('Monthly');
                  setFilterStage('hidden');
                }}
                style={{ borderRadius: 14, backgroundColor: '#4A34A7', paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Filter result</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function DashboardStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{value}</Text>
      <Text style={{ marginTop: 4, color: 'rgba(255,255,255,0.78)', fontSize: 11 }}>{label}</Text>
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
  theme: { surfaceAlt: string; border: string; text: string; subtext: string };
}) {
  return (
    <View style={{ width: '48.5%', borderRadius: 14, backgroundColor: theme.surfaceAlt, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: color, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Ionicons name={icon} size={16} color="#5B54A0" />
      </View>
      <Text style={{ color: theme.text, fontSize: 22, fontWeight: '700' }}>{value}</Text>
      <Text style={{ marginTop: 3, color: theme.subtext, fontSize: 11 }}>{label}</Text>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  designCard: {
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
  },
  designImageWrap: {
    width: '100%',
    position: 'relative',
  },
  designImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  designContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  designTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  designArtist: {
    fontSize: 10,
    marginBottom: 8,
  },
  designPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
  },
  dashboardCard: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  dashboardCardTitle: {
    color: '#2F2A36',
    fontSize: 14,
    fontWeight: '600',
  },
  dashboardPatternCircleLg: {
    position: 'absolute',
    top: 10,
    left: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  dashboardPatternCircleSm: {
    position: 'absolute',
    bottom: 16,
    right: 18,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dashboardPatternDot: {
    position: 'absolute',
    bottom: 18,
    right: 42,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
