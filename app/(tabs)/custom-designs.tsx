import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';
import type { Design, User } from '@/types';
import { mergeUserAndProfile, normalizePaymentDetails, normalizeProfileResponse } from '@/lib/profile';

type TabType = 'designs' | 'collections';
type FollowTab = 'followers' | 'following';

type CollectionItem = {
  id: number | string;
  name: string;
  description?: string;
  imagePath?: string;
  designCount: number;
};

type ReviewItem = {
  id: string | number;
  author: string;
  avatar?: string;
  comment: string;
  stars: number;
  createdAt?: string;
};

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200';
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300';
const API_ORIGIN = 'https://berrystamp-backend-dev-4cn29.ondigitalocean.app';

const toAbsoluteImage = (path?: string) => {
  if (!path || path === 'string') return '';
  if (path.startsWith('http') || path.startsWith('file:')) return path;
  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
};

const unwrapList = (response: any): any[] => {
  const body = response?.responseBody || response?.data || response || {};
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.results)) return body.results;
  return [];
};

const toDisplayName = (person: any) => {
  const direct = String(person?.name || '').trim();
  if (direct) return direct;
  const built = `${person?.firstName || ''} ${person?.lastName || ''}`.trim();
  return built || person?.username || person?.userName || 'User';
};

const toCountLabel = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;

