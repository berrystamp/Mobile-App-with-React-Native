import { useAppAlert } from "@/components/common/AppAlert";
import { formatNaira } from "@/lib/currency";
import { normalizeDesign, normalizeDesignListResponse } from "@/lib/designs";
import { upsertLocalConversation } from "@/lib/localConversations";
import { SearchFilters, addSearchHistory, getSearchFilters } from "@/lib/localStorage";
import ApiService from "@/services/apiClient";
import { Design, Mock } from "@/types";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, Share, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getLowestPrice = (design: Design) => {
  const prices = design.mocks.map((m) => m.price).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : design.amount || 0;
};

const toAbsUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://backend-prod-api.berrystamp.com/${path.replace(/^\/+/, '')}`;
};

const getMockSizes = (mock?: Mock | null): string[] => {
  if (!mock) return [];
  const s = (mock as any).sizes || (mock as any).availableSizes || [];
  return Array.isArray(s) ? s.map(String).filter(Boolean) : [];
};

// ─── Printer card type ────────────────────────────────────────────────────────

interface PrinterCard {
  id: number;
  name: string;
  avatar: string;
  cover: string;
  role: string;
  jobs: number;
  rating: string;
  location: string;
  distance: string;
  successRate: number;
}

const normalizePrinter = (item: any, index: number): PrinterCard => ({
  id: Number(item.id || index),
  name:
    item.name ||
    `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
    item.userName ||
    item.username ||
    'Printer',
  avatar: toAbsUrl(
    item.profileImage?.thumbnailUrl ||
      item.profileImage?.url ||
      item.thumbnailProfilePic ||
      item.profilePic ||
      item.avatar,
  ),
  cover: toAbsUrl(
    item.coverImage?.url ||
      item.coverPic ||
      item.profileImage?.url ||
      item.profilePic,
  ),
  role: item.bio || item.specialty || 'Commercial Printer',
  jobs: Number(item.insight?.totalCompletedOrders || item.totalJobs || 0),
  rating: item.insight?.rating?.avgStars
    ? item.insight.rating.avgStars.toFixed(1)
    : '4.5',
  location: item.userPhone || 'Lagos state',
  distance: item.insight?.distanceInKm
    ? `${item.insight.distanceInKm} km away`
    : '0 km away',
  successRate: Number(item.insight?.jobSuccessPercentage || 0),
});


// ─── Design card ──────────────────────────────────────────────────────────────

function ProductCard({
  design,
  onPress,
  onFavorite,
}: {
  design: Design;
  onPress: () => void;
  onFavorite: (id: number) => void;
}) {
  const isDark = useColorScheme() === 'dark';
  const price = getLowestPrice(design);
  const artistName =
    `${design.profile.firstName} ${design.profile.lastName}`.trim() ||
    design.profile.username;
  const imageUrl = design.imagePath?.startsWith('http')
    ? design.imagePath
    : design.imagePath
    ? `https://backend-prod-api.berrystamp.com/${design.imagePath}`
    : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        width: CARD_WIDTH,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDark ? '#2B2B2B' : '#F0F0F0',
      }}>
      <View style={{ height: CARD_WIDTH * 0.9, backgroundColor: isDark ? '#232323' : '#F7F7F7' }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }}  />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="image-outline" size={28} color={isDark ? '#555' : '#CCC'} />
          </View>
        )}
        <TouchableOpacity
          onPress={() => onFavorite(design.id)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons
            name={design.liked ? 'heart' : 'heart-outline'}
            size={16}
            color={design.liked ? '#FF4D67' : '#888'}
          />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#FFF' : '#1A1A1A', marginBottom: 2 }}>
          {design.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontSize: 11, color: isDark ? '#AAA' : '#888', marginBottom: 4 }}>
          By {artistName}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#FFF' : '#1A1A1A' }}>
          {formatNaira(price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}


// ─── Share sheet ──────────────────────────────────────────────────────────────

function ShareSheet({
  visible,
  design,
  onClose,
}: {
  visible: boolean;
  design: Design | null;
  onClose: () => void;
}) {
  const isDark = useColorScheme() === 'dark';
  if (!design) return null;

  const shareOptions = [
    { label: 'Whatsapp', icon: require('@/assets/images/icon.png'), color: '#25D366', action: 'whatsapp' },
    { label: 'X', icon: require('@/assets/images/icon.png'), color: '#000', action: 'twitter' },
    { label: 'LinkedIn', icon: require('@/assets/images/icon.png'), color: '#0077B5', action: 'linkedin' },
    { label: 'Facebook', icon: require('@/assets/images/icon.png'), color: '#1877F2', action: 'facebook' },
    { label: 'Email', icon: require('@/assets/images/icon.png'), color: '#EA4335', action: 'email' },
    { label: 'Instagram', icon: require('@/assets/images/icon.png'), color: '#E1306C', action: 'instagram' },
  ];

  const handleCopy = async () => {
    try {
      await Share.share({
        message: `Check out "${design.title}" on Berrystamp! ${design.description || ''}`,
        title: design.title,
      });
    } catch {}
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 36,
          }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#111' }}>Share</Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: isDark ? '#333' : '#F0F0F0',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="close" size={16} color={isDark ? '#FFF' : '#333'} />
            </TouchableOpacity>
          </View>

          {/* Social icons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            {shareOptions.map((opt) => (
              <TouchableOpacity key={opt.action} onPress={handleCopy} style={{ alignItems: 'center', width: 48 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: opt.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}>
                  <Ionicons name="share-social-outline" size={22} color="#FFF" />
                </View>
                <Text style={{ fontSize: 10, color: isDark ? '#AAA' : '#666', textAlign: 'center' }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
              borderRadius: 14,
              padding: 12,
            }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#E0E0E0',
                marginRight: 12,
              }}>
              {design.imagePath ? (
                <Image source={{ uri: design.imagePath }} style={{ width: 44, height: 44 }}  />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#FFF' : '#111' }}>
                {design.title}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 12, color: isDark ? '#AAA' : '#777' }}>
                {design.description || 'Berrystamp design'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopy}
              style={{
                backgroundColor: '#4A3298',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 8,
                marginLeft: 10,
              }}>
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Copy</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}


// ─── Printer selection screen ─────────────────────────────────────────────────

function PrinterSelectionScreen({
  visible,
  cartItems,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  cartItems: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const [printers, setPrinters] = useState<PrinterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentId, setSentId] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    const load = async () => {
      try {
        setLoading(true);
        // Use /api/v1/users filtered by PRINTER profileType
        const res = await ApiService.getUsers('PRINTER', 0, 60);
        const content =
          res?.responseBody?.content ||
          res?.content ||
          res?.responseBody ||
          res ||
          [];
        const list = Array.isArray(content) ? content : [];
        setPrinters(list.map(normalizePrinter));
      } catch (err) {
        console.error('[PrinterSelection] Failed to load printers:', err);
        setPrinters([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [visible]);

  const handleMessage = async (printer: PrinterCard) => {
    setSentId(printer.id);
    try {
      const conversationId = await upsertLocalConversation({
        participantId: printer.id,
        name: printer.name,
        role: 'Printers',
        initialMessages: cartItems.map((item, i) => ({
          id: `order-req-${printer.id}-${i}-${Date.now()}`,
          type: 'bundle' as const,
          text: '[Product gallery]',
          previewText: '[Product gallery]',
          author: 'me' as const,
          createdAt: new Date().toISOString(),
          status: 'sent' as const,
          bundle: {
            title: 'Order request',
            productCount: cartItems.length,
            footerLabel: 'View product details',
            items: [item],
          },
        })),
      });

      setTimeout(() => {
        setSentId(null);
        onSuccess();
        onClose();
        router.push({
          pathname: '/chat',
          params: {
            conversationId: String(conversationId),
            participantId: String(printer.id),
            participantName: printer.name,
            participantRole: 'Printers',
          },
        });
      }, 1200);
    } catch (err) {
      console.error('[PrinterSelection] Failed to send order request:', err);
      setSentId(null);
    }
  };

  const renderPrinter = ({ item, index }: { item: PrinterCard; index: number }) => {
    const isSent = sentId === item.id;
    return (
      <View
        style={{
          width: (SCREEN_WIDTH - 48) / 2,
          marginBottom: 16,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDark ? '#2B2B2B' : '#F0F0F0',
        }}>
        {/* Cover */}
        <View style={{ height: 80, backgroundColor: isDark ? '#2A2A2A' : '#E8E8E8' }}>
          {item.cover ? (
            <Image source={{ uri: item.cover }} style={{ width: '100%', height: '100%' }}  />
          ) : null}
          {/* Avatar */}
          <View
            style={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              marginLeft: -22,
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 2,
              borderColor: isDark ? '#1B1B1B' : '#FFF',
              overflow: 'hidden',
              backgroundColor: '#4A3298',
            }}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={{ width: 44, height: 44 }}  />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>
                  {item.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingTop: 28, paddingHorizontal: 10, paddingBottom: 12, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#FFF' : '#111' }}>
              {item.name}
            </Text>
            <Ionicons name="checkmark-circle" size={13} color="#4A3298" style={{ marginLeft: 3 }} />
          </View>
          <Text numberOfLines={1} style={{ fontSize: 11, color: isDark ? '#AAA' : '#777', marginBottom: 4 }}>
            {item.role}
          </Text>
          <Text style={{ fontSize: 10, color: isDark ? '#888' : '#999', marginBottom: 2 }}>
            {item.distance} • {item.jobs} jobs | {item.rating} ★
          </Text>
          <Text style={{ fontSize: 10, color: isDark ? '#888' : '#999', marginBottom: 10 }}>
            {item.location}
          </Text>

          {isSent ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
              <Text style={{ fontSize: 11, color: '#22C55E', marginLeft: 4, fontWeight: '600' }}>
                Order request created
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleMessage(item)}
              style={{
                backgroundColor: '#4A3298',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 24,
                width: '100%',
                alignItems: 'center',
              }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#F8F8F8' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2A2A2A' : '#ECECEC',
            backgroundColor: isDark ? '#1A1A1A' : '#FFF',
          }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#111'} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: isDark ? '#FFF' : '#111' }}>
              On-demand Printer
            </Text>
            <Text style={{ fontSize: 12, color: isDark ? '#AAA' : '#777', marginTop: 2 }}>
              Select and message a printer of your choice for printing preferences and printing cost negotiation
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#4A3298" />
            <Text style={{ marginTop: 12, color: isDark ? '#AAA' : '#777' }}>Loading printers...</Text>
          </View>
        ) : printers.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="print-outline" size={48} color={isDark ? '#444' : '#CCC'} />
            <Text style={{ marginTop: 12, color: isDark ? '#AAA' : '#777', textAlign: 'center' }}>
              No printers available right now.
            </Text>
          </View>
        ) : (
          <FlatList
            data={printers}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderPrinter}
            numColumns={2}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}


