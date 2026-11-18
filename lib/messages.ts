import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import type { Message } from '@/types';

const READ_CONVERSATIONS_STORAGE_KEY = 'berrystamp_read_conversations_v1';
const localReadMap = new Map<string, { timestampMs: number; lastMessageId?: string }>();
let readMapHydrated = false;

const ensureReadMapHydrated = () => {
  if (readMapHydrated) return;
  readMapHydrated = true;
  AsyncStorage.getItem(READ_CONVERSATIONS_STORAGE_KEY)
    .then((raw) => {
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([key, val]: [string, any]) => {
          if (val && typeof val === 'object') {
            localReadMap.set(key, {
              timestampMs: Number(val.timestampMs || 0),
              lastMessageId: val.lastMessageId ? String(val.lastMessageId) : undefined,
            });
          }
        });
      }
    })
    .catch(() => {});
};

ensureReadMapHydrated();

export function markConversationReadLocally(
  conversationId?: string | number,
  lastMessageId?: string | number,
  lastMessageTimestamp?: string,
) {
  if (conversationId === undefined || conversationId === null) return;
  const key = String(conversationId);
  const msgTime = lastMessageTimestamp ? new Date(lastMessageTimestamp).getTime() : 0;
  const timestampMs = Math.max(Date.now(), Number.isFinite(msgTime) ? msgTime : 0);
  const existing = localReadMap.get(key);
  localReadMap.set(key, {
    timestampMs: Math.max(timestampMs, existing?.timestampMs || 0),
    lastMessageId: lastMessageId ? String(lastMessageId) : existing?.lastMessageId,
  });

  const serialized: Record<string, { timestampMs: number; lastMessageId?: string }> = {};
  localReadMap.forEach((value, k) => {
    serialized[k] = value;
  });
  AsyncStorage.setItem(READ_CONVERSATIONS_STORAGE_KEY, JSON.stringify(serialized)).catch(() => {});
}

export function isConversationReadLocally(
  conversationId?: string | number,
  lastMessageId?: string | number,
  lastMessageTimestamp?: string,
): boolean {
  if (conversationId === undefined || conversationId === null) return false;
  const entry = localReadMap.get(String(conversationId));
  if (!entry) return false;
  if (lastMessageId && entry.lastMessageId && String(lastMessageId) === String(entry.lastMessageId)) {
    return true;
  }
  if (lastMessageTimestamp) {
    const msgTime = new Date(lastMessageTimestamp).getTime();
    if (Number.isFinite(msgTime) && entry.timestampMs >= msgTime) {
      return true;
    }
  }
  return Boolean(!lastMessageTimestamp && !lastMessageId && entry.timestampMs > 0);
}

export interface BackendMediaAsset {
  id?: number;
  name?: string;
  path?: string;
  originalFilePath?: string;
  size?: number;
  contentType?: string;
  previewPath?: string;
  thumbnailPath?: string;
  exactHash?: string;
  perceptualHash?: number;
  url?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  originalUrl?: string;
}

export interface BackendProfileRating {
  id?: number;
  total1Star?: number;
  total2Star?: number;
  total3Star?: number;
  total4Star?: number;
  total5Star?: number;
  avgStars?: number;
}

export interface BackendProfileInsight {
  totalFollowers?: number;
  totalFollowing?: number;
  totalUploads?: number;
  rating?: BackendProfileRating;
  totalEarnings?: number;
  totalReviews?: number;
  totalCancelledOrders?: number;
  totalCompletedOrders?: number;
  jobSuccessPercentage?: number;
}

export interface BackendParticipantProfile {
  id?: number;
  profileType?: 'CUSTOMER' | 'DESIGNER' | 'PRINTER' | string;
  status?: string;
  name?: string;
  profileImage?: BackendMediaAsset;
  coverImage?: BackendMediaAsset;
  bio?: string;
  reasonForProbation?: string;
  reasonForTermination?: string;
  probationDate?: string;
  terminationDate?: string;
  insight?: BackendProfileInsight;
  distanceInKm?: number;
  userId?: number;
  userName?: string;
  profilePic?: string;
  previewProfilePic?: string;
  thumbnailProfilePic?: string;
  coverPic?: string;
  previewCoverPic?: string;
  thumbnailCoverPic?: string;
  categories?: string[];
  userEmail?: string;
  userPhone?: string;
}

