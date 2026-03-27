import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AvatarBadge } from '@/components/messages/AvatarBadge';
import {
  normalizeConversationsResponse,
  normalizeMessagesResponse,
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

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { conversationId, participantId, participantName, printerId } = useLocalSearchParams<{ conversationId?: string; participantId?: string; participantName?: string; printerId?: string }>();

  const [conversation, setConversation] = useState<ConversationSummaryDto>({
    id: String(conversationId || printerId || 'new-conversation'),
    name: participantName || 'Conversation',
    role: 'Designer',
    avatarColor: '#A9D8FF',
    avatarEmoji: '🤓',
    lastMessage: '',
    unreadCount: 0,
    updatedAtLabel: 'Now',
    participantId: participantId ? Number(participantId) : printerId ? Number(printerId) : undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [draft, setDraft] = useState('');
  const [showConversationActions, setShowConversationActions] = useState(false);
  const [showOfferDetail, setShowOfferDetail] = useState(false);

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
          if (selected) {
            setConversation((current) => ({ ...current, ...selected }));
          }

          setMessages(normalizeMessagesResponse(messagesRes, me?.id));
        }
      } catch (error) {
        console.error('Failed to load chat', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [conversationId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    const newMessage: ChatMessageDto = {
      id: `local-${Date.now()}`,
      type: 'text',
      author: 'me',
      text: trimmed,
      createdAtLabel: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent',
    };

    setMessages((current) => [...current, newMessage]);
    setDraft('');

    try {
      await ApiService.sendMessage(String(conversation.id), {
        content: trimmed,
        receiverId: conversation.participantId,
      });
    } catch (error) {
      console.warn('Message endpoint unavailable. Message queued locally.', error);
    }
  };

  const renderMessage = (message: ChatMessageDto) => {
    if (message.type === 'bundle' && message.bundle) {
      return (
        <View key={message.id} style={[styles.messageRow, styles.myRow]}>
          <View style={styles.bundleCard}>
            <View style={styles.bundleGrid}>
              {message.bundle.items.map((item) => (
                <View key={item.id} style={styles.bundleTile}>
                  <Image source={item.image} style={styles.bundleImage} contentFit="cover" />
                  {item.overlayText ? (
                    <View style={styles.bundleOverlay}>
                      <Text style={styles.bundleOverlayText}>{item.overlayText}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.bundleFooter} onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.bundleFooterText}>{message.bundle.footerLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (message.type === 'offer' && message.offer) {
      return (
        <View key={message.id} style={[styles.messageRow, styles.otherRow]}>
          <View style={styles.offerShell}>
            <Text style={styles.offerCaption}>{message.offer.description}</Text>
            <View style={styles.offerCard}>
              <Image source={message.offer.image} style={styles.offerImage} contentFit="contain" />
              <View style={styles.offerInfo}>
                <Text style={styles.offerTitle}>{message.offer.title}</Text>
                <Text style={styles.offerPrice}>{message.offer.priceLabel}</Text>
              </View>
              <TouchableOpacity style={styles.offerButton} onPress={() => setShowOfferDetail(true)}>
                <Text style={styles.offerButtonText}>{message.offer.ctaLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    const isMe = message.author === 'me';

    return (
      <View
        key={message.id}
        style={[styles.messageRow, isMe ? styles.myRow : styles.otherRow]}>
        {!isMe ? (
          <View style={styles.otherAvatarWrapper}>
            <AvatarBadge
              color={conversation.avatarColor}
              emoji={conversation.avatarEmoji}
              size={36}
            />
          </View>
        ) : null}
        <View style={[styles.textBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {message.text}
          </Text>
          <Text style={[styles.messageMeta, isMe ? styles.myMeta : styles.otherMeta]}>
            {isMe ? `${message.status === 'seen' ? 'Seen • ' : ''}${message.createdAtLabel}` : `${message.createdAtLabel}${message.status === 'seen' ? ' • Seen' : ''}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="#2C2733" />
            </TouchableOpacity>
            <View style={styles.headerIdentity}>
              <AvatarBadge
                color={conversation.avatarColor}
                emoji={conversation.avatarEmoji}
                size={40}
              />
              <View>
                <Text style={styles.headerName}>{conversation.name}</Text>
                <Text style={styles.headerMeta}>2hrs ago</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowConversationActions(true)}
              style={styles.iconButton}>
              <Ionicons name="ellipsis-vertical" size={20} color="#787381" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.thread}
            contentContainerStyle={styles.threadContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {isLoading ? <View style={styles.threadLoader}><Ionicons name="chatbox-ellipses-outline" size={28} color="#8A8298" /><Text style={styles.threadLoaderText}>Loading messages...</Text></View> : messages.map(renderMessage)}
          </ScrollView>

          <View style={styles.composerBar}>
            <View style={styles.composerInputShell}>
              <TouchableOpacity style={styles.composerIcon}>
                <Feather name="smile" size={21} color="#8F8A9C" />
              </TouchableOpacity>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Send message"
                placeholderTextColor="#9A94A7"
                multiline
                style={styles.composerInput}
              />
              <TouchableOpacity style={styles.composerIcon}>
                <Feather name="image" size={21} color="#8F8A9C" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.composerIcon}>
                <Feather name="paperclip" size={21} color="#8F8A9C" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!draft.trim()}>
              <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          transparent
          visible={showConversationActions}
          animationType="slide"
          onRequestClose={() => setShowConversationActions(false)}>
          <Pressable
            style={styles.overlay}
            onPress={() => setShowConversationActions(false)}>
            <Pressable style={styles.menuSheet} onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <TouchableOpacity style={styles.menuAction}>
                <Ionicons name="trash-outline" size={22} color="#FF6B63" />
                <Text style={styles.menuActionText}>Delete</Text>
              </TouchableOpacity>
              <View style={styles.sheetDivider} />
              <TouchableOpacity style={styles.menuAction}>
                <Ionicons name="alert-circle-outline" size={22} color="#FF6B63" />
                <Text style={styles.menuActionText}>Report</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          transparent
          visible={showOfferDetail}
          animationType="slide"
          onRequestClose={() => setShowOfferDetail(false)}>
          <Pressable style={styles.overlay} onPress={() => setShowOfferDetail(false)}>
            <Pressable style={styles.detailSheet} onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>Order Detail</Text>
                <TouchableOpacity onPress={() => setShowOfferDetail(false)}>
                  <Ionicons name="close" size={22} color="#2C2733" />
                </TouchableOpacity>
              </View>
              <Text style={styles.detailLead}>
                Review the custom offer and confirm the details before continuing.
              </Text>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Order title</Text>
                <Text style={styles.detailValue}>{OFFER_DETAILS.title}</Text>
              </View>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Agreed description</Text>
                <Text style={styles.detailValue}>{OFFER_DETAILS.description}</Text>
              </View>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Agreed amount</Text>
                <Text style={styles.detailStrong}>{OFFER_DETAILS.amount}</Text>
              </View>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Selected item source</Text>
                <Text style={styles.detailValue}>{OFFER_DETAILS.source}</Text>
              </View>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Need pickup logistics</Text>
                <Text style={styles.detailValue}>{OFFER_DETAILS.logistics}</Text>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setShowOfferDetail(false);
                  router.push('/(tabs)/checkout');
                }}>
                <Text style={styles.primaryButtonText}>Accept offer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowOfferDetail(false)}>
                <Text style={styles.secondaryButtonText}>Not now</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EEF7',
  },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1A26',
  },
  headerMeta: {
    fontSize: 13,
    color: '#9792A8',
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thread: {
    flex: 1,
  },
  threadContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 12,
  },
  threadLoader: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  threadLoaderText: {
    color: "#8A8298",
    fontSize: 14,
  },
  messageRow: {
    width: '100%',
  },
  myRow: {
    alignItems: 'flex-end',
  },
  otherRow: {
    alignItems: 'flex-start',
  },
  bundleCard: {
    width: '78%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D9CEF3',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  bundleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bundleTile: {
    width: '50%',
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#ECE7F6',
  },
  bundleImage: {
    width: '100%',
    height: '100%',
  },
  bundleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58, 38, 114, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bundleOverlayText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  bundleFooter: {
    borderTopWidth: 1,
    borderTopColor: '#ECE7F6',
    paddingVertical: 14,
    alignItems: 'center',
  },
  bundleFooterText: {
    color: '#4A3298',
    fontSize: 18,
    fontWeight: '600',
  },
  offerShell: {
    width: '82%',
  },
  offerCaption: {
    color: '#9B96A8',
    fontSize: 16,
    marginBottom: 10,
  },
  offerCard: {
    width: 192,
    borderWidth: 1,
    borderColor: '#D9CEF3',
    backgroundColor: '#FFFFFF',
  },
  offerImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F7F5FB',
  },
  offerInfo: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  offerTitle: {
    fontSize: 15,
    color: '#3A3744',
  },
  offerPrice: {
    fontSize: 14,
    color: '#1760D5',
    fontWeight: '700',
  },
  offerButton: {
    backgroundColor: '#4A3298',
    paddingVertical: 12,
    alignItems: 'center',
  },
  offerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  otherAvatarWrapper: {
    marginBottom: 8,
    marginLeft: 4,
  },
  textBubble: {
    maxWidth: '78%',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  myBubble: {
    backgroundColor: '#4A3298',
    borderTopRightRadius: 8,
  },
  otherBubble: {
    backgroundColor: '#F7F6FA',
    borderTopLeftRadius: 8,
    marginLeft: 44,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 24,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#35313F',
  },
  messageMeta: {
    marginTop: 8,
    fontSize: 12,
  },
  myMeta: {
    color: '#DAD1F6',
    textAlign: 'right',
  },
  otherMeta: {
    color: '#ACA6B9',
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 22, default: 16 }),
    borderTopWidth: 1,
    borderTopColor: '#F2EEF7',
    backgroundColor: '#FFFFFF',
  },
  composerInputShell: {
    flex: 1,
    minHeight: 54,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#DED8E9',
    borderRadius: 28,
    backgroundColor: '#FAF9FC',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  composerIcon: {
    width: 30,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerInput: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: '#2B2833',
    maxHeight: 96,
  },
  sendButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4A3298',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C8C1DC',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 13, 28, 0.42)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 34,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 96,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D8D4E1',
    marginBottom: 24,
  },
  menuAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  menuActionText: {
    fontSize: 16,
    color: '#26222E',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F0ECF6',
  },
  detailSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2833',
  },
  detailLead: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8D8798',
    marginBottom: 20,
  },
  detailBlock: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B2833',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6E697B',
  },
  detailStrong: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A68DA',
  },
  primaryButton: {
    backgroundColor: '#4A3298',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1DCEE',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#6E697B',
    fontSize: 16,
    fontWeight: '600',
  },
});
