import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

import type { CollectionItem, TabType } from '@/components/shop/types';
import { fetchShopData, toAbsoluteImage, toCountLabel } from '@/components/shop/utils';
import { formatNaira } from '@/lib/currency';
import { upsertLocalConversation } from '@/lib/localConversations';
import ApiService from '@/services/apiClient';
import { toProfileType, useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#4732A1';
const SPECIALIZATIONS = [
  'Geometry art', 'Abstract art', 'Line art', 'Illustration',
  'Contemporary art', 'Minimal art', 'Creative art', 'Animation',
  'Animal art', 'Potrait art', 'Fractal art', 'Fantasy art',
];
const DESIGN_CATEGORIES = [
  'Minimalist', 'Abstract', 'Conceptual', 'Fun & Playful',
  'Nature', 'Typography', 'Feminine', 'Masculine', 'Kiddies',
];
const SOCIAL_APPS = [
  { name: 'WhatsApp Status', icon: 'logo-whatsapp' as const, color: '#25D366' },
  { name: 'WhatsApp', icon: 'logo-whatsapp' as const, color: '#25D366' },
  { name: 'Snapchat', icon: 'logo-snapchat' as const, color: '#FFFC00' },
  { name: 'TikTok', icon: 'musical-notes' as const, color: '#010101' },
  { name: 'Instagram', icon: 'logo-instagram' as const, color: '#E1306C' },
  { name: 'Facebook', icon: 'logo-facebook' as const, color: '#1877F2' },
  { name: 'Messenger', icon: 'chatbubble-ellipses' as const, color: '#0084FF' },
];

// ─── Theme helper ─────────────────────────────────────────────────────────────
function useTheme(isDark: boolean) {
  return {
    background: isDark ? '#111113' : '#F6F6F8',
    surface: isDark ? '#1A1A1E' : '#FFFFFF',
    text: isDark ? '#F3F3F5' : '#282433',
    muted: isDark ? '#A9A9B1' : '#7A7687',
    border: isDark ? '#2B2B31' : '#E9E6F3',
    primary: PRIMARY,
    red: '#E53935',
    inputBg: isDark ? '#232328' : '#F3F3F7',
  };
}

// ─── Sheet handle ─────────────────────────────────────────────────────────────
function SheetHandle() {
  return <View style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: '#CFCFD6', alignSelf: 'center', marginTop: 12, marginBottom: 8 }} />;
}