export interface BackendConversationMessage {
  id?: string | number;
  messageId?: string | number;
  content?: string;
  caption?: string;
  sender?: BackendParticipantProfile;
  receiver?: BackendParticipantProfile;
  read?: boolean;
  readDateTime?: string;
  chatType?: string;
  messageIdentifier?: string;
  conversationId?: number;
  conversationName?: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string;
}

export interface BackendConversation {
  id?: number;
  conversationName?: string;
  type?: string;
  hasUnreadMessages?: boolean;
  unreadMessageCount?: number;
  lastMessageTimestamp?: string;
  participants?: BackendParticipantProfile[];
  lastMessage?: BackendConversationMessage;
}

export interface ConversationSummaryDto {
  id: string;
  source: 'backend' | 'local';
  name: string;
  role: 'Designer' | 'Printers' | 'Customer';
  avatarColor: string;
  avatarEmoji: string;
  avatarImageUrl?: string;
  avatarThumbnailUrl?: string;
  avatarPreviewUrl?: string;
  avatarInitials: string;
  lastMessage: string;
  unreadCount: number;
  updatedAtLabel: string;
  timestamp?: string;
  online?: boolean;
  participantId?: number;
  conversationName?: string;
  conversationType?: string;
  hasUnreadMessages?: boolean;
  participantProfileType?: string;
  participantStatus?: string;
  participantBio?: string;
  participantCategories?: string[];
  participantInsight?: BackendProfileInsight;
  participantUserName?: string;
  participantUserEmail?: string;
  participantUserPhone?: string;
  participants: BackendParticipantProfile[];
  lastMessageDetail?: BackendConversationMessage;
  raw?: BackendConversation;
}

export interface ChatMessageDto {
  id: string;
  type: 'text' | 'bundle' | 'offer';
  author: 'me' | 'other';
  text?: string;
  caption?: string;
  createdAtLabel: string;
  status?: 'sent' | 'seen';
  imageUrl?: string;
  sender?: BackendParticipantProfile;
  receiver?: BackendParticipantProfile;
  readDateTime?: string;
  chatType?: string;
  conversationId?: number;
  conversationName?: string;
  messageIdentifier?: string;
  raw?: BackendConversationMessage | Message | any;
  bundle?: {
    title: string;
    productCount?: number;
    items: {
      id: string;
      image?: any;
      imageUrl?: string;
      overlayText?: string;
      name?: string;
      title?: string;
      price?: number;
      quantity?: number;
      colour?: string;
      color?: string;
      size?: string;
      variantText?: string;
      designerName?: string;
      printingType?: string;
      budget?: string;
      deliveryDate?: string;
      preferredDeliveryDate?: string;
      deliveryAddress?: string;
      pickupAddress?: string;
      itemAvailability?: string;
      inventorySource?: string;
      hasOwnItem?: boolean;
    }[];
    footerLabel: string;
  };
  offer?: { title: string; priceLabel: string; description: string; image: any; ctaLabel: string };
}

const AVATAR_COLORS = ['#B8E5C0', '#A9D8FF', '#FFD7A1', '#F5B9C1', '#CAB8FF', '#F7D6A1'];
const AVATAR_EMOJIS = ['🧢', '🤓', '🧔🏾', '👱🏽', '🧑🏾‍🦱', '👩🏾'];

const unwrapList = (response: any) => {
  const responseBody = response?.responseBody;

  if (Array.isArray(responseBody)) return responseBody;
  if (Array.isArray(responseBody?.content)) return responseBody.content;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;

  return [];
};

const normalizeRole = (profileType?: string): ConversationSummaryDto['role'] => {
  return profileType === 'PRINTER' ? 'Printers' : profileType === 'CUSTOMER' ? 'Customer' : 'Designer';
};

const relativeTime = (dateString?: string) => {
  if (!dateString) return 'Now';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Now';

  return date.toLocaleDateString('en-US');
};

