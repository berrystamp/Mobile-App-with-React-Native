import { useAppAlert } from '@/components/common/AppAlert';
import { AvatarBadge } from '@/components/messages/AvatarBadge';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ENV } from '@/lib/config/env';
import {
  normalizeConversationsResponse,
  normalizeMessagesResponse,
  type ChatMessageDto,
  type ConversationSummaryDto,
} from '@/lib/messages';
import ApiService from '@/services/apiClient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const IMAGE_FILE_PATTERN = /\.(png|jpe?g|gif|webp|bmp|heic|heif|svg)(\?.*)?$/i;

const formatMessageTime = (value?: string | number | Date) => {
  if (!value) return 'Now';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Now';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
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
  return `\u20a6${numeric.toLocaleString()}`;
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

// Normalize the full order API response into a display-friendly shape
const normalizeOrderDetail = (raw: any) => {
  if (!raw) return null;
  const body = raw?.responseBody || raw?.data || raw || {};
  const req = body?.orderRequest || {};
  const printReq = req?.printRequest || {};
  const customReq = req?.customDesignRequest || {};

  const coverImageUrl =
    printReq?.designCoverImage?.url ||
    printReq?.designCoverImage?.previewUrl ||
    printReq?.designFrontImageUrl ||
    customReq?.image?.url ||
    customReq?.imageUrlFront ||
    '';

  return {
    id: body.id,
    title: body.title || 'Order',
    description: body.description || '',
    printingAmount: body.printingAmount || 0,
    designAmount: body.designAmount || 0,
    pickupAmount: body.pickupAmount || 0,
    deliveryAmount: body.deliveryAmount || 0,
    totalAmount: body.totalAmount || 0,
    orderStatus: body.orderStatus || 'REVIEW',
    deliveryDate: body.deliveryDate || '',
    itemProvidedByCustomer: body.itemProvidedByCustomer || false,
    ref: body.ref || '',
    orderRequestId: req?.id,
    orderType: req?.orderType || 'PRINT',
    budgetAmount: req?.budgetAmount || 0,
    dateOfDelivery: req?.dateOfDelivery || '',
    purpose: customReq?.purpose || '',
    theme: customReq?.theme || '',
    mockTypes: Array.isArray(customReq?.mockTypes) ? customReq.mockTypes : [],
    coverImageUrl: resolveImageUri(coverImageUrl),
    customerProfile: req?.customerProfile || null,
    providerProfile: req?.providerProfile || null,
    conversationId: req?.conversationId || null,
  };
};

export default function ChatScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const themeIconColor = isDark ? '#f1f5f9' : '#0f172a';
  const themeSecondaryIconColor = isDark ? '#94a3b8' : '#64748b';
  const scrollViewRef = useRef<ScrollView>(null);
  const { uploadFile, uploading } = useFileUpload();
  const { show: showAlert, element: alertElement } = useAppAlert();

  const {
    conversationId,
    participantId,
    participantName,
    participantRole,
    orderId,
    chatType: chatTypeParam,
    isDesigner: isDesignerParam,
  } = useLocalSearchParams<{
    conversationId?: string;
    participantId?: string;
    participantName?: string;
    participantRole?: string;
    orderId?: string;
    chatType?: string;
    isDesigner?: string;
  }>();

  const isDesigner = isDesignerParam === 'true';

  const [conversation, setConversation] = useState<ConversationSummaryDto>({
    id: String(conversationId || 'new-conversation'),
    source: 'backend',
    name: participantName || 'Conversation',
    role: participantRole === 'Printers' ? 'Printers' : 'Designer',
    avatarColor: '#A9D8FF',
    avatarEmoji: '\u2728',
    avatarInitials: String(participantName || 'C')
      .split(/\s+/).filter(Boolean).slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '').join('') || 'C',
    lastMessage: '',
    unreadCount: 0,
    updatedAtLabel: 'Now',
    participantId: participantId ? Number(participantId) : undefined,
    participants: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<(ChatMessageDto & { imageUrl?: string })[]>([]);
  const [draft, setDraft] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showConversationActions, setShowConversationActions] = useState(false);

  // ORDER_REQUEST: the order request detail fetched from the conversation's order
  const [orderRequestDetail, setOrderRequestDetail] = useState<any>(null);
  // ORDER: per-message order details
  const [orderDetailsByMessageId, setOrderDetailsByMessageId] = useState<Record<string, any>>({});

  // Designer-specific: product details modal (ORDER_REQUEST)
  const [showProductDetails, setShowProductDetails] = useState(false);
  // Designer-specific: create order form modal
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  // Designer-specific: order details modal (after order created / VIEW DETAILS)
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  // Success toast
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  // Create order form state
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderDeliveryDate, setOrderDeliveryDate] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const me = await ApiService.getCurrentUser();

        if (conversationId) {
          const [convoRes, messagesRes] = await Promise.all([
            ApiService.getConversations(0, 80),
            ApiService.getConversationMessages(String(conversationId), 0, 100),
          ]);

          const allConversations = normalizeConversationsResponse(convoRes);
          const selected = allConversations.find((item) => item.id === String(conversationId));
          if (selected) setConversation((c) => ({ ...c, ...selected }));

          const myId = me?.id || me?.userId || me?.profileId;
          const normalized = normalizeMessagesResponse(messagesRes, myId).map((item) => {
            const senderId = item.sender?.id || item.sender?.userId;
            const receiverId = item.receiver?.id || item.receiver?.userId;
            const resolvedAuthor =
              Number(senderId) === Number(selected?.participantId || participantId)
                ? 'other'
                : Number(receiverId) === Number(selected?.participantId || participantId)
                ? 'me'
                : item.author;
            const imageUrl = isImageContent(item.text) ? resolveImageUri(item.text) : undefined;
            return { ...item, author: resolvedAuthor, imageUrl } as ChatMessageDto & { imageUrl?: string };
          });

          setMessages(normalized);
          // Mark unread messages as read
          const unread = normalized
            .filter((m) => m.author === 'other' && m.status !== 'seen')
            .map((m) => String(m.messageIdentifier || m.id)).filter(Boolean);
          if (unread.length) {
            Promise.allSettled(unread.map((id) => ApiService.markMessageAsRead(id))).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Failed to load chat', err);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [conversationId, participantId]);

  // Fetch order request detail for ORDER_REQUEST / ORDER chat type (both designer and customer)
  useEffect(() => {
    // Resolve orderId: prefer URL param, then scan messages for an ORDER/ORDER_REQUEST message
    const resolvedOrderId = orderId
      || messages.find((m) => m.chatType === 'ORDER_REQUEST' || m.chatType === 'ORDER')
          ?.raw?.orderId
      || messages.find((m) => m.chatType === 'ORDER_REQUEST' || m.chatType === 'ORDER')
          ?.raw?.id
      || null;

    const isOrderChat =
      chatTypeParam === 'ORDER_REQUEST' ||
      chatTypeParam === 'ORDER' ||
      messages.some((m) => m.chatType === 'ORDER_REQUEST' || m.chatType === 'ORDER');

    if (!isOrderChat || !resolvedOrderId) return;

    ApiService.getOrderById(String(resolvedOrderId))
      .then((res) => {
        const detail = normalizeOrderDetail(res);
        setOrderRequestDetail(detail);
      })
      .catch(() => setOrderRequestDetail(null));
  }, [isDesigner, chatTypeParam, orderId, messages]);

  // Fetch order details for ORDER-type messages
  useEffect(() => {
    const orderMessages = messages.filter((m) => {
      // Fix: was `m.chatType !== 'ORDER' || 'ORDER_REQUEST'` which is always true (JS bug)
      if (m.chatType !== 'ORDER' && m.chatType !== 'ORDER_REQUEST') return false;
      if (orderDetailsByMessageId[m.id]) return false;
      // orderId lives in raw.orderId, raw.order.id, raw.id, caption, or text
      const oid =
        m.raw?.orderId ||
        m.raw?.order?.id ||
        m.raw?.id ||
        Number(m.caption || m.text || 0);
      const valid = Number.isFinite(Number(oid)) && Number(oid) > 0;
      if (!valid) {
        console.warn('[Chat] ORDER message has no resolvable orderId', {
          messageId: m.id,
          chatType: m.chatType,
          rawKeys: m.raw ? Object.keys(m.raw) : [],
          caption: m.caption,
          text: m.text,
        });
      }
      return valid;
    });
    if (!orderMessages.length) return;

    Promise.allSettled(
      orderMessages.map(async (m) => {
        const oid =
          m.raw?.orderId ||
          m.raw?.order?.id ||
          m.raw?.id ||
          Number(m.caption || m.text || 0);
 
          const res = await ApiService.getOrderById(oid);
          const order = normalizeOrderDetail(res);
          return { messageId: m.id, order };
      
      }),
    ).then((results) => {
      const next: Record<string, any> = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value.order) {
          next[r.value.messageId] = r.value.order;
        } 
        // else if (r.status === 'rejected') {
        //   console.error('[Chat] Order fetch settled as rejected:', r.reason);
        // }
      });
      if (Object.keys(next).length) setOrderDetailsByMessageId((c) => ({ ...c, ...next }));
    });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 80);
    return () => clearTimeout(timer);
  }, [messages]);

  // chatType rules:
  // - plain text with no orderId/chatTypeParam → always DIRECT
  // - image upload → FILE
  // - orderId present or explicit param → use param or ORDER
  const VALID_CHAT_TYPES = ['ORDER', 'ORDER_REQUEST', 'DIRECT', 'FILE'] as const;
  type ChatType = typeof VALID_CHAT_TYPES[number];

  const resolvePayloadChatType = (isFile = false): ChatType => {
    if (isFile) return 'FILE';
    // Typed/input text messages are always DIRECT
    return 'DIRECT';
  };

  const buildPayload = (content: string, caption: string, isFile = false) =>{console.log(resolvePayloadChatType(isFile)); return({
    
    toProfileId: Number(conversation.participantId || participantId || 0),
    content,
    caption,
    chatType: resolvePayloadChatType(isFile),
  })
};

  const dispatchMessage = async (payload: ReturnType<typeof buildPayload>) => {
    if (orderId) {
      await ApiService.sendOrderMessage(String(orderId), payload);
    } else {
      await ApiService.sendMessage(payload);
    }
  };

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newMessage: ChatMessageDto & { imageUrl?: string } = {
      id: `local-${Date.now()}`,
      type: 'text',
      author: 'me',
      text: trimmed,
      createdAtLabel: formatMessageTime(new Date()),
      status: 'sent',
    };

    setMessages((c) => [...c, newMessage]);
    setDraft('');

    try {
      await dispatchMessage(buildPayload(trimmed, trimmed, false));
    } catch (err: any) {
      console.error('[Chat] Message send failed:', err?.response?.data?.responseMessage || err?.message, err);
      showAlert({
        type: 'error',
        title: 'Message not sent',
        message: err?.response?.data?.responseMessage || err?.message || 'Please check your connection and try again.',
      });
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
            type: 'text',
            author: 'me',
            text: uploaded.path,
            imageUrl: resolveImageUri(uploaded.path),
            createdAtLabel: formatMessageTime(new Date()),
            status: 'sent',
          };
          setMessages((c) => [...c, newMessage]);
          await dispatchMessage(buildPayload(uploaded.path, uploaded.path, true));
        }
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
  };

  const handleCreateOrder = async () => {
    if (!orderTitle.trim() || !orderAmount.trim() || !orderDeliveryDate.trim()) {
      showAlert({ type: 'warning', title: 'Missing fields', message: 'Please fill in title, amount, and delivery date.' });
      return;
    }
    if (!orderRequestDetail?.orderRequestId) return;
    setCreatingOrder(true);
    try {
      const res = await ApiService.createOrder({
        orderRequestId: Number(orderRequestDetail.orderRequestId),
        title: orderTitle.trim(),
        description: orderDescription.trim(),
        amount: Number(orderAmount),
        deliveryDate: orderDeliveryDate.trim(),
      });
      const created = normalizeOrderDetail(res);
      setOrderRequestDetail(created || orderRequestDetail);
      setShowCreateOrder(false);
      setShowOrderSuccess(true);
      setTimeout(() => setShowOrderSuccess(false), 3000);
    } catch (err: any) {
      console.error('[Chat] Create order failed:', err?.response?.data?.responseMessage || err?.message, err);
      showAlert({
        type: 'error',
        title: 'Order creation failed',
        message: err?.response?.data?.responseMessage || err?.message || 'Please try again.',
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  // ─── Resolve the other user's avatar from the message sender field ──────────
  const resolveOtherAvatar = (message: ChatMessageDto & { imageUrl?: string }) => {
    // The "other" sender profile comes directly from the backend message payload
    const senderProfile = message.author === 'other' ? message.sender : message.receiver;
    const imageUrl =
      senderProfile?.profileImage?.thumbnailUrl ||
      senderProfile?.profileImage?.previewUrl ||
      senderProfile?.profileImage?.url ||
      senderProfile?.thumbnailProfilePic ||
      senderProfile?.previewProfilePic ||
      senderProfile?.profilePic ||
      conversation.avatarThumbnailUrl ||
      conversation.avatarPreviewUrl ||
      conversation.avatarImageUrl ||
      undefined;
    const initials =
      senderProfile?.name
        ? senderProfile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('')
        : conversation.avatarInitials;
    return { imageUrl, initials };
  };

  // ─── Render: ORDER message bubble (fetched order details) ───────────────────
  const renderOrderMessage = (message: ChatMessageDto & { imageUrl?: string }, orderDetail: any) => {
    const isMe = message.author === 'me';
    const otherAvatar = resolveOtherAvatar(message);
    return (
      <View key={message.id} className={`w-full my-2 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="mr-2 self-end mb-1">
            <AvatarBadge
              color={conversation.avatarColor}
              imageUrl={otherAvatar.imageUrl}
              label={otherAvatar.initials}
              size={32}
            />
          </View>
        )}
        <View className="max-w-[82%] rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {orderDetail.coverImageUrl ? (
            <TouchableOpacity onPress={() => setSelectedImage(orderDetail.coverImageUrl)} activeOpacity={0.85}>
              <Image source={{ uri: orderDetail.coverImageUrl }} style={{ width: '100%', height: 160 }} contentFit="cover" />
            </TouchableOpacity>
          ) : null}
          <View className="px-4 py-3">
            <Text className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{orderDetail.title}</Text>
            <Text className="text-[13px] text-slate-500 dark:text-slate-400 mt-1" numberOfLines={2}>{orderDetail.description}</Text>
            <Text className="text-[13px] text-slate-700 dark:text-slate-200 mt-2 font-medium">
              Total Amount: {formatCurrency(orderDetail.totalAmount)}
            </Text>
            <Text className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
              Timeline: Due on {orderDetail.deliveryDate || 'N/A'}
            </Text>
            <Text className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
              Status: {orderDetail.orderStatus}
            </Text>
            <TouchableOpacity
              className="mt-3 border border-[#4A3298] rounded-lg py-2 items-center"
              onPress={() => { setSelectedOrderDetail(orderDetail); setShowOrderDetails(true); }}>
              <Text className="text-[#4A3298] text-[14px] font-semibold">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ─── Render: ORDER_REQUEST card (designer and customer) ────────────────────
  const renderOrderRequestCard = () => {
    if (!orderRequestDetail) return null;
    const detail = orderRequestDetail;
    return (
      <View className="mx-4 my-3">
        {/* Cover image card */}
        {detail.coverImageUrl ? (
          <View className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-3" style={{ width: 200 }}>
            <TouchableOpacity onPress={() => setSelectedImage(detail.coverImageUrl)} activeOpacity={0.85}>
              <Image source={{ uri: detail.coverImageUrl }} style={{ width: 200, height: 160 }} contentFit="cover" />
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2 items-center border-t border-slate-200 dark:border-slate-700"
              onPress={() => setShowProductDetails(true)}>
              <Text className="text-[#4A3298] text-[14px] font-semibold">View Details</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* "You have an offer sent to this customer" */}
        {detail.title ? (
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mt-1">
            <Text className="text-center text-[13px] text-slate-500 dark:text-slate-400 mb-3">
              {isDesigner ? 'You have an offer sent to this customer' : 'Order details'}
            </Text>
            <Text className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 text-center">{detail.title}</Text>
            <Text className="text-[13px] text-slate-500 dark:text-slate-400 text-center mt-1" numberOfLines={2}>{detail.description}</Text>
            <Text className="text-[13px] text-slate-700 dark:text-slate-200 text-center mt-2 font-medium">
              Total Amount: {formatCurrency(detail.totalAmount)}
            </Text>
            <Text className="text-[12px] text-slate-500 dark:text-slate-400 text-center mt-1">
              Timeline: Due on {detail.deliveryDate || detail.dateOfDelivery || 'N/A'}
            </Text>
            <Text className="text-[12px] text-slate-500 dark:text-slate-400 text-center mt-0.5">
              Status: {detail.orderStatus || 'ACTIVE'}
            </Text>
            <TouchableOpacity
              className="mt-3 border border-[#4A3298] rounded-lg py-2 items-center"
              onPress={() => { setSelectedOrderDetail(detail); setShowOrderDetails(true); }}>
              <Text className="text-[#4A3298] text-[14px] font-semibold">View Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // No order created yet — only designer can create an offer
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mt-1">
            <Text className="text-center text-[13px] text-slate-500 dark:text-slate-400 mb-3">
              {isDesigner ? 'You received an order request' : 'Waiting for offer from designer'}
            </Text>
            {isDesigner && (
              <TouchableOpacity
                className="bg-[#4A3298] rounded-full py-3 items-center mt-2"
                onPress={() => setShowCreateOrder(true)}>
                <Text className="text-white text-[15px] font-bold">Create Offer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // ─── Render: regular text / image message bubble ────────────────────────────
  const renderMessage = (message: ChatMessageDto & { imageUrl?: string }) => {
    const orderDetail = orderDetailsByMessageId[message.id];
    if (message.chatType === 'ORDER' && orderDetail) {
      return renderOrderMessage(message, orderDetail);
    }

    const isMe = message.author === 'me';
    const displayUrl = message.imageUrl || (isImageContent(message.text) ? resolveImageUri(message.text) : '');
    const isImage = Boolean(displayUrl);
    const finalImageUrl = displayUrl.replace(
      'https://berrystamp-backend-dev-4cn29.ondigitalocean.app',
      'https://berry-stamp-prod.s3.amazonaws.com',
    );
    const otherAvatar = resolveOtherAvatar(message);
    const isSeen = message.raw?.read === true;

    return (
      <View key={message.id} className={`w-full my-1 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="mr-2 self-end mb-1">
            <AvatarBadge
              color={conversation.avatarColor}
              imageUrl={otherAvatar.imageUrl}
              label={otherAvatar.initials}
              size={32}
            />
          </View>
        )}
        <View
          className={`max-w-[78%] rounded-2xl px-4 py-3 ${
            isMe
              ? 'bg-[#4A3298] rounded-br-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
          }`}>
          {isImage ? (
            <TouchableOpacity onPress={() => setSelectedImage(finalImageUrl)} activeOpacity={0.8}>
              <Image source={{ uri: finalImageUrl }} style={{ width: 200, height: 200, borderRadius: 8 }} contentFit="cover" />
            </TouchableOpacity>
          ) : (
            <Text className={`text-[15px] leading-6 ${isMe ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
              {message.text}
            </Text>
          )}
          <Text className={`mt-2 text-[11px] ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400 dark:text-slate-500'}`}>
            {isMe
              ? `${isSeen ? 'Seen \u2022 ' : ''}${message.createdAtLabel}`
              : `${message.createdAtLabel}${isSeen ? ' \u2022 Seen' : ''}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>

          {/* ── Header ── */}
          <View
            className="flex-row items-center justify-between px-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            style={{ paddingTop: 4 }}>
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
              <Ionicons name="arrow-back" size={24} color={themeIconColor} />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center gap-3 ml-2">
              <AvatarBadge
                color={conversation.avatarColor}
                imageUrl={conversation.avatarThumbnailUrl || conversation.avatarPreviewUrl || conversation.avatarImageUrl}
                label={conversation.avatarInitials}
                size={40}
              />
              <View>
                <Text className="text-[17px] font-bold text-slate-900 dark:text-slate-100">{conversation.name}</Text>
                <Text className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{conversation.updatedAtLabel}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowConversationActions(true)} className="w-10 h-10 items-center justify-center">
              <Ionicons name="ellipsis-vertical" size={20} color={themeSecondaryIconColor} />
            </TouchableOpacity>
          </View>

          {/* ── Messages ── */}
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
              <>
                {/* ORDER_REQUEST / ORDER card at top — visible to both designer and customer */}
                {orderRequestDetail &&
                  (chatTypeParam === 'ORDER_REQUEST' ||
                    chatTypeParam === 'ORDER' ||
                    messages.some((m) => m.chatType === 'ORDER_REQUEST' || m.chatType === 'ORDER')) &&
                  renderOrderRequestCard()}
                {messages.map(renderMessage)}
              </>
            )}
          </ScrollView>

          {/* ── Composer ── */}
          <View
            className="flex-row items-end px-4 pt-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
            <View className="flex-1 flex-row items-end bg-slate-100 dark:bg-slate-800 rounded-3xl px-1 py-1 min-h-[50px] max-h-[120px]">
          
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Write message"
                placeholderTextColor="#94a3b8"
                multiline
                className="flex-1 px-3 pt-3 pb-3 text-[15px] text-slate-900 dark:text-slate-100 max-h-[100px]"
                textAlignVertical="top"
              />
          
              <TouchableOpacity onPress={handlePickAndUploadImage} disabled={uploading} className="w-9 h-[42px] items-center justify-center mr-1">
                {uploading ? (
                  <ActivityIndicator size="small" color="#64748b" />
                ) : (
                  <Feather name="paperclip" size={20} color={themeSecondaryIconColor} />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!draft.trim()}
              className={`w-[50px] h-[50px] rounded-full items-center justify-center ${draft.trim() ? 'bg-[#4A3298]' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

      </KeyboardAvoidingView>
    </SafeAreaView>

      {/* ── Lightbox ── */}
      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity
            className="absolute right-4 z-10 w-12 h-12 items-center justify-center bg-white/10 rounded-full"
            style={{ top: Math.max(insets.top, 20) }}
            onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage ?? undefined }} style={{ width: '100%', height: '80%' }} contentFit="contain" />
          )}
        </View>
      </Modal>

      {/* ── Conversation actions ── */}
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

      {/* ── Product Details modal (ORDER_REQUEST — designer) ── */}
      <Modal transparent visible={showProductDetails} animationType="slide" onRequestClose={() => setShowProductDetails(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowProductDetails(false)}>
          <Pressable className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
              <View className="w-6" />
              <Text className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">Product details and specifications</Text>
              <TouchableOpacity onPress={() => setShowProductDetails(false)}>
                <Ionicons name="close" size={24} color={themeIconColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              {/* Design image */}
              {orderRequestDetail?.coverImageUrl ? (
                <View className="items-center mb-5">
                  <Image
                    source={{ uri: orderRequestDetail.coverImageUrl }}
                    style={{ width: 140, height: 140, borderRadius: 8 }}
                    contentFit="cover"
                  />
                  <Text className="text-[13px] text-slate-500 dark:text-slate-400 mt-2">Item design</Text>
                </View>
              ) : null}

              {orderRequestDetail?.purpose ? (
                <View className="mb-4">
                  <Text className="text-[13px] text-slate-400 dark:text-slate-500 mb-1">Purpose</Text>
                  <Text className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{orderRequestDetail.purpose}</Text>
                </View>
              ) : null}

              {orderRequestDetail?.theme ? (
                <View className="mb-4">
                  <Text className="text-[13px] text-slate-400 dark:text-slate-500 mb-1">Theme</Text>
                  <Text className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{orderRequestDetail.theme}</Text>
                </View>
              ) : null}

              {orderRequestDetail?.mockTypes?.length ? (
                <View className="mb-4">
                  <Text className="text-[13px] text-slate-400 dark:text-slate-500 mb-1">Mock up</Text>
                  <Text className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                    {orderRequestDetail.mockTypes.join(', ')}
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <TouchableOpacity
              className="bg-[#4A3298] rounded-full py-4 items-center mt-4"
              onPress={() => { setShowProductDetails(false); setShowCreateOrder(true); }}>
              <Text className="text-white text-[16px] font-bold">Create Offer</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Create New Order modal (designer) ── */}
      <Modal transparent visible={showCreateOrder} animationType="slide" onRequestClose={() => setShowCreateOrder(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowCreateOrder(false)}>
          <Pressable className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View className="flex-row items-center mb-1">
              <TouchableOpacity onPress={() => setShowCreateOrder(false)} className="mr-3">
                <Ionicons name="arrow-back" size={22} color={themeIconColor} />
              </TouchableOpacity>
              <Text className="text-[18px] font-bold text-slate-900 dark:text-slate-100">Create New Order</Text>
            </View>
            <Text className="text-[13px] text-slate-500 dark:text-slate-400 mb-5">
              Enter details agreed with clients for their acceptance and order generation
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {/* Order title */}
              <Text className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-1">Order title</Text>
              <TextInput
                value={orderTitle}
                onChangeText={setOrderTitle}
                placeholder="Write title"
                placeholderTextColor="#94a3b8"
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] text-slate-900 dark:text-slate-100 mb-4 bg-white dark:bg-slate-800"
              />

              {/* Description */}
              <Text className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Brief description of order agreed specifications
              </Text>
              <TextInput
                value={orderDescription}
                onChangeText={setOrderDescription}
                placeholder="Write description"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] text-slate-900 dark:text-slate-100 mb-4 bg-white dark:bg-slate-800"
                textAlignVertical="top"
                style={{ minHeight: 80 }}
              />

              {/* Amount */}
              <Text className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Agreed amount (\u20a6)
              </Text>
              <TextInput
                value={orderAmount}
                onChangeText={setOrderAmount}
                placeholder="Enter amount"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] text-slate-900 dark:text-slate-100 mb-4 bg-white dark:bg-slate-800"
              />

              {/* Delivery date */}
              <Text className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Agreed date of delivery
              </Text>
              <View className="flex-row items-center border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-6 bg-white dark:bg-slate-800">
                <TextInput
                  value={orderDeliveryDate}
                  onChangeText={setOrderDeliveryDate}
                  placeholder="mm/dd/yy"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-[15px] text-slate-900 dark:text-slate-100"
                />
                <Ionicons name="calendar-outline" size={20} color={themeSecondaryIconColor} />
              </View>
            </ScrollView>

            <TouchableOpacity
              className={`rounded-full py-4 items-center ${creatingOrder ? 'bg-slate-400' : 'bg-[#4A3298]'}`}
              onPress={handleCreateOrder}
              disabled={creatingOrder}>
              {creatingOrder ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-[16px] font-bold">Create Order</Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Order Details modal ── */}
      <Modal transparent visible={showOrderDetails} animationType="slide" onRequestClose={() => setShowOrderDetails(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowOrderDetails(false)}>
          <Pressable className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-2">
              <View className="w-6" />
              <Text className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">Order details</Text>
              <TouchableOpacity onPress={() => setShowOrderDetails(false)}>
                <Ionicons name="close" size={24} color={themeIconColor} />
              </TouchableOpacity>
            </View>
            <Text className="text-[13px] text-slate-500 dark:text-slate-400 mb-5">
              Review information to ensure details is exactly as agreed with printer before accepting
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              {selectedOrderDetail ? (
                <>
                  <View className="mb-4">
                    <Text className="text-[13px] font-bold text-slate-900 dark:text-slate-100 mb-1">Order title</Text>
                    <Text className="text-[14px] text-slate-600 dark:text-slate-300">{selectedOrderDetail.title}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-[13px] font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Brief description of order agreed specifications
                    </Text>
                    <Text className="text-[14px] text-slate-600 dark:text-slate-300 leading-6">{selectedOrderDetail.description}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-[13px] font-bold text-slate-900 dark:text-slate-100 mb-1">Design amount</Text>
                    <Text className="text-[14px] text-slate-600 dark:text-slate-300">{formatCurrency(selectedOrderDetail.designAmount)}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-[13px] font-bold text-slate-900 dark:text-slate-100 mb-1">Printing amount</Text>
                    <Text className="text-[14px] text-slate-600 dark:text-slate-300">{formatCurrency(selectedOrderDetail.printingAmount)}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-[13px] font-bold text-slate-900 dark:text-slate-100 mb-1">Delivery amount</Text>
                    <Text className="text-[14px] text-slate-600 dark:text-slate-300">{formatCurrency(selectedOrderDetail.deliveryAmount)}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-[13px] font-bold text-slate-900 dark:text-slate-100 mb-1">Agreed date of delivery</Text>
                    <Text className="text-[14px] text-slate-600 dark:text-slate-300">{selectedOrderDetail.deliveryDate || 'N/A'}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-[13px] font-bold text-slate-900 dark:text-slate-100 mb-1">Need pickup logistics</Text>
                    <Text className="text-[14px] text-slate-600 dark:text-slate-300">
                      {selectedOrderDetail.itemProvidedByCustomer ? 'Yes' : 'No'}
                    </Text>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Order created success toast ── */}
      {showOrderSuccess && (
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            left: 24,
            right: 24,
            backgroundColor: '#fff',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#4A3298',
            borderStyle: 'dashed',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
          <View className="w-7 h-7 rounded-full bg-green-500 items-center justify-center mr-3">
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
          <Text className="text-[14px] font-semibold text-slate-900">Order created successfully!</Text>
        </View>
      )}

      {/* ── Alert modal ── */}
      {alertElement}

    </View>
  );
}