// ─── Sheet row action ─────────────────────────────────────────────────────────
function SheetRow({ label, icon, color, onPress }: { label: string; icon?: any; color?: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EFEFF4' }}>
      {icon ? <Ionicons name={icon} size={20} color={color || '#444'} style={{ marginRight: 14 }} /> : null}
      <Text style={{ fontSize: 16, fontWeight: '500', color: color || '#1E2031' }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── DesignCard ───────────────────────────────────────────────────────────────
function DesignCard({ item, theme, username, onMenu, onPress }: { item: any; theme: ReturnType<typeof useTheme>; username: string; onMenu: () => void; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={{ width: '48.5%', borderRadius: 12, marginBottom: 12, backgroundColor: theme.surface, overflow: 'hidden' }}>
      <View style={{ position: 'relative' }}>
        {item.imagePath ? (
          <Image source={{ uri: item.imagePath }} style={{ width: '100%', height: 120, backgroundColor: theme.inputBg }} resizeMode="cover" />
        ) : (
          <View style={{ width: '100%', height: 120, backgroundColor: theme.inputBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="image-outline" size={28} color={theme.muted} />
          </View>
        )}
        <TouchableOpacity onPress={onMenu} style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#444" />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }} numberOfLines={1}>{item.title || 'Untitled'}</Text>
        <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }} numberOfLines={1}>By {username}</Text>
        {item.price ? <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary, marginTop: 4 }}>{formatNaira(item.price)}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── CollectionCard ───────────────────────────────────────────────────────────
function CollectionCard({ item, theme, onMenu, onPress }: { item: CollectionItem; theme: ReturnType<typeof useTheme>; onMenu: () => void; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={{ width: '48.5%', borderRadius: 12, marginBottom: 12, backgroundColor: theme.surface, overflow: 'hidden' }}>
      <View style={{ position: 'relative' }}>
        {item.imagePath ? (
          <Image source={{ uri: item.imagePath }} style={{ width: '100%', height: 120, backgroundColor: theme.inputBg }} resizeMode="cover" />
        ) : (
          <View style={{ width: '100%', height: 120, backgroundColor: theme.inputBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="albums-outline" size={28} color={theme.muted} />
          </View>
        )}
        <TouchableOpacity onPress={onMenu} style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#444" />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }} numberOfLines={1}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{toCountLabel(item.designCount, 'design')}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── QuickActionsSheet ────────────────────────────────────────────────────────
function QuickActionsSheet({ visible, theme, onClose, onCreateCollection, onUploadDesign }: { visible: boolean; theme: ReturnType<typeof useTheme>; onClose: () => void; onCreateCollection: () => void; onUploadDesign: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={S.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[S.sheet, { backgroundColor: theme.surface }]}>
          <SheetHandle />
          <Text style={[S.sheetTitle, { color: theme.text }]}>Quick Actions</Text>
          <SheetRow label="Create Collection" icon="albums-outline" onPress={() => { onClose(); onCreateCollection(); }} />
          <SheetRow label="Upload Design" icon="cloud-upload-outline" onPress={() => { onClose(); onUploadDesign(); }} />
          <View style={{ height: 16 }} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── DesignMenuSheet ──────────────────────────────────────────────────────────
function DesignMenuSheet({ visible, theme, onClose, onUpdate, onAddToCollection, onInsights, onShare, onDelete }: {
  visible: boolean; theme: ReturnType<typeof useTheme>; onClose: () => void;
  onUpdate: () => void; onAddToCollection: () => void; onInsights: () => void; onShare: () => void; onDelete: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={S.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[S.sheet, { backgroundColor: theme.surface }]}>
          <SheetHandle />
          <SheetRow label="Update Design" icon="create-outline" onPress={() => { onClose(); onUpdate(); }} />
          <SheetRow label="Add to collection" icon="add-circle-outline" onPress={() => { onClose(); onAddToCollection(); }} />
          <SheetRow label="View post insights" icon="bar-chart-outline" onPress={() => { onClose(); onInsights(); }} />
          <SheetRow label="Share design" icon="share-social-outline" onPress={() => { onClose(); onShare(); }} />
          <SheetRow label="Delete Design" icon="trash-outline" color={theme.red} onPress={() => { onClose(); onDelete(); }} />
          <View style={{ height: 16 }} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── CollectionMenuSheet ──────────────────────────────────────────────────────
function CollectionMenuSheet({ visible, theme, onClose, onUpdate, onShare, onDelete }: {
  visible: boolean; theme: ReturnType<typeof useTheme>; onClose: () => void;
  onUpdate: () => void; onShare: () => void; onDelete: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={S.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[S.sheet, { backgroundColor: theme.surface }]}>
          <SheetHandle />
          <SheetRow label="Update Collection" icon="create-outline" onPress={() => { onClose(); onUpdate(); }} />
          <SheetRow label="Share collection" icon="share-social-outline" onPress={() => { onClose(); onShare(); }} />
          <SheetRow label="Delete Collection" icon="trash-outline" color={theme.red} onPress={() => { onClose(); onDelete(); }} />
          <View style={{ height: 16 }} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── DeleteConfirmModal ───────────────────────────────────────────────────────
function DeleteConfirmModal({ visible, theme, isDesign, loading, onClose, onConfirm }: {
  visible: boolean; theme: ReturnType<typeof useTheme>; isDesign: boolean; loading: boolean; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={S.centerOverlay}>
        <View style={[S.centerCard, { backgroundColor: theme.surface }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Delete</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={theme.muted} /></TouchableOpacity>
          </View>
          <Text style={{ fontSize: 14, color: theme.muted, lineHeight: 20, marginBottom: 24 }}>
            {isDesign
              ? 'Are you sure you want to delete this design? The design will no longer be found in your shop.'
              : 'Are you sure you want to delete this collection? All designs inside will be unlinked.'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={onClose} style={[S.outlineBtn, { flex: 1, borderColor: theme.border }]}>
              <Text style={{ color: theme.text, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} disabled={loading} style={[S.filledBtn, { flex: 1, backgroundColor: theme.red }]}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── PaymentPromptModal ───────────────────────────────────────────────────────
function PaymentPromptModal({ visible, theme, onClose, onAddNow }: { visible: boolean; theme: ReturnType<typeof useTheme>; onClose: () => void; onAddNow: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={S.centerOverlay}>
        <View style={[S.centerCard, { backgroundColor: theme.surface }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Payment</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={theme.muted} /></TouchableOpacity>
          </View>
          <Text style={{ fontSize: 14, color: theme.muted, lineHeight: 20, marginBottom: 24 }}>
            Add your payment details in order to get your shop visible to prospect customers.
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={onClose} style={[S.outlineBtn, { flex: 1, borderColor: theme.border }]}>
              <Text style={{ color: theme.muted, fontWeight: '600' }}>Do it later</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAddNow} style={[S.filledBtn, { flex: 1, backgroundColor: theme.primary }]}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Add Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── PostInsightSheet ─────────────────────────────────────────────────────────
function PostInsightSheet({ visible, theme, insight, loading, onClose }: { visible: boolean; theme: ReturnType<typeof useTheme>; insight: any; loading: boolean; onClose: () => void }) {
  const body = insight?.responseBody || insight || {};
  const accountReached = body?.accountReached ?? body?.reach ?? 0;
  const postClicks = body?.postClicks ?? body?.clicks ?? 0;
  const noOfSales = body?.sales ?? body?.noOfSales ?? 0;
  const totalImpressions = body?.totalImpressions ?? body?.impressions ?? 0;
  const followersPct = body?.followersReachedPercentage ?? body?.followersPercentage ?? 0;
  const nonFollowersPct = body?.nonFollowersReachedPercentage ?? body?.nonFollowersPercentage ?? 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={S.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[S.sheet, { backgroundColor: theme.surface }]}>
          <SheetHandle />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Post Insight</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={theme.muted} /></TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 32 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Interaction & Analytics</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                  {[
                    { label: 'Account reached', value: accountReached },
                    { label: 'Post clicks', value: postClicks },
                    { label: 'No of Sales', value: noOfSales },
                  ].map((stat) => (
                    <View key={stat.label} style={{ flex: 1, alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, marginHorizontal: 4 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text }}>{stat.value}</Text>
                      <Text style={{ fontSize: 11, color: theme.muted, textAlign: 'center', marginTop: 4 }}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Impression & Discovery</Text>
                <View style={{ backgroundColor: theme.inputBg, borderRadius: 10, padding: 14, gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.text, fontSize: 14 }}>Total impressions</Text>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>{totalImpressions}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.text, fontSize: 14 }}>Followers account reached</Text>
                    <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>{followersPct}%</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.text, fontSize: 14 }}>Non-followers account reached</Text>
                    <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>{nonFollowersPct}%</Text>
                  </View>
                </View>
              </View>
              <View style={{ height: 32 }} />
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── ShareSheet ───────────────────────────────────────────────────────────────
function ShareSheet({ visible, theme, title, onClose, conversations }: { visible: boolean; theme: ReturnType<typeof useTheme>; title: string; onClose: () => void; conversations: any[] }) {
  const handleShare = async (platform?: string) => {
    onClose();
    await Share.share({ message: title });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={S.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[S.sheet, { backgroundColor: theme.surface }]}>
          <SheetHandle />
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 }}>Send to</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {conversations.slice(0, 8).map((c: any, i: number) => (
                <TouchableOpacity key={i} onPress={() => handleShare()} style={{ alignItems: 'center', marginRight: 16 }}>
                  {c.avatar ? (
                    <Image source={{ uri: c.avatar }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.inputBg }} />
                  ) : (
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.inputBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="person" size={22} color={theme.muted} />
                    </View>
                  )}
                  <Text style={{ fontSize: 11, color: theme.muted, marginTop: 4, maxWidth: 52 }} numberOfLines={1}>{c.name || 'User'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border, marginHorizontal: 20, marginBottom: 12 }} />
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 }}>Share to</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SOCIAL_APPS.map((app) => (
                <TouchableOpacity key={app.name} onPress={() => handleShare(app.name)} style={{ alignItems: 'center', marginRight: 20 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: app.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={app.icon} size={24} color={app.color} />
                  </View>
                  <Text style={{ fontSize: 11, color: theme.muted, marginTop: 4, maxWidth: 60, textAlign: 'center' }} numberOfLines={2}>{app.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ height: 24 }} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── AddToCollectionSheet ─────────────────────────────────────────────────────
function AddToCollectionSheet({ visible, theme, designId, onClose }: { visible: boolean; theme: ReturnType<typeof useTheme>; designId: string | number | null; onClose: () => void }) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(false);

  React.useEffect(() => {
    if (!visible) { setSelected(null); setToast(false); return; }
    setLoading(true);
    ApiService.getMyCollections(0, 50)
      .then((res) => {
        const body = res?.responseBody || res || {};
        const list = Array.isArray(body) ? body : Array.isArray(body?.content) ? body.content : [];
        setCollections(list.map((item: any) => ({
          id: item?.id,
          name: item?.name || item?.title || 'Untitled',
          imagePath: toAbsoluteImage(item?.imagePath || item?.coverPath),
          designCount: Number(item?.designCount || 0),
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible]);

  const handleAdd = async () => {
    if (!selected || !designId) return;
    setAdding(true);
    try {
      await ApiService.addDesignToCollection({ designId, collectionId: selected });
      setToast(true);
      setTimeout(() => { setToast(false); onClose(); }, 2000);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.responseMessage || e?.message || 'Failed to add to collection');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={S.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[S.sheet, { backgroundColor: theme.surface, maxHeight: '80%' }]}>
          <SheetHandle />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Add to collection</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={theme.muted} /></TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, color: theme.muted, paddingHorizontal: 20, marginBottom: 16 }}>Select preferred collection to keep your design</Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 32 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {collections.map((col) => (
                  <TouchableOpacity key={String(col.id)} onPress={() => setSelected(col.id)} style={{ width: '48%', borderRadius: 10, marginBottom: 12, borderWidth: 2, borderColor: selected === col.id ? theme.primary : 'transparent', overflow: 'hidden', backgroundColor: theme.inputBg }}>
                    {col.imagePath ? (
                      <Image source={{ uri: col.imagePath }} style={{ width: '100%', height: 90 }} resizeMode="cover" />
                    ) : (
                      <View style={{ width: '100%', height: 90, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="albums-outline" size={28} color={theme.muted} />
                      </View>
                    )}
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }} numberOfLines={1}>{col.name}</Text>
                      <Text style={{ fontSize: 11, color: theme.muted }}>{toCountLabel(col.designCount, 'design')}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 16 }} />
            </ScrollView>
          )}
          <View style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}>
            <TouchableOpacity onPress={handleAdd} disabled={!selected || adding} style={[S.filledBtn, { backgroundColor: selected ? theme.primary : theme.muted }]}>
              {adding ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Add to collection</Text>}
            </TouchableOpacity>
          </View>
          {toast ? (
            <View style={{ position: 'absolute', bottom: 90, left: 20, right: 20, backgroundColor: '#1B8A4E', borderRadius: 10, flexDirection: 'row', alignItems: 'center', padding: 14 }}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontWeight: '600' }}>Design added to collection successfully!</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── EditProfileSheet ─────────────────────────────────────────────────────────
function EditProfileSheet({ visible, theme, profile, onClose, onSaved }: { visible: boolean; theme: ReturnType<typeof useTheme>; profile: any; onClose: () => void; onSaved: () => void }) {
  const [shopName, setShopName] = useState('');
  const [bio, setBio] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  React.useEffect(() => {
    if (visible && profile) {
      setShopName(profile.username || '');
      setBio(profile.bio || '');
      setSelectedSpecs(Array.isArray(profile.categories) ? profile.categories : []);
      setCoverUri(null);
      setAvatarUri(null);
    }
  }, [visible, profile]);

  const pickImage = async (type: 'cover' | 'avatar') => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      if (type === 'cover') setCoverUri(result.assets[0].uri);
      else setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) => prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let coverPath = profile?.cover || '';
      let avatarPath = profile?.avatar || '';
      if (coverUri) {
        const uploaded = await ApiService.uploadSingleFile(coverUri);
        coverPath = uploaded?.path || uploaded?.url || uploaded?.originalFilePath || coverUri;
      }
      if (avatarUri) {
        const uploaded = await ApiService.uploadSingleFile(avatarUri);
        avatarPath = uploaded?.path || uploaded?.url || uploaded?.originalFilePath || avatarUri;
      }
      await ApiService.updateMyProfile({
        username: shopName.trim(),
        bio: bio.trim(),
        categories: selectedSpecs,
        ...(coverPath ? { coverPic: coverPath } : {}),
        ...(avatarPath ? { profilePic: avatarPath } : {}),
      });
      onSaved();
      onClose();
    } catch (e: any) {
      Alert.alert('Save failed', e?.response?.data?.responseMessage || e?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[S.backdrop, { justifyContent: 'flex-end' }]}>
        <View style={[S.sheet, { backgroundColor: theme.surface, maxHeight: '92%' }]}>
          <SheetHandle />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={theme.primary} /> : <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 15 }}>Save</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
            {/* Cover picker */}
            <TouchableOpacity onPress={() => pickImage('cover')} style={{ height: 120, borderRadius: 12, backgroundColor: theme.inputBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' }}>
              {coverUri || profile?.cover ? (
                <Image source={{ uri: coverUri || profile?.cover }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : null}
              <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: 8 }}>
                <Ionicons name="camera" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
            {/* Avatar picker */}
            <TouchableOpacity onPress={() => pickImage('avatar')} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.inputBg, alignItems: 'center', justifyContent: 'center', marginBottom: 20, alignSelf: 'flex-start', overflow: 'hidden' }}>
              {avatarUri || profile?.avatar ? (
                <Image source={{ uri: avatarUri || profile?.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : null}
              <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 14, padding: 5 }}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            {/* Shop name */}
            <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>Shop name</Text>
            <TextInput
              value={shopName}
              onChangeText={setShopName}
              placeholder="Enter shop name"
              placeholderTextColor={theme.muted}
              style={{ backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, color: theme.text, fontSize: 15, marginBottom: 16 }}
            />
            {/* Bio */}
            <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about your shop..."
              placeholderTextColor={theme.muted}
              multiline
              numberOfLines={4}
              style={{ backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, color: theme.text, fontSize: 15, minHeight: 90, textAlignVertical: 'top', marginBottom: 20 }}
            />
            {/* Specializations */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 12 }}>Add Specialization</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
              {SPECIALIZATIONS.map((spec) => {
                const active = selectedSpecs.includes(spec);
                return (
                  <TouchableOpacity key={spec} onPress={() => toggleSpec(spec)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary + '18' : 'transparent' }}>
                    <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: active ? theme.primary : theme.muted, backgroundColor: active ? theme.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      {active ? <Ionicons name="checkmark" size={10} color="#fff" /> : null}
                    </View>
                    <Text style={{ fontSize: 13, color: active ? theme.primary : theme.text }}>{spec}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── UploadProductSheet ───────────────────────────────────────────────────────
function UploadProductSheet({ visible, theme, onClose, onUploaded }: { visible: boolean; theme: ReturnType<typeof useTheme>; onClose: () => void; onUploaded: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [artImages, setArtImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [mockImages, setMockImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const reset = () => { setName(''); setDescription(''); setArtImages([]); setCoverImage(null); setMockImages([]); setCategories([]); };

  React.useEffect(() => { if (!visible) reset(); }, [visible]);

  const pickImages = async (setter: (uris: string[]) => void, multiple = true) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: multiple, quality: 0.8 });
    if (!result.canceled) setter(result.assets.map((a) => a.uri));
  };

  const toggleCat = (cat: string) => setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const handleUpload = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Please enter a product name.'); return; }
    setUploading(true);
    try {
      const uploadedArt = artImages.length ? await ApiService.uploadMultipleFiles(artImages) : [];
      const uploadedCover = coverImage ? await ApiService.uploadSingleFile(coverImage) : null;
      const uploadedMocks = mockImages.length ? await ApiService.uploadMultipleFiles(mockImages) : [];
      const artUrls = (Array.isArray(uploadedArt) ? uploadedArt : []).map((f: any) => f?.path || f?.url || f?.originalFilePath || '').filter(Boolean);
      const coverUrl = uploadedCover?.path || uploadedCover?.url || uploadedCover?.originalFilePath || '';
      await ApiService.createCustomDesign({
        name: name.trim(),
        description: description.trim(),
        frontImageUrl: coverUrl || artUrls[0] || '',
        designImages: artUrls,
        categories,
        openForCustomization: false,
        amount: 0,
        mocks: uploadedMocks.map((f: any, i: number) => ({
          limitedStatus: false,
          imageUrl: f?.path || f?.url || f?.originalFilePath || '',
          availableQty: 100,
          name: `Mock ${i + 1}`,
          category: categories[0] || '',
          colours: [],
        })),
        tags: categories,
      });
      onUploaded();
      onClose();
    } catch (e: any) {
      Alert.alert('Upload failed', e?.response?.data?.responseMessage || e?.message || 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[S.backdrop, { justifyContent: 'flex-end' }]}>
        <View style={[S.sheet, { backgroundColor: theme.surface, maxHeight: '94%' }]}>
          <SheetHandle />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Upload New Product</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={theme.muted} /></TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, color: theme.muted, paddingHorizontal: 20, marginBottom: 16 }}>Your design will be watermarked with the Berrystamp logo.</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>Product name *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Enter product name" placeholderTextColor={theme.muted} style={{ backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, color: theme.text, fontSize: 15, marginBottom: 14 }} />
            <Text style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>Product description *</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="Describe your product" placeholderTextColor={theme.muted} multiline numberOfLines={3} style={{ backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, color: theme.text, fontSize: 15, minHeight: 80, textAlignVertical: 'top', marginBottom: 14 }} />
            {/* Upload rows */}
            {[
              { label: 'Art Images', images: artImages, onUpload: () => pickImages(setArtImages) },
              { label: 'Cover Image', images: coverImage ? [coverImage] : [], onUpload: () => pickImages((uris) => setCoverImage(uris[0] || null), false) },
              { label: 'Mock Images', images: mockImages, onUpload: () => pickImages(setMockImages) },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <Ionicons name="image-outline" size={20} color={theme.muted} style={{ marginRight: 10 }} />
                <Text style={{ flex: 1, color: theme.text, fontSize: 14 }}>{row.label}{row.images.length > 0 ? ` (${row.images.length})` : ''}</Text>
                <TouchableOpacity onPress={row.onUpload} style={{ backgroundColor: theme.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Upload</Text>
                </TouchableOpacity>
              </View>
            ))}
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginTop: 8, marginBottom: 12 }}>Design Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {DESIGN_CATEGORIES.map((cat) => {
                const active = categories.includes(cat);
                return (
                  <TouchableOpacity key={cat} onPress={() => toggleCat(cat)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary + '18' : 'transparent' }}>
                    <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: active ? theme.primary : theme.muted, backgroundColor: active ? theme.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      {active ? <Ionicons name="checkmark" size={10} color="#fff" /> : null}
                    </View>
                    <Text style={{ fontSize: 13, color: active ? theme.primary : theme.text }}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
              <TouchableOpacity onPress={onClose} style={[S.outlineBtn, { flex: 1, borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>Cancel Upload</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpload} disabled={uploading} style={[S.filledBtn, { flex: 1, backgroundColor: theme.primary }]}>
                {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Upload Product</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── NewCollectionSheet ───────────────────────────────────────────────────────
function NewCollectionSheet({ visible, theme, onClose, onCreated }: { visible: boolean; theme: ReturnType<typeof useTheme>; onClose: () => void; onCreated: () => void }) {
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  React.useEffect(() => { if (!visible) { setColName(''); setColDesc(''); setCoverUri(null); } }, [visible]);

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) setCoverUri(result.assets[0].uri);
  };

  const handleCreate = async () => {
    if (!colName.trim()) { Alert.alert('Required', 'Please enter a collection name.'); return; }
    setCreating(true);
    try {
      let imagePath = '';
      if (coverUri) {
        const uploaded = await ApiService.uploadSingleFile(coverUri);
        imagePath = uploaded?.path || uploaded?.url || uploaded?.originalFilePath || '';
      }
      await ApiService.createCollection({ name: colName.trim(), description: colDesc.trim(), ...(imagePath ? { imagePath } : {}) });
      onCreated();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.responseMessage || e?.message || 'Failed to create collection.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[S.backdrop, { justifyContent: 'flex-end' }]}>
        <View style={[S.sheet, { backgroundColor: theme.surface, maxHeight: '85%' }]}>
          <SheetHandle />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>New Collection</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={theme.muted} /></TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, color: theme.muted, paddingHorizontal: 20, marginBottom: 16 }}>Organise your designs into a collection.</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
            <TextInput value={colName} onChangeText={setColName} placeholder="Enter collection name" placeholderTextColor={theme.muted} style={{ backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, color: theme.text, fontSize: 15, marginBottom: 14 }} />
            <TextInput value={colDesc} onChangeText={setColDesc} placeholder="Add description (optional)" placeholderTextColor={theme.muted} multiline numberOfLines={3} style={{ backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, color: theme.text, fontSize: 15, minHeight: 80, textAlignVertical: 'top', marginBottom: 14 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <Ionicons name="image-outline" size={20} color={theme.muted} style={{ marginRight: 10 }} />
              <Text style={{ flex: 1, color: theme.text, fontSize: 14 }}>Collection Cover{coverUri ? ' (1)' : ''}</Text>
              <TouchableOpacity onPress={pickCover} style={{ backgroundColor: theme.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Upload</Text>
              </TouchableOpacity>
            </View>
            {coverUri ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 10, padding: 10, marginBottom: 12 }}>
                <Image source={{ uri: coverUri }} style={{ width: 40, height: 40, borderRadius: 6, marginRight: 10 }} />
                <Text style={{ flex: 1, color: theme.text, fontSize: 13 }} numberOfLines={1}>{coverUri.split('/').pop()}</Text>
                <TouchableOpacity onPress={() => setCoverUri(null)}><Ionicons name="close-circle" size={20} color={theme.muted} /></TouchableOpacity>
              </View>
            ) : null}
            <TouchableOpacity onPress={handleCreate} disabled={creating} style={[S.filledBtn, { backgroundColor: theme.primary, marginBottom: 32 }]}>
              {creating ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Create Collection</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── FollowersScreen (modal overlay) ─────────────────────────────────────────
function FollowersScreen({ visible, theme, profileId, initialTab, onClose }: { visible: boolean; theme: ReturnType<typeof useTheme>; profileId: number; initialTab: 'followers' | 'following'; onClose: () => void }) {
  const [tab, setTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  React.useEffect(() => {
    if (!visible) return;
    setTab(initialTab);
    setLoading(true);
    Promise.all([
      ApiService.getFollowers(profileId, 0, 100).catch(() => ({ responseBody: { content: [] } })),
      ApiService.getFollowing(profileId, 0, 100).catch(() => ({ responseBody: { content: [] } })),
    ]).then(([frs, fing]) => {
      const unwrap = (r: any) => { const b = r?.responseBody || r || {}; return Array.isArray(b) ? b : Array.isArray(b?.content) ? b.content : []; };
      setFollowers(unwrap(frs));
      setFollowing(unwrap(fing));
    }).finally(() => setLoading(false));
  }, [visible, profileId, initialTab]);

  const list = (tab === 'followers' ? followers : following).filter((u: any) => {
    const name = String(u?.username || u?.fullName || u?.name || '').toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  const handleRemove = async (u: any) => {
    const id = u?.id || u?.profileId || u?.followingProfileId;
    if (!id) return;
    setRemovingId(id);
    try {
      await ApiService.unfollowProfile(id);
      if (tab === 'following') setFollowing((prev) => prev.filter((x: any) => (x?.id || x?.profileId) !== id));
      else setFollowers((prev) => prev.filter((x: any) => (x?.id || x?.profileId) !== id));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}><Ionicons name="arrow-back" size={22} color={theme.text} /></TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, flex: 1 }}>Followers & Following</Text>
        </View>
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
            <Ionicons name="search" size={18} color={theme.muted} style={{ marginRight: 8 }} />
            <TextInput value={search} onChangeText={setSearch} placeholder="Search profile" placeholderTextColor={theme.muted} style={{ flex: 1, color: theme.text, fontSize: 15 }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border, marginHorizontal: 16 }}>
          {(['followers', 'following'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ flex: 1, alignItems: 'center', paddingBottom: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: tab === t ? theme.text : theme.muted, textTransform: 'capitalize' }}>{t}</Text>
              {tab === t ? <View style={{ height: 2, width: '100%', backgroundColor: theme.primary, marginTop: 8 }} /> : null}
            </TouchableOpacity>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item, i) => String(item?.id || item?.profileId || i)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
            renderItem={({ item }) => {
              const id = item?.id || item?.profileId;
              const name = item?.username || item?.fullName || item?.name || 'User';
              const avatar = toAbsoluteImage(item?.profilePicturePath || item?.avatar || item?.profilePic);
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.inputBg, marginRight: 12 }} />
                  ) : (
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.inputBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Ionicons name="person" size={20} color={theme.muted} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{name}</Text>
                    <Text style={{ fontSize: 12, color: theme.muted }}>Designer account</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item)} disabled={removingId === id} style={{ borderWidth: 1.5, borderColor: theme.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}>
                    {removingId === id ? <ActivityIndicator size="small" color={theme.primary} /> : <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>Remove</Text>}
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.muted, marginTop: 32 }}>No {tab} found.</Text>}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── CollectionDetailScreen (modal overlay) ───────────────────────────────────
function CollectionDetailScreen({ visible, theme, collection, username, onClose, onRefresh }: { visible: boolean; theme: ReturnType<typeof useTheme>; collection: CollectionItem | null; username: string; onClose: () => void; onRefresh: () => void }) {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuDesign, setMenuDesign] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    if (!visible || !collection) return;
    setLoading(true);
    ApiService.getDesigns({ page: 0, size: 40 })
      .then((res) => {
        const body = res?.responseBody || res || {};
        const list = Array.isArray(body) ? body : Array.isArray(body?.content) ? body.content : [];
        setDesigns(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, collection]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ApiService.deleteCustomDesign(deleteTarget.id);
      setDesigns((prev) => prev.filter((d) => String(d.id) !== String(deleteTarget.id)));
      setDeleteTarget(null);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (!collection) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}><Ionicons name="arrow-back" size={22} color={theme.text} /></TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Collection</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {collection.imagePath ? (
            <Image source={{ uri: collection.imagePath }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: 200, backgroundColor: theme.inputBg, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="albums-outline" size={48} color={theme.muted} />
            </View>
          )}
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 4 }}>{collection.name}</Text>
            <Text style={{ fontSize: 14, color: theme.muted, marginBottom: 16 }}>{toCountLabel(collection.designCount, 'design')} found in this collection</Text>
            {loading ? (
              <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 32 }} />
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {designs.map((design) => (
                  <View key={String(design.id)} style={{ width: '48.5%', borderRadius: 12, marginBottom: 12, backgroundColor: theme.surface, overflow: 'hidden' }}>
                    <View style={{ position: 'relative' }}>
                      {design.imagePath || design.frontImageUrl ? (
                        <Image source={{ uri: toAbsoluteImage(design.imagePath || design.frontImageUrl) }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                      ) : (
                        <View style={{ width: '100%', height: 110, backgroundColor: theme.inputBg, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="image-outline" size={24} color={theme.muted} />
                        </View>
                      )}
                      <TouchableOpacity onPress={() => setMenuDesign(design)} style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="ellipsis-horizontal" size={16} color="#444" />
                      </TouchableOpacity>
                    </View>
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }} numberOfLines={1}>{design.title || design.name || 'Untitled'}</Text>
                      <Text style={{ fontSize: 11, color: theme.muted }}>By {username}</Text>
                    </View>
                  </View>
                ))}
                {designs.length === 0 ? <Text style={{ color: theme.muted, textAlign: 'center', width: '100%', marginTop: 24 }}>No designs in this collection.</Text> : null}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Design menu inside collection */}
        <Modal visible={Boolean(menuDesign)} transparent animationType="slide" onRequestClose={() => setMenuDesign(null)}>
          <TouchableOpacity style={S.backdrop} activeOpacity={1} onPress={() => setMenuDesign(null)}>
            <View style={[S.sheet, { backgroundColor: theme.surface }]}>
              <SheetHandle />
              <SheetRow label="Update Design" icon="create-outline" onPress={() => setMenuDesign(null)} />
              <SheetRow label="Remove from collection" icon="remove-circle-outline" onPress={() => setMenuDesign(null)} />
              <SheetRow label="View post insights" icon="bar-chart-outline" onPress={() => setMenuDesign(null)} />
              <SheetRow label="Share design" icon="share-social-outline" onPress={() => setMenuDesign(null)} />
              <SheetRow label="Delete Design" icon="trash-outline" color={theme.red} onPress={() => { setDeleteTarget(menuDesign); setMenuDesign(null); }} />
              <View style={{ height: 16 }} />
            </View>
          </TouchableOpacity>
        </Modal>

        <DeleteConfirmModal
          visible={Boolean(deleteTarget)}
          theme={theme}
          isDesign
          loading={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      </View>
    </Modal>
  );
}

// ─── Main MyShopScreen ────────────────────────────────────────────────────────
export default function MyShopScreen() {
  const router = useRouter();
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const role = useAuthStore((state) => state.role);
  const activeRole = toProfileType(role);
  const readOnly = Boolean(profileId);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useTheme(isDark);
  const insets = useSafeAreaInsets();

  // ── Data state ──
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('designs');
  const [bioExpanded, setBioExpanded] = useState(false);

  // ── Modal/sheet visibility ──
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showUploadProduct, setShowUploadProduct] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followersInitialTab, setFollowersInitialTab] = useState<'followers' | 'following'>('followers');

  // ── Design menu state ──
  const [designMenuTarget, setDesignMenuTarget] = useState<any | null>(null);
  const [collectionMenuTarget, setCollectionMenuTarget] = useState<CollectionItem | null>(null);
  const [showDesignMenu, setShowDesignMenu] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);

  // ── Action sheets ──
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [addToCollectionDesignId, setAddToCollectionDesignId] = useState<string | number | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [insightData, setInsightData] = useState<any>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; type: 'design' | 'collection' } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Collection detail ──
  const [collectionDetail, setCollectionDetail] = useState<CollectionItem | null>(null);
  const [showCollectionDetail, setShowCollectionDetail] = useState(false);

  // ── Follow ──
  const [followLoading, setFollowLoading] = useState(false);

  // ── Load ──
  const loadShop = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const data = await fetchShopData(activeRole, profileId ? Number(profileId) : undefined);
      setShop(data);
      if (data.shouldPromptPayment && !readOnly && (activeRole === 'DESIGNER' || activeRole === 'PRINTER')) {
        setShowPaymentPrompt(true);
      }
    } catch (error: any) {
      Alert.alert('Unable to load shop', error?.response?.data?.responseMessage || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeRole, profileId, readOnly]);

  useFocusEffect(useCallback(() => { loadShop(); }, [loadShop]));

  const onRefresh = useCallback(() => { setRefreshing(true); loadShop(true); }, [loadShop]);

  // ── Derived data ──
  const designItems: any[] = useMemo(() =>
    (shop?.designs || []).map((item: any) => ({
      id: item.id,
      title: item.title || item.name || 'Untitled design',
      imagePath: toAbsoluteImage(item.imagePath || item.frontImageUrl || item.mocks?.[0]?.imagePath),
      price: item.amount || item.price || 0,
      type: 'design',
    })), [shop?.designs]);

  const collectionItems: CollectionItem[] = useMemo(() =>
    (shop?.collections || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      imagePath: item.imagePath,
      designCount: item.designCount,
    })), [shop?.collections]);

  // ── Handlers ──
  const handleDesignMenu = (item: any) => { setDesignMenuTarget(item); setShowDesignMenu(true); };
  const handleCollectionMenu = (item: CollectionItem) => { setCollectionMenuTarget(item); setShowCollectionMenu(true); };

  const handleDesignInsights = async (item: any) => {
    setInsightLoading(true);
    setShowInsight(true);
    try {
      const data = await ApiService.getDesignInsights(item.id);
      setInsightData(data);
    } catch { setInsightData(null); }
    finally { setInsightLoading(false); }
  };

  const handleShare = (title: string) => { setShareTitle(title); Share.share({ message: title }); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'design') {
        await ApiService.deleteCustomDesign(deleteTarget.id);
        setShop((prev: any) => ({ ...prev, designs: (prev?.designs || []).filter((d: any) => String(d.id) !== String(deleteTarget.id)) }));
      } else {
        await ApiService.deleteCollection(deleteTarget.id);
        setShop((prev: any) => ({ ...prev, collections: (prev?.collections || []).filter((d: any) => String(d.id) !== String(deleteTarget.id)) }));
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (e: any) {
      Alert.alert('Delete failed', e?.response?.data?.responseMessage || e?.message || 'Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!readOnly || !shop?.profile?.profileId || followLoading) return;
    setFollowLoading(true);
    try {
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
    } catch (e: any) {
      Alert.alert(shop?.profile?.isFollowing ? 'Unable to unfollow' : 'Unable to follow', e?.response?.data?.responseMessage || e?.message || 'Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageArtist = async () => {
    if (!readOnly || !shop?.profile?.profileId) return;
    const conversationId = await upsertLocalConversation({
      participantId: shop.profile.profileId,
      name: shop.profile.username,
      role: 'Designer',
      initialMessages: [{
        id: `msg-${Date.now()}`,
        type: 'text',
        text: `Hi ${shop.profile.username}, I would like to ask about your designs.`,
        author: 'me',
        createdAt: new Date().toISOString(),
        status: 'sent',
      }],
    });
    router.push({ pathname: '/chat', params: { localConversationId: conversationId, participantId: String(shop.profile.profileId), participantName: shop.profile.username, participantRole: 'Designer' } });
  };

  if (loading && !shop) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const profile = shop?.profile;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: readOnly ? 20 : 100 }}
      >
        {/* ── Cover ── */}
        <View style={{ height: 180, position: 'relative' }}>
          {profile?.cover ? (
            <Image source={{ uri: profile.cover }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: '100%', backgroundColor: theme.primary + '44' }} />
          )}
          <View style={{ position: 'absolute', top: insets.top + 12, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => router.back()} style={S.iconBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Avatar row ── */}
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -36 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: theme.surface, overflow: 'hidden', backgroundColor: theme.inputBg }}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={32} color={theme.muted} />
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push({ pathname: '/shop-reviews', params: { profileId: String(profile?.profileId) } })} style={{ backgroundColor: theme.primary + '18', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 4 }}>
            <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>{toCountLabel(profile?.reviews || 0, 'review')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Profile info ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>{profile?.username || 'My Shop'}</Text>
          {/* Stars */}
          <View style={{ flexDirection: 'row', marginTop: 4, marginBottom: 8 }}>
            {[1,2,3,4,5].map((s) => <Ionicons key={s} name="star-outline" size={16} color={theme.muted} style={{ marginRight: 2 }} />)}
          </View>
          {/* Stats row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: theme.text, fontSize: 13 }}>{profile?.reviews || 0} Reviews</Text>
            <Text style={{ color: theme.muted, marginHorizontal: 6 }}>|</Text>
            <TouchableOpacity onPress={() => { setFollowersInitialTab('followers'); setShowFollowers(true); }}>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>{profile?.followers || 0} Followers</Text>
            </TouchableOpacity>
            <Text style={{ color: theme.muted, marginHorizontal: 6 }}>|</Text>
            <TouchableOpacity onPress={() => { setFollowersInitialTab('following'); setShowFollowers(true); }}>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>{profile?.following || 0} Following</Text>
            </TouchableOpacity>
          </View>
          {/* Bio */}
          {profile?.bio ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 20 }} numberOfLines={bioExpanded ? undefined : 2}>{profile.bio}</Text>
              <TouchableOpacity onPress={() => setBioExpanded((v) => !v)}>
                <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600', marginTop: 2 }}>{bioExpanded ? 'See Less' : 'See More'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {/* Action buttons */}
          {!readOnly ? (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setShowEditProfile(true)} style={[S.outlineBtn, { flex: 1, borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontWeight: '600', fontSize: 14 }}>Edit Shop Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleShare(`Check out ${profile?.username || 'this'}'s shop on Berrystamp.`)} style={[S.filledBtn, { flex: 1, backgroundColor: theme.primary }]}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Share Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity onPress={handleMessageArtist} style={[S.outlineBtn, { flex: 1, borderColor: theme.border }]}>
                <Ionicons name="mail-outline" size={16} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 14 }}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFollowToggle} disabled={followLoading} style={[S.filledBtn, { flex: 1, backgroundColor: shop?.profile?.isFollowing ? theme.surface : theme.primary, borderWidth: 1, borderColor: theme.primary }]}>
                {followLoading ? <ActivityIndicator size="small" color={shop?.profile?.isFollowing ? theme.primary : '#fff'} /> : <Text style={{ color: shop?.profile?.isFollowing ? theme.primary : '#fff', fontWeight: '700', fontSize: 14 }}>{shop?.profile?.isFollowing ? 'Following' : 'Follow'}</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Tabs ── */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border, marginHorizontal: 16 }}>
          {(['designs', 'collections'] as TabType[]).map((t) => (
            <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={{ flex: 1, alignItems: 'center', paddingBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: activeTab === t ? theme.text : theme.muted }}>{t === 'designs' ? 'Design' : 'Collection'}</Text>
              {activeTab === t ? <View style={{ height: 2, width: '100%', backgroundColor: theme.primary, marginTop: 8 }} /> : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Grid ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {activeTab === 'designs' ? (
            designItems.length === 0 ? (
              <Text style={{ textAlign: 'center', color: theme.muted, marginTop: 32 }}>No designs uploaded yet.</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {designItems.map((item) => (
                  <DesignCard
                    key={String(item.id)}
                    item={item}
                    theme={theme}
                    username={profile?.username || 'designer'}
                    onMenu={() => handleDesignMenu(item)}
                    onPress={() => router.push({ pathname: '/product', params: { designId: String(item.id) } })}
                  />
                ))}
              </View>
            )
          ) : (
            collectionItems.length === 0 ? (
              <Text style={{ textAlign: 'center', color: theme.muted, marginTop: 32 }}>No collections yet.</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {collectionItems.map((item) => (
                  <CollectionCard
                    key={String(item.id)}
                    item={item}
                    theme={theme}
                    onMenu={() => handleCollectionMenu(item)}
                    onPress={() => { setCollectionDetail(item); setShowCollectionDetail(true); }}
                  />
                ))}
              </View>
            )
          )}
        </View>


      </ScrollView>

      {/* ── FAB ── */}
      {!readOnly ? (
        <TouchableOpacity onPress={() => setShowQuickActions(true)} style={{ position: 'absolute', bottom: insets.bottom + 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8 }}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      ) : null}

      {/* ── Sheets & Modals ── */}
      <QuickActionsSheet
        visible={showQuickActions}
        theme={theme}
        onClose={() => setShowQuickActions(false)}
        onCreateCollection={() => setShowNewCollection(true)}
        onUploadDesign={() => setShowUploadProduct(true)}
      />

      <DesignMenuSheet
        visible={showDesignMenu}
        theme={theme}
        onClose={() => setShowDesignMenu(false)}
        onUpdate={() => { if (designMenuTarget) router.push({ pathname: '/upload-design', params: { designId: String(designMenuTarget.id) } }); }}
        onAddToCollection={() => { if (designMenuTarget) { setAddToCollectionDesignId(designMenuTarget.id); setShowAddToCollection(true); } }}
        onInsights={() => { if (designMenuTarget) handleDesignInsights(designMenuTarget); }}
        onShare={() => { if (designMenuTarget) handleShare(`Check out "${designMenuTarget.title}" on Berrystamp.`); }}
        onDelete={() => { if (designMenuTarget) { setDeleteTarget({ id: designMenuTarget.id, type: 'design' }); setShowDeleteConfirm(true); } }}
      />

      <CollectionMenuSheet
        visible={showCollectionMenu}
        theme={theme}
        onClose={() => setShowCollectionMenu(false)}
        onUpdate={() => { if (collectionMenuTarget) router.push({ pathname: '/create-collection', params: { collectionId: String(collectionMenuTarget.id), name: collectionMenuTarget.name } }); }}
        onShare={() => { if (collectionMenuTarget) handleShare(`Check out "${collectionMenuTarget.name}" collection on Berrystamp.`); }}
        onDelete={() => { if (collectionMenuTarget) { setDeleteTarget({ id: collectionMenuTarget.id, type: 'collection' }); setShowDeleteConfirm(true); } }}
      />

      <AddToCollectionSheet
        visible={showAddToCollection}
        theme={theme}
        designId={addToCollectionDesignId}
        onClose={() => setShowAddToCollection(false)}
      />

      <PostInsightSheet
        visible={showInsight}
        theme={theme}
        insight={insightData}
        loading={insightLoading}
        onClose={() => { setShowInsight(false); setInsightData(null); }}
      />

      <ShareSheet
        visible={showShare}
        theme={theme}
        title={shareTitle}
        conversations={shop?.followers || []}
        onClose={() => setShowShare(false)}
      />

      <DeleteConfirmModal
        visible={showDeleteConfirm}
        theme={theme}
        isDesign={deleteTarget?.type === 'design'}
        loading={deleting}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
      />

      <PaymentPromptModal
        visible={showPaymentPrompt}
        theme={theme}
        onClose={() => setShowPaymentPrompt(false)}
        onAddNow={() => { setShowPaymentPrompt(false); router.push('/payment-details'); }}
      />

      <EditProfileSheet
        visible={showEditProfile}
        theme={theme}
        profile={profile}
        onClose={() => setShowEditProfile(false)}
        onSaved={() => loadShop()}
      />

      <UploadProductSheet
        visible={showUploadProduct}
        theme={theme}
        onClose={() => setShowUploadProduct(false)}
        onUploaded={() => loadShop()}
      />

      <NewCollectionSheet
        visible={showNewCollection}
        theme={theme}
        onClose={() => setShowNewCollection(false)}
        onCreated={() => loadShop()}
      />

      <FollowersScreen
        visible={showFollowers}
        theme={theme}
        profileId={profile?.profileId || 0}
        initialTab={followersInitialTab}
        onClose={() => setShowFollowers(false)}
      />

      <CollectionDetailScreen
        visible={showCollectionDetail}
        theme={theme}
        collection={collectionDetail}
        username={profile?.username || 'designer'}
        onClose={() => setShowCollectionDetail(false)}
        onRefresh={() => loadShop()}
      />
    </View>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 20, marginBottom: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  centerOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 20 },
  centerCard: { width: '100%', maxWidth: 420, borderRadius: 18, padding: 20 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 10, paddingVertical: 13 },
  filledBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingVertical: 13 },
});