// ─── Product detail screen ────────────────────────────────────────────────────

function ProductDetailScreen({
  design,
  onClose,
  onCartAdded,
}: {
  design: Design;
  onClose: () => void;
  onCartAdded: (design: Design, mock: Mock, colour: string, size: string, qty: number) => void;
}) {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { show: showAlert } = useAppAlert();

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedMock, setSelectedMock] = useState<Mock | null>(design.mocks[0] || null);
  const [selectedColour, setSelectedColour] = useState<string>(design.mocks[0]?.colours?.[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(design.liked);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [relatedDesigns, setRelatedDesigns] = useState<Design[]>([]);

  const gallery = useMemo(() => {
    const items: { id: string; uri: string }[] = [];
    if (design.imagePath) items.push({ id: 'main', uri: design.imagePath });
    design.mocks.forEach((m) => {
      if (m.imagePath && m.imagePath !== design.imagePath) {
        items.push({ id: `mock-${m.id}`, uri: m.imagePath });
      }
    });
    return items.length ? items : [{ id: 'placeholder', uri: '' }];
  }, [design]);

  const mockSizes = useMemo(() => getMockSizes(selectedMock), [selectedMock]);

  const artistName =
    (design as any).shopName ||
    (design as any).brandName ||
    design.designerName ||
    `${design.profile.firstName} ${design.profile.lastName}`.trim() ||
    design.profile.username ||
    'Berrystamp';

  const lowestPrice = useMemo(() => {
    const prices = design.mocks.map((m) => m.price).filter((p) => p > 0);
    return prices.length ? Math.min(...prices) : design.amount || 0;
  }, [design]);

  useEffect(() => {
    ApiService.getDesigns({ page: 0, size: 8, designer: design.designerId })
      .then((res) => {
        const list = normalizeDesignListResponse(res).filter((d) => d.id !== design.id).slice(0, 6);
        setRelatedDesigns(list);
      })
      .catch(() => {});
  }, [design.id, design.designerId]);

  const handleFavorite = async () => {
    setIsFavorite((prev) => !prev);
    try {
      await ApiService.toggleFavorite(String(design.id));
    } catch {
      setIsFavorite((prev) => !prev);
    }
  };

  const handleAddToCart = async (printNow = false) => {
    if (!selectedMock) {
      showAlert({ type: 'warning', title: 'Select a mockup', message: 'Please select a mockup before adding to cart.' });
      return;
    }
    try {
      setAddingToCart(true);
      await ApiService.addOrUpdateCartItem(design.id, selectedMock.id, {
        quantity,
        colour: selectedColour || undefined,
        size: selectedSize || undefined,
      });
      if (printNow) {
        // Print Now: skip cart flow — go straight to printer selection with this item
        onClose();
        router.push({
          pathname: '/(tabs)/select-printer',
          params: {
            cartItems: JSON.stringify([
              {
                id: String(design.id),
                name: design.title,
                imageUrl: selectedMock?.imagePath || design.imagePath || '',
                price: selectedMock?.price || design.amount || 0,
                quantity,
                colour: selectedColour || '',
                size: selectedSize || '',
                variantText: [selectedColour, selectedSize].filter(Boolean).join(' / '),
                designerName:
                  `${design.profile.firstName} ${design.profile.lastName}`.trim() ||
                  design.profile.username,
              },
            ]),
          },
        });
        return;
      }
      setCartSuccess(true);
      onCartAdded(design, selectedMock, selectedColour, selectedSize, quantity);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err: any) {
      console.error('[ProductDetail] Add to cart failed:', err);
      showAlert({
        type: 'error',
        title: 'Could not add to cart',
        message: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRequestCustomization = async () => {
    try {
      const conversationId = await upsertLocalConversation({
        participantId: design.profile.id,
        name: artistName,
        role: 'Designer',
        initialMessages: [
          {
            id: `custom-${design.id}-${Date.now()}`,
            type: 'text',
            text: `Hi, I'd like to request a customization for "${design.title}".`,
            previewText: `Customization request for "${design.title}"`,
            author: 'me',
            createdAt: new Date().toISOString(),
            status: 'sent',
          },
        ],
      });
      onClose();
      router.push({
        pathname: '/chat',
        params: {
          conversationId: String(conversationId),
          participantId: String(design.profile.id),
          participantName: artistName,
          participantRole: 'Designer',
        },
      });
    } catch (err) {
      console.error('[ProductDetail] Customization request failed:', err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#F5F5F5' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Hero header with gallery ── */}
        <View style={{ backgroundColor: isDark ? '#1A1A1A' : '#B7B7B7' }}>
          {/* Top bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingTop: insets.top + 8,
              paddingBottom: 12,
            }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push({ pathname: '/my-shop', params: { profileId: String(design.profile.id) } })}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  overflow: 'hidden',
                  backgroundColor: '#4A3298',
                  marginRight: 8,
                }}>
                {design.profile.profilePicturePath ? (
                  <Image
                    source={{ uri: design.profile.profilePicturePath }}
                    style={{ width: 36, height: 36 }}
                    
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>
                      {(design.profile.firstName || 'B').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>
                  {design.title}
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                  Designed by {artistName}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={handleFavorite}
                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? '#FF4D67' : '#FFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowShare(true)}
                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="share-2" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Gallery */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
            }>
            {gallery.map((item) => (
              <View
                key={item.id}
                style={{ width: SCREEN_WIDTH, height: 280, alignItems: 'center', justifyContent: 'center' }}>
                {item.uri ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: SCREEN_WIDTH * 0.8, height: 260 }}
                    
                  />
                ) : (
                  <Ionicons name="image-outline" size={64} color={isDark ? '#444' : '#CCC'} />
                )}
              </View>
            ))}
          </ScrollView>

          {/* Dots */}
          {gallery.length > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 }}>
              {gallery.map((item, i) => (
                <View
                  key={item.id}
                  style={{
                    width: i === galleryIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === galleryIndex ? '#333' : '#CCC',
                    marginHorizontal: 3,
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Content ── */}
        <View style={{ backgroundColor: isDark ? '#121212' : '#FFF', paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Description */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#AAA' : '#555', marginBottom: 4 }}>
            Description
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? '#CCC' : '#444', lineHeight: 20, marginBottom: 8 }}>
            {design.description || design.title}
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? '#CCC' : '#444', marginBottom: 4 }}>
            From{' '}
            <Text
              style={{ color: '#2D71E3', fontWeight: '600' }}
              onPress={() =>
                router.push({ pathname: '/my-shop', params: { profileId: String(design.profile.id) } })
              }>
              {artistName} Collections
            </Text>
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: isDark ? '#FFF' : '#111', marginBottom: 16 }}>
            {formatNaira(lowestPrice)}
          </Text>

          {/* Cart success toast */}
          {cartSuccess && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#1E2E1E' : '#F0FFF4',
                borderRadius: 10,
                padding: 10,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#22C55E',
              }}>
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
              <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: '#22C55E', fontWeight: '600' }}>
                Item successfully added to cart
              </Text>
              <TouchableOpacity onPress={() => { router.push('/cart'); onClose(); }}>
                <Text style={{ color: '#4A3298', fontSize: 13, fontWeight: '700' }}>Go to Cart</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Select Mockup */}
          <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#FFF' : '#111', marginBottom: 10 }}>
            Select Mockup
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {design.mocks.map((mock) => {
              const isActive = selectedMock?.id === mock.id;
              return (
                <TouchableOpacity
                  key={mock.id}
                  onPress={() => {
                    setSelectedMock(mock);
                    setSelectedColour(mock.colours?.[0] || '');
                    setSelectedSize(getMockSizes(mock)[0] || '');
                  }}
                  style={{
                    marginRight: 12,
                    borderWidth: 2,
                    borderColor: isActive ? '#4A3298' : isDark ? '#333' : '#E0E0E0',
                    borderRadius: 12,
                    overflow: 'hidden',
                    width: 90,
                  }}>
                  <View style={{ width: 90, height: 90, backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' }}>
                    {mock.imagePath ? (
                      <Image source={{ uri: mock.imagePath }} style={{ width: 90, height: 90 }}  />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="shirt-outline" size={28} color={isDark ? '#555' : '#CCC'} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Select colour */}
          {!!selectedMock?.colours?.length && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: isDark ? '#AAA' : '#666', marginBottom: 8 }}>Select colour</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {selectedMock.colours.map((colour) => (
                  <TouchableOpacity
                    key={colour}
                    onPress={() => setSelectedColour(colour)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colour,
                      borderWidth: selectedColour === colour ? 3 : 1.5,
                      borderColor: selectedColour === colour ? '#4A3298' : 'rgba(0,0,0,0.15)',
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Choose size */}
          {!!mockSizes.length && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: isDark ? '#AAA' : '#666', marginBottom: 8 }}>Choose size</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {mockSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: selectedSize === size ? '#4A3298' : isDark ? '#444' : '#D0D0D0',
                      backgroundColor:
                        selectedSize === size ? '#4A3298' : isDark ? '#1A1A1A' : '#FFF',
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: selectedSize === size ? '#FFF' : isDark ? '#CCC' : '#333',
                      }}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Select quantity */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, color: isDark ? '#AAA' : '#666', marginBottom: 8 }}>Select quantity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#4A3298',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', lineHeight: 22 }}>−</Text>
              </TouchableOpacity>
              <Text
                style={{
                  marginHorizontal: 16,
                  fontSize: 16,
                  fontWeight: '700',
                  color: isDark ? '#FFF' : '#111',
                  minWidth: 24,
                  textAlign: 'center',
                }}>
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#4A3298',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', lineHeight: 22 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Request customization */}
          <TouchableOpacity
            onPress={handleRequestCustomization}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isDark ? '#333' : '#E0E0E0',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 13,
              marginBottom: 20,
              backgroundColor: isDark ? '#1A1A1A' : '#FFF',
            }}>
            <Ionicons name="grid-outline" size={18} color="#4A3298" style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, fontSize: 14, color: '#4A3298', fontWeight: '600' }}>
              Request customization
            </Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#666' : '#AAA'} />
          </TouchableOpacity>

           {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
            <TouchableOpacity
              onPress={() => handleAddToCart(false)}
              disabled={addingToCart}
              style={{
                flex: 1,
                paddingVertical: 15,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: '#4A3298',
                alignItems: 'center',
                backgroundColor: isDark ? '#1A1A1A' : '#FFF',
              }}>
              {addingToCart ? (
                <ActivityIndicator size="small" color="#4A3298" />
              ) : (
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#4A3298' }}>Add to Cart</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAddToCart(true)}
              disabled={addingToCart}
              style={{
                flex: 1,
                paddingVertical: 15,
                borderRadius: 14,
                backgroundColor: '#4A3298',
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>Print Now</Text>
            </TouchableOpacity>
          </View>

          {/* More from designer */}
          {relatedDesigns.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#FFF' : '#111', marginBottom: 14 }}>
                More from designer
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {relatedDesigns.map((item) => {
                  const relatedPrice = getLowestPrice(item);
                  const relatedArtist =
                    `${item.profile.firstName} ${item.profile.lastName}`.trim() || item.profile.username;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => router.push({ pathname: '/products', params: { designId: String(item.id) } })}
                      style={{
                        width: (SCREEN_WIDTH - 52) / 2,
                        marginBottom: 14,
                        borderRadius: 14,
                        overflow: 'hidden',
                        backgroundColor: isDark ? '#1B1B1B' : '#FFF',
                        borderWidth: 1,
                        borderColor: isDark ? '#2B2B2B' : '#F0F0F0',
                      }}>
                      <View style={{ height: 120, backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' }}>
                        {item.imagePath ? (
                          <Image
                            source={{ uri: item.imagePath }}
                            style={{ width: '100%', height: '100%' }}
                            
                          />
                        ) : null}
                        <TouchableOpacity
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Ionicons
                            name={item.liked ? 'heart' : 'heart-outline'}
                            size={13}
                            color={item.liked ? '#FF4D67' : '#888'}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={{ padding: 8 }}>
                        <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#FFF' : '#111' }}>
                          {item.title}
                        </Text>
                        <Text numberOfLines={1} style={{ fontSize: 10, color: isDark ? '#AAA' : '#888', marginTop: 1 }}>
                          By {relatedArtist}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#FFF' : '#111', marginTop: 3 }}>
                          {formatNaira(relatedPrice)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ShareSheet visible={showShare} design={design} onClose={() => setShowShare(false)} />
    </View>
  );
}


// ─── Main ProductsScreen ──────────────────────────────────────────────────────

export default function ProductsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { show: showAlert, element: alertElement } = useAppAlert();

  const { artistId, artistName: artistNameParam, designId, searchField } =
    useLocalSearchParams<{
      artistId?: string;
      artistName?: string;
      designId?: string;
      searchField?: string;
    }>();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Design[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchField || '');
  const [filters, setFilters] = useState<SearchFilters>({
    productCategories: [],
    designCategories: [],
    priceRange: [0, 9000],
    sortBy: 'Recently added',
  });
  const [error, setError] = useState<string | null>(null);

  // Detail view — if designId param is present, start in detail mode immediately
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  // Track whether we are in "single product" mode (came from a designId link)
  const isSingleProduct = Boolean(designId);

  // Printer selection
  const [showPrinters, setShowPrinters] = useState(false);
  const [pendingCartItems, setPendingCartItems] = useState<any[]>([]);

  const theme = useMemo(
    () => ({
      background: isDark ? '#121212' : '#F8F8F8',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#111111',
      subtext: isDark ? '#ABABAB' : '#777777',
      border: isDark ? '#2A2A2A' : '#ECECEC',
    }),
    [isDark],
  );

  const loadProducts = useCallback(
    async (query: string, nextFilters: SearchFilters) => {
      try {
        setIsLoading(true);
        setError(null);

        if (designId) {
          // Single-product mode: fetch and go straight to detail, never show the list
          const res = await ApiService.fetchDesignById(Number(designId));
          const normalized = normalizeDesign(res?.responseBody || res);
          setSelectedDesign(normalized);
          return;
        }

        const res = await ApiService.getDesigns({
          page: 0,
          size: 60,
          designer: artistId ? Number(artistId) : undefined,
          searchField: query.trim() || undefined,
          designCategories: nextFilters.designCategories.length
            ? nextFilters.designCategories.join(',')
            : undefined,
          mockName: nextFilters.productCategories.length
            ? nextFilters.productCategories.join(',')
            : undefined,
          lowerPriceRange: nextFilters.priceRange[0],
          upperPriceRange: nextFilters.priceRange[1],
        });

        let list = normalizeDesignListResponse(res);

        // Client-side sort
        if (nextFilters.sortBy === 'Low Price') {
          list = list.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
        } else if (nextFilters.sortBy === 'High Price') {
          list = list.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
        }

        setProducts(list);
      } catch (err: any) {
        console.error('[Products] Failed to load:', err);
        setError(err?.response?.data?.message || 'Unable to load products right now.');
      } finally {
        setIsLoading(false);
      }
    },
    [artistId, designId],
  );

  useFocusEffect(
    useCallback(() => {
      const syncFilters = async () => {
        const stored = await getSearchFilters();
        setFilters(stored);
      };
      syncFilters();
    }, []),
  );

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(searchQuery, filters), searchQuery.trim() ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadProducts, searchQuery, filters]);

  const handleFavorite = async (id: number) => {
    setProducts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, liked: !d.liked } : d)),
    );
    try {
      await ApiService.toggleFavorite(String(id));
    } catch {
      setProducts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, liked: !d.liked } : d)),
      );
    }
  };

  const handleCartAdded = (
    design: Design,
    mock: Mock,
    colour: string,
    size: string,
    qty: number,
  ) => {
    setPendingCartItems([
      {
        id: `${design.id}-${mock.id}-${Date.now()}`,
        name: design.title,
        imageUrl: mock.imagePath || design.imagePath,
        price: mock.price || design.amount || 0,
        quantity: qty,
        colour,
        size,
        designerId: design.designerId || design.profile.id,
        designerName:
          design.designerName ||
          `${design.profile.firstName} ${design.profile.lastName}`.trim(),
      },
    ]);
  };

  const title = artistNameParam ? `${artistNameParam}'s products` : 'Marketplace';

  // ── Single-product mode: came here via designId param ──
  // Show a spinner while loading, then the detail screen — never the list.
  if (isSingleProduct) {
    if (isLoading || (!selectedDesign && !error)) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#121212' : '#F5F5F5' }}>
          <ActivityIndicator size="large" color="#4A3298" />
        </View>
      );
    }
    if (error || !selectedDesign) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: isDark ? '#121212' : '#F5F5F5' }}>
          <Ionicons name="alert-circle-outline" size={48} color="#E15656" />
          <Text style={{ color: '#E15656', textAlign: 'center', marginTop: 12 }}>
            {error || 'Could not load this product.'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16, backgroundColor: '#4A3298', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        <ProductDetailScreen
          design={selectedDesign}
          onClose={() => router.back()}
          onCartAdded={handleCartAdded}
        />
        <PrinterSelectionScreen
          visible={showPrinters}
          cartItems={pendingCartItems}
          onClose={() => setShowPrinters(false)}
          onSuccess={() => setPendingCartItems([])}
        />
        {alertElement}
      </>
    );
  }

  // ── If a design is selected from the list, show the detail screen ──
  if (selectedDesign) {
    return (
      <>
        <ProductDetailScreen
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
          onCartAdded={handleCartAdded}
        />
        <PrinterSelectionScreen
          visible={showPrinters}
          cartItems={pendingCartItems}
          onClose={() => setShowPrinters(false)}
          onSuccess={() => setPendingCartItems([])}
        />
        {alertElement}
      </>
    );
  }

  // ── Product list ──
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.text }} numberOfLines={1}>
            {title}
          </Text>
          <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 1 }}>
            Tap a product to view details
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => loadProducts(searchQuery, filters)}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="refresh-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search + filter */}
      {!designId && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 10,
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 24,
              paddingHorizontal: 14,
              height: 42,
            }}>
            <Ionicons name="search-outline" size={16} color={theme.subtext} style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search designs"
              placeholderTextColor={theme.subtext}
              style={{ flex: 1, fontSize: 14, color: theme.text }}
              returnKeyType="search"
              onSubmitEditing={() => addSearchHistory(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={theme.subtext} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/Filter')}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="options-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#4A3298" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#E15656" />
          <Text style={{ color: '#E15656', textAlign: 'center', marginTop: 12 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadProducts(searchQuery, filters)}
            style={{
              marginTop: 16,
              backgroundColor: '#4A3298',
              borderRadius: 20,
              paddingHorizontal: 24,
              paddingVertical: 10,
            }}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="grid-outline" size={48} color={theme.subtext} />
          <Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 12 }}>
            No products found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              design={item}
              onPress={() => setSelectedDesign(item)}
              onFavorite={handleFavorite}
            />
          )}
        />
      )}

      {alertElement}
    </View>
  );
}