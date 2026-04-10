import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';
import { ShopGrid } from '@/components/shop/ShopGrid';
import { ShopHeader } from '@/components/shop/ShopHeader';
import type { GridItem, TabType } from '@/components/shop/types';
import { fetchShopData, toAbsoluteImage, toCountLabel } from '@/components/shop/utils';

export default function MyShopScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const activeRole = toProfileType(role);
  const isDark = useColorScheme() === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('designs');
  const [shop, setShop] = useState<any>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [menuTarget, setMenuTarget] = useState<GridItem | null>(null);

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
      const data = await fetchShopData(activeRole);
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
            onEdit={() => router.push('/edit-profile')}
            onOpenReviews={() => router.push({ pathname: '/shop-reviews', params: { profileId: String(shop.profile.profileId) } })}
            onOpenFollowers={() => router.push({ pathname: '/shop-follows', params: { profileId: String(shop.profile.profileId), tab: 'followers' } })}
            onOpenFollowing={() => router.push({ pathname: '/shop-follows', params: { profileId: String(shop.profile.profileId), tab: 'following' } })}
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
              emptyMessage={activeTab === 'designs' ? 'No designs uploaded yet.' : 'No collections yet.'}
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={Boolean(menuTarget)} transparent animationType="slide" onRequestClose={() => setMenuTarget(null)}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setMenuTarget(null)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}> 
            <View style={styles.sheetHandle} />
            <SheetAction label="Update Design" onPress={() => handleMenuAction('update')} />
            <SheetAction label="Delete Design" onPress={() => handleMenuAction('delete')} />
            <SheetAction label="View insights" onPress={() => handleMenuAction('insights')} />
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
});
