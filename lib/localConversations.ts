import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_CONVERSATIONS_KEY = 'localConversations';

export type LocalConversationMessage = {
  id: string;
  text: string;
  author: 'me' | 'other';
  createdAt: string;
  status?: 'sent' | 'seen';
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
  const next = conversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          lastMessage: message.text,
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
  initialMessage,
}: {
  participantId?: number;
  name: string;
  role: 'Designer' | 'Printers';
  initialMessage: string;
}) => {
  const conversations = await readAll();
  const now = new Date().toISOString();
  const message: LocalConversationMessage = {
    id: `msg-${Date.now()}`,
    text: initialMessage,
    author: 'me',
    createdAt: now,
    status: 'sent',
  };

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
            lastMessage: initialMessage,
            updatedAt: now,
            messages: [...conversation.messages, message],
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
    lastMessage: initialMessage,
    unreadCount: 0,
    updatedAt: now,
    messages: [message],
  };

  await writeAll([created, ...conversations]);
  return conversationId;
};
