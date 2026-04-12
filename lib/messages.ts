import type { Message } from '@/types';
import { getLocalConversations } from '@/lib/localConversations';
import { useAuthStore } from '@/store/authStore';

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
  role: 'Designer' | 'Printers';
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
    items: { id: string; image?: any; imageUrl?: string; overlayText?: string }[];
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

const normalizeRole = (profileType?: string): 'Designer' | 'Printers' => {
  return profileType === 'PRINTER' ? 'Printers' : 'Designer';
};

const relativeTime = (dateString?: string) => {
  if (!dateString) return 'Now';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Now';

  const deltaMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(deltaMs / 60000));

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
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

const pickConversationParticipant = (participants: BackendParticipantProfile[] = []) => {
  const activeProfileType = getCurrentProfileType();
  return (
    participants.find((participant) => participant?.profileType && participant.profileType !== activeProfileType) ||
    participants[0]
  );
};

export function normalizeConversationsResponse(response: any): ConversationSummaryDto[] {
  const list = unwrapList(response);

  return list.map((item: BackendConversation | any, index: number) => {
    const participants = Array.isArray(item?.participants) ? item.participants : [];
    const participant = pickConversationParticipant(participants);
    const lastMessageTimestamp =
      item?.lastMessageTimestamp ||
      item?.lastMessage?.readDateTime ||
      item?.lastMessage?.createdAt ||
      item?.lastMessage?.updatedAt ||
      item?.lastMessage?.timestamp;
    const participantName = resolveProfileName(participant);
    const avatarImageUrl = resolveProfileImage(participant);

    return {
      id: String(item?.id || item?.conversationId || participant?.id || index),
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
      unreadCount: Number(item?.unreadMessageCount || 0),
      updatedAtLabel: relativeTime(lastMessageTimestamp),
      timestamp: lastMessageTimestamp,
      online: participant?.status === 'ACTIVE',
      participantId: participant?.id,
      conversationName: item?.conversationName,
      conversationType: item?.type,
      hasUnreadMessages: Boolean(item?.hasUnreadMessages),
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

export async function getMergedConversations(response: any): Promise<ConversationSummaryDto[]> {
  const backend = normalizeConversationsResponse(response);
  const local = await getLocalConversations();

  const localMapped: ConversationSummaryDto[] = local.map((item, index) => ({
    id: item.id,
    source: 'local',
    name: item.name,
    role: item.role,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    avatarEmoji: AVATAR_EMOJIS[index % AVATAR_EMOJIS.length],
    avatarInitials: initialsFromName(item.name),
    lastMessage: item.lastMessage,
    unreadCount: item.unreadCount,
    updatedAtLabel: relativeTime(item.updatedAt),
    timestamp: item.updatedAt,
    participantId: item.participantId,
    participants: [],
  }));

  const merged = [...localMapped];
  backend.forEach((conversation) => {
    if (!merged.some((item) => item.id === conversation.id)) {
      merged.push(conversation);
    }
  });

  return merged.sort((left, right) => {
    const leftTime = left.timestamp ? new Date(left.timestamp).getTime() : 0;
    const rightTime = right.timestamp ? new Date(right.timestamp).getTime() : 0;
    return rightTime - leftTime;
  });
}

export function normalizeMessagesResponse(response: any, myUserId?: number): ChatMessageDto[] {
  const list = unwrapList(response);

  return list.map((item: BackendConversationMessage | Message | any, index: number) => {
    const sender = item?.sender;
    const senderId = sender?.id || sender?.userId || item?.senderId;
    const author = Number(senderId) === Number(myUserId) ? 'me' : 'other';
    const content = item?.content || item?.text || '';
    const caption = item?.caption || '';
    const createdAt = item?.createdAt || item?.timestamp || item?.readDateTime;

    return {
      id: String(item?.id || item?.messageIdentifier || `${index}`),
      type: 'text',
      author,
      text: content,
      caption,
      createdAtLabel: formatMessageTime(createdAt),
      status: item?.read ? 'seen' : 'sent',
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
