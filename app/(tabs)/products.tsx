import { useAppAlert } from "@/components/common/AppAlert";
import PrintPreferencesModal, { type PrintPreferencesResult } from "@/components/PrintPreferencesModal";
import { useCustomDesignStore } from "@/context/CustomDesignContext";
import { useShareAfterDismiss } from "@/hooks/use-share-after-dismiss";
import { formatNaira } from "@/lib/currency";
import {
  isInfluencerDesign,
  matchesProductCategory,
  normalizeDesign,
  normalizeDesignListResponse,
  STANDARD_SIZES,
} from '@/lib/designs';
import { SearchFilters, addSearchHistory, getSearchFilters } from "@/lib/localStorage";
import { resourceShareUrl, shareResourceLink } from "@/lib/sharing";
import ApiService from "@/services/apiClient";
import { Design, Mock } from "@/types";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2; 
const GALLERY_HEIGHT = SCREEN_WIDTH * 1.25;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getLowestPrice = (design: Design) => {
  const prices = design.mocks.map((m) => m.price).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : design.amount || 0;
};

const getMockSizes = (mock?: Mock | null): string[] => {
  if (!mock) return STANDARD_SIZES;
  const s = (mock as any).sizes ?? (mock as any).availableSizes ?? [];
  const parsed = Array.isArray(s)
    ? s.map(String).map((v) => v.trim()).filter(Boolean)
    : typeof s === 'string'
      ? s.split(',').map((v) => v.trim()).filter(Boolean)
      : [];
  return parsed.length ? parsed : STANDARD_SIZES;
};

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
  const imageUrl = design.imagePath?.startsWith('http') ? design.imagePath : design.imagePath ? `https://berrystamp-backend-production.up.railway.app/${design.imagePath}` : '';
  const isLocked = Boolean(
    design.locked ||
      design.printerId ||
      design.openForCustomization === false,
  );
  const isInfluencer = isInfluencerDesign(design);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ width: CARD_WIDTH }} className="mb-6 bg-transparent">
      <View style={{ height: CARD_WIDTH * 1.3 }} className="mb-3 overflow-hidden rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E]">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={120}
            recyclingKey={String(design.id)}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="image-outline" size={28} color={isDark ? '#555' : '#CCC'} />
          </View>
        )}

        {isLocked && (
          <View className="absolute left-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-black/70">
            <Ionicons name="lock-closed" size={15} color={isDark ? '#A993FF' : '#3E2F8A'} />
          </View>
        )}

        {isInfluencer && (
          <View className="absolute bottom-2.5 left-2.5 overflow-hidden rounded-full bg-[#0050BA]/95">
            <View className="flex-row items-center px-2.5 py-1">
              <MaterialCommunityIcons name="crown" size={12} color="#F9A70D" />
              <Text className="ml-1 text-[9px] font-bold tracking-wide text-white uppercase">
                Influencer
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => onFavorite(design.id)}
          className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-black/70"
        >
          <Ionicons
            name={design.liked ? 'heart' : 'heart-outline'}
            size={18}
            color={design.liked ? '#FF3B30' : (isDark ? '#FFF' : '#1C1C1E')}
          />
        </TouchableOpacity>
      </View>
      <View className="px-1">
        <Text numberOfLines={1} className="mb-1 text-[14px] font-semibold text-[#1C1C1E] dark:text-white">
          {design.title}
        </Text>
        <Text numberOfLines={1} className="mb-1.5 text-[12px] text-[#8E8E93]">
          by {artistName}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] font-extrabold text-[#3E2F8A] dark:text-[#A993FF]">
            {formatNaira(price)}
          </Text>
          <View className="flex-row items-center gap-1.5">
            {isInfluencer && (
              <MaterialCommunityIcons name="crown" size={15} color="#F9A70D" />
            )}
            {isLocked && (
              <Ionicons name="lock-closed" size={14} color={isDark ? '#A993FF' : '#3E2F8A'} />
            )}
          </View>
        </View>
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
  const isDark = useColorScheme() === 'dark';
  const sharing = useShareAfterDismiss(visible);
  if (!design) return null;

  const handleSocialShare = async (platform: string) => {
    const url = resourceShareUrl('design', design.id);
    const message = `Check out "${design.title}" on Berrystamp!\n${url}`;
    const encodedMessage = encodeURIComponent(message);
    const productUrl = encodeURIComponent(url);
    
    let appUrl = '';
    let webUrl = '';

    switch (platform) {
      case 'Whatsapp':
        appUrl = `whatsapp://send?text=${encodedMessage}`;
        webUrl = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'X':
        appUrl = `twitter://post?message=${encodedMessage}`;
        webUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        break;
      case 'Facebook':
        webUrl = `https://www.facebook.com/sharer/sharer.php?u=${productUrl}&quote=${encodedMessage}`;
        break;
      case 'LinkedIn':
        webUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${productUrl}`;
        break;
    }

    try {
      if (appUrl) {
        await Linking.openURL(appUrl).catch(() => (webUrl ? Linking.openURL(webUrl) : undefined));
      } else if (webUrl) {
        await Linking.openURL(webUrl);
      }
    } catch (e) {
      console.warn(`Could not open ${platform}`, e);
    }
    onClose();
  };

  const handleCopy = async () => {
    try {
      await shareResourceLink(
        `Check out "${design.title}" on Berrystamp.`,
        resourceShareUrl('design', design.id),
      );
    } catch { }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onDismiss={sharing.onDismiss}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <View 
          onStartShouldSetResponder={() => true} 
          className="rounded-t-[32px] bg-white p-6 pb-12 dark:bg-[#1C1C1E]"
        >
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-[20px] font-extrabold text-[#1C1C1E] dark:text-white">Share Product</Text>
            <TouchableOpacity onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E]">
              <Ionicons name="close" size={20} color={isDark ? '#FFF' : '#1C1C1E'} />
            </TouchableOpacity>
          </View>

          <View className="mb-8 flex-row justify-between px-2">
            {['Whatsapp', 'X', 'LinkedIn', 'Facebook'].map((label) => (
              <TouchableOpacity key={label} onPress={() => handleSocialShare(label)} className="items-center">
                <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-[#3E2F8A]">
                  <Ionicons name="share-social-outline" size={26} color="#FFF" />
                </View>
                <Text className="text-center text-[12px] font-medium text-[#8E8E93]">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center rounded-2xl bg-[#F5F5F7] p-3 dark:bg-[#2C2C2E]">
            <View className="mr-3 h-14 w-14 overflow-hidden rounded-xl bg-[#E0E0E0]">
              {design.imagePath ? <Image source={{ uri: design.imagePath }} style={{ width: "100%", height: "100%" }} contentFit="cover" cachePolicy="memory-disk" /> : null}
            </View>
            <View className="flex-1">
              <Text numberOfLines={1} className="text-[16px] font-bold text-[#1C1C1E] dark:text-white">
                {design.title}
              </Text>
              <Text numberOfLines={1} className="mt-1 text-[13px] text-[#8E8E93]">
                Berrystamp Exclusives
              </Text>
            </View>
            <TouchableOpacity onPress={() => sharing.share(handleCopy, onClose)} className="ml-3 rounded-xl bg-[#3E2F8A] px-5 py-3">
              <Text className="text-[14px] font-bold text-white">Share link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
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
  const { show: showAlert, element: alertElement } = useAppAlert();
  const { setDesignFor, setTheme, setItems, setProductContext } = useCustomDesignStore();

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedMock, setSelectedMock] = useState<Mock | null>(design.mocks[0] || null);
  const [selectedColour, setSelectedColour] = useState<string>(design.mocks[0]?.colours?.[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(() => getMockSizes(design.mocks[0])[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(design.liked);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [relatedDesigns, setRelatedDesigns] = useState<Design[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pendingPrintCartItems, setPendingPrintCartItems] = useState<any[]>([]);

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
  const lowestPrice = useMemo(() => getLowestPrice(design), [design]);

  useEffect(() => {
    const urls = [
      ...gallery.map((g) => g.uri),
      ...design.mocks.map((m) => m.imagePath),
      design.profile?.profilePicturePath,
    ].filter((u): u is string => Boolean(u && u.startsWith('http')));
    if (urls.length > 0) {
      Image.prefetch(Array.from(new Set(urls)), 'memory-disk').catch(() => {});
    }
  }, [gallery, design.mocks, design.profile?.profilePicturePath]);

  useEffect(() => {
    ApiService.getDesigns({ page: 0, size: 8, designer: design.designerId })
      .then((res) => {
        const list = normalizeDesignListResponse(res).filter((d) => d.id !== design.id).slice(0, 6);
        setRelatedDesigns(list);
      })
      .catch(() => { });
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
        setPendingPrintCartItems([{
          id: String(design.id), designId: Number(design.id), mockId: Number(selectedMock.id),
          name: design.title, imageUrl: selectedMock?.imagePath || design.imagePath || '', price: selectedMock?.price || design.amount || 0,
          quantity, colour: selectedColour || '', size: selectedSize || '', variantText: [selectedColour, selectedSize].filter(Boolean).join(' / '),
          designerName: artistName,
          printerId: design.printerId,
          printerName: design.printerName,
        }]);
        setShowPrintModal(true);
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

  const handlePrintPreferencesContinue = async (result: PrintPreferencesResult) => {
    setShowPrintModal(false);
    const isLocked = Boolean(design.locked || design.printerId || design.openForCustomization === false);
    if (isLocked) {
      if (!design.printerId) {
        showAlert({
          type: 'error',
          title: 'Printer Unavailable',
          message: 'This product is locked, but no printer is attached to it yet.',
        });
        return;
      }
      if (pendingPrintCartItems.length > 0) {
        try {
          setAddingToCart(true);
          const payload = pendingPrintCartItems.map((item) => ({
            designId: Number(item.designId),
            colour: item.colour || '',
            quantity: Number(item.quantity) || 1,
            size: item.size || '',
            mockItemId: Number(item.mockId),
            customDesign: false,
            sourceOfItem: result.hasOwnItem ? 'From Customer' : 'From Printer',
            estimatedAmount: Number(item.price || 0) * (Number(item.quantity) || 1),
            dateOfDelivery: result.dateOfDelivery || '',
            deliveryAddress: {
              name: result.deliveryAddress.name,
              address: result.deliveryAddress.name,
              latitude: result.deliveryAddress.latitude,
              longitude: result.deliveryAddress.longitude,
              country: 'Nigeria',
            },
            printerId: Number(design.printerId),
          }));
          const res = await ApiService.createPrintOrders(payload);
          const responseBody: any[] = res?.responseBody ?? res ?? [];
          const firstOrder = Array.isArray(responseBody) ? responseBody[0] : responseBody;
          const conversationId = firstOrder?.conversationId;
          const createdOrderRequestId = firstOrder?.id;
          onClose();
          router.push({
            pathname: '/(tabs)/chat',
            params: {
              ...(conversationId ? { conversationId: String(conversationId) } : {}),
              participantId: String(design.printerId),
              participantName: design.printerName || 'Assigned Printer',
              participantRole: 'Printers',
              ...(createdOrderRequestId ? { orderId: String(createdOrderRequestId) } : {}),
            },
          });
          return;
        } catch (err: any) {
          showAlert({
            type: 'error',
            title: 'Order Failed',
            message: err?.response?.data?.responseMessage || err?.message || 'Unable to send print order.',
          });
          return;
        } finally {
          setAddingToCart(false);
        }
      }
    }
    onClose();
    router.push({
      pathname: '/(tabs)/select-printer',
      params: {
        cartItems: JSON.stringify(pendingPrintCartItems), dateOfDelivery: result.dateOfDelivery, deliveryAddress: JSON.stringify(result.deliveryAddress),
        hasOwnItem: String(result.hasOwnItem), ...(result.pickupAddress ? { pickupAddress: JSON.stringify(result.pickupAddress) } : {}),
      },
    });
  };

  const handleRequestCustomization = () => {
    setDesignFor(''); setTheme(''); setItems([]);
    setProductContext({
      sourceDesignId: design.id, sourceDesignTitle: design.title, sourceDesignImage: selectedMock?.imagePath || design.imagePath,
      designerId: design.designerId || design.profile.id, designerName: artistName,
      availableMocks: design.mocks.map((m) => ({ id: m.id, name: m.name, imagePath: m.imagePath, price: m.price })),
      selectedMockId: selectedMock?.id,
    });
    onClose();
    router.push('/(tabs)/create-custom-design');
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Full Bleed Image Gallery */}
        <View style={{ width: SCREEN_WIDTH, height: GALLERY_HEIGHT }} className="bg-[#F5F5F7] dark:bg-[#1C1C1E]">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}>
            {gallery.map((item) => (
              <View key={item.id} style={{ width: SCREEN_WIDTH, height: GALLERY_HEIGHT }}>
                {item.uri ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    priority="high"
                    transition={120}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="image-outline" size={64} className="text-[#D1D1D6] dark:text-[#3A3A3C]" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* SLEEK FLOATING ACTION HEADER */}
          <View style={{ top: Math.max(insets.top, 10) }} className="absolute left-4 right-4 z-10 flex-row items-center justify-between">
            {/* Back Button */}
            <TouchableOpacity onPress={onClose} className="h-11 w-11 items-center justify-center rounded-full bg-black/40 shadow-sm backdrop-blur-md">
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" className="ml-[-2px]" />
            </TouchableOpacity>

            {/* Actions */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={handleFavorite} className="h-11 w-11 items-center justify-center rounded-full bg-black/40 shadow-sm backdrop-blur-md">
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#FF3B30" : "#FFFFFF"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowShare(true)} className="h-11 w-11 items-center justify-center rounded-full bg-black/40 shadow-sm backdrop-blur-md">
                <Feather name="share" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pagination Counter */}
          {gallery.length > 1 && (
            <View className="absolute bottom-10 right-4 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md">
              <Text className="text-[12px] font-bold tracking-widest text-white">
                {galleryIndex + 1} / {gallery.length}
              </Text>
            </View>
          )}
        </View>

        {/* Content Box Container */}
        <View className="-mt-6 bg-white px-6 pt-8 pb-[120px] rounded-t-[32px] dark:bg-black shadow-sm">
          
          {/* Top Title & Price Section */}
          <View className="flex-row items-start justify-between gap-4 mb-5">
            <View className="flex-1">
              <Text className="text-[24px] font-extrabold tracking-tight text-[#1C1C1E] dark:text-white">
                {design.title}
              </Text>
              
              {/* Designer Info moved securely into the layout hierarchy */}
              <View className="mt-3 flex-row items-center">
                <View className="mr-2 h-7 w-7 overflow-hidden rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E]">
                  {design.profile?.profilePicturePath ? (
                    <Image
                      source={{ uri: design.profile.profilePicturePath }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center bg-[#3E2F8A]">
                      <Text className="text-[11px] font-bold text-white">{artistName?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[14px] font-medium text-[#8E8E93]">
                  {artistName}
                </Text>
              </View>
            </View>

            <Text className="text-[24px] font-extrabold text-[#3E2F8A] dark:text-[#A993FF]">
              {formatNaira(lowestPrice)}
            </Text>
          </View>

          {(design.locked ||
            design.printerId ||
            design.openForCustomization === false ||
            design.influencerMerch ||
            design.influencerDesign) && (
            <View className="mb-4 flex-row flex-wrap items-center gap-2">
              {(design.influencerMerch || design.influencerDesign) && (
                <View className="flex-row items-center rounded-full bg-[#0050BA]/15 px-3 py-1.5 dark:bg-[#0050BA]/30">
                  <MaterialCommunityIcons name="crown" size={14} color="#F9A70D" />
                  <Text className="ml-1.5 text-[11px] font-bold text-[#0050BA] dark:text-[#7BB0FF] uppercase">
                    Influencer Merch
                  </Text>
                </View>
              )}
              {(design.locked || design.printerId || design.openForCustomization === false) && (
                <View className="flex-row items-center rounded-full bg-[#3E2F8A]/10 px-3 py-1.5 dark:bg-[#3E2F8A]/30">
                  <Ionicons name="lock-closed" size={13} color={isDark ? '#A993FF' : '#3E2F8A'} />
                  <Text className="ml-1.5 text-[11px] font-semibold text-[#3E2F8A] dark:text-[#A993FF]">
                    {design.printerName ? `Locked to ${design.printerName}` : 'Locked Item'}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Text className="mb-8 text-[15px] leading-6 text-[#3A3A3C] dark:text-[#D1D1D6]">
            {design.description || "Premium quality design crafted for exceptional aesthetics and comfort. Explore the styles below to personalize your fit."}
          </Text>

          {/* Styles Selection */}
          <View className="border-t border-[#F5F5F7] pt-8 dark:border-[#2C2C2E]">
            <Text className="mb-4 text-[16px] font-bold text-[#1C1C1E] dark:text-white">Available Styles</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
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
                    style={{ width: 85, height: 85 }}
                    className={`mr-4 overflow-hidden rounded-2xl border-2 ${isActive ? 'border-[#3E2F8A]' : 'border-transparent bg-[#F5F5F7] dark:bg-[#1C1C1E]'}`}
                  >
                    {mock.imagePath ? (
                      <Image
                        source={{ uri: mock.imagePath }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        priority="high"
                        transition={120}
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="shirt-outline" size={32} className="text-[#CCC] dark:text-[#555]" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Colors Selection */}
            {!!selectedMock?.colours?.length && (
              <View className="mb-8">
                <Text className="mb-4 text-[16px] font-bold text-[#1C1C1E] dark:text-white">Color Options</Text>
                <View className="flex-row flex-wrap gap-4">
                  {selectedMock.colours.map((colour) => (
                    <TouchableOpacity
                      key={colour}
                      onPress={() => setSelectedColour(colour)}
                      style={{ backgroundColor: colour, borderColor: selectedColour === colour ? '#3E2F8A' : (isDark ? '#3A3A3C' : '#E5E5EA') }}
                      className={`h-11 w-11 rounded-full border-[3px] shadow-sm ${selectedColour === colour ? 'scale-110' : ''}`}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Size Selection */}
            <View className="mb-8">
              <Text className="mb-4 text-[16px] font-bold text-[#1C1C1E] dark:text-white">Size</Text>
              <View className="flex-row flex-wrap gap-3">
                {(mockSizes.length ? mockSizes : STANDARD_SIZES).map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`min-w-[60px] items-center rounded-xl border-2 px-4 py-3 ${selectedSize === size ? 'border-[#3E2F8A] bg-[#3E2F8A]' : 'border-[#E5E5EA] bg-transparent dark:border-[#3A3A3C]'}`}
                  >
                    <Text className={`text-[15px] font-bold ${selectedSize === size ? 'text-white' : 'text-[#1C1C1E] dark:text-white'}`}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity Selector */}
            <View className="mb-10 flex-row items-center justify-between">
              <Text className="text-[16px] font-bold text-[#1C1C1E] dark:text-white">Quantity</Text>
              <View className="flex-row items-center rounded-xl bg-[#F5F5F7] p-1 dark:bg-[#1C1C1E]">
                <TouchableOpacity onPress={() => setQuantity((q) => Math.max(1, q - 1))} className="h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-[#2C2C2E]">
                  <Text className="text-[20px] font-medium text-[#1C1C1E] dark:text-white">−</Text>
                </TouchableOpacity>
                <Text className="w-12 text-center text-[16px] font-bold text-[#1C1C1E] dark:text-white">{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity((q) => q + 1)} className="h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-[#2C2C2E]">
                  <Text className="text-[20px] font-medium text-[#1C1C1E] dark:text-white">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions Grid */}
            <TouchableOpacity onPress={handleRequestCustomization} className="mb-4 flex-row items-center justify-center rounded-2xl border-2 border-[#E5E5EA] py-4 dark:border-[#2C2C2E]">
              <Ionicons name="color-wand-outline" size={20} className="mr-2 text-[#1C1C1E] dark:text-white" />
              <Text className="text-[16px] font-bold text-[#1C1C1E] dark:text-white">Request Custom Order</Text>
            </TouchableOpacity>

            <View className="mb-10 flex-row gap-4">
              <TouchableOpacity onPress={() => handleAddToCart(false)} disabled={addingToCart} className="flex-1 h-14 items-center justify-center rounded-2xl border-2 border-[#3E2F8A] bg-transparent">
                {addingToCart ? <ActivityIndicator size="small" color="#3E2F8A" /> : <Text className="text-[16px] font-bold text-[#3E2F8A] dark:text-[#A993FF]">Add to Cart</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAddToCart(true)} disabled={addingToCart} className="flex-1 h-14 items-center justify-center rounded-2xl bg-[#3E2F8A] shadow-md shadow-[#3E2F8A]/30">
                <Text className="text-[16px] font-bold text-white">Print Now</Text>
              </TouchableOpacity>
            </View>

            {/* More Items from Same Designer */}
            {relatedDesigns.length > 0 && (
              <View>
                <Text className="mb-6 text-[20px] font-extrabold text-[#1C1C1E] dark:text-white">More from {artistName}</Text>
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

      {/* Success Toast */}
      {cartSuccess && (
        <View className="absolute bottom-10 left-6 right-6 z-50">
          <View className="flex-row items-center rounded-2xl border border-[#34C759]/20 bg-white px-4 py-4 shadow-xl dark:border-[#34C759]/20 dark:bg-[#1C1C1E]">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#34C759]/15">
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-[#1C1C1E] dark:text-white">Added to Cart</Text>
              <Text className="text-[12px] text-[#8E8E93]">Item saved successfully</Text>
            </View>
            <TouchableOpacity onPress={() => { router.push('/cart'); onClose(); }} className="rounded-xl bg-[#F5F5F7] px-4 py-2.5 dark:bg-[#2C2C2E]">
              <Text className="text-[13px] font-bold text-[#3E2F8A] dark:text-[#A993FF]">View Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ShareSheet visible={showShare} design={design} onClose={() => setShowShare(false)} />
      <PrintPreferencesModal visible={showPrintModal} onClose={() => setShowPrintModal(false)} onContinue={handlePrintPreferencesContinue} />
      {alertElement}
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

  const loadProducts = useCallback(async (query: string, nextFilters: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      if (designId) {
        const res = await ApiService.fetchDesignById(Number(designId));
        const normalized = normalizeDesign(res?.responseBody || res);
        setSelectedDesign(normalized);
        const singleUrls = [
          normalized.imagePath,
          ...normalized.mocks.map((m) => m.imagePath),
        ].filter((u): u is string => Boolean(u && u.startsWith('http')));
        if (singleUrls.length > 0) {
          Image.prefetch(Array.from(new Set(singleUrls)), 'memory-disk').catch(() => {});
        }
        return;
      }

      const res = await ApiService.getDesigns({
        page: 0,
        size: 60,
        designer: artistId ? Number(artistId) : undefined,
        searchField: query.trim() || undefined,
        designCategories: nextFilters.designCategories.length ? nextFilters.designCategories.join(',') : undefined,
        lowerPriceRange: nextFilters.priceRange[0],
        upperPriceRange: nextFilters.priceRange[1],
      });

      let list = normalizeDesignListResponse(res);
      if (nextFilters.productCategories.length) {
        list = list.filter((design) => matchesProductCategory(design, nextFilters.productCategories));
      }
      if (nextFilters.sortBy === 'Low Price') list = list.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      else if (nextFilters.sortBy === 'High Price') list = list.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));

      setProducts(list);
      const listUrls = list
        .slice(0, 30)
        .flatMap((d) => [d.imagePath, ...d.mocks.slice(0, 2).map((m) => m.imagePath)])
        .filter((u): u is string => Boolean(u && u.startsWith('http')));
      if (listUrls.length > 0) {
        Image.prefetch(Array.from(new Set(listUrls)), 'memory-disk').catch(() => {});
      }
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

  const handleCartAdded = () => {};

  if (isSingleProduct) {
    if (isLoading || (!selectedDesign && !error)) {
      return (
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
          <ActivityIndicator size="large" color="#3E2F8A" />
        </View>
      );
    }
    if (error || !selectedDesign) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
          <Ionicons name="alert-circle-outline" size={56} color="#FF3B30" />
          <Text className="mt-4 text-center text-[16px] text-[#FF3B30]">{error || 'Could not load this product.'}</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-6 rounded-xl bg-[#3E2F8A] px-8 py-4">
            <Text className="font-bold text-white">Return</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        <ProductDetailScreen design={selectedDesign} onClose={() => router.back()} onCartAdded={handleCartAdded} />
        {alertElement}
      </>
    );
  }

  if (selectedDesign) {
    return (
      <>
        <ProductDetailScreen design={selectedDesign} onClose={() => setSelectedDesign(null)} onCartAdded={handleCartAdded} />
        {alertElement}
      </>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      
      {/* PERFECTLY CENTERED MAIN HEADER */}
      <View style={{ paddingTop: Math.max(insets.top, 16) }} className="flex-row items-center justify-between px-5 pb-3">
        {/* Left Side: Back */}
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E]">
          <Ionicons name="chevron-back" size={22} color={isDark ? "#FFFFFF" : "#1C1C1E"} className="ml-[-2px]" />
        </TouchableOpacity>
        
        {/* Center: Title */}
        <View className="flex-1 items-center px-2">
          <Text numberOfLines={1} className="text-[18px] font-bold tracking-wide text-[#1C1C1E] dark:text-white">
            {artistNameParam ? `${artistNameParam}'s Catalog` : 'Marketplace'}
          </Text>
        </View>
        
        {/* Right Side: Refresh */}
        <TouchableOpacity onPress={() => loadProducts(searchQuery, filters)} className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E]">
          <Ionicons name="refresh" size={20} color={isDark ? "#FFFFFF" : "#1C1C1E"} />
        </TouchableOpacity>
      </View>

      {!designId && (
        <View className="flex-row items-center gap-3 px-5 py-3">
          <View className="h-[52px] flex-1 flex-row items-center rounded-2xl bg-[#F5F5F7] px-4 dark:bg-[#1C1C1E]">
            <Ionicons name="search" size={20} color={isDark ? "#8E8E93" : "#8E8E93"} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search catalog..."
              placeholderTextColor="#8E8E93"
              className="ml-2 flex-1 text-[16px] text-[#1C1C1E] dark:text-white"
              returnKeyType="search"
              onSubmitEditing={() => addSearchHistory(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                <Ionicons name="close-circle" size={18} className="text-[#8E8E93]" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/Filter')} className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#3E2F8A] shadow-md shadow-[#3E2F8A]/30">
            <Ionicons name="options" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3E2F8A" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text className="mt-4 text-center text-[16px] text-[#FF3B30]">{error}</Text>
          <TouchableOpacity onPress={() => loadProducts(searchQuery, filters)} className="mt-8 rounded-2xl bg-[#3E2F8A] px-8 py-4">
            <Text className="text-[16px] font-bold text-white">Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="shirt-outline" size={64} className="text-[#E5E5EA] dark:text-[#2C2C2E]" />
          <Text className="mt-4 text-center text-[16px] font-medium text-[#8E8E93]">No matching products found.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 }}
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
