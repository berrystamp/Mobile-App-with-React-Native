import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarBadge } from '@/components/messages/AvatarBadge';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ENV } from '@/lib/config/env';
import { appendLocalConversationMessage, getLocalConversationById } from '@/lib/localConversations';
import {
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
  
  const { conversationId, participantId, participantName, printerId, localConversationId, participantRole } = useLocalSearchParams<{
    conversationId?: string;
    participantId?: string;
    participantName?: string;
    printerId?: string;
    localConversationId?: string;
    participantRole?: string;
  }>();

  const [conversation, setConversation] = useState<ConversationSummaryDto>({
    id: String(localConversationId || conversationId || printerId || 'new-conversation'),
    name: participantName || 'Conversation',
    role: participantRole === 'Printers' ? 'Printers' : 'Designer',
    avatarColor: '#A9D8FF',
    avatarEmoji: '🤓',
    lastMessage: '',
    unreadCount: 0,
    updatedAtLabel: 'Now',
    participantId: participantId ? Number(participantId) : printerId ? Number(printerId) : undefined,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<(ChatMessageDto & { imageUrl?: string })[]>([]);
  const [draft, setDraft] = useState('');
  const [showConversationActions, setShowConversationActions] = useState(false);
  const [showOfferDetail, setShowOfferDetail] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const me = await ApiService.getCurrentUser();

        if (localConversationId) {
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
              localConversation.messages.map((message) => ({
                id: message.id,
                type: 'text',
                author: message.author,
                text: message.text,
                imageUrl: isImageContent(message.text) ? resolveImageUri(message.text) : undefined,
                createdAtLabel: formatMessageTime(message.createdAt),
                status: message.status,
              })),
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

          const content = messagesRes?.responseBody?.content || messagesRes?.content || messagesRes?.data || messagesRes || [];
          const list = Array.isArray(content) ? content : [];

          setMessages(
            list.map((item: any, index: number) =>
              withImageMetadata({
                id: String(item.id || `${index}`),
                type: 'text',
                author: Number(item.senderId) === Number(me?.id) ? 'me' : 'other',
                text: item.content || item.text || '',
                createdAtLabel: formatMessageTime(item.createdAt),
                status: item.read ? 'seen' : 'sent',
              }),
            ),
          );
        }
      } catch (error) {
        console.error('Failed to load chat', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [conversationId, localConversationId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newMessage = {
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
      if (localConversationId) {
        await appendLocalConversationMessage(String(localConversationId), {
          id: newMessage.id,
          text: trimmed,
          author: 'me',
          createdAt: new Date().toISOString(),
          status: 'sent',
        });
      } else {
        await ApiService.sendMessage(String(conversation.id), {
          content: trimmed,
          receiverId: conversation.participantId,
        });
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
          const newMessage = {
            id: `img-${Date.now()}`,
            type: 'text' as const,
            author: 'me',
            text: uploaded.path,
            imageUrl: resolveImageUri(uploaded.path),
            createdAtLabel: formatMessageTime(new Date()),
            status: 'sent',
          };

          setMessages((current) => [...current, newMessage]);

          if (localConversationId) {
            await appendLocalConversationMessage(String(localConversationId), {
              id: newMessage.id,
              text: uploaded.path,
              author: 'me',
              createdAt: new Date().toISOString(),
              status: 'sent',
            });
          } else {
            await ApiService.sendMessage(String(conversation.id), {
              content: uploaded.path,
              receiverId: conversation.participantId,
            });
          }
        }
      } catch (error) {
        console.error('Image upload failed', error);
      }
    }
  };

  const renderMessage = (message: ChatMessageDto & { imageUrl?: string }) => {
    if (message.type === 'bundle' && message.bundle) {
      return (
        <View key={message.id} className="w-full items-end my-1">
          <View className="w-[78%] rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
            <View className="flex-row flex-wrap">
              {message.bundle.items.map((item) => (
                <View key={item.id} className="w-1/2 aspect-square border-[0.5px] border-slate-100 dark:border-slate-700">
                  <Image source={item.image} className="w-full h-full" contentFit="cover" />
                  {item.overlayText && (
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <Text className="text-white text-xl font-bold">{item.overlayText}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            <TouchableOpacity className="border-t border-slate-100 dark:border-slate-700 py-3 items-center" onPress={() => router.push('/(tabs)/products')}>
              <Text className="text-indigo-600 dark:text-indigo-400 text-lg font-semibold">{message.bundle.footerLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (message.type === 'offer' && message.offer) {
      return (
        <View key={message.id} className="w-full items-start my-1">
          <View className="w-[82%]">
            <Text className="text-slate-500 dark:text-slate-400 text-sm mb-2">{message.offer.description}</Text>
            <View className="w-[192px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
              <Image source={message.offer.image} className="w-full h-[180px] bg-slate-50 dark:bg-slate-900" contentFit="contain" />
              <View className="px-3 pt-3 pb-4 gap-1">
                <Text className="text-[15px] text-slate-800 dark:text-slate-200 font-medium">{message.offer.title}</Text>
                <Text className="text-[14px] text-blue-600 dark:text-blue-400 font-bold">{message.offer.priceLabel}</Text>
              </View>
              <TouchableOpacity className="bg-indigo-600 dark:bg-indigo-700 py-3 items-center" onPress={() => setShowOfferDetail(true)}>
                <Text className="text-white text-[15px] font-bold">{message.offer.ctaLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    const isMe = message.author === 'me';
    const displayUrl = message.imageUrl || (isImageContent(message.text) ? resolveImageUri(message.text) : '');
    const isImage = Boolean(displayUrl);
   
    return (
      <View key={message.id} className={`w-full my-1 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="mr-2 self-end mb-1">
            <AvatarBadge color={conversation.avatarColor} emoji={conversation.avatarEmoji} size={32} />
          </View>
        )}
        <View className={`max-w-[78%] rounded-2xl px-4 py-3 ${isMe ? 'bg-indigo-600 dark:bg-indigo-700 rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm'}`}>
          {isImage ? (
             <Image source={{ uri: displayUrl.replace("https://berrystamp-backend-dev-4cn29.ondigitalocean.app","https://berry-stamp-prod.s3.amazonaws.com") }} className="w-[200px] h-[200px] rounded-lg" contentFit="cover" />
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
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <View className="flex-1">
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            style={{ paddingTop: Math.max(insets.top, 12) + 4 }}
          >
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
              <Ionicons name="arrow-back" size={24} className="text-slate-800 dark:text-slate-100" color="currentColor" />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center gap-3 ml-2">
              <AvatarBadge color={conversation.avatarColor} emoji={conversation.avatarEmoji} size={40} />
              <View>
                <Text className="text-[17px] font-bold text-slate-900 dark:text-slate-100">{conversation.name}</Text>
                <Text className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Active</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowConversationActions(true)} className="w-10 h-10 items-center justify-center">
              <Ionicons name="ellipsis-vertical" size={20} className="text-slate-500 dark:text-slate-400" color="currentColor" />
            </TouchableOpacity>
          </View>

          {/* Thread */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
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
              messages.map( renderMessage)
            )}
          </ScrollView>

          {/* Composer */}
          <View
            className="flex-row items-end px-4 pt-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
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
                  <Feather name="image" size={20} className="text-slate-500 dark:text-slate-400" color="currentColor" />
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
        </View>

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
                  <Ionicons name="close" size={24} className="text-slate-900 dark:text-slate-100" color="currentColor" />
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

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
