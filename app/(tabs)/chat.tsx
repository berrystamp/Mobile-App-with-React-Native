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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const formatDateForApi = (date: Date) => date.toISOString().slice(0, 10);

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

const getMessageOrderId = (message?: Partial<ChatMessageDto & { raw?: any }>) => {
  const raw = message?.raw || {};
  const candidates = [
    raw?.orderId,
    raw?.order?.id,
    raw?.content,
    message?.text,
    raw?.id,
    raw?.orderRequest?.order?.id,
  ];

  const value = candidates.find((candidate) => {
    const numeric = Number(candidate);
    return Number.isFinite(numeric) && numeric > 0;
  });

  return value ? String(value) : '';
};

const getMessageKey = (message: ChatMessageDto & { imageUrl?: string }, index: number) => {
  return [
    message.id,
    message.messageIdentifier,
    message.conversationId,
    message.chatType,
    message.raw?.createdDate || message.raw?.createdAt || message.raw?.timestamp,
    index,
  ]
    .filter(Boolean)
    .join('-');
};

const isReviewStatus = (status?: string) => {
  const normalized = String(status || '').toUpperCase();
  return normalized === 'REVIEW' || normalized === 'IN_REVIEW' || normalized === 'AWAITING_CONFIRMATION';
};

const isRejectedStatus = (status?: string) => String(status || '').toUpperCase() === 'REJECTED';

const isAcceptedStatus = (status?: string) => {
  const normalized = String(status || '').toUpperCase();
  return normalized === 'ACTIVE' || normalized === 'CONFIRMED' || normalized === 'COMPLETED';
};

