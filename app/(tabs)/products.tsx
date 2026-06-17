import { useAppAlert } from "@/components/common/AppAlert";
import { formatNaira } from "@/lib/currency";
import { encodeDraft } from "@/lib/customDesign";
import { normalizeDesign, normalizeDesignListResponse } from "@/lib/designs";
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
// 4:5 Aspect ratio for professional product imagery
const GALLERY_HEIGHT = SCREEN_WIDTH * 1.25; 

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
      activeOpacity={0.9}
      style={{
        width: CARD_WIDTH,
        marginBottom: 24,
        backgroundColor: 'transparent',
      }}>
      <View style={{ 
        height: CARD_WIDTH * 1.3, 
        backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10
      }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="image-outline" size={28} color={isDark ? '#555' : '#CCC'} />
          </View>
        )}
        <TouchableOpacity
          onPress={() => onFavorite(design.id)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isDark ? 'rgba(28,28,30,0.6)' : 'rgba(255,255,255,0.8)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons
            name={design.liked ? 'heart' : 'heart-outline'}
            size={18}
            color={design.liked ? '#FF3B30' : (isDark ? '#FFF' : '#1C1C1E')}
          />
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 4 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#FFF' : '#1C1C1E', marginBottom: 4, letterSpacing: 0.3 }}>
          {design.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontSize: 12, color: isDark ? '#8E8E93' : '#8E8E93', marginBottom: 6 }}>
          Designed by {artistName}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E' }}>
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
        message: `Discover "${design.title}" on Berrystamp. ${design.description || ''}`,
        title: design.title,
      });
    } catch {}
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 40,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E' }}>Share Product</Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? '#2C2C2E' : '#F5F5F7',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="close" size={18} color={isDark ? '#FFF' : '#1C1C1E'} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
            {shareOptions.map((opt) => (
              <TouchableOpacity key={opt.action} onPress={handleCopy} style={{ alignItems: 'center', width: 50 }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: opt.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                  <Ionicons name="share-social-outline" size={24} color="#FFF" />
                </View>
                <Text style={{ fontSize: 11, color: isDark ? '#8E8E93' : '#8E8E93', textAlign: 'center' }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#2C2C2E' : '#F5F5F7',
              borderRadius: 16,
              padding: 12,
            }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#E0E0E0',
                marginRight: 12,
              }}>
              {design.imagePath ? (
                <Image source={{ uri: design.imagePath }} style={{ width: 48, height: 48 }} />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '600', color: isDark ? '#FFF' : '#1C1C1E' }}>
                {design.title}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 13, color: isDark ? '#8E8E93' : '#8E8E93', marginTop: 2 }}>
                Berrystamp Exclusives
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopy}
              style={{
                backgroundColor: '#4A3298',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginLeft: 12,
              }}>
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>Copy Link</Text>
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
        const res = await ApiService.getUsers('PRINTER', 0, 60);
        const content = res?.responseBody?.content || res?.content || res?.responseBody || res || [];
        setPrinters(Array.isArray(content) ? content.map(normalizePrinter) : []);
      } catch {
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
            title: 'Order Specification',
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
    } catch {
      setSentId(null);
    }
  };

  const renderPrinter = ({ item }: { item: PrinterCard }) => {
    const isSent = sentId === item.id;
    return (
      <View
        style={{
          width: (SCREEN_WIDTH - 48) / 2,
          marginBottom: 16,
          borderRadius: 16,
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderWidth: 1,
          borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
          overflow: 'hidden'
        }}>
        <View style={{ height: 80, backgroundColor: isDark ? '#2C2C2E' : '#F5F5F7' }}>
          {item.cover ? <Image source={{ uri: item.cover }} style={{ width: '100%', height: '100%' }} /> : null}
          <View
            style={{
              position: 'absolute',
              bottom: -20,
              alignSelf: 'center',
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 2,
              borderColor: isDark ? '#1C1C1E' : '#FFF',
              overflow: 'hidden',
              backgroundColor: '#4A3298',
            }}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>
                  {item.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingTop: 28, paddingHorizontal: 12, paddingBottom: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E' }}>
              {item.name}
            </Text>
            <Ionicons name="checkmark-circle" size={14} color="#4A3298" style={{ marginLeft: 4 }} />
          </View>
          <Text numberOfLines={1} style={{ fontSize: 12, color: isDark ? '#8E8E93' : '#8E8E93', marginBottom: 8 }}>
            {item.role}
          </Text>
          <Text style={{ fontSize: 11, color: isDark ? '#636366' : '#AEAEB2', marginBottom: 4 }}>
            {item.distance} • {item.jobs} orders | {item.rating} ★
          </Text>
          <Text style={{ fontSize: 11, color: isDark ? '#636366' : '#AEAEB2', marginBottom: 16 }}>
            {item.location}
          </Text>

          {isSent ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={{ fontSize: 12, color: '#34C759', marginLeft: 6, fontWeight: '600' }}>
                Order Sent
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleMessage(item)}
              style={{
                backgroundColor: '#4A3298',
                borderRadius: 24,
                paddingVertical: 10,
                width: '100%',
                alignItems: 'center',
              }}>
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Engage Partner</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#F5F5F7' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1C1C1E'} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E' }}>
              Select Print Partner
            </Text>
            <Text style={{ fontSize: 13, color: isDark ? '#8E8E93' : '#8E8E93', marginTop: 2 }}>
              Choose a verified partner for production and fulfillment.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#4A3298" />
          </View>
        ) : printers.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="print-outline" size={64} color={isDark ? '#3A3A3C' : '#D1D1D6'} />
            <Text style={{ marginTop: 16, fontSize: 16, color: isDark ? '#8E8E93' : '#8E8E93', textAlign: 'center' }}>
              No print partners available in this region.
            </Text>
          </View>
        ) : (
          <FlatList
            data={printers}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderPrinter}
            numColumns={2}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            columnWrapperStyle={{ gap: 16 }}
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
    'Berrystamp Studio';

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
      showAlert({ type: 'warning', title: 'Selection Required', message: 'Please select a specific style to continue.' });
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
                designerName: artistName,
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
      showAlert({
        type: 'error',
        title: 'Transaction Failed',
        message: err?.response?.data?.message || 'Unable to update cart at this time.',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRequestCustomization = async () => {
    const draft = encodeDraft({
      designFor: '',
      designTheme: '',
      items: selectedMock?.name ? [selectedMock.name] : [],
      sourceDesignId: design.id,
      sourceDesignTitle: design.title,
      sourceDesignImage: selectedMock?.imagePath || design.imagePath,
      designerId: design.designerId || design.profile.id,
      designerName: artistName,
    });

    onClose();
    router.push({ pathname: '/(tabs)/create-custom-design', params: { draft } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FFF' }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* ── Full Bleed Edge-to-Edge Image Gallery ── */}
        <View style={{ width: SCREEN_WIDTH, height: GALLERY_HEIGHT, backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7' }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
            }>
            {gallery.map((item) => (
              <View key={item.id} style={{ width: SCREEN_WIDTH, height: GALLERY_HEIGHT }}>
                {item.uri ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="image-outline" size={64} color={isDark ? '#3A3A3C' : '#D1D1D6'} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Floating Header Over Image */}
          <View
            style={{
              position: 'absolute',
              top: Math.max(insets.top, 20),
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              zIndex: 10,
            }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.7)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleFavorite}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? '#FF3B30' : '#000'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowShare(true)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Feather name="share" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Gallery Pagination Indicator */}
          {gallery.length > 1 && (
            <View style={{
              position: 'absolute',
              bottom: 30,
              alignSelf: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
                {galleryIndex + 1} / {gallery.length}
              </Text>
            </View>
          )}
        </View>

        {/* ── Content Box ── */}
        <View style={{ 
          backgroundColor: isDark ? '#000' : '#FFF', 
          marginTop: -20, 
          borderTopLeftRadius: 24, 
          borderTopRightRadius: 24, 
          paddingHorizontal: 20, 
          paddingTop: 28,
          paddingBottom: 120 
        }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <Text style={{ flex: 1, fontSize: 22, fontWeight: '800', color: isDark ? '#FFF' : '#1C1C1E', letterSpacing: -0.5 }}>
              {design.title}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: isDark ? '#FFF' : '#1C1C1E' }}>
              {formatNaira(lowestPrice)}
            </Text>
          </View>

          <Text style={{ fontSize: 15, color: isDark ? '#8E8E93' : '#636366', marginBottom: 20 }}>
            Designed by <Text style={{ color: '#4A3298', fontWeight: '600' }}>{artistName}</Text>
          </Text>

          <Text style={{ fontSize: 15, lineHeight: 24, color: isDark ? '#E5E5EA' : '#3A3A3C', marginBottom: 28 }}>
            {design.description || "Premium quality design crafted for exceptional aesthetics and comfort."}
          </Text>

          {cartSuccess && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#1C2E1C' : '#F0FFF4',
                borderRadius: 12,
                padding: 14,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#34C759',
              }}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#34C759', fontWeight: '600' }}>
                Added to cart successfully
              </Text>
              <TouchableOpacity onPress={() => { router.push('/cart'); onClose(); }}>
                <Text style={{ color: isDark ? '#FFF' : '#1C1C1E', fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' }}>View Cart</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Selections ── */}
          <View style={{ borderTopWidth: 1, borderColor: isDark ? '#2C2C2E' : '#F5F5F7', paddingTop: 24 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E', marginBottom: 16 }}>
              Available Styles
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
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
                      marginRight: 16,
                      borderWidth: 2,
                      borderColor: isActive ? '#4A3298' : 'transparent',
                      borderRadius: 12,
                      overflow: 'hidden',
                      width: 80,
                    }}>
                    <View style={{ width: 80, height: 80, backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7' }}>
                      {mock.imagePath ? (
                        <Image source={{ uri: mock.imagePath }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="shirt-outline" size={24} color={isDark ? '#555' : '#CCC'} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {!!selectedMock?.colours?.length && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E', marginBottom: 16 }}>Color Options</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {selectedMock.colours.map((colour) => (
                    <TouchableOpacity
                      key={colour}
                      onPress={() => setSelectedColour(colour)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colour,
                        borderWidth: 2,
                        borderColor: selectedColour === colour ? '#4A3298' : (isDark ? '#2C2C2E' : '#E5E5EA'),
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 2,
                      }}
                    />
                  ))}
                </View>
              </View>
            )}

            {!!mockSizes.length && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E', marginBottom: 16 }}>Size Selection</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {mockSizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      style={{
                        minWidth: 50,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: selectedSize === size ? '#4A3298' : (isDark ? '#2C2C2E' : '#E5E5EA'),
                        backgroundColor: selectedSize === size ? '#4A3298' : 'transparent',
                        alignItems: 'center'
                      }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: selectedSize === size ? '#FFF' : (isDark ? '#E5E5EA' : '#1C1C1E'),
                        }}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E' }}>Quantity</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderRadius: 8, padding: 4 }}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: isDark ? '#FFF' : '#1C1C1E', fontSize: 20, fontWeight: '500' }}>−</Text>
                </TouchableOpacity>
                <Text style={{ width: 40, textAlign: 'center', fontSize: 16, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E' }}>
                  {quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => q + 1)}
                  style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: isDark ? '#FFF' : '#1C1C1E', fontSize: 20, fontWeight: '500' }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRequestCustomization}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                borderRadius: 12,
                paddingVertical: 16,
                marginBottom: 24,
              }}>
              <Ionicons name="color-wand-outline" size={20} color={isDark ? '#FFF' : '#1C1C1E'} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 15, color: isDark ? '#FFF' : '#1C1C1E', fontWeight: '600' }}>
                Request Custom Order
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 40 }}>
              <TouchableOpacity
                onPress={() => handleAddToCart(false)}
                disabled={addingToCart}
                style={{
                  flex: 1,
                  paddingVertical: 18,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#FFF' : '#1C1C1E',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}>
                {addingToCart ? (
                  <ActivityIndicator size="small" color={isDark ? '#FFF' : '#1C1C1E'} />
                ) : (
                  <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E' }}>Add to Cart</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAddToCart(true)}
                disabled={addingToCart}
                style={{
                  flex: 1,
                  paddingVertical: 18,
                  borderRadius: 12,
                  backgroundColor: '#4A3298',
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>Print Now</Text>
              </TouchableOpacity>
            </View>

            {/* More from designer */}
            {relatedDesigns.length > 0 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFF' : '#1C1C1E', marginBottom: 20 }}>
                  More from {artistName}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {relatedDesigns.map((item) => (
                    <ProductCard
                      key={item.id}
                      design={item}
                      onPress={() => router.push({ pathname: '/products', params: { designId: String(item.id) } })}
                      onFavorite={handleFavorite}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
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
  const { element: alertElement } = useAppAlert();

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

  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const isSingleProduct = Boolean(designId);

  const [showPrinters, setShowPrinters] = useState(false);
  const [pendingCartItems, setPendingCartItems] = useState<any[]>([]);

  const theme = useMemo(
    () => ({
      background: isDark ? '#000000' : '#FFFFFF',
      surface: isDark ? '#1C1C1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#1C1C1E',
      subtext: isDark ? '#8E8E93' : '#8E8E93',
      border: isDark ? '#2C2C2E' : '#E5E5EA',
    }),
    [isDark],
  );

  const loadProducts = useCallback(
    async (query: string, nextFilters: SearchFilters) => {
      try {
        setIsLoading(true);
        setError(null);

        if (designId) {
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

        if (nextFilters.sortBy === 'Low Price') {
          list = list.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
        } else if (nextFilters.sortBy === 'High Price') {
          list = list.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
        }

        setProducts(list);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load catalog right now.');
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

  const title = artistNameParam ? `${artistNameParam}'s Catalog` : 'The Marketplace';

  if (isSingleProduct) {
    if (isLoading || (!selectedDesign && !error)) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color="#4A3298" />
        </View>
      );
    }
    if (error || !selectedDesign) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: theme.background }}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={{ color: '#FF3B30', textAlign: 'center', marginTop: 12 }}>
            {error || 'Could not load this product.'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 20, backgroundColor: '#4A3298', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 }}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Return</Text>
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          backgroundColor: theme.surface,
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginLeft: -10 }}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.5 }} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => loadProducts(searchQuery, filters)}
          style={{ width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' }}>
          <Ionicons name="refresh-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {!designId && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            gap: 12,
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7',
              borderRadius: 12,
              paddingHorizontal: 16,
              height: 48,
            }}>
            <Ionicons name="search-outline" size={18} color={theme.subtext} style={{ marginRight: 10 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search catalog..."
              placeholderTextColor={theme.subtext}
              style={{ flex: 1, fontSize: 15, color: theme.text }}
              returnKeyType="search"
              onSubmitEditing={() => addSearchHistory(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.subtext} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/Filter')}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="options-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#4A3298" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="alert-circle-outline" size={56} color="#FF3B30" />
          <Text style={{ color: '#FF3B30', textAlign: 'center', marginTop: 16, fontSize: 15 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadProducts(searchQuery, filters)}
            style={{
              marginTop: 24,
              backgroundColor: '#4A3298',
              borderRadius: 12,
              paddingHorizontal: 32,
              paddingVertical: 14,
            }}>
            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 15 }}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="grid-outline" size={56} color={theme.border} />
          <Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 16, fontSize: 15 }}>
            No matching products found in the catalog.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
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
