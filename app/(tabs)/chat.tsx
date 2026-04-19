import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarBadge } from '@/components/messages/AvatarBadge';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ENV } from '@/lib/config/env';
import { appendLocalConversationMessage, getLocalConversationById } from '@/lib/localConversations';
import { normalizeManageOrder } from '@/lib/orders';
import {
  normalizeMessagesResponse,
  normalizeConversationsResponse,
  type ChatMessageDto,
  type ConversationSummaryDto,
} from '@/lib/messages';
import ApiService from '@/services/apiClient';

const OFFER_DETAILS = {
  title: 'Screen printing on items (Long Sleeve and tote)',
  description:
    'Printer will source the long sleeve shirts while tote bags will be picked up from the customer. Delivery timeline is within three working days after approval.',
  amount: '₦10,000',
  source: 'Long sleeve by printer, tote bag supplied by customer',
  logistics: 'Pickup logistics requested',
};

const IMAGE_FILE_PATTERN = /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)(\?.*)?$/i;

const formatMessageTime = (value?: string | number | Date) => {
  if (!value) return 'Now';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Now';

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateLabel = (value?: string) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US');
};

const formatCurrency = (value?: string | number) => {
  const numeric = Number(value || 0);
  if (!numeric) return 'N/A';
  return `₦${numeric.toLocaleString()}`;
};

const resolveImageUri = (value?: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }

  const normalizedPath = trimmed.replace(/^\/+/, '');
  return `${ENV.BASE_URL}/${normalizedPath}`;
};

const isImageContent = (text?: string) => {
  const trimmed = String(text || '').trim();
  if (!trimmed || /\s/.test(trimmed)) return false;

  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('data:image/') ||
    IMAGE_FILE_PATTERN.test(trimmed)
  );
};

