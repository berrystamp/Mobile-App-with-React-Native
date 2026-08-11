import { useAppAlert } from "@/components/common/AppAlert";
import { useCustomDesignStore } from "@/context/CustomDesignContext"; // Import your shared state hook
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
  name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.userName || item.username || 'Printer',
  avatar: toAbsUrl(item.profileImage?.thumbnailUrl || item.profileImage?.url || item.thumbnailProfilePic || item.profilePic || item.avatar),
  cover: toAbsUrl(item.coverImage?.url || item.coverPic || item.profileImage?.url || item.profilePic),
  role: item.bio || item.specialty || 'Commercial Printer',
  jobs: Number(item.insight?.totalCompletedOrders || item.totalJobs || 0),
  rating: item.insight?.rating?.avgStars ? item.insight.rating.avgStars.toFixed(1) : '4.5',
  location: item.userPhone || 'Lagos state',
  distance: item.insight?.distanceInKm ? `${item.insight.distanceInKm} km away` : '0 km away',
  successRate: Number(item.insight?.jobSuccessPercentage || 0),
});

// ─── Design Card Component ───────────────────────────────────────────────────

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
  const artistName = `${design.profile.firstName} ${design.profile.lastName}`.trim() || design.profile.username;
  const imageUrl = design.imagePath?.startsWith('http') ? design.imagePath : design.imagePath ? `https://backend-prod-api.berrystamp.com/${design.imagePath}` : '';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ width: CARD_WIDTH }} className="mb-6 bg-transparent">
      <View style={{ height: CARD_WIDTH * 1.3 }} className="mb-[10px] overflow-hidden rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E]">
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-full w-full" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="image-outline" size={28} color={isDark ? '#555' : '#CCC'} />
          </View>
        )}
        <TouchableOpacity
          onPress={() => onFavorite(design.id)}
          className="absolute right-[10px] top-[10px] h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-black/60"
        >
          <Ionicons
            name={design.liked ? 'heart' : 'heart-outline'}
            size={18}
            color={design.liked ? '#FF3B30' : (isDark ? '#FFF' : '#1C1C1E')}
          />
        </TouchableOpacity>
      </View>
      <View className="px-1">
        <Text numberOfLines={1} className="mb-1 text-[14px] font-semibold text-[#1C1C1E] dark:text-white tracking-wide">
          {design.title}
        </Text>
        <Text numberOfLines={1} className="mb-[6px] text-[12px] text-[#8E8E93]">
          Designed by {artistName}
        </Text>
        <Text className="text-[14px] font-bold text-[#1C1C1E] dark:text-white">
          {formatNaira(price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Share Sheet Component ───────────────────────────────────────────────────

function ShareSheet({
  visible,
  design,
  onClose,
}: {
  visible: boolean;
  design: Design | null;
  onClose: () => void;
}) {
  if (!design) return null;

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
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} className="rounded-t-[24px] bg-white p-6 pb-10 dark:bg-[#1C1C1E]">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-[#1C1C1E] dark:text-white">Share Product</Text>
            <TouchableOpacity onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E]">
              <Ionicons name="close" size={18} className="text-[#1C1C1E] dark:text-white" />
            </TouchableOpacity>
          </View>

          <View className="mb-8 flex-row justify-between">
            {['Whatsapp', 'X', 'LinkedIn', 'Facebook'].map((label) => (
              <TouchableOpacity key={label} onPress={handleCopy} className="w-[50px] items-center">
                <View className="mb-2 h-[50px] w-[50px] items-center justify-center rounded-full bg-[#4A3298]">
                  <Ionicons name="share-social-outline" size={24} color="#FFF" />
                </View>
                <Text className="text-center text-[11px] text-[#8E8E93]">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center rounded-2xl bg-[#F5F5F7] p-3 dark:bg-[#2C2C2E]">
            <View className="mr-3 h-12 w-12 overflow-hidden rounded-lg bg-[#E0E0E0]">
              {design.imagePath ? <Image source={{ uri: design.imagePath }} className="h-full w-full" /> : null}
            </View>
            <View className="flex-1">
              <Text numberOfLines={1} className="text-[15px] font-semibold text-[#1C1C1E] dark:text-white">
                {design.title}
              </Text>
              <Text numberOfLines={1} className="mt-0.5 text-[13px] text-[#8E8E93]">
                Berrystamp Exclusives
              </Text>
            </View>
            <TouchableOpacity onPress={handleCopy} className="ml-3 rounded-xl bg-[#4A3298] px-4 py-2.5">
              <Text className="text-[14px] font-semibold text-white">Copy Link</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Printer Selection Component ──────────────────────────────────────────────

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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-[#F5F5F7] dark:bg-black">
        <View className="flex-row items-center bg-white px-4 py-4 dark:bg-[#1C1C1E]">
          <TouchableOpacity onPress={onClose} className="mr-4">
            <Ionicons name="arrow-back" size={24} className="text-[#1C1C1E] dark:text-white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-[18px] font-bold text-[#1C1C1E] dark:text-white">Select Print Partner</Text>
            <Text className="mt-0.5 text-[13px] text-[#8E8E93]">Choose a verified partner for production and fulfillment.</Text>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4A3298" />
          </View>
        ) : printers.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="print-outline" size={64} className="text-[#D1D1D6] dark:text-[#3A3A3C]" />
            <Text className="mt-4 text-center text-[16px] text-[#8E8E93]">No print partners available in this region.</Text>
          </View>
        ) : (
          <FlatList
            data={printers}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            columnWrapperStyle={{ gap: 16 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSent = sentId === item.id;
              return (
                <View style={{ width: (SCREEN_WIDTH - 48) / 2 }} className="mb-4 overflow-hidden rounded-2xl border border-[#E5E5EA] bg-white dark:border-[#2C2C2E] dark:bg-[#1C1C1E]">
                  <View className="h-20 bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                    {item.cover ? <Image source={{ uri: item.cover }} className="h-full w-full" /> : null}
                    <View className="absolute bottom-[-20px] h-11 w-11 align-self-center overflow-hidden rounded-full border-2 border-white bg-[#4A3298] dark:border-[#1C1C1E]">
                      {item.avatar ? (
                        <Image source={{ uri: item.avatar }} className="h-full w-full" />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Text className="text-[14px] font-bold text-white">{item.name.slice(0, 1).toUpperCase()}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="items-center px-3 pb-4 pt-7">
                    <View className="mb-0.5 flex-row items-center">
                      <Text numberOfLines={1} className="text-[14px] font-bold text-[#1C1C1E] dark:text-white">{item.name}</Text>
                      <Ionicons name="checkmark-circle" size={14} color="#4A3298" className="ml-1" />
                    </View>
                    <Text numberOfLines={1} className="mb-2 text-[12px] text-[#8E8E93]">{item.role}</Text>
                    <Text className="mb-1 text-[11px] text-[#AEAEB2] dark:text-[#636366]">{item.distance} • {item.jobs} orders | {item.rating} ★</Text>
                    <Text className="mb-4 text-[11px] text-[#AEAEB2] dark:text-[#636366]">{item.location}</Text>

                    {isSent ? (
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text className="ml-1.5 text-[12px] font-semibold text-[#34C759]">Order Sent</Text>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => handleMessage(item)} className="w-full items-center rounded-full bg-[#4A3298] py-2.5">
                        <Text className="text-[13px] font-semibold text-white">Engage Partner</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Product Detail Component ─────────────────────────────────────────────────

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

  // 1. Hook straight into the shared context mutations
  const { setDesignFor, setTheme, setItems, setProductContext } = useCustomDesignStore();

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
  const artistName = (design as any).shopName || (design as any).brandName || design.designerName || `${design.profile.firstName} ${design.profile.lastName}`.trim() || design.profile.username || 'Berrystamp Studio';
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
    try { await ApiService.toggleFavorite(String(design.id)); } catch { setIsFavorite((prev) => !prev); }
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
      showAlert({ type: 'error', title: 'Transaction Failed', message: err?.response?.data?.message || 'Unable to update cart at this time.' });
    } finally {
      setAddingToCart(false);
    }
  };

  // 2. Updated to use CustomDesignContext state instead of URL params path construction
  const handleRequestCustomization = () => {
    setDesignFor('');
    setTheme('');
    setItems([]);
    setProductContext({
      sourceDesignId: design.id,
      sourceDesignTitle: design.title,
      sourceDesignImage: selectedMock?.imagePath || design.imagePath,
      designerId: design.designerId || design.profile.id,
      designerName: artistName,
      availableMocks: design.mocks.map((m) => ({
        id: m.id,
        name: m.name,
        imagePath: m.imagePath,
        price: m.price,
      })),
      selectedMockId: selectedMock?.id,
    });

    onClose();
    router.push('/(tabs)/create-custom-design'); // Simple navigation without param bundles
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Full Bleed Image Gallery */}
        <View style={{ width: SCREEN_WIDTH, height: GALLERY_HEIGHT }} className="bg-[#F5F5F7] dark:bg-[#1C1C1E]">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
          >
            {gallery.map((item) => (
              <View key={item.id} style={{ width: SCREEN_WIDTH, height: GALLERY_HEIGHT }}>
                {item.uri ? (
                  <Image source={{ uri: item.uri }} className="h-full w-full object-cover" resizeMode="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="image-outline" size={64} className="text-[#D1D1D6] dark:text-[#3A3A3C]" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Floating Action Header */}
          <View style={{ top: Math.max(insets.top, 20) }} className="absolute left-0 right-0 z-10 flex-row justify-between px-4">
            <TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-white/70">
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handleFavorite} className="h-10 w-10 items-center justify-center rounded-full bg-white/70">
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#FF3B30' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowShare(true)} className="h-10 w-10 items-center justify-center rounded-full bg-white/70">
                <Feather name="share" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pagination Counter */}
          {gallery.length > 1 && (
            <View className="absolute bottom-[30px] align-self-center rounded-xl bg-black/50 px-3 py-1.5">
              <Text className="text-[12px] font-semibold tracking-widest text-white">
                {galleryIndex + 1} / {gallery.length}
              </Text>
            </View>
          )}
        </View>

        {/* Content Box Container */}
        <View className="-mt-5 rounded-t-[24px] bg-white px-5 pt-7 pb-[120px] dark:bg-black">
          <View className="mb-2 flex-row items-flex-start justify-between gap-4">
            <Text className="flex-1 text-[22px] font-extrabold tracking-tight text-[#1C1C1E] dark:text-white">
              {design.title}
            </Text>
            <Text className="text-[22px] font-extrabold text-[#1C1C1E] dark:text-white">
              {formatNaira(lowestPrice)}
            </Text>
          </View>

          <Text className="mb-5 text-[15px] text-[#636366] dark:text-[#8E8E93]">
            Designed by <Text className="font-semibold text-[#4A3298]">{artistName}</Text>
          </Text>

          <Text className="mb-7 text-[15px] leading-6 text-[#3A3A3C] dark:text-[#E5E5EA]">
            {design.description || "Premium quality design crafted for exceptional aesthetics and comfort."}
          </Text>

          {cartSuccess && (
            <View className="mb-6 flex-row items-center rounded-6 border border-[#34C759] bg-[#F0FFF4] p-3.5 dark:bg-[#1C2E1C]">
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text className="ml-2.5 flex-1 text-[14px] font-semibold text-[#34C759]">Added to cart successfully</Text>
              <TouchableOpacity onPress={() => { router.push('/cart'); onClose(); }}>
                <Text className="text-[14px] font-bold text-[#1C1C1E] underline dark:text-white">View Cart</Text>
              </TouchableOpacity>
            </View>
          )}

           {/* Styles Selection */}
          <View className="border-t border-[#F5F5F7] pt-6 dark:border-[#2C2C2E]">
            <Text className="mb-4 text-[15px] font-bold text-[#1C1C1E] dark:text-white">Available Styles</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
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
                    style={{ width: 80 }}
                    className={`mr-4 overflow-hidden rounded-xl border-2 ${isActive ? 'border-[#4A3298]' : 'border-transparent'}`}
                  >
                    <View className="bg-[#F5F5F7] dark:bg-[#1C1C1E]" style={{ width: 80, height: 80 }}>
                      {mock.imagePath ? (
                        <Image source={{ uri: mock.imagePath }} className="h-full w-full" />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons name="shirt-outline" size={32} className="text-[#CCC] dark:text-[#555]" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Colors Selection */}
            {!!selectedMock?.colours?.length && (
              <View className="mb-6">
                <Text className="mb-4 text-[15px] font-bold text-[#1C1C1E] dark:text-white">Color Options</Text>
                <View className="flex-row flex-wrap gap-3">
                  {selectedMock.colours.map((colour) => (
                    <TouchableOpacity
                      key={colour}
                      onPress={() => setSelectedColour(colour)}
                      style={{ backgroundColor: colour, borderColor: selectedColour === colour ? '#4A3298' : (isDark ? '#2C2C2E' : '#E5E5EA') }}
                      className="h-10 w-10 rounded-full border-2 shadow-sm"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Size Selection */}
            {!!mockSizes.length && (
              <View className="mb-6">
                <Text className="mb-4 text-[15px] font-bold text-[#1C1C1E] dark:text-white">Size Selection</Text>
                <View className="flex-row flex-wrap gap-3">
                  {mockSizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      className={`min-w-[50px] items-center rounded-lg border px-4 py-3 ${selectedSize === size ? 'border-[#4A3298] bg-[#4A3298]' : 'border-[#E5E5EA] bg-transparent dark:border-[#2C2C2E]'}`}
                    >
                      <Text className={`text-[14px] font-semibold ${selectedSize === size ? 'text-white' : 'text-[#1C1C1E] dark:text-[#E5E5EA]'}`}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Quantity Selector */}
            <View className="mb-8 flex-row items-center justify-between">
              <Text className="text-[15px] font-bold text-[#1C1C1E] dark:text-white">Quantity</Text>
              <View className="flex-row items-center rounded-lg bg-[#F5F5F7] p-1 dark:bg-[#1C1C1E]">
                <TouchableOpacity onPress={() => setQuantity((q) => Math.max(1, q - 1))} className="h-9 w-9 items-center justify-center">
                  <Text className="text-[20px] font-medium text-[#1C1C1E] dark:text-white">−</Text>
                </TouchableOpacity>
                <Text className="w-10 text-center text-[16px] font-bold text-[#1C1C1E] dark:text-white">{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity((q) => q + 1)} className="h-9 w-9 items-center justify-center">
                  <Text className="text-[20px] font-medium text-[#1C1C1E] dark:text-white">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions Grid */}
            <TouchableOpacity onPress={handleRequestCustomization} className="mb-6 flex-row items-center justify-center rounded-xl border border-[#E5E5EA] py-4 dark:border-[#2C2C2E]">
              <Ionicons name="color-wand-outline" size={20} className="mr-2 text-[#1C1C1E] dark:text-white" />
              <Text className="text-[15px] font-semibold text-[#1C1C1E] dark:text-white">Request Custom Order</Text>
            </TouchableOpacity>

            <View className="mb-10 flex-row gap-4">
              <TouchableOpacity onPress={() => handleAddToCart(false)} disabled={addingToCart} className="flex-1 items-center rounded-xl border border-[#1C1C1E] py-[18px] bg-transparent dark:border-white">
                {addingToCart ? <ActivityIndicator size="small" className="text-[#1C1C1E] dark:text-white" /> : <Text className="text-[15px] font-bold text-[#1C1C1E] dark:text-white">Add to Cart</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAddToCart(true)} disabled={addingToCart} className="flex-1 items-center rounded-xl bg-[#4A3298] py-[18px]">
                <Text className="text-[15px] font-bold text-white">Print Now</Text>
              </TouchableOpacity>
            </View>

            {/* More Items from Same Designer */}
            {relatedDesigns.length > 0 && (
              <View>
                <Text className="mb-5 text-[18px] font-bold text-[#1C1C1E] dark:text-white">More from {artistName}</Text>
                <View className="flex-row flex-wrap justify-between">
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

// ─── Main Marketplace Controller Screen ───────────────────────────────────────

export default function ProductsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { element: alertElement } = useAppAlert();

  const { artistId, artistName: artistNameParam, designId, searchField } = useLocalSearchParams<{ artistId?: string; artistName?: string; designId?: string; searchField?: string; }>();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Design[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchField || '');
  const [filters, setFilters] = useState<SearchFilters>({ productCategories: [], designCategories: [], priceRange: [0, 9000], sortBy: 'Recently added' });
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const isSingleProduct = Boolean(designId);
  const [showPrinters, setShowPrinters] = useState(false);
  const [pendingCartItems, setPendingCartItems] = useState<any[]>([]);

  const loadProducts = useCallback(async (query: string, nextFilters: SearchFilters) => {
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
        designCategories: nextFilters.designCategories.length ? nextFilters.designCategories.join(',') : undefined,
        mockName: nextFilters.productCategories.length ? nextFilters.productCategories.join(',') : undefined,
        lowerPriceRange: nextFilters.priceRange[0],
        upperPriceRange: nextFilters.priceRange[1],
      });

      let list = normalizeDesignListResponse(res);
      if (nextFilters.sortBy === 'Low Price') list = list.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      else if (nextFilters.sortBy === 'High Price') list = list.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));

      setProducts(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load catalog right now.');
    } finally {
      setIsLoading(false);
    }
  }, [artistId, designId]);

  useFocusEffect(
    useCallback(() => {
      const syncFilters = async () => { setFilters(await getSearchFilters()); };
      syncFilters();
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(searchQuery, filters), searchQuery.trim() ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadProducts, searchQuery, filters]);

  const handleFavorite = async (id: number) => {
    setProducts((prev) => prev.map((d) => (d.id === id ? { ...d, liked: !d.liked } : d)));
    try { await ApiService.toggleFavorite(String(id)); } catch { setProducts((prev) => prev.map((d) => (d.id === id ? { ...d, liked: !d.liked } : d))); }
  };

  const handleCartAdded = (design: Design, mock: Mock, colour: string, size: string, qty: number) => {
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
        designerName: design.designerName || `${design.profile.firstName} ${design.profile.lastName}`.trim(),
      },
    ]);
  };

  if (isSingleProduct) {
    if (isLoading || (!selectedDesign && !error)) {
      return (
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
          <ActivityIndicator size="large" color="#4A3298" />
        </View>
      );
    }
    if (error || !selectedDesign) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text className="mt-3 text-center text-[#FF3B30]">{error || 'Could not load this product.'}</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-5 rounded-xl bg-[#4A3298] px-8 py-3.5">
            <Text className="font-semibold text-white">Return</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        <ProductDetailScreen design={selectedDesign} onClose={() => router.back()} onCartAdded={handleCartAdded} />
        <PrinterSelectionScreen visible={showPrinters} cartItems={pendingCartItems} onClose={() => setShowPrinters(false)} onSuccess={() => setPendingCartItems([])} />
        {alertElement}
      </>
    );
  }

  if (selectedDesign) {
    return (
      <>
        <ProductDetailScreen design={selectedDesign} onClose={() => setSelectedDesign(null)} onCartAdded={handleCartAdded} />
        <PrinterSelectionScreen visible={showPrinters} cartItems={pendingCartItems} onClose={() => setShowPrinters(false)} onSuccess={() => setPendingCartItems([])} />
        {alertElement}
      </>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Search Header area */}
      <View style={{ paddingTop: insets.top + 12 }} className="flex-row items-center bg-white px-5 pb-4 dark:bg-black">
        <TouchableOpacity onPress={() => router.back()} className="-ml-2.5 mr-3 h-10 w-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} className="text-[#1C1C1E] dark:text-white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[20px] font-extrabold tracking-tight text-[#1C1C1E] dark:text-white">
            {artistNameParam ? `${artistNameParam}'s Catalog` : 'The Marketplace'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => loadProducts(searchQuery, filters)} className="h-10 w-10 items-end justify-center">
          <Ionicons name="refresh-outline" size={22} className="text-[#1C1C1E] dark:text-white" />
        </TouchableOpacity>
      </View>

      {!designId && (
        <View className="flex-row items-center gap-3 px-5 py-3">
          <View className="h-12 flex-1 flex-row items-center rounded-xl bg-[#F5F5F7] px-4 dark:bg-[#1C1C1E]">
            <Ionicons name="search-outline" size={18} className="mr-2.5 text-[#8E8E93]" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search catalog..."
              placeholderTextColor="#8E8E93"
              className="flex-1 text-[15px] text-[#1C1C1E] dark:text-white"
              returnKeyType="search"
              onSubmitEditing={() => addSearchHistory(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} className="text-[#8E8E93]" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/Filter')} className="h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E]">
            <Ionicons name="options-outline" size={22} className="text-[#1C1C1E] dark:text-white" />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A3298" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={56} color="#FF3B30" />
          <Text className="mt-4 text-center text-[15px] text-[#FF3B30]">{error}</Text>
          <TouchableOpacity onPress={() => loadProducts(searchQuery, filters)} className="mt-6 rounded-xl bg-[#4A3298] px-8 py-3.5">
            <Text className="text-[15px] font-semibold text-white">Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="grid-outline" size={56} className="text-[#E5E5EA] dark:text-[#2C2C2E]" />
          <Text className="mt-4 text-center text-[15px] text-[#8E8E93]">No matching products found in the catalog.</Text>
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
            <ProductCard design={item} onPress={() => setSelectedDesign(item)} onFavorite={handleFavorite} />
          )}
        />
      )}
      {alertElement}
    </View>
  );
}