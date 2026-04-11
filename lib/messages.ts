import type { Message } from '@/types';
import { getLocalConversations } from '@/lib/localConversations';

export interface ConversationSummaryDto {
  id: string;
  name: string;
  role: 'Designer' | 'Printers';
  avatarColor: string;
  avatarEmoji: string;
  lastMessage: string;
  unreadCount: number;
  updatedAtLabel: string;
  online?: boolean;
  participantId?: number;
}

export interface ChatMessageDto {
  id: string;
  type: 'text' | 'bundle' | 'offer';
  author: 'me' | 'other';
  text?: string;
  createdAtLabel: string;
  status?: 'sent' | 'seen';
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

const nameFromProfile = (profile?: {
  firstName?: string;
  lastName?: string;
  username?: string;
}) => {
  if (!profile) return 'Unknown user';

  const fromNames = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  return fromNames || profile.username || 'Unknown user';
};

export function normalizeConversationsResponse(response: any): ConversationSummaryDto[] {
  const content = response?.responseBody?.content || response?.content || response?.data || response || [];
  const list = Array.isArray(content) ? content : [];

  return list.map((item: any, index: number) => {
    const profile = item.profile || item.participant || item.receiver || item.user;
    const createdAt = item.lastMessageTime || item.updatedAt || item.createdAt;

    return {
      id: String(item.id || item.conversationId || profile?.id || index),
      name: item.name || nameFromProfile(profile),
      role: item.role === 'PRINTER' ? 'Printers' : 'Designer',
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      avatarEmoji: AVATAR_EMOJIS[index % AVATAR_EMOJIS.length],
      lastMessage: item.lastMessage || item.preview || 'Tap to start conversation',
      unreadCount: Number(item.unreadCount || 0),
      updatedAtLabel: relativeTime(createdAt),
      online: Boolean(item.online),
      participantId: profile?.id,
    };
  });
}

export async function getMergedConversations(response: any): Promise<ConversationSummaryDto[]> {
  const backend = normalizeConversationsResponse(response);
  const local = await getLocalConversations();

  const localMapped: ConversationSummaryDto[] = local.map((item, index) => ({
    id: item.id,
    name: item.name,
    role: item.role,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    avatarEmoji: AVATAR_EMOJIS[index % AVATAR_EMOJIS.length],
    lastMessage: item.lastMessage,
    unreadCount: item.unreadCount,
    updatedAtLabel: relativeTime(item.updatedAt),
    participantId: item.participantId,
  }));

  const merged = [...localMapped];
  backend.forEach((conversation) => {
    if (!merged.some((item) => item.id === conversation.id)) {
      merged.push(conversation);
    }
  });

  return merged;
}

export function normalizeMessagesResponse(response: any, myUserId?: number): ChatMessageDto[] {
  const content = response?.responseBody?.content || response?.content || response?.data || response || [];
  const list = Array.isArray(content) ? content : [];

  return list.map((item: Message | any, index: number) => ({
    id: String(item.id || `${index}`),
    type: 'text',
    author: Number(item.senderId) === Number(myUserId) ? 'me' : 'other',
    text: item.content || item.text || '',
    createdAtLabel: item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Now',
    status: item.read ? 'seen' : 'sent',
  }));
}