const formatMessageTime = (value?: string) => {
  if (!value) return 'Now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Now';

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getCurrentProfileType = () => useAuthStore.getState().role?.toUpperCase() || 'CUSTOMER';

const initialsFromName = (value?: string) => {
  const name = String(value || '').trim();
  if (!name) return '?';

  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || name.slice(0, 1).toUpperCase();
};

const resolveProfileName = (profile?: BackendParticipantProfile) => {
  return (
    profile?.name ||
    profile?.userName ||
    profile?.userEmail ||
    profile?.userPhone ||
    'Unknown user'
  );
};

const resolveProfileImage = (profile?: BackendParticipantProfile) => {
  return (
    profile?.profileImage?.url ||
    profile?.profileImage?.previewUrl ||
    profile?.profileImage?.thumbnailUrl ||
    profile?.profilePic ||
    profile?.previewProfilePic ||
    profile?.thumbnailProfilePic ||
    ''
  );
};

const resolveProfilePreviewImage = (profile?: BackendParticipantProfile) => {
  return (
    profile?.profileImage?.previewUrl ||
    profile?.profileImage?.thumbnailUrl ||
    profile?.previewProfilePic ||
    profile?.thumbnailProfilePic ||
    resolveProfileImage(profile)
  );
};

const resolveProfileThumbnailImage = (profile?: BackendParticipantProfile) => {
  return (
    profile?.profileImage?.thumbnailUrl ||
    profile?.thumbnailProfilePic ||
    resolveProfilePreviewImage(profile)
  );
};

const resolveMessagePreview = (message?: BackendConversationMessage) => {
  if (!message) return 'Tap to start conversation';
  if (message.caption?.trim()) return message.caption.trim();
  if (message.content?.trim()) return message.content.trim();
  return 'Tap to start conversation';
};

const pickConversationParticipant = (participants: BackendParticipantProfile[] = [], myProfileId?: number) => {
  const activeProfileType = getCurrentProfileType();
  return (
    (myProfileId ? participants.find((participant) => Number(participant.id) !== myProfileId) : undefined) ||
    participants.find((participant) => participant?.profileType && participant.profileType !== activeProfileType) ||
    participants[0]
  );
};

export function normalizeConversationsResponse(response: any, myProfileId?: number): ConversationSummaryDto[] {
  ensureReadMapHydrated();
  const activeProfileType = getCurrentProfileType();
  const list = unwrapList(response).filter((item: BackendConversation) => {
    const participants = Array.isArray(item?.participants) ? item.participants : [];
    if (!participants.length) return true;

    const hasProfileTypes = participants.some((p) => Boolean(p?.profileType));
    if (myProfileId && hasProfileTypes) {
      return participants.some(
        (p) =>
          Number(p.id) === Number(myProfileId) &&
          (!p.profileType || String(p.profileType).toUpperCase() === activeProfileType),
      );
    }
    if (myProfileId) {
      return participants.some((p) => Number(p.id) === Number(myProfileId));
    }
    if (hasProfileTypes) {
      return participants.some((p) => String(p.profileType || '').toUpperCase() === activeProfileType);
    }
    return true;
  });

  return list.map((item: BackendConversation | any, index: number) => {
    const participants = Array.isArray(item?.participants) ? item.participants : [];
    const participant = pickConversationParticipant(participants, myProfileId);
    const lastMessageTimestamp =
      item?.lastMessageTimestamp ||
      item?.lastMessage?.readDateTime ||
      item?.lastMessage?.createdAt ||
      item?.lastMessage?.updatedAt ||
      item?.lastMessage?.timestamp;
    const participantName = resolveProfileName(participant);
    const avatarImageUrl = resolveProfileImage(participant);
    const convId = String(item?.id || item?.conversationId || participant?.id || index);
    const lastMsgId = getBackendMessageId(item?.lastMessage);
    const locallyRead = isConversationReadLocally(convId, lastMsgId, lastMessageTimestamp);
    const lastMsgFromMe =
      myProfileId && item?.lastMessage?.sender?.id
        ? Number(item.lastMessage.sender.id) === Number(myProfileId)
        : item?.lastMessage?.sender?.profileType
          ? String(item.lastMessage.sender.profileType).toUpperCase() === activeProfileType
          : false;
    const rawUnreadCount = Number(item?.unreadMessageCount || 0);
    const rawHasUnread = Boolean(item?.hasUnreadMessages || rawUnreadCount > 0) && !item?.lastMessage?.read;
    const isUnread = !locallyRead && !lastMsgFromMe && rawHasUnread;
    const unreadCount = isUnread ? Math.max(1, rawUnreadCount) : 0;

    return {
      id: convId,
      source: 'backend',
      name: participantName || item?.conversationName || 'Unknown user',
      role: normalizeRole(participant?.profileType),
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      avatarEmoji: AVATAR_EMOJIS[index % AVATAR_EMOJIS.length],
      avatarImageUrl: avatarImageUrl || undefined,
      avatarPreviewUrl: resolveProfilePreviewImage(participant) || undefined,
      avatarThumbnailUrl: resolveProfileThumbnailImage(participant) || undefined,
      avatarInitials: initialsFromName(participantName),
      lastMessage: resolveMessagePreview(item?.lastMessage),
      unreadCount,
      updatedAtLabel: relativeTime(lastMessageTimestamp),
      timestamp: lastMessageTimestamp,
      online: participant?.status === 'ACTIVE',
      participantId: participant?.id,
      conversationName: item?.conversationName,
      conversationType: item?.type,
      hasUnreadMessages: isUnread,
      participantProfileType: participant?.profileType,
      participantStatus: participant?.status,
      participantBio: participant?.bio,
      participantCategories: participant?.categories || [],
      participantInsight: participant?.insight,
      participantUserName: participant?.userName,
      participantUserEmail: participant?.userEmail,
      participantUserPhone: participant?.userPhone,
      participants,
      lastMessageDetail: item?.lastMessage,
      raw: item,
    };
  });
}

export async function getMergedConversations(response: any, myProfileId?: number): Promise<ConversationSummaryDto[]> {
  const backend = normalizeConversationsResponse(response, myProfileId);

  return backend.sort((left, right) => {
    const leftTime = left.timestamp ? new Date(left.timestamp).getTime() : 0;
    const rightTime = right.timestamp ? new Date(right.timestamp).getTime() : 0;
    return rightTime - leftTime;
  });
}

export function getBackendMessageId(message?: BackendConversationMessage): string | undefined {
  // Never use the synthetic list index as an ID for a backend mutation.
  const candidates = [message?.id, message?.messageId, message?.messageIdentifier];
  const id = candidates.find((value) =>
    (typeof value === 'string' && value.trim().length > 0) ||
    (typeof value === 'number' && Number.isFinite(value)));
  return id === undefined ? undefined : String(id);
}

export function normalizeMessagesResponse(response: any, myUserId?: number): ChatMessageDto[] {
  ensureReadMapHydrated();
  const list = unwrapList(response);

  return list.map((item: BackendConversationMessage | Message | any, index: number) => {
    const sender = item?.sender;
    const senderId = sender?.id || sender?.userId || item?.senderId;
    const author = Number(senderId) === Number(myUserId) ? 'me' : 'other';
    const content = item?.content || item?.text || '';
    const caption = item?.caption || '';
    const createdAt = item?.createdAt || item?.timestamp || item?.readDateTime;
    const msgId = getBackendMessageId(item) ?? String(index);
    const locallyRead = isConversationReadLocally(item?.conversationId, msgId, createdAt);
    const isRead = Boolean(item?.read || item?.readDateTime || locallyRead);

    return {
      id: msgId,
      type: 'text',
      author,
      text: content,
      caption,
      createdAtLabel: formatMessageTime(createdAt),
      status: isRead ? 'seen' : 'sent',
      sender: sender,
      receiver: item?.receiver,
      readDateTime: item?.readDateTime,
      chatType: item?.chatType,
      conversationId: item?.conversationId,
      conversationName: item?.conversationName,
      messageIdentifier: item?.messageIdentifier,
      raw: item,
    };
  });
}
