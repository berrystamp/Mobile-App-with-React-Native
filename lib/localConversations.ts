import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_CONVERSATIONS_KEY = 'localConversations';

export type LocalConversationMessage = {
  id: string;
  type?: 'text' | 'bundle';
  text: string;
  previewText?: string;
  author: 'me' | 'other';
  createdAt: string;
  status?: 'sent' | 'seen';
  bundle?: {
    title?: string;
    productCount?: number;
    footerLabel: string;
    items: {
      id: string;
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
  };
};

export type LocalConversation = {
  id: string;
  participantId?: number;
  name: string;
  role: 'Designer' | 'Printers';
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
  messages: LocalConversationMessage[];
};

const readAll = async (): Promise<LocalConversation[]> => {
  const raw = await AsyncStorage.getItem(LOCAL_CONVERSATIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = async (conversations: LocalConversation[]) => {
  await AsyncStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(conversations));
};

export const getLocalConversations = async () => readAll();

export const getLocalConversationById = async (id: string) => {
  const conversations = await readAll();
  return conversations.find((conversation) => conversation.id === id) || null;
};

export const appendLocalConversationMessage = async (
  conversationId: string,
  message: LocalConversationMessage,
) => {
  const conversations = await readAll();
  const previewText = message.previewText || message.text;
  const next = conversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          lastMessage: previewText,
          updatedAt: message.createdAt,
          messages: [...conversation.messages, message],
        }
      : conversation,
  );

  await writeAll(next);
};

export const upsertLocalConversation = async ({
  participantId,
  name,
  role,
  initialMessages,
}: {
  participantId?: number;
  name: string;
  role: 'Designer' | 'Printers';
  initialMessages: LocalConversationMessage[];
}) => {
  const conversations = await readAll();
  const now = new Date().toISOString();
  const messages = initialMessages.map((message, index) => ({
    ...message,
    id: message.id || `msg-${Date.now()}-${index}`,
    type: message.type || 'text',
    createdAt: message.createdAt || now,
    status: message.status || 'sent',
  }));
  const lastMessage = messages[messages.length - 1];
  const previewText = lastMessage?.previewText || lastMessage?.text || 'New message';

  const existing = conversations.find(
    (conversation) =>
      (participantId && conversation.participantId === participantId && conversation.role === role) ||
      (!participantId && conversation.name === name && conversation.role === role),
  );

  if (existing) {
    const next = conversations.map((conversation) =>
      conversation.id === existing.id
        ? {
            ...conversation,
            name,
            participantId: participantId || conversation.participantId,
            lastMessage: previewText,
            updatedAt: now,
            messages: [...conversation.messages, ...messages],
          }
        : conversation,
    );
    await writeAll(next);
    return existing.id;
  }

  const conversationId = `local-${participantId || name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
  const created: LocalConversation = {
    id: conversationId,
    participantId,
    name,
    role,
    lastMessage: previewText,
    unreadCount: 0,
    updatedAt: now,
    messages,
  };

  await writeAll([created, ...conversations]);
  return conversationId;
};