export default function MyShopScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const activeRole = toProfileType(role);
  const isDark = useColorScheme() === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('designs');

  const [profile, setProfile] = useState<any>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followTab, setFollowTab] = useState<FollowTab>('followers');
  const [searchText, setSearchText] = useState('');
  const [menuTarget, setMenuTarget] = useState<{ id: string | number; type: 'design' | 'collection' } | null>(null);

  const theme = {
    background: isDark ? '#111113' : '#F6F6F8',
    surface: isDark ? '#1A1A1E' : '#FFFFFF',
    text: isDark ? '#F3F3F5' : '#282433',
    muted: isDark ? '#A9A9B1' : '#7A7687',
    border: isDark ? '#2B2B31' : '#E9E6F3',
    primary: '#4732A1',
  };

  const loadShop = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const currentUser = (await ApiService.getCurrentUser()) as User | null;
      const [
        myProfileResponse,
        designsResponse,
        collectionsResponse,
        paymentResponse,
      ] = await Promise.all([
        ApiService.getMyProfile(),
        ApiService.getCustomDesigns(0, 40),
        ApiService.getMyCollections(0, 40).catch(() => ({ responseBody: { content: [] } })),
        ApiService.getPaymentDetails().catch(() => null),
      ]);

      const normalized = normalizeProfileResponse(myProfileResponse);
      const merged = mergeUserAndProfile(currentUser, normalized);
      const roleProfile =
        activeRole === 'DESIGNER'
          ? merged.designerProfile
          : activeRole === 'PRINTER'
            ? merged.printerProfile
            : merged.customerProfile;

      const insight = roleProfile?.insight || {};
      const profileId = Number(normalized.id || currentUser?.id || roleProfile?.id || 0);
      const [followerResponse, followingResponse, reviewResponse] = await Promise.all([
        ApiService.getFollowers(profileId || undefined, 0, 100).catch(() => ({ responseBody: { content: [] } })),
        ApiService.getFollowing(profileId || undefined, 0, 100).catch(() => ({ responseBody: { content: [] } })),
        ApiService.getShopReviews(profileId || undefined, 0, 50).catch(() => ({ responseBody: { content: [] } })),
      ]);

      const designList = unwrapList(designsResponse) as Design[];
      const collectionList = unwrapList(collectionsResponse).map((item: any) => ({
        id: item?.id || String(Math.random()),
        name: String(item?.name || item?.title || 'Untitled collection'),
        description: String(item?.description || ''),
        imagePath: toAbsoluteImage(item?.imagePath || item?.coverPath || item?.previewImage || item?.image?.url),
        designCount: Number(item?.designCount || item?.designsCount || item?.designs?.length || 0),
      }));

      const reviewList = unwrapList(reviewResponse).map((item: any, index: number) => ({
        id: item?.id || `review-${index}`,
        author: toDisplayName(item?.profile || item?.user || item?.author || {}),
        avatar: toAbsoluteImage(item?.profile?.profilePicturePath || item?.user?.profilePicturePath || item?.avatar),
        comment: String(item?.comment || item?.review || item?.message || ''),
        stars: Number(item?.stars || item?.rating || item?.rate || 0),
        createdAt: item?.createdAt || item?.date,
      })).filter((item: ReviewItem) => item.comment);

      const followerList = unwrapList(followerResponse);
      const followingList = unwrapList(followingResponse);
      const payment = normalizePaymentDetails(paymentResponse || {});

      setProfile({
        ...merged,
        profileId,
        bio: roleProfile?.bio || currentUser?.bio || '',
        categories: Array.isArray(roleProfile?.categories) ? roleProfile.categories : [],
        cover: toAbsoluteImage(roleProfile?.coverPic || roleProfile?.coverPhotoPath || normalized.coverPic || normalized.coverImageUrl),
        avatar: toAbsoluteImage(roleProfile?.profilePic || normalized.profilePicturePath || normalized.profileImageUrl || merged.avatar),
        followers: Number(insight.totalFollowers || followerList.length || 0),
        following: Number(insight.totalFollowing || followingList.length || 0),
        reviews: Number(insight.totalReviews || reviewList.length || 0),
        uploads: Number(insight.totalUploads || designList.length || 0),
      });

      setDesigns(designList);
      setCollections(collectionList);
      setReviews(reviewList);
      setFollowers(followerList);
      setFollowing(followingList);

      const hasPaymentDetails = Boolean(payment.bankName && payment.accountName && payment.accountNumber);
      if (!hasPaymentDetails && (activeRole === 'DESIGNER' || activeRole === 'PRINTER')) {
        setShowPaymentPrompt(true);
      }
    } catch (error: any) {
      Alert.alert('Unable to load shop', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeRole, refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadShop();
    }, [loadShop]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShop();
  }, [loadShop]);

  const searchablePeople = useMemo(() => {
    const source = followTab === 'followers' ? followers : following;
    const query = searchText.trim().toLowerCase();
    return source.filter((person) => {
      if (!query) return true;
      const joined = `${toDisplayName(person)} ${person?.username || ''}`.toLowerCase();
      return joined.includes(query);
    });
  }, [followTab, followers, following, searchText]);

  const handleRemoveFollow = async (target: any) => {
    const profileId = Number(target?.id || target?.profileId || target?.profile?.id);
    if (!profileId) return;

    try {
      await ApiService.unfollowProfile(profileId);
      if (followTab === 'followers') {
        setFollowers((prev) => prev.filter((item) => Number(item?.id || item?.profileId || item?.profile?.id) !== profileId));
      } else {
        setFollowing((prev) => prev.filter((item) => Number(item?.id || item?.profileId || item?.profile?.id) !== profileId));
      }
    } catch (error: any) {
      Alert.alert('Action failed', error?.response?.data?.responseMessage || error?.message || 'Could not update follow list.');
    }
  };

  const shareShop = async () => {
    const username = profile?.username || profile?.fullName || 'designer';
    await Share.share({
      message: `Check out ${username}'s shop on Berrystamp.`,
      title: 'Shop Collection',
    });
  };

  const handleMenuAction = async (action: 'update' | 'delete' | 'insights' | 'share') => {
    if (!menuTarget) return;

    if (action === 'update') {
      setMenuTarget(null);
      router.push('/edit-profile');
      return;
    }

    if (action === 'insights') {
      setMenuTarget(null);
      router.push('/(tabs)');
      return;
    }

    if (action === 'share') {
      setMenuTarget(null);
      await shareShop();
      return;
    }

    if (action === 'delete' && menuTarget.type === 'design') {
      try {
        await ApiService.deleteCustomDesign(menuTarget.id);
        setDesigns((prev) => prev.filter((design) => String(design.id) !== String(menuTarget.id)));
      } catch (error: any) {
        Alert.alert('Delete failed', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
      } finally {
        setMenuTarget(null);
      }
    }
  };

  if (loading && !profile) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}>
        <View style={styles.coverSection}>
          <Image source={{ uri: profile?.cover || FALLBACK_COVER }} style={styles.cover} />
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/edit-profile')}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}> 
          <Image source={{ uri: profile?.avatar || FALLBACK_AVATAR }} style={styles.avatar} />
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>{profile?.fullName || profile?.username || 'My Shop'}</Text>
            <TouchableOpacity onPress={() => setShowReviewModal(true)}>
              <Text style={[styles.reviewTrigger, { color: theme.primary }]}>{toCountLabel(profile?.reviews || reviews.length || 0, 'review')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: theme.text }]}>{toCountLabel(profile?.uploads || designs.length, 'design')}</Text>
            <Text style={[styles.dot, { color: theme.primary }]}>|</Text>
            <TouchableOpacity onPress={() => { setFollowTab('followers'); setShowFollowModal(true); }}>
              <Text style={[styles.statText, { color: theme.primary }]}>{toCountLabel(profile?.followers || followers.length, 'follower')}</Text>
            </TouchableOpacity>
            <Text style={[styles.dot, { color: theme.primary }]}>|</Text>
            <TouchableOpacity onPress={() => { setFollowTab('following'); setShowFollowModal(true); }}>
              <Text style={[styles.statText, { color: theme.primary }]}>{toCountLabel(profile?.following || following.length, 'following')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.bio, { color: theme.muted }]} numberOfLines={2}>
            {profile?.bio || 'Tell people what your shop creates and the kind of projects you are open to.'}
          </Text>

          <View style={styles.tagWrap}>
            {(profile?.categories || []).slice(0, 6).map((item: string) => (
              <View key={item} style={[styles.tag, { borderColor: theme.border }]}>
                <Text style={[styles.tagText, { color: theme.muted }]}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.tabRow, { borderBottomColor: theme.border }]}> 
            <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('designs')}>
              <Text style={[styles.tabText, { color: activeTab === 'designs' ? theme.text : theme.muted }]}>Design</Text>
              {activeTab === 'designs' ? <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} /> : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('collections')}>
              <Text style={[styles.tabText, { color: activeTab === 'collections' ? theme.text : theme.muted }]}>Collection</Text>
              {activeTab === 'collections' ? <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} /> : null}
            </TouchableOpacity>
          </View>

          {activeTab === 'designs' ? (
            <View style={styles.grid}>
              {designs.map((item) => {
                const imagePath = toAbsoluteImage(item.imagePath || item.mocks?.[0]?.imagePath);
                return (
                  <View key={item.id} style={[styles.card, { backgroundColor: theme.background }]}> 
                    <TouchableOpacity style={styles.menuDot} onPress={() => setMenuTarget({ id: item.id, type: 'design' })}>
                      <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
                    </TouchableOpacity>
                    {imagePath ? (
                      <Image source={{ uri: imagePath }} style={styles.cardImage} />
                    ) : (
                      <View style={[styles.cardImage, styles.cardPlaceholder]}>
                        <Ionicons name="image-outline" size={20} color={theme.muted} />
                      </View>
                    )}
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.title || 'Untitled design'}</Text>
                    <Text style={[styles.cardSub, { color: theme.muted }]}>{toCountLabel(item.mocks?.length || 0, 'variant')}</Text>
                  </View>
                );
              })}
              {!designs.length ? <Text style={[styles.emptyText, { color: theme.muted }]}>No designs uploaded yet.</Text> : null}
            </View>
          ) : (
            <View style={styles.grid}>
              {collections.map((item) => (
                <View key={String(item.id)} style={[styles.card, { backgroundColor: theme.background }]}> 
                  <TouchableOpacity style={styles.menuDot} onPress={() => setMenuTarget({ id: item.id, type: 'collection' })}>
                    <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
                  </TouchableOpacity>
                  {item.imagePath ? (
                    <Image source={{ uri: item.imagePath }} style={styles.cardImage} />
                  ) : (
                    <View style={[styles.cardImage, styles.cardPlaceholder]}>
                      <Ionicons name="albums-outline" size={20} color={theme.muted} />
                    </View>
                  )}
                  <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.cardSub, { color: theme.muted }]}>{toCountLabel(item.designCount, 'design')}</Text>
                </View>
              ))}
              {!collections.length ? <Text style={[styles.emptyText, { color: theme.muted }]}>No collections yet.</Text> : null}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={Boolean(menuTarget)} transparent animationType="slide" onRequestClose={() => setMenuTarget(null)}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setMenuTarget(null)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}> 
            <View style={styles.sheetHandle} />
            <SheetAction label="Update Design" onPress={() => handleMenuAction('update')} />
            <SheetAction label="Delete Design" destructive onPress={() => handleMenuAction('delete')} />
            <SheetAction label="View insights" onPress={() => handleMenuAction('insights')} />
            <SheetAction label="Share collection" onPress={() => handleMenuAction('share')} />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showPaymentPrompt} transparent animationType="fade" onRequestClose={() => setShowPaymentPrompt(false)}>
        <View style={styles.centerModalWrap}>
          <View style={[styles.paymentPrompt, { backgroundColor: theme.surface }]}> 
            <TouchableOpacity onPress={() => setShowPaymentPrompt(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.paymentCopy, { color: theme.text }]}>Add your payment details in other to get your visible to prospect customers</Text>
            <View style={[styles.promptButtons, { borderTopColor: theme.border }]}> 
              <TouchableOpacity style={styles.promptBtn} onPress={() => setShowPaymentPrompt(false)}>
                <Text style={[styles.promptBtnText, { color: theme.muted }]}>Do it later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptBtn, { borderLeftColor: theme.border, borderLeftWidth: StyleSheet.hairlineWidth }]}
                onPress={() => {
                  setShowPaymentPrompt(false);
                  router.push('/payment-details');
                  setShowPaymentSuccess(true);
                }}>
                <Text style={[styles.promptBtnText, { color: theme.primary, fontWeight: '700' }]}>Add Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPaymentSuccess} transparent animationType="fade" onRequestClose={() => setShowPaymentSuccess(false)}>
        <View style={styles.centerModalWrap}>
          <View style={[styles.successCard, { backgroundColor: theme.surface }]}> 
            <TouchableOpacity onPress={() => setShowPaymentSuccess(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.successTitle, { color: theme.text }]}>Payment Updated successfully!!</Text>
            <Text style={[styles.successBody, { color: theme.text }]}>Cogratuation! Your designs will now be visible to customers</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={showReviewModal} transparent animationType="slide" onRequestClose={() => setShowReviewModal(false)}>
        <View style={[styles.fullModal, { backgroundColor: theme.background }]}> 
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Review</Text>
            <View style={{ width: 20 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 8 }}>
            {reviews.map((review) => (
              <View key={String(review.id)} style={[styles.reviewRow, { borderBottomColor: theme.border }]}> 
                <Image source={{ uri: review.avatar || FALLBACK_AVATAR }} style={styles.reviewAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reviewName, { color: theme.text }]}>{review.author}</Text>
                  <Text style={[styles.reviewMeta, { color: theme.muted }]}>
                    {'★'.repeat(Math.max(0, Math.min(5, Math.round(review.stars || 0))))} {review.createdAt ? `• ${new Date(review.createdAt).toLocaleDateString()}` : ''}
                  </Text>
                  <Text style={[styles.reviewComment, { color: theme.text }]}>{review.comment}</Text>
                </View>
              </View>
            ))}
            {!reviews.length ? <Text style={[styles.emptyText, { color: theme.muted }]}>No reviews yet.</Text> : null}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showFollowModal} transparent animationType="slide" onRequestClose={() => setShowFollowModal(false)}>
        <View style={[styles.fullModal, { backgroundColor: theme.background }]}> 
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFollowModal(false)}>
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.headerPill} />
            <View style={{ width: 20 }} />
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={theme.muted} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search profile"
              placeholderTextColor={theme.muted}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>

          <View style={[styles.followTabs, { borderBottomColor: theme.border }]}> 
            <TouchableOpacity style={styles.followTabBtn} onPress={() => setFollowTab('followers')}>
              <Text style={[styles.followTabText, { color: followTab === 'followers' ? theme.text : theme.muted }]}>Followers</Text>
              {followTab === 'followers' ? <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} /> : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.followTabBtn} onPress={() => setFollowTab('following')}>
              <Text style={[styles.followTabText, { color: followTab === 'following' ? theme.text : theme.muted }]}>Following</Text>
              {followTab === 'following' ? <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} /> : null}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
            {searchablePeople.map((person, index) => {
              const id = Number(person?.id || person?.profileId || person?.profile?.id || index);
              const avatar = toAbsoluteImage(person?.profilePicturePath || person?.profile?.profilePicturePath || person?.profilePic);
              return (
                <View key={`${id}-${index}`} style={styles.personRow}>
                  <Image source={{ uri: avatar || FALLBACK_AVATAR }} style={styles.personAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personName, { color: theme.text }]}>{toDisplayName(person?.profile || person)}</Text>
                    <Text style={[styles.personSub, { color: theme.muted }]}>Designer account</Text>
                  </View>
                  <TouchableOpacity style={[styles.removeBtn, { borderColor: theme.primary }]} onPress={() => handleRemoveFollow(person)}>
                    <Text style={[styles.removeBtnText, { color: theme.primary }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            {!searchablePeople.length ? <Text style={[styles.emptyText, { color: theme.muted }]}>No profiles found.</Text> : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function SheetAction({ label, onPress, destructive }: { label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.sheetAction}>
      <Text style={[styles.sheetActionText, destructive ? { color: '#D63939' } : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverSection: { height: 200, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  headerRow: { position: 'absolute', top: 52, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  profileCard: { marginTop: -32, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 18, paddingBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, marginTop: -34, borderWidth: 3, borderColor: '#fff' },
  nameRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 28, fontWeight: '700', flex: 1, marginRight: 6 },
  reviewTrigger: { fontSize: 18, fontWeight: '500' },
  statsRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statText: { fontSize: 14, fontWeight: '500' },
  dot: { fontSize: 14 },
  bio: { marginTop: 12, lineHeight: 21, fontSize: 14 },
  tagWrap: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12 },
  tabRow: { marginTop: 18, flexDirection: 'row', borderBottomWidth: 1 },
  tabButton: { flex: 1, alignItems: 'center', paddingBottom: 10 },
  tabText: { fontSize: 26, fontWeight: '500' },
  tabIndicator: { marginTop: 8, height: 2, width: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  card: { width: '48.5%', borderRadius: 12, padding: 10, marginBottom: 12, minHeight: 180 },
  menuDot: { position: 'absolute', zIndex: 1, top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#DBDBDB', alignItems: 'center', justifyContent: 'center' },
  cardImage: { width: '100%', height: 104, borderRadius: 10, backgroundColor: '#ECECF1' },
  cardPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardTitle: { marginTop: 10, fontSize: 16, fontWeight: '500' },
  cardSub: { marginTop: 3, fontSize: 14 },
  emptyText: { width: '100%', textAlign: 'center', marginVertical: 20, fontSize: 14 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 26 },
  sheetHandle: { width: 70, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: '#CFCFD6', marginTop: 12, marginBottom: 10 },
  sheetAction: { paddingHorizontal: 26, paddingVertical: 20, borderBottomColor: '#EFEFF4', borderBottomWidth: StyleSheet.hairlineWidth },
  sheetActionText: { fontSize: 30, color: '#1E2031', fontWeight: '500' },
  centerModalWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 18 },
  paymentPrompt: { borderRadius: 18, width: '100%', maxWidth: 410, overflow: 'hidden' },
  closeBtn: { alignSelf: 'flex-end', padding: 12 },
  paymentCopy: { fontSize: 31, lineHeight: 40, paddingHorizontal: 24, paddingBottom: 20 },
  promptButtons: { flexDirection: 'row', borderTopWidth: 1 },
  promptBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  promptBtnText: { fontSize: 28 },
  successCard: { borderRadius: 18, width: '100%', maxWidth: 410, paddingBottom: 24 },
  successTitle: { textAlign: 'center', fontSize: 30, fontWeight: '600', marginTop: 4 },
  successBody: { textAlign: 'center', fontSize: 27, lineHeight: 35, marginTop: 16, paddingHorizontal: 30 },
  fullModal: { flex: 1 },
  modalHeader: { paddingTop: 54, paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 22, fontWeight: '600' },
  reviewRow: { flexDirection: 'row', paddingVertical: 14, gap: 12, borderBottomWidth: 1 },
  reviewAvatar: { width: 42, height: 42, borderRadius: 21 },
  reviewName: { fontSize: 16, fontWeight: '600' },
  reviewMeta: { marginTop: 2, fontSize: 12 },
  reviewComment: { marginTop: 8, fontSize: 15, lineHeight: 22 },
  headerPill: { height: 5, width: 96, borderRadius: 3, backgroundColor: '#CACAD0' },
  searchWrap: { marginHorizontal: 18, marginBottom: 14, height: 46, borderRadius: 24, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F3' },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 14 },
  followTabs: { flexDirection: 'row', marginHorizontal: 18, borderBottomWidth: 1 },
  followTabBtn: { flex: 1, alignItems: 'center', paddingBottom: 10 },
  followTabText: { fontSize: 28, fontWeight: '500' },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  personAvatar: { width: 48, height: 48, borderRadius: 24 },
  personName: { fontSize: 16, fontWeight: '600' },
  personSub: { marginTop: 2, fontSize: 13 },
  removeBtn: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 },
  removeBtnText: { fontSize: 14, fontWeight: '500' },
});