// Normalize the full order API response into a display friendly shape
const normalizeOrderDetail = (raw: any) => {
  if (!raw) return null;
  const body = raw?.responseBody || raw?.data || raw || {};
  const req = body?.orderRequest || (body?.customDesignRequest || body?.printRequest ? body : {});
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
    title: body.title || req?.title || '',
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
    orderRequestId: req?.id || body?.orderRequestId,
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
    hasOffer: Boolean(body.id && (body.title || body.totalAmount || body.designAmount || body.printingAmount)),
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
  } = useLocalSearchParams<{
    conversationId?: string;
    participantId?: string;
    participantName?: string;
    participantRole?: string;
    orderId?: string;
    isDesigner?: string;
  }>();

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
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportReasons, setShowReportReasons] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  
  const [orderRequestDetail, setOrderRequestDetail] = useState<any>(null);
  const [orderDetailsByMessageId, setOrderDetailsByMessageId] = useState<Record<string, any>>({});
  const [orderRequestDetailsByMessageId, setOrderRequestDetailsByMessageId] = useState<Record<string, any>>({});

  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderDeliveryDate, setOrderDeliveryDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const normalizeChatMessages = useCallback(
    (messagesRes: any, myId?: number, selectedConversation?: ConversationSummaryDto) => {
      return normalizeMessagesResponse(messagesRes, myId).map((item) => {
        const senderId = item.sender?.id || item.sender?.userId;
        const receiverId = item.receiver?.id || item.receiver?.userId;
        const otherProfileId = selectedConversation?.participantId || participantId;
        const resolvedAuthor =
          Number(senderId) === Number(otherProfileId)
            ? 'other'
            : Number(receiverId) === Number(otherProfileId)
            ? 'me'
            : item.author;
        const imageUrl = isImageContent(item.text) ? resolveImageUri(item.text) : undefined;

        return { ...item, author: resolvedAuthor, imageUrl } as ChatMessageDto & { imageUrl?: string };
      });
    },
    [participantId],
  );

  const currentProfileType = useMemo(() => {
    for (const message of messages) {
      if (message.author === 'me' && message.sender?.profileType) {
        return String(message.sender.profileType).toUpperCase();
      }
      if (message.author === 'other' && message.receiver?.profileType) {
        return String(message.receiver.profileType).toUpperCase();
      }
    }
    return '';
  }, [messages]);

  const isDesigner = currentProfileType === 'DESIGNER';
  const isCustomer = currentProfileType === 'CUSTOMER';

  const displayMessages = useMemo(() => {
    const seenOrderCards = new Set<string>();

    return messages.filter((message) => {
      if (message.chatType !== 'ORDER' && message.chatType !== 'ORDER_REQUEST') return true;

      const orderKey = getMessageOrderId(message) || message.messageIdentifier || message.id;
      const dedupeKey = `${message.chatType}-${orderKey}`;
      if (seenOrderCards.has(dedupeKey)) return false;
      seenOrderCards.add(dedupeKey);
      return true;
    });
  }, [messages]);

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
          const normalized = normalizeChatMessages(messagesRes, myId, selected);
          setMessages(normalized);

          const unread = normalized
            .filter((m) => m.author === 'other' && m.readDateTime === null )
            .map((m) => String( m.id)).filter(Boolean);
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
  }, [conversationId, normalizeChatMessages, participantId]);

  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;
    const refreshMessages = async () => {
      try {
        const [me, messagesRes] = await Promise.all([
          ApiService.getCurrentUser(),
          ApiService.getConversationMessages(String(conversationId), 0, 100),
        ]);
        if (cancelled) return;
        const myId = me?.id || me?.userId || me?.profileId;
        setMessages(normalizeChatMessages(messagesRes, myId, conversation));
      } catch {
        // Keep the current thread visible if a background refresh fails.
      }
    };

    const timer = setInterval(refreshMessages, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [conversation, conversationId, normalizeChatMessages]);

  const openActionSheet = () => {
    setShowActions(true);
  };

  const closeAllModals = () => {
    setShowActions(false);
    setShowDeleteModal(false);
    setShowReportReasons(false);
  };

  const handleDeleteConversation = async () => {
    if (!conversationId) return;
    closeAllModals();
    await ApiService.deleteConversation(conversationId);
  };

  const handleReportConversation = async (reason: string) => {
    if (!conversationId) return;

    closeAllModals();
    try {
      await ApiService.reportConversation(conversationId, reason);
    } finally {
      setShowReportSuccess(true);
    }
  };

  const reportReasons = [
    { id: 'not-trustworthy', label: 'Not trustworthy' },
    { id: 'not-skilled', label: 'Not skilled' },
    { id: 'hate-speech', label: 'Hate speech or symbols' },
    { id: 'scam', label: 'Scam and fraud' },
    { id: 'bullying', label: 'Bullying harassment' },
  ];

  useEffect(() => {
    const firstOrderMessage = messages.find((m) => m.chatType === 'ORDER_REQUEST' || m.chatType === 'ORDER');
    const resolvedOrderId = orderId || getMessageOrderId(firstOrderMessage) || null;

    const isOrderChat = messages.some((m) => m.chatType === 'ORDER_REQUEST' || m.chatType === 'ORDER')

    if (!isOrderChat || !resolvedOrderId) return;
    const request =
      firstOrderMessage?.chatType === 'ORDER_REQUEST'
        ? ApiService.getOrderRequestById(String(resolvedOrderId))
        : ApiService.getOrderById(String(resolvedOrderId));

    request
      .then((res) => {
        const detail = normalizeOrderDetail(res);
        setOrderRequestDetail(detail);
      })
      .catch(() => setOrderRequestDetail(null));
  }, [orderId, messages]);

  useEffect(() => {
    const orderMessages = messages.filter((m) => {
      if (m.chatType !== 'ORDER' && m.chatType !== 'ORDER_REQUEST') return false;

      if (m.chatType === 'ORDER' && orderDetailsByMessageId[m.id]) return false;
      if (m.chatType === 'ORDER_REQUEST' && orderRequestDetailsByMessageId[m.id]) return false;

      const oid = getMessageOrderId(m);
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
        const oid = getMessageOrderId(m);
        const res =
          m.chatType === 'ORDER_REQUEST'
            ? await ApiService.getOrderRequestById(oid)
            : await ApiService.getOrderById(oid);
            
        const data = normalizeOrderDetail(res);
        return { messageId: m.id, data, type: m.chatType };
      }),
    ).then((results) => {
      const nextOrders: Record<string, any> = {};
      const nextRequests: Record<string, any> = {};

      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.data) {
          if (r.value.type === 'ORDER') {
            nextOrders[r.value.messageId] = r.value.data;
          } else if (r.value.type === 'ORDER_REQUEST') {
            nextRequests[r.value.messageId] = r.value.data;
          }
        }
      });

      if (Object.keys(nextOrders).length) {
        setOrderDetailsByMessageId((c) => ({ ...c, ...nextOrders }));
      }
      if (Object.keys(nextRequests).length) {
        setOrderRequestDetailsByMessageId((c) => ({ ...c, ...nextRequests }));
      }
    });
  }, [messages, orderDetailsByMessageId, orderRequestDetailsByMessageId]);

  useEffect(() => {
    const timer = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 80);
    return () => clearTimeout(timer);
  }, [messages]);

  type ChatType = 'ORDER' | 'ORDER_REQUEST' | 'DIRECT' | 'FILE';

  const resolvePayloadChatType = (isFile = false): ChatType => {
    if (isFile) return 'FILE';
    return 'DIRECT';
  };

  const buildPayload = (content: string, caption: string, isFile = false) => ({
    toProfileId: Number(conversation.participantId || participantId || 0),
    content,
    caption,
    chatType: resolvePayloadChatType(isFile),
  });

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
      // Immediately register that an offer exists so 'Create Offer' hides everywhere
      setOrderRequestDetail({ ...(created || orderRequestDetail), hasOffer: true });
      setOrderTitle('');
      setOrderDescription('');
      setOrderAmount('');
      setOrderDeliveryDate('');
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

  const refreshOrderDetail = async (id: string | number) => {
    const res = await ApiService.getOrderById(id);
    const detail = normalizeOrderDetail(res);
    if (detail) {
      setOrderRequestDetail(detail);
      setOrderDetailsByMessageId((current) => {
        const next = { ...current };
        Object.keys(next).forEach((key) => {
          if (String(next[key]?.id) === String(id)) next[key] = detail;
        });
        return next;
      });
      setSelectedOrderDetail(detail);
    }
    return detail;
  };

  const handleAcceptOffer = async (detail: any) => {
    if (!detail?.id) return;
    setUpdatingOrderId(String(detail.id));
    try {
      await ApiService.confirmOrder(detail.id);
      await refreshOrderDetail(detail.id);
      showAlert({ type: 'success', title: 'Offer accepted', message: 'The offer has been accepted.' });
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Could not accept offer',
        message: err?.response?.data?.responseMessage || err?.message || 'Please try again.',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRejectOffer = async (detail: any) => {
    if (!detail?.id) return;
    setUpdatingOrderId(String(detail.id));
    try {
      await ApiService.declineOrder(detail.id);
      await refreshOrderDetail(detail.id);
      showAlert({ type: 'success', title: 'Offer rejected', message: 'The offer has been rejected.' });
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Could not reject offer',
        message: err?.response?.data?.responseMessage || err?.message || 'Please try again.',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (detail: any) => {
    if (!detail?.id) return;
    setUpdatingOrderId(String(detail.id));
    try {
        await ApiService.declineOrder(detail.id); // Fallback if cancel logic shares the decline endpoint
      await refreshOrderDetail(detail.id);
      showAlert({ type: 'success', title: 'Order cancelled', message: 'The order has been cancelled.' });
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Could not cancel order',
        message: err?.response?.data?.responseMessage || err?.message || 'Please try again.',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeliveryDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (!selectedDate) return;
    setOrderDeliveryDate(formatDateForApi(selectedDate));
  };

  const handlePayForOrder = async (detail: any) => {
    await handleAcceptOffer(detail);
    setShowOrderDetails(false);
  };

  const resolveOtherAvatar = (message: ChatMessageDto & { imageUrl?: string }) => {
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

  const renderOrderCard = (orderDetail: any) => {
    if (!orderDetail) return null;
    const imageUrl = orderDetail.coverImageUrl;

    return (
      <View className="my-3 self-start">
        <Text className="mb-2 text-[13px] text-slate-500 dark:text-slate-400">Custom order offer</Text>
        <View style={{ width: 128 }}>
          {imageUrl ? (
            <TouchableOpacity onPress={() => setSelectedImage(imageUrl)} activeOpacity={0.85}>
              <Image source={{ uri: imageUrl }} style={{ width: 112, height: 124 }} contentFit="cover" />
            </TouchableOpacity>
          ) : (
            <View className="items-center justify-center bg-slate-100 dark:bg-slate-800" style={{ width: 112, height: 124 }}>
              <Ionicons name="image-outline" size={24} color={themeSecondaryIconColor} />
            </View>
          )}
          <Text className="mt-2 text-[11px] text-slate-700 dark:text-slate-200" numberOfLines={1}>
            {orderDetail.title || orderDetail.purpose || 'Custom order'}
          </Text>
          <TouchableOpacity
            className="mt-1 items-center bg-[#4A3298] py-2"
            style={{ width: 112 }}
            onPress={() => {
              setSelectedOrderDetail(orderDetail);
              setShowOrderDetails(true);
            }}>
            <Text className="text-[11px] font-semibold text-white">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOrderRequestCard = (orderRequestDetailParams:any) => {
    if (!orderRequestDetailParams) return null;
    const detail = orderRequestDetailParams;
    const hasOffer = detail.hasOffer || Boolean(detail.id && detail.title);
    const canRespondToOffer = isCustomer && hasOffer && isReviewStatus(detail.orderStatus);
    const isUpdatingThisOrder = updatingOrderId === String(detail.id);
    
    return (
      <View className="mx-4 my-3">
        {hasOffer ? (
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mt-1">
            <Text className="text-center text-[13px] text-slate-500 dark:text-slate-400 mb-3">
              {isDesigner ? 'You have an offer sent to this customer' : 'Order details'}
            </Text>
            <Text className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 text-center">{detail.title || 'Order offer'}</Text>
            <Text className="text-[13px] text-slate-500 dark:text-slate-400 text-center mt-1" numberOfLines={2}>{detail.description}</Text>
            <Text className="text-[13px] text-slate-700 dark:text-slate-200 text-center mt-2 font-medium">
              Total Amount: {formatCurrency(detail.totalAmount || detail.designAmount || detail.printingAmount)}
            </Text>
            <Text className="text-[12px] text-slate-500 dark:text-slate-400 text-center mt-1">
              Timeline: Due on {formatDateLabel(detail.deliveryDate || detail.dateOfDelivery)}
            </Text>
            <Text className="text-[12px] text-slate-500 dark:text-slate-400 text-center mt-0.5">
              Status: {detail.orderStatus || 'ACTIVE'}
            </Text>

            <TouchableOpacity
              className="mt-3 border border-[#4A3298] rounded-lg py-2 items-center"
              onPress={() => { setSelectedOrderDetail(detail); setShowOrderDetails(true); }}>
              <Text className="text-[#4A3298] text-[14px] font-semibold">View Details</Text>
            </TouchableOpacity>

            {isDesigner && isReviewStatus(detail.orderStatus) && (
              <TouchableOpacity
                className={`mt-3 rounded-lg py-2 items-center border ${isUpdatingThisOrder ? 'bg-slate-100 border-slate-200' : 'bg-red-50 border-red-500 dark:bg-red-500/10 dark:border-red-500/30'}`}
                disabled={isUpdatingThisOrder}
                onPress={() => handleCancelOrder(detail)}>
                {isUpdatingThisOrder ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Text className="text-red-500 text-[14px] font-semibold">Cancel Order</Text>
                )}
              </TouchableOpacity>
            )}

            {canRespondToOffer ? (
              <View className="flex-row gap-3 mt-3">
                <TouchableOpacity
                  className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 items-center"
                  disabled={isUpdatingThisOrder}
                  onPress={() => handleRejectOffer(detail)}>
                  <Text className="text-slate-700 dark:text-slate-200 text-[14px] font-semibold">Reject Offer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 rounded-lg py-2.5 items-center ${isUpdatingThisOrder ? 'bg-slate-400' : 'bg-[#4A3298]'}`}
                  disabled={isUpdatingThisOrder}
                  onPress={() => handleAcceptOffer(detail)}>
                  {isUpdatingThisOrder ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-[14px] font-semibold">Accept Offer</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : isAcceptedStatus(detail.orderStatus) ? (
              <Text className="text-[12px] text-green-600 dark:text-green-400 text-center mt-3 font-semibold">Offer accepted</Text>
            ) : isRejectedStatus(detail.orderStatus) ? (
              <Text className="text-[12px] text-red-500 text-center mt-3 font-semibold">Offer rejected</Text>
            ) : null}
          </View>
        ) : (
          <View className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mt-1">
            <Text className="text-center text-[13px] text-slate-500 dark:text-slate-400 mb-3">
              {isDesigner ? 'You received an order request' : 'Waiting for offer from designer'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderMessage = (message: ChatMessageDto & { imageUrl?: string }) => {
    const orderDetail = orderDetailsByMessageId[message.id];
    const orderRequest = orderRequestDetailsByMessageId[message.id]; 
    
    if (message.chatType === 'ORDER' && orderDetail) {
      return renderOrderRequestCard(orderDetail);
    }

    if (message.chatType === 'ORDER_REQUEST' && orderRequest) {
      return renderOrderCard(orderRequest);
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

  const canShowModalCreateOffer = isDesigner && Boolean(selectedOrderDetail) && !selectedOrderDetail?.hasOffer && isReviewStatus(selectedOrderDetail?.orderStatus) && !isRejectedStatus(selectedOrderDetail?.orderStatus);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>

          {/* Header */}
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
            <TouchableOpacity onPress={() => openActionSheet()} className="w-10 h-10 items-center justify-center">
              <Ionicons name="ellipsis-vertical" size={20} color={themeSecondaryIconColor} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            >
            {isLoading ? (
              <View className="py-10 items-center justify-center gap-3">
                <ActivityIndicator size="small" color="#4A3298" />
                <Text className="text-slate-500 dark:text-slate-400 text-sm">Loading messages...</Text>
              </View>
            ) : (
              <>
                {displayMessages.map((message, index) => (
                  <React.Fragment key={getMessageKey(message, index)}>
                    {renderMessage(message)}
                  </React.Fragment>
                ))}
              </>
            )}
          </ScrollView>

          {/* Composer */}
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

      {/* Lightbox */}
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

      {/* Conversation actions */}

            <Modal transparent visible={showActions} animationType="slide" onRequestClose={closeAllModals}>
              <Pressable className="flex-1 justify-end bg-black/40" onPress={closeAllModals}>
                <Pressable className="rounded-t-[32px] bg-white px-6 pb-8 pt-5 dark:bg-[#1E1E1E]" onPress={(event) => event.stopPropagation()}>
                  <View className="mb-5 h-1.5 w-14 self-center rounded-full bg-[#E5DFEF] dark:bg-[#3B3B3B]" />
                  <TouchableOpacity
                    className="flex-row items-center py-3"
                    onPress={() => {
                      setShowActions(false);
                      setShowDeleteModal(true);
                    }}>
                    <Ionicons name="trash-outline" size={22} color="#FF6B63" />
                    <Text className="ml-4 text-base font-semibold text-[#2F2A36] dark:text-white">Delete</Text>
                  </TouchableOpacity>
                  <View className="my-2 h-px bg-[#F1EDF6] dark:bg-[#2F2F2F]" />
                  <TouchableOpacity
                    className="flex-row items-center py-3"
                    onPress={() => {
                      setShowActions(false);
                      setShowReportReasons(true);
                    }}>
                    <Ionicons name="alert-circle-outline" size={22} color="#FF6B63" />
                    <Text className="ml-4 text-base font-semibold text-[#2F2A36] dark:text-white">Report</Text>
                  </TouchableOpacity>
                </Pressable>
              </Pressable>
            </Modal>
      
            <Modal transparent visible={showDeleteModal} animationType="fade" onRequestClose={closeAllModals}>
              <View className="flex-1 items-center justify-center bg-black/50 px-6">
                <View className="w-full max-w-[340px] rounded-[28px] bg-white p-6 dark:bg-[#1E1E1E]">
                  <TouchableOpacity className="self-end" onPress={closeAllModals}>
                    <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#2B2833'} />
                  </TouchableOpacity>
                  <Text className="mt-2 text-center text-sm leading-6 text-[#4D4759] dark:text-gray-300">
                    Are you sure you want to delete this chat? Your conversation with this user will not be seen again.
                  </Text>
                  <View className="mt-5 flex-row border-t border-[#EFEAF6] pt-4 dark:border-[#2F2F2F]">
                    <TouchableOpacity className="flex-1 items-center" onPress={closeAllModals}>
                      <Text className="text-base font-medium text-[#8F879F] dark:text-gray-400">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 items-center" onPress={handleDeleteConversation}>
                      <Text className="text-base font-semibold text-[#FF6B63]">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
      
            <Modal transparent visible={showReportReasons} animationType="slide" onRequestClose={closeAllModals}>
              <Pressable className="flex-1 justify-end bg-black/40" onPress={closeAllModals}>
                <Pressable className="rounded-t-[32px] bg-white px-6 pb-8 pt-6 dark:bg-[#1E1E1E]" onPress={(event) => event.stopPropagation()}>
                  <Text className="mb-4 text-center text-lg font-bold text-[#2F2A36] dark:text-white">Report</Text>
                  {reportReasons.map((reason) => (
                    <TouchableOpacity key={reason.id} className="border-b border-[#F2EEF8] py-4 dark:border-[#2F2F2F]" onPress={() => handleReportConversation(reason.label)}>
                      <Text className="text-sm text-[#4D4759] dark:text-gray-300">{reason.label}</Text>
                    </TouchableOpacity>
                  ))}
                </Pressable>
              </Pressable>
            </Modal>
      
            <Modal transparent visible={showReportSuccess} animationType="fade" onRequestClose={() => setShowReportSuccess(false)}>
              <View className="flex-1 items-center justify-center bg-black/50 px-6">
                <View className="w-full max-w-[360px] items-center rounded-[28px] bg-white p-6 dark:bg-[#1E1E1E]">
                  <Text className="text-base font-bold text-[#2F2A36] dark:text-white">Report</Text>
                  <View className="my-5 h-24 w-24 items-center justify-center rounded-full bg-[#EAF0FF] dark:bg-[#25314E]">
                    <Ionicons name="checkmark" size={54} color="#3452B3" />
                  </View>
                  <Text className="text-xl font-bold text-[#2B2833] dark:text-white">Thanks for reporting</Text>
                  <Text className="mt-3 text-center text-sm leading-6 text-[#6E677C] dark:text-gray-400">
                    We will review your report and take action if there is a violation of community guidelines.
                  </Text>
                  <TouchableOpacity
                    className="mt-5 w-full items-center rounded-2xl bg-[#FF726B] py-4"
                    onPress={() => {
                      setShowReportSuccess(false);
                    }}>
                    <Text className="text-base font-bold text-white">Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

      {/* Product Details modal */}
      <Modal transparent visible={showProductDetails} animationType="slide" onRequestClose={() => setShowProductDetails(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowProductDetails(false)}>
          <Pressable className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
            <View className="flex-row justify-between items-center mb-5">
              <View className="w-6" />
              <Text className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">Product details and specifications</Text>
              <TouchableOpacity onPress={() => setShowProductDetails(false)}>
                <Ionicons name="close" size={24} color={themeIconColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
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

            {isDesigner && isReviewStatus(orderRequestDetail?.orderStatus) && !orderRequestDetail?.hasOffer ? (
              <TouchableOpacity
                className="bg-[#4A3298] rounded-full py-4 items-center mt-4"
                onPress={() => { setShowProductDetails(false); setShowCreateOrder(true); }}>
                <Text className="text-white text-[16px] font-bold">Create Offer</Text>
              </TouchableOpacity>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Create New Order modal */}
      <Modal transparent visible={showCreateOrder} animationType="slide" onRequestClose={() => setShowCreateOrder(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowCreateOrder(false)}>
          <Pressable className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
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
              <Text className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-1">Order title</Text>
              <TextInput
                value={orderTitle}
                onChangeText={setOrderTitle}
                placeholder="Write title"
                placeholderTextColor="#94a3b8"
                className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] text-slate-900 dark:text-slate-100 mb-4 bg-white dark:bg-slate-800"
              />

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

              <Text className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Agreed date of delivery
              </Text>
              <TouchableOpacity
                className="flex-row items-center border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-3 bg-white dark:bg-slate-800"
                onPress={() => setShowDatePicker(true)}>
                <Text className={`flex-1 text-[15px] ${orderDeliveryDate ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                  {orderDeliveryDate ? formatDateLabel(orderDeliveryDate) : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={themeSecondaryIconColor} />
              </TouchableOpacity>
              {showDatePicker ? (
                <DateTimePicker
                  value={orderDeliveryDate ? new Date(orderDeliveryDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  onChange={handleDeliveryDateChange}
                />
              ) : null}
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

      {/* Order Details modal */}
      <Modal transparent visible={showOrderDetails} animationType="slide" onRequestClose={() => setShowOrderDetails(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowOrderDetails(false)}>
          <Pressable className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
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
                    <Text className="text-[14px] text-slate-600 dark:text-slate-300">{selectedOrderDetail.title || selectedOrderDetail.purpose || 'Custom order'}</Text>
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
                {canShowModalCreateOffer && (
                <TouchableOpacity
                className="bg-[#4A3298] rounded-full py-3 items-center mt-2"
                onPress={() => setShowCreateOrder(true)}>
                <Text className="text-white text-[15px] font-bold">Create Offer</Text>
                </TouchableOpacity>
                )}
                </>
              ) : null}
            </ScrollView>
            
            {/* Added modal cancel view for designers too, just to be thorough */}
            {selectedOrderDetail && isDesigner && isReviewStatus(selectedOrderDetail.orderStatus) ? (
              <View className="mt-4 flex-row gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <TouchableOpacity
                  className={`flex-1 items-center rounded-full border py-3 ${updatingOrderId === String(selectedOrderDetail.id) ? 'bg-slate-100 border-slate-200' : 'border-red-500 bg-red-50 dark:bg-red-500/10'}`}
                  disabled={updatingOrderId === String(selectedOrderDetail.id)}
                  onPress={() => handleCancelOrder(selectedOrderDetail)}>
                  {updatingOrderId === String(selectedOrderDetail.id) ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Text className="text-[14px] font-semibold text-red-500">Cancel Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            {selectedOrderDetail && isCustomer && isReviewStatus(selectedOrderDetail.orderStatus) ? (
              <View className="mt-4 flex-row gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <TouchableOpacity
                  className="flex-1 items-center rounded-full border border-[#4A3298] py-3"
                  disabled={updatingOrderId === String(selectedOrderDetail.id)}
                  onPress={() => handleRejectOffer(selectedOrderDetail)}>
                  <Text className="text-[14px] font-semibold text-[#4A3298]">Reject Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 items-center rounded-full py-3 ${updatingOrderId === String(selectedOrderDetail.id) ? 'bg-slate-400' : 'bg-[#4A3298]'}`}
                  disabled={updatingOrderId === String(selectedOrderDetail.id)}
                  onPress={() => handlePayForOrder(selectedOrderDetail)}>
                  {updatingOrderId === String(selectedOrderDetail.id) ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-[14px] font-semibold text-white">Pay for Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Order created success toast */}
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

      {/* Alert modal */}
      {alertElement}

    </View>
  );
}