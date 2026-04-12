import { ArtistCard } from '@/components/ArtistCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionHeader } from '@/components/SectionHeader';
import { useHomeData } from '@/hooks/useHomeData';
import { formatNaira } from '@/lib/currency';
import { addRecentDesign } from '@/lib/localStorage';
import { mergeUserAndProfile, normalizeProfileResponse } from '@/lib/profile';
import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';
import type { Design, TProfileType, User } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  RefreshControl,
  StatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Path, Polyline, Defs, Pattern, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const [profileLoading, setProfileLoading] = useState(true);
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [filterStage, setFilterStage] = useState<'hidden' | 'range' | 'calendar'>('hidden');
  const [, setRangeLabel] = useState('This Month');
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
  } = useHomeData(activeRole === 'CUSTOMER');
  
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
        profileType: activeRole,
      } as User;
      setCurrentUser(merged);
      setWallet(walletResponse?.responseBody || walletResponse || null);
      setWalletHistory(walletHistoryResponse?.responseBody?.content || walletHistoryResponse?.responseBody || walletHistoryResponse?.content || []);
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
    background: isDark ? '#121212' : '#FAFAFA',
    surface: isDark ? '#1C1C1F' : '#FFFFFF',
    surfaceAlt: isDark ? '#232327' : '#F6F6F8',
    border: isDark ? '#2C2C31' : '#F1F1F1',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    subtext: isDark ? '#B8B8B8' : '#8A8A8A',
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
  const dashboardTopInset = Math.max(insets.top, StatusBar.currentHeight || 0);
  
  const paymentSegments = useMemo(() => {
    const credits = walletHistory
      .filter((item: any) => String(item.type).toUpperCase() === 'CREDIT')
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const debits = walletHistory
      .filter((item: any) => String(item.type).toUpperCase() === 'DEBIT')
      .reduce((sum: number, item: any) => sum + Math.abs(Number(item.amount || 0)), 0);
    const balance = Number(wallet?.balance || 0);

    const rawSegments = [
      { label: 'Paid', value: credits, color: '#322783' },
      { label: 'Pending', value: debits, color: '#0A66C2' },
      { label: 'Canceled', value: balance, color: '#F90A3F' },
    ].filter((item) => item.value > 0);

    return rawSegments.length ? rawSegments : [{ label: 'Paid', value: 1, color: '#322783' }];
  }, [wallet?.balance, walletHistory]);
  
  const totalSegmentValue = paymentSegments.reduce((sum, item) => sum + item.value, 0) || 1;
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
                    pathname: '/my-shop',
                    params: {
                      profileId: String(artist.id),
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: dashboardTopInset + 12, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={dashboardRefreshing}
            onRefresh={() => {
              setDashboardRefreshing(true);
              loadProfileDashboard();
            }}
          />
        }>
        
        {/* Top Balance Card */}
        <View style={styles.balanceCard}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <Pattern id="maze" patternUnits="userSpaceOnUse" width="60" height="60">
                <Path d="M0 30 L30 0 M30 60 L60 30 M0 0 L30 30 M30 30 L60 0 M0 60 L30 30 L60 60" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#maze)" />
          </Svg>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Ionicons name="eye-off-outline" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.balanceAmount}>{formatNaira(Number(wallet?.balance || 0))}</Text>
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceUser}>{activeName || 'Account'}</Text>
            <Text style={styles.balanceRole}>
              {activeRole === 'DESIGNER' ? 'Verified Account' : activeRole === 'PRINTER' ? 'Printer Account' : 'Verified Account'}
            </Text>
          </View>
        </View>

        {/* Business Performance Stats Card */}
        <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Designer&apos;s statistics</Text>
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4F0FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Ionicons name="stats-chart" size={20} color="#4A34A7" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#322783' }}>{jobSuccess}%</Text>
            <Text style={{ fontSize: 13, color: '#8A8A8A', marginTop: 4 }}>Business Performance</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricGrid}>
          <MetricBox icon="bag-outline" color="#F2994A" value={completedOrders} label="Completed order" theme={theme} />
          <MetricBox icon="wallet-outline" color="#27AE60" value={formatNaira(Number(totalEarnings || 0))} label="Overall Earning" theme={theme} />
          <MetricBox icon="star-outline" color="#9B51E0" value={rating.toFixed(1)} label="Overall Rating" theme={theme} />
          <MetricBox icon="checkbox-outline" color="#56CCF2" value={`${jobSuccess}%`} label="Job Success" theme={theme} />
          <MetricBox icon="close-circle-outline" color="#EB5757" value={cancelledOrders} label="Canceled order" theme={theme} />
          <MetricBox icon="cube-outline" color="#2F80ED" value={totalOrders} label="Total Order" theme={theme} />
        </View>

        {/* Column Stats Card */}
        <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Designer&apos;s statistics</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ alignItems: 'center' }}>
               <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>0%</Text>
               <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>Customer Retent.</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
               <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>{followers >= 1000 ? (followers/1000).toFixed(1)+'k' : followers}</Text>
               <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>Followers</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
               <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>{following}</Text>
               <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>Following</Text>
            </View>
          </View>
        </View>

        {/* Overall Payment Status */}
        <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 20 }]}>Overall Payment Status</Text>
          <View style={{ alignItems: 'center', paddingBottom: 20 }}>
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Circle cx="70" cy="70" r="45" stroke={isDark ? '#303038' : '#EFEAF8'} strokeWidth="10" fill="none" />
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
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={{ color: theme.subtext, fontSize: 12 }}>{item.label}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.paymentButton} onPress={() => router.push('/payments')}>
            <Text style={styles.paymentButtonText}>Payment history</Text>
          </TouchableOpacity>
        </View>

        {/* Account Overview */}
        <View style={[styles.dashboardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.overviewHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 0 }]}>Account overview</Text>
              <Text style={styles.overviewSubtitle}> (this month)</Text>
            </View>
            <TouchableOpacity onPress={() => setFilterStage('range')}>
              <Ionicons name="chevron-down" size={16} color="#8A8A8A" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.overviewAmount, { color: theme.text }]}>
            {topChartValue ? formatNaira(topChartValue) : formatNaira(0)}
          </Text>

          {chartData.length > 0 ? (
            <View style={{ alignItems: 'center', position: 'relative', marginTop: 30 }}>
              <View style={[styles.chartTooltip, { top: -15, left: '35%' }]}>
                <Text style={styles.tooltipAmount}>{formatNaira(chartData[chartData.length - 1][1])}</Text>
                <Text style={styles.tooltipMonth}>{chartData[chartData.length - 1][0]}</Text>
              </View>
              <Svg width="100%" height="150" viewBox="0 0 345 150">
                <Path d="M15 110 H330" stroke={isDark ? '#303038' : '#F0EDF6'} strokeWidth="1" />
                <Polyline points={chartPoints} fill="none" stroke="#2970FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, width: '100%', marginTop: -20 }}>
                {chartData.map(([month]) => (
                  <Text key={month} style={{ color: theme.subtext, fontSize: 11 }}>{month}</Text>
                ))}
              </View>
            </View>
          ) : (
            <Text style={{ color: theme.subtext, fontSize: 13, marginTop: 20 }}>No wallet history available for account overview yet.</Text>
          )}
        </View>

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
    <View style={[styles.metricBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.metricIconWrap, { borderColor: color }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.metricTextWrap}>
        <Text style={[styles.metricValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
        <Text style={[styles.metricLabel, { color: theme.subtext }]} numberOfLines={1}>{label}</Text>
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
  
  // Dashboard Refined UI Styles
  balanceCard: {
    borderRadius: 12,
    backgroundColor: '#3D248D',
    padding: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#E0D8FF',
    fontSize: 13,
    fontWeight: '400',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 28,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceUser: {
    color: '#E0D8FF',
    fontSize: 13,
  },
  balanceRole: {
    color: '#E0D8FF',
    fontSize: 13,
  },
  dashboardCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricBox: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  paymentButton: {
    backgroundColor: '#322783',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: 'center',
    marginTop: 16,
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewSubtitle: {
    color: '#8A8A8A',
    fontSize: 13,
  },
  overviewAmount: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  chartTooltip: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tooltipMonth: {
    fontSize: 10,
    color: '#8A8A8A',
    marginTop: 2,
  },
});
