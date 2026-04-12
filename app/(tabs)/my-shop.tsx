import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import ApiService from '@/services/apiClient';
import { upsertLocalConversation } from '@/lib/localConversations';
import { toProfileType, useAuthStore } from '@/store/authStore';
import { ShopGrid } from '@/components/shop/ShopGrid';
import { ShopHeader } from '@/components/shop/ShopHeader';
import type { GridItem, TabType } from '@/components/shop/types';
import { fetchShopData, toAbsoluteImage, toCountLabel } from '@/components/shop/utils';

export default function MyShopScreen() {
  const router = useRouter();
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const role = useAuthStore((state) => state.role);
  const activeRole = toProfileType(role);
  const readOnly = Boolean(profileId);
  const isDark = useColorScheme() === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('designs');
  const [shop, setShop] = useState<any>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [menuTarget, setMenuTarget] = useState<GridItem | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

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
      const data = await fetchShopData(activeRole, profileId ? Number(profileId) : undefined);
      setShop(data);
      if (data.shouldPromptPayment && (activeRole === 'DESIGNER' || activeRole === 'PRINTER')) {
        setShowPaymentPrompt(true);
      }
    } catch (error: any) {
      Alert.alert('Unable to load shop', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeRole, profileId, refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadShop();
    }, [loadShop]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShop();
  }, [loadShop]);

  const designItems: GridItem[] = useMemo(
    () =>
      (shop?.designs || []).map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled design',
        subtitle: toCountLabel(item.mocks?.length || 0, 'variant'),
        imagePath: toAbsoluteImage(item.imagePath || item.mocks?.[0]?.imagePath),
        type: 'design',
      })),
    [shop?.designs],
  );

  const collectionItems: GridItem[] = useMemo(
    () =>
      (shop?.collections || []).map((item: any) => ({
        id: item.id,
        title: item.name,
        subtitle: toCountLabel(item.designCount, 'design'),
        imagePath: item.imagePath,
        type: 'collection',
      })),
    [shop?.collections],
  );

  const handleMenuAction = async (action: 'update' | 'delete' | 'insights' | 'share') => {
    if (!menuTarget) return;

    if (action === 'update') {
      setMenuTarget(null);
      if (menuTarget.type === 'collection') {
        router.push({ pathname: '/create-collection', params: { collectionId: String(menuTarget.id), name: menuTarget.title } });
      } else {
        router.push({ pathname: '/upload-design', params: { designId: String(menuTarget.id) } });
      }
      return;
    }

    if (action === 'insights') {
      setMenuTarget(null);
      const insight = await ApiService.getDesignInsights(menuTarget.id);
      const body = insight?.responseBody || insight || {};
      Alert.alert(
        'Post Insight',
        `Account reached: ${body?.accountReached || body?.reach || 0}\nPost clicks: ${body?.postClicks || body?.clicks || 0}\nSales: ${body?.sales || body?.noOfSales || 0}`,
      );
      return;
    }

    if (action === 'share') {
      setMenuTarget(null);
      await Share.share({ message: `Check out ${shop?.profile?.username || 'designer'}'s shop on Berrystamp.` });
      return;
    }

    if (action === 'delete' && menuTarget.type === 'design') {
      try {
        await ApiService.deleteCustomDesign(menuTarget.id);
        setShop((prev: any) => ({ ...prev, designs: (prev?.designs || []).filter((d: any) => String(d.id) !== String(menuTarget.id)) }));
      } catch (error: any) {
        Alert.alert('Delete failed', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
      } finally {
        setMenuTarget(null);
      }
    }

    if (action === 'delete' && menuTarget.type === 'collection') {
      try {
        await ApiService.deleteCollection(menuTarget.id);
        setShop((prev: any) => ({ ...prev, collections: (prev?.collections || []).filter((d: any) => String(d.id) !== String(menuTarget.id)) }));
      } catch (error: any) {
        Alert.alert('Delete failed', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
      } finally {
        setMenuTarget(null);
      }
    }
  };

  const handleFollowToggle = async () => {
    if (!readOnly || !shop?.profile?.profileId || followLoading) return;

    try {
      setFollowLoading(true);
      if (shop.profile.isFollowing) {
        await ApiService.unfollowProfile(shop.profile.profileId);
      } else {
        await ApiService.followProfile(shop.profile.profileId);
      }

      setShop((prev: any) => ({
        ...prev,
        profile: {
          ...prev.profile,
          isFollowing: !prev.profile.isFollowing,
          followers: Math.max(0, Number(prev.profile.followers || 0) + (prev.profile.isFollowing ? -1 : 1)),
        },
      }));
    } catch (error: any) {
      Alert.alert(
        shop?.profile?.isFollowing ? 'Unable to unfollow' : 'Unable to follow',
        error?.response?.data?.responseMessage || error?.message || 'Please try again.',
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageArtist = async () => {
    if (!readOnly || !shop?.profile?.profileId) return;

    const conversationId = await upsertLocalConversation({
      participantId: shop.profile.profileId,
      name: shop.profile.fullName,
      role: 'Designer',
      initialMessages: [
        {
          id: `msg-${Date.now()}`,
          type: 'text',
          text: `Hi ${shop.profile.fullName}, I would like to ask about your designs and collections.`,
          author: 'me',
          createdAt: new Date().toISOString(),
          status: 'sent',
        },
      ],
    });

    router.push({
      pathname: '/chat',
      params: {
        localConversationId: conversationId,
        participantId: String(shop.profile.profileId),
        participantName: shop.profile.fullName,
        participantRole: 'Designer',
      },
    });
  };

  if (loading && !shop) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false}>
        <View style={{ borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' }}>
          <ShopHeader
            profile={shop.profile}
            textColor={theme.text}
            mutedColor={theme.muted}
            primaryColor={theme.primary}
            borderColor={theme.border}
            onBack={() => router.back()}
            onEdit={() => (readOnly ? router.back() : router.push('/edit-profile'))}
            onMessage={handleMessageArtist}
            onFollow={handleFollowToggle}
            onOpenReviews={() => router.push({ pathname: '/shop-reviews', params: { profileId: String(shop.profile.profileId) } })}
            onOpenFollowers={() => router.push({ pathname: '/shop-follows', params: { profileId: String(shop.profile.profileId), tab: 'followers' } })}
            onOpenFollowing={() => router.push({ pathname: '/shop-follows', params: { profileId: String(shop.profile.profileId), tab: 'following' } })}
            readOnly={readOnly}
            followLoading={followLoading}
          />

          <View style={[styles.bodyCard, { backgroundColor: theme.surface }]}> 
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

            <ShopGrid
              items={activeTab === 'designs' ? designItems : collectionItems}
              bg={theme.background}
              text={theme.text}
              muted={theme.muted}
              onMenu={(item) => setMenuTarget(item)}
              showMenu={!readOnly}
              onItemPress={(item) => {
                if (item.type === 'design') {
                  router.push({ pathname: '/product-details', params: { designId: String(item.id) } });
                  return;
                }
                router.push({ pathname: '/products', params: { searchField: item.title } });
              }}
              emptyMessage={activeTab === 'designs' ? 'No designs uploaded yet.' : 'No collections yet.'}
            />
          </View>
        </View>
      </ScrollView>

      {!readOnly ? (
        <View style={[styles.actionRow, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: theme.primary }]} onPress={() => router.push('/create-collection')}>
            <Text style={{ color: theme.primary, fontWeight: '700' }}>Create Collection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/upload-design')}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Upload Design</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal visible={Boolean(menuTarget)} transparent animationType="slide" onRequestClose={() => setMenuTarget(null)}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setMenuTarget(null)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}> 
            <View style={styles.sheetHandle} />
            <SheetAction label={menuTarget?.type === 'collection' ? 'Update Collection' : 'Update Design'} onPress={() => handleMenuAction('update')} />
            <SheetAction label={menuTarget?.type === 'collection' ? 'Delete Collection' : 'Delete Design'} onPress={() => handleMenuAction('delete')} />
            {menuTarget?.type === 'design' ? <SheetAction label="View insights" onPress={() => handleMenuAction('insights')} /> : null}
            <SheetAction label="Share collection" onPress={() => handleMenuAction('share')} />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showPaymentPrompt} transparent animationType="fade" onRequestClose={() => setShowPaymentPrompt(false)}>
        <View style={styles.centerModalWrap}>
          <View style={[styles.paymentCard, { backgroundColor: theme.surface }]}> 
            <Text style={[styles.modalText, { color: theme.text }]}>Add your payment details to make your shop visible to customers.</Text>
            <View style={[styles.promptButtons, { borderTopColor: theme.border }]}> 
              <TouchableOpacity style={styles.promptBtn} onPress={() => setShowPaymentPrompt(false)}>
                <Text style={{ color: theme.muted }}>Do it later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptBtn, { borderLeftColor: theme.border, borderLeftWidth: StyleSheet.hairlineWidth }]}
                onPress={() => {
                  setShowPaymentPrompt(false);
                  router.push('/payment-details');
                  setShowPaymentSuccess(true);
                }}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>Add now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPaymentSuccess} transparent animationType="fade" onRequestClose={() => setShowPaymentSuccess(false)}>
        <View style={styles.centerModalWrap}>
          <View style={[styles.paymentCard, { backgroundColor: theme.surface }]}> 
            <Text style={[styles.modalTitle, { color: theme.text }]}>Payment updated successfully</Text>
            <Text style={[styles.modalText, { color: theme.text }]}>Your designs will now be visible to customers.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SheetAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.sheetAction}>
      <Text style={styles.sheetActionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bodyCard: { marginTop: 16, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 16, paddingBottom: 20 },
  tabRow: { marginTop: 8, flexDirection: 'row', borderBottomWidth: 1 },
  tabButton: { flex: 1, alignItems: 'center', paddingBottom: 10 },
  tabText: { fontSize: 18, fontWeight: '500' },
  tabIndicator: { marginTop: 8, height: 2, width: '100%' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 },
  sheetHandle: { width: 70, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: '#CFCFD6', marginTop: 12, marginBottom: 10 },
  sheetAction: { paddingHorizontal: 26, paddingVertical: 18, borderBottomColor: '#EFEFF4', borderBottomWidth: StyleSheet.hairlineWidth },
  sheetActionText: { fontSize: 17, color: '#1E2031', fontWeight: '500' },
  centerModalWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 18 },
  paymentCard: { width: '100%', maxWidth: 410, borderRadius: 18, overflow: 'hidden', paddingTop: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  modalText: { fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 20, paddingBottom: 18 },
  promptButtons: { flexDirection: 'row', borderTopWidth: 1 },
  promptBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  actionRow: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  secondaryBtn: { flex: 1, marginRight: 8, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  primaryBtn: { flex: 1, marginLeft: 8, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
});