const withImageMetadata = (message: ChatMessageDto & { imageUrl?: string }) => {
  const imageCandidate = message.imageUrl || message.text;
  const imageUrl = isImageContent(imageCandidate) ? resolveImageUri(imageCandidate) : undefined;

  return {
    ...message,
    imageUrl,
  };
};

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { uploadFile, uploading } = useFileUpload();
  const insets = useSafeAreaInsets();
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeIconColor = isDark ? '#FFFFFF' : '#000000';
  const themeSecondaryIconColor = isDark ? '#94a3b8' : '#64748b';

  const { conversationId, participantId, participantName, printerId, localConversationId, participantRole, orderId, chatType } = useLocalSearchParams<{
    conversationId?: string;
    participantId?: string;
    participantName?: string;
    printerId?: string;
    localConversationId?: string;
    participantRole?: string;
    orderId?: string;
    chatType?: string;
  }>();

  const [conversation, setConversation] = useState<ConversationSummaryDto>({
    id: String(localConversationId || conversationId || printerId || 'new-conversation'),
    source: String(localConversationId || '').startsWith('local-') ? 'local' : 'backend',
    name: participantName || 'Conversation',
    role: participantRole === 'Printers' ? 'Printers' : 'Designer',
    avatarColor: '#A9D8FF',
    avatarEmoji: '✨',
    avatarInitials: String(participantName || 'Conversation')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'C',
    lastMessage: '',
    unreadCount: 0,
    updatedAtLabel: 'Now',
    participantId: participantId ? Number(participantId) : printerId ? Number(printerId) : undefined,
    participants: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<(ChatMessageDto & { imageUrl?: string })[]>([]);
  const [draft, setDraft] = useState('');
  const [showConversationActions, setShowConversationActions] = useState(false);
  const [showOfferDetail, setShowOfferDetail] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null); // State for the Product modal
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [orderDetailsByMessageId, setOrderDetailsByMessageId] = useState<Record<string, any>>({});
  const [chatOrderDetail, setChatOrderDetail] = useState<any>(null);
  const isLocalConversation = Boolean(localConversationId && String(localConversationId).startsWith('local-'));

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', 
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', 
      () => setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const me = await ApiService.getCurrentUser();

        if (isLocalConversation) {
          const localConversation = await getLocalConversationById(String(localConversationId));
          if (localConversation) {
            setConversation((current) => ({
              ...current,
              id: localConversation.id,
              name: localConversation.name,
              role: localConversation.role,
              participantId: localConversation.participantId,
            }));
            setMessages(
              localConversation.messages.map((message) =>
                message.type === 'bundle' && message.bundle
                  ? {
                      id: message.id,
                      type: 'bundle',
                      author: message.author,
                      text: message.text,
                      createdAtLabel: formatMessageTime(message.createdAt),
                      status: message.status,
                      bundle: {
                        title: message.bundle.title || 'Selected products',
                        productCount: message.bundle.productCount,
                        footerLabel: message.bundle.footerLabel,
                        items: message.bundle.items.map((item) => ({
                          id: item.id,
                          imageUrl: item.imageUrl ? resolveImageUri(item.imageUrl) : undefined,
                          overlayText: item.overlayText,
                          name: item.name,
                          title: item.title,
                          price: item.price,
                          quantity: item.quantity,
                          colour: item.colour,
                          color: item.color,
                          size: item.size,
                          variantText: item.variantText,
                          designerName: item.designerName,
                          printingType: item.printingType,
                          budget: item.budget,
                          deliveryDate: item.deliveryDate,
                          preferredDeliveryDate: item.preferredDeliveryDate,
                          deliveryAddress: item.deliveryAddress,
                          pickupAddress: item.pickupAddress,
                          itemAvailability: item.itemAvailability,
                          inventorySource: item.inventorySource,
                          hasOwnItem: item.hasOwnItem,
                        })),
                      },
                    }
                  : {
                      id: message.id,
                      type: 'text',
                      author: message.author,
                      text: message.text,
                      imageUrl: isImageContent(message.text) ? resolveImageUri(message.text) : undefined,
                      createdAtLabel: formatMessageTime(message.createdAt),
                      status: message.status,
                    },
              ),
            );
          }
        } else if (conversationId) {
          const [convoRes, messagesRes] = await Promise.all([
            ApiService.getConversations(0, 80),
            ApiService.getConversationMessages(String(conversationId), 0, 100),
          ]);

          const allConversations = normalizeConversationsResponse(convoRes);
          const selected = allConversations.find((item) => item.id === String(conversationId));
          if (selected) {
            setConversation((current) => ({ ...current, ...selected }));
          }

          const myId = me?.id || me?.userId || me?.profileId;
          const normalizedMessages = normalizeMessagesResponse(messagesRes, myId).map((item) => {
            const senderId = item.sender?.id || item.sender?.userId;
            const receiverId = item.receiver?.id || item.receiver?.userId;
            const resolvedAuthor =
              Number(senderId) === Number(selected?.participantId || participantId)
                ? 'other'
                : Number(receiverId) === Number(selected?.participantId || participantId)
                  ? 'me'
                  : item.author;

            return withImageMetadata({
              ...item,
              author: resolvedAuthor,
            });
          });

          setMessages(normalizedMessages);

          const unreadIncomingMessageIds = normalizedMessages
            .filter((item) => item.author === 'other' && item.status !== 'seen')
            .map((item) => String(item.messageIdentifier || item.id))
            .filter(Boolean);

          if (unreadIncomingMessageIds.length) {
            Promise.allSettled(unreadIncomingMessageIds.map((messageId) => ApiService.markMessageAsRead(messageId))).catch(() => {});
          }
        }
      } catch (error) {
        console.error('Failed to load chat', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [conversationId, isLocalConversation, localConversationId, participantId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    if (!orderId) {
      setChatOrderDetail(null);
      return;
    }

    ApiService.getOrderById(String(orderId))
      .then((response) => setChatOrderDetail(normalizeManageOrder(response)))
      .catch(() => setChatOrderDetail(null));
  }, [orderId]);

  useEffect(() => {
    const orderMessages = messages.filter((message) => {
      const orderIdVal = Number(message.text || message.caption || 0);
      return message.chatType === 'ORDER' && Number.isFinite(orderIdVal) && orderIdVal > 0 && !orderDetailsByMessageId[message.id];
    });

    if (!orderMessages.length) return;

    Promise.allSettled(
      orderMessages.map(async (message) => {
        const orderIdVal = Number(message.text || message.caption || 0);
        const response = await ApiService.getOrderById(orderIdVal);
        const order = normalizeManageOrder(response);
        return { messageId: message.id, order };
      }),
    ).then((results) => {
      const next: Record<string, any> = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          next[result.value.messageId] = result.value.order;
        }
      });

      if (Object.keys(next).length) {
        setOrderDetailsByMessageId((current) => ({ ...current, ...next }));
      }
    });
  }, [messages, orderDetailsByMessageId]);

  const currentOrderDetail =
    chatOrderDetail ||
    Object.values(orderDetailsByMessageId)[0] ||
    null;

  const headerSubtitle = currentOrderDetail
    ? `${currentOrderDetail.status} • ${currentOrderDetail.dueOn !== 'N/A' ? `Due ${currentOrderDetail.dueOn}` : formatCurrency(currentOrderDetail.amount)}`
    : conversation.role;

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newMessage: ChatMessageDto & { imageUrl?: string } = {
      id: `local-${Date.now()}`,
      type: 'text' as const,
      author: 'me',
      text: trimmed,
      createdAtLabel: formatMessageTime(new Date()),
      status: 'sent',
    };

    setMessages((current) => [...current, newMessage]);
    setDraft('');

    try {
      if (isLocalConversation) {
        await appendLocalConversationMessage(String(localConversationId), {
          id: newMessage.id,
          text: trimmed,
          author: 'me',
          createdAt: new Date().toISOString(),
          status: 'sent',
        });
      } else {
        const payload = {
          toProfileId: Number(conversation.participantId || participantId || 0),
          content: trimmed,
          caption: '',
          chatType: String(chatType || conversation.lastMessageDetail?.chatType || 'ORDER'),
        };

        if (orderId) {
          await ApiService.sendOrderMessage(String(orderId), payload);
        } else {
          await ApiService.sendMessage(payload);
        }
      }
    } catch (error) {
      console.warn('Message endpoint unavailable', error);
    }
  };

  const handlePickAndUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        const uploaded = await uploadFile(uri);
        
        if (uploaded?.path) {
          const newMessage: ChatMessageDto & { imageUrl?: string } = {
            id: `img-${Date.now()}`,
            type: 'text' as const,
            author: 'me',
            text: uploaded.path,
            imageUrl: resolveImageUri(uploaded.path),
            createdAtLabel: formatMessageTime(new Date()),
            status: 'sent',
          };

          setMessages((current) => [...current, newMessage]);

          if (isLocalConversation) {
            await appendLocalConversationMessage(String(localConversationId), {
              id: newMessage.id,
              text: uploaded.path,
              author: 'me',
              createdAt: new Date().toISOString(),
              status: 'sent',
            });
          } else {
            const payload = {
              toProfileId: Number(conversation.participantId || participantId || 0),
              content: uploaded.path,
              caption: '',
              chatType: String(chatType || conversation.lastMessageDetail?.chatType || 'ORDER'),
            };

            if (orderId) {
              await ApiService.sendOrderMessage(String(orderId), payload);
            } else {
              await ApiService.sendMessage(payload);
            }
          }
        }
      } catch (error) {
        console.error('Image upload failed', error);
      }
    }
  };

  const renderMessage = (message: ChatMessageDto & { imageUrl?: string }) => {
    const orderDetail = orderDetailsByMessageId[message.id];
    const isMe = message.author === 'me';

    if (message.chatType === 'ORDER' && orderDetail) {
      const gallery = Array.isArray(orderDetail.uploadedDesigns)
        ? orderDetail.uploadedDesigns.map((uri: string) => resolveImageUri(uri)).filter(Boolean)
        : [];

      return (
        <View key={message.id} className={`w-full my-1 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
          {!isMe && (
            <View className="mr-2 self-end mb-1">
              <AvatarBadge
                color={conversation.avatarColor}
                emoji={conversation.avatarEmoji}
                imageUrl={conversation.avatarThumbnailUrl || conversation.avatarPreviewUrl || conversation.avatarImageUrl}
                label={conversation.avatarInitials}
                size={32}
              />
            </View>
          )}
          <View className={`max-w-[82%] rounded-2xl overflow-hidden ${isMe ? 'bg-indigo-600 dark:bg-indigo-700' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
            {gallery.length ? (
              <View className="flex-row flex-wrap">
                {gallery.slice(0, 4).map((uri: string, index: number) => (
                  <TouchableOpacity key={`${uri}-${index}`} className="w-1/2 aspect-square" onPress={() => setSelectedImage(uri)}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            <View className="px-4 py-3">
              <Text className={`${isMe ? 'text-white' : 'text-slate-900 dark:text-slate-100'} text-[15px] font-semibold`}>
                {orderDetail.title}
              </Text>
              <Text className={`${isMe ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'} mt-1 text-[13px]`}>
                {orderDetail.status} • {orderDetail.designer}
              </Text>
              <Text className={`${isMe ? 'text-indigo-50' : 'text-slate-700 dark:text-slate-200'} mt-2 text-[13px]`}>
                {orderDetail.description}
              </Text>
              <Text className={`${isMe ? 'text-indigo-50' : 'text-slate-700 dark:text-slate-200'} mt-2 text-[13px]`}>
                Items: {Array.isArray(orderDetail.itemsToPrint) && orderDetail.itemsToPrint.length ? orderDetail.itemsToPrint.join(', ') : 'Not specified'}
              </Text>
              <Text className={`${isMe ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'} mt-1 text-[12px]`}>
                Created {orderDetail.createdAt} {orderDetail.dueOn !== 'N/A' ? `• Due ${orderDetail.dueOn}` : ''}
              </Text>
              <Text className={`${isMe ? 'text-white' : 'text-slate-900 dark:text-slate-100'} mt-3 text-[14px] font-bold`}>
                ₦{Number(orderDetail.amount || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (message.type === 'bundle' && message.bundle) {
      const bundleItems = message.bundle.items;
      const hiddenBundleCount = Math.max(bundleItems.length - 3, 0);

      return (
        <View key={message.id} className={`w-full my-1 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
          {!isMe && (
            <View className="mr-2 self-end mb-1">
              <AvatarBadge
                color={conversation.avatarColor}
                emoji={conversation.avatarEmoji}
                imageUrl={conversation.avatarThumbnailUrl || conversation.avatarPreviewUrl || conversation.avatarImageUrl}
                label={conversation.avatarInitials}
                size={32}
              />
            </View>
          )}
          <View className="w-[78%]">
            <View className="rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
              <View className="flex-row flex-wrap">
                {bundleItems.slice(0, 4).map((item, index) => (
                  <View key={item.id} className="w-1/2 aspect-square border-[0.5px] border-slate-100 dark:border-slate-700">
                    {item.imageUrl || item.image ? (
                      <Image source={item.imageUrl ? { uri: item.imageUrl } : item.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center bg-slate-100 dark:bg-slate-900">
                        <Ionicons name="image-outline" size={28} color={isDark ? '#94a3b8' : '#64748b'} />
                      </View>
                    )}
                    {(item.overlayText || (index === 3 && hiddenBundleCount > 0 ? `+${hiddenBundleCount} Items` : '')) ? (
                      <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <Text className="text-white text-xl font-bold">
                          {item.overlayText || `+${hiddenBundleCount} Items`}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
              <TouchableOpacity className="border-t border-slate-100 dark:border-slate-700 py-3 items-center" onPress={() => setSelectedProductDetail(message.bundle)}>
                <Text className="text-indigo-600 dark:text-indigo-400 text-lg font-semibold">{message.bundle?.footerLabel}</Text>
              </TouchableOpacity>
            </View>
            <Text className={`mt-2 text-[11px] text-indigo-200 ${isMe ? 'text-right' : 'text-left'}`}>
              {message.status === 'seen' ? `Seen . ${message.createdAtLabel}` : message.createdAtLabel}
            </Text>
          </View>
        </View>
      );
    }

    if (message.type === 'offer' && message.offer) {
      return (
        <View key={message.id} className={`w-full my-1 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
          {!isMe && (
            <View className="mr-2 self-end mb-1">
              <AvatarBadge
                color={conversation.avatarColor}
                emoji={conversation.avatarEmoji}
                imageUrl={conversation.avatarThumbnailUrl || conversation.avatarPreviewUrl || conversation.avatarImageUrl}
                label={conversation.avatarInitials}
                size={32}
              />
            </View>
          )}
          <View className="w-[82%]">
            <Text className={`text-slate-500 dark:text-slate-400 text-sm mb-2 ${isMe ? 'text-right' : 'text-left'}`}>{message.offer.description}</Text>
            <View className={`w-[192px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl overflow-hidden ${isMe ? 'self-end' : 'self-start'}`}>
              <View className="w-full bg-slate-50 dark:bg-slate-900">
                <Image source={message.offer.image} style={{ width: '100%', height: 180 }} contentFit="contain" />
              </View>
              <View className="px-3 pt-3 pb-4 gap-1">
                <Text className="text-[15px] text-slate-800 dark:text-slate-200 font-medium">{message.offer.title}</Text>
                <Text className="text-[14px] text-blue-600 dark:text-blue-400 font-bold">{message.offer.priceLabel}</Text>
              </View>
              <TouchableOpacity className="bg-indigo-600 dark:bg-indigo-700 py-3 items-center" onPress={() => setShowOfferDetail(true)}>
                <Text className="text-white text-[15px] font-bold">{message.offer?.ctaLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    const displayUrl = message.imageUrl || (isImageContent(message.text) ? resolveImageUri(message.text) : '');
    const isImage = Boolean(displayUrl);
    const finalImageUrl = displayUrl.replace("https://berrystamp-backend-dev-4cn29.ondigitalocean.app","https://berry-stamp-prod.s3.amazonaws.com");
    
    return (
      <View key={message.id} className={`w-full my-1 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="mr-2 self-end mb-1">
            <AvatarBadge
              color={conversation.avatarColor}
              emoji={conversation.avatarEmoji}
              imageUrl={conversation.avatarThumbnailUrl || conversation.avatarPreviewUrl || conversation.avatarImageUrl}
              label={conversation.avatarInitials}
              size={32}
            />
          </View>
        )}
        <View className={`max-w-[78%] rounded-2xl px-4 py-3 ${isMe ? 'bg-indigo-600 dark:bg-indigo-700 rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm'}`}>
          {isImage ? (
            <TouchableOpacity onPress={() => setSelectedImage(finalImageUrl)} activeOpacity={0.8}>
              <Image 
                source={{ uri: finalImageUrl }} 
                style={{ width: 200, height: 200, borderRadius: 8 }} 
                contentFit="cover" 
              />
            </TouchableOpacity>
          ) : (
            <Text className={`text-[15px] leading-6 ${isMe ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
              {message.text}
            </Text>
          )}
          <Text className={`mt-2 text-[11px] ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400 dark:text-slate-500'}`}>
            {isMe ? `${message.status === 'seen' ? 'Seen • ' : ''}${message.createdAtLabel}` : `${message.createdAtLabel}${message.status === 'seen' ? ' • Seen' : ''}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
          
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
          >
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
              <Ionicons name="arrow-back" size={24} color={themeIconColor} />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center gap-3 ml-2">
              <AvatarBadge
                color={conversation.avatarColor}
                emoji={conversation.avatarEmoji}
                imageUrl={conversation.avatarThumbnailUrl || conversation.avatarPreviewUrl || conversation.avatarImageUrl}
                label={conversation.avatarInitials}
                size={40}
              />
              <View>
                <Text className="text-[17px] font-bold text-slate-900 dark:text-slate-100">{conversation.name}</Text>
                <Text className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {headerSubtitle}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowConversationActions(true)} className="w-10 h-10 items-center justify-center">
              <Ionicons name="ellipsis-vertical" size={20} color={themeSecondaryIconColor} />
            </TouchableOpacity>
          </View>

          {/* Thread (Messages) */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}>
            {isLoading ? (
              <View className="py-10 items-center justify-center gap-3">
                <ActivityIndicator size="small" color="#4A3298" />
                <Text className="text-slate-500 dark:text-slate-400 text-sm">Loading messages...</Text>
              </View>
            ) : (
              messages.map(renderMessage)
            )}
          </ScrollView>

          {/* Composer (Text Input) */}
          <View
            className="flex-row items-end px-4 pt-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3"
            style={{ paddingBottom: isKeyboardVisible ? 12 : Math.max(insets.bottom, 12) }}
          >
            <View className="flex-1 flex-row items-end bg-slate-100 dark:bg-slate-800 rounded-3xl px-1 py-1 min-h-[50px] max-h-[120px]">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Message..."
                placeholderTextColor="#94a3b8"
                multiline
                className="flex-1 px-4 pt-3 pb-3 text-[15px] text-slate-900 dark:text-slate-100 max-h-[100px]"
                textAlignVertical="top"
              />
              <TouchableOpacity onPress={handlePickAndUploadImage} disabled={uploading} className="w-10 h-[42px] items-center justify-center mr-1">
                {uploading ? (
                  <ActivityIndicator size="small" color="#64748b" />
                ) : (
                  <Feather name="image" size={20} color={themeSecondaryIconColor} />
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={handleSend}
              disabled={!draft.trim()}
              className={`w-[50px] h-[50px] rounded-full items-center justify-center ${draft.trim() ? 'bg-indigo-600 dark:bg-indigo-700' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" className="ml-1" />
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* --- MODALS STAY OUTSIDE THE KEYBOARD AVOIDING VIEW --- */}
      
      {/* Lightbox Modal for Images */}
      <Modal 
        visible={!!selectedImage} 
        transparent={true} 
        animationType="fade" 
        onRequestClose={() => setSelectedImage(null)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity 
            className="absolute right-4 z-10 w-12 h-12 items-center justify-center bg-white/10 rounded-full"
            style={{ top: Math.max(insets.top, 20) }}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={{ width: '100%', height: '80%' }} 
              contentFit="contain" 
            />
          )}
        </View>
      </Modal>

      {/* Action Modal */}
      <Modal transparent visible={showConversationActions} animationType="slide" onRequestClose={() => setShowConversationActions(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowConversationActions(false)}>
          <Pressable className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-3 pb-10" onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 self-center mb-6" />
            <TouchableOpacity className="flex-row items-center gap-4 py-4 px-2">
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
              <Text className="text-lg text-slate-900 dark:text-slate-100">Delete Chat</Text>
            </TouchableOpacity>
            <View className="h-[1px] bg-slate-100 dark:bg-slate-800" />
            <TouchableOpacity className="flex-row items-center gap-4 py-4 px-2">
              <Ionicons name="alert-circle-outline" size={22} color="#ef4444" />
              <Text className="text-lg text-slate-900 dark:text-slate-100">Report User</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Offer Detail Modal */}
      <Modal transparent visible={showOfferDetail} animationType="slide" onRequestClose={() => setShowOfferDetail(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowOfferDetail(false)}>
          <Pressable className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-3 pb-8" onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 self-center mb-6" />
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">Order Detail</Text>
              <TouchableOpacity onPress={() => setShowOfferDetail(false)} className="p-1">
                <Ionicons name="close" size={24} color={themeIconColor} />
              </TouchableOpacity>
            </View>
            <Text className="text-[15px] text-slate-500 dark:text-slate-400 mb-6 leading-6">Review the custom offer and confirm the details before continuing.</Text>
            
            <View className="mb-4">
              <Text className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mb-1">Order title</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-300">{OFFER_DETAILS.title}</Text>
            </View>
            <View className="mb-4">
              <Text className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mb-1">Agreed description</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-300 leading-6">{OFFER_DETAILS.description}</Text>
            </View>
            <View className="mb-4">
              <Text className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mb-1">Agreed amount</Text>
              <Text className="text-[16px] font-bold text-blue-600 dark:text-blue-400">{OFFER_DETAILS.amount}</Text>
            </View>
            
            <TouchableOpacity className="bg-indigo-600 dark:bg-indigo-700 rounded-full py-4 items-center mt-6" onPress={() => {
                setShowOfferDetail(false);
                router.push('/(tabs)/checkout');
            }}>
              <Text className="text-white text-lg font-bold">Accept offer</Text>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-full py-4 items-center border border-slate-200 dark:border-slate-700 mt-3" onPress={() => setShowOfferDetail(false)}>
              <Text className="text-slate-600 dark:text-slate-300 text-lg font-semibold">Not now</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Product Detail Modal (from the uploaded image) */}
    {/* Product Detail Modal (from the uploaded image) */}
      <Modal transparent visible={!!selectedProductDetail} animationType="fade" onRequestClose={() => setSelectedProductDetail(null)}>
        <Pressable className="flex-1 bg-black/40 justify-center items-center px-4" onPress={() => setSelectedProductDetail(null)}>
          <Pressable className="bg-white dark:bg-slate-50 rounded-3xl w-full max-w-[380px] p-6" onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="w-6" /> {/* Visual spacer to strictly center the title */}
              <Text className="text-[17px] font-semibold text-slate-900">Product Detail</Text>
              <TouchableOpacity onPress={() => setSelectedProductDetail(null)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Extract product data. Assuming 'selectedProductDetail' is the bundle, we grab the first item. */}
            {(() => {
              const products = Array.isArray(selectedProductDetail?.items) && selectedProductDetail.items.length
                ? selectedProductDetail.items
                : [selectedProductDetail || {}];

              return (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                  {products.map((product: any, index: number) => {
                    const budgetDisplay =
                      product.budget ||
                      ((product.minBudget || product.maxBudget)
                        ? `${formatCurrency(product.minBudget)} - ${formatCurrency(product.maxBudget)}`
                        : formatCurrency(product.price));

                    return (
                      <View
                        key={String(product.id || `${index}`)}
                        className={`${index ? 'mt-5 border-t border-slate-200 pt-5' : ''}`}
                      >
                        <View className="items-center mb-5">
                          <Image
                            source={{ uri: product.imageUrl || product.image || 'https://via.placeholder.com/150' }}
                            style={{ width: 140, height: 140, borderRadius: 8, marginBottom: 16 }}
                            contentFit="cover"
                          />
                          <Text className="text-center text-[15px] font-medium text-slate-800">
                            {product.name || product.title || selectedProductDetail?.title || 'Product Item'}
                          </Text>
                        </View>

                        <View className="flex-row justify-between">
                          <View className="flex-1 pr-3">
                            <Text className="mb-3 text-[13px] font-semibold text-slate-800">Material specification</Text>
                            <Text className="mb-2 text-[12px] text-slate-600">Colour : {product.color || product.colour || 'N/A'}</Text>
                            <Text className="mb-2 text-[12px] text-slate-600">Size : {product.size || 'N/A'}</Text>
                            <Text className="mb-2 text-[12px] text-slate-600">
                              Quantity : {product.quantity || 1} {Number(product.quantity || 1) > 1 ? 'pieces' : 'piece'}
                            </Text>
                            <Text className="mb-2 text-[12px] text-slate-600">Variant : {product.variantText || 'N/A'}</Text>
                            <Text className="mb-3 mt-4 text-[13px] font-semibold text-slate-800">Item availability</Text>
                            <Text className="text-[12px] text-slate-600">
                              From: {product.inventorySource || product.itemAvailability || "Designer/printer inventory"}
                            </Text>
                            {product.deliveryAddress ? (
                              <Text className="mt-2 text-[12px] text-slate-600">Delivery address: {product.deliveryAddress}</Text>
                            ) : null}
                            {product.pickupAddress ? (
                              <Text className="mt-2 text-[12px] text-slate-600">Pickup address: {product.pickupAddress}</Text>
                            ) : null}
                          </View>

                          <View className="flex-1 pl-3">
                            <Text className="mb-3 text-[13px] font-semibold text-slate-800">Printing Preferences</Text>
                            <Text className="mb-1 text-[12px] text-slate-600">Preferred printing type</Text>
                            <Text className="mb-4 text-[12px] text-slate-600">{product.printingType || product.printType || 'N/A'}</Text>

                            <Text className="mb-1 text-[12px] text-slate-600">Total Budget</Text>
                            <Text className="mb-4 text-[13px] font-medium text-blue-600">{budgetDisplay}</Text>

                            <Text className="mb-1 text-[12px] text-slate-600">Preferred delivery date</Text>
                            <Text className="mb-4 text-[12px] text-slate-600">
                              {formatDateLabel(product.deliveryDate || product.preferredDeliveryDate || '')}
                            </Text>

                            <Text className="mb-1 text-[12px] text-slate-600">Unit price</Text>
                            <Text className="text-[12px] text-slate-600">{formatCurrency(product.price)}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}
