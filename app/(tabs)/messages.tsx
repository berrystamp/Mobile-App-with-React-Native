import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, SafeAreaView, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

import { ConversationRow } from '@/components/messages/ConversationRow';
import { MessageEmptyState } from '@/components/messages/MessageEmptyState';
import type { ConversationSummaryDto } from '@/lib/messages';
import {
  getBackendMessageId,
  getCachedConversations,
  getMemoryConversations,
  getMemoryConversationMessages,
  getMemoryMyProfileId,
  getMergedConversations,
  markConversationReadLocally,
  normalizeMessagesResponse,
  setCachedConversationMessages,
  setCachedConversations,
  setMemoryMyProfileId,
} from '@/lib/messages';
import ApiService from '@/services/apiClient';
import { getAccountProfile } from '@/lib/accountProfile';
import { useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';

const reportReasons = [
  { id: 'not-trustworthy', label: 'Not trustworthy' },
  { id: 'not-skilled', label: 'Not skilled' },
  { id: 'hate-speech', label: 'Hate speech or symbols' },
  { id: 'scam', label: 'Scam and fraud' },
  { id: 'bullying', label: 'Bullying harassment' },
];

export default function MessagesScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const role = useAuthStore((state) => state.role);
  const initialCached = useMemo(() => getMemoryConversations(role), [role]);
  const [query, setQuery] = useState('');
  const [threadsState, setThreadsState] = useState<{ role: string; items: ConversationSummaryDto[] }>(() => ({
    role: String(role),
    items: initialCached || [],
  }));
  const threads = useMemo(
    () => (threadsState.role === String(role) ? threadsState.items : getMemoryConversations(role) || []),
    [threadsState, role],
  );
  const setThreads = useCallback(
    (
      next:
        | ConversationSummaryDto[]
        | ((prev: ConversationSummaryDto[]) => ConversationSummaryDto[]),
      targetRole: string = String(useAuthStore.getState().role),
    ) => {
      setThreadsState((prev) => {
        const base =
          prev.role === targetRole ? prev.items : getMemoryConversations(targetRole) || [];
        const items = typeof next === 'function' ? next(base) : next;
        return { role: targetRole, items };
      });
    },
    [],
  );
  const [loading, setLoading] = useState(!initialCached || initialCached.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [userIdState, setUserIdState] = useState<{ role: string; id: number | null }>(() => ({
    role: String(role),
    id: getMemoryMyProfileId(role) || null,
  }));
  const currentUserId =
    userIdState.role === String(role) ? userIdState.id : getMemoryMyProfileId(role) || null;
  const setCurrentUserId = useCallback(
    (id: number | null, targetRole: string = String(useAuthStore.getState().role)) => {
      setUserIdState({ role: targetRole, id });
    },
    [],
  );
  const refreshedResponse = useConversationStore((state) => state.response);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummaryDto | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportReasons, setShowReportReasons] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  useEffect(() => {
    const activeRole = useAuthStore.getState().role;
    const expectedProfileId = getMemoryMyProfileId(activeRole) || currentUserId;
    if (!refreshedResponse || !expectedProfileId) return;
    let cancelled = false;
    getMergedConversations(refreshedResponse, expectedProfileId).then((all) => {
      if (cancelled) return;
      if (useAuthStore.getState().role !== activeRole) return;
      const filtered = all.filter((thread) => Number(thread.participantId) !== Number(expectedProfileId));
      setThreads(filtered, String(activeRole));
      setCachedConversations(filtered, activeRole);
    });
    return () => { cancelled = true; };
  }, [refreshedResponse, currentUserId, role, setThreads]);

  const fetchConversations = useCallback(async (isPullToRefresh = false) => {
    const activeRole = useAuthStore.getState().role;
    try {
      // 1. Hydrate immediately from memory / AsyncStorage cache if we don't have threads yet
      const memThreads = getMemoryConversations(activeRole);
      if (memThreads && memThreads.length > 0) {
        setThreads(memThreads);
        setLoading(false);
      } else {
        const storedThreads = await getCachedConversations(activeRole);
        if (storedThreads && storedThreads.length > 0) {
          setThreads(storedThreads);
          setLoading(false);
        } else if (!isPullToRefresh) {
          setLoading(true);
        }
      }

      // 2. Resolve myId fast from memory or local userData while firing getConversations in parallel
      let myId = getMemoryMyProfileId(activeRole) || 0;
      const [cachedUser, conversationsResponse] = await Promise.all([
        myId ? Promise.resolve(null) : ApiService.getCurrentUser().catch(() => null),
        ApiService.getConversations(0, 60),
      ]);

      if (!myId && cachedUser) {
        const userObj = cachedUser?.responseBody || cachedUser;
        myId = Number(getAccountProfile(userObj, activeRole)?.id || 0);
        if (myId) setMemoryMyProfileId(myId, activeRole);
      }

      // If still not in local cache, fetch profile once in background
      if (!myId) {
        const profileResponse = await ApiService.getMyProfile().catch(() => null);
        const currentUser = profileResponse?.responseBody || profileResponse;
        myId = Number(getAccountProfile(currentUser, activeRole)?.id || 0);
        if (myId) setMemoryMyProfileId(myId, activeRole);
      }

      if (myId) setCurrentUserId(myId);

      const all = await getMergedConversations(conversationsResponse, myId || undefined);
      const filtered = myId ? all.filter((t) => Number(t.participantId) !== myId) : all;
      setThreads(filtered);
      setCachedConversations(filtered, activeRole);

      // 3. Background prefetch avatar images & top 6 conversation message threads
      const avatarUrls = filtered
        .map((t) => t.avatarThumbnailUrl || t.avatarPreviewUrl || t.avatarImageUrl)
        .filter((u): u is string => Boolean(u && u.startsWith('http')));
      if (avatarUrls.length > 0) {
        ExpoImage.prefetch(avatarUrls.slice(0, 20), 'memory-disk').catch(() => {});
      }

      filtered.slice(0, 6).forEach((thread) => {
        if (!getMemoryConversationMessages(thread.id)) {
          ApiService.getConversationMessages(String(thread.id), 0, 50)
            .then((res) => {
              const normalized = normalizeMessagesResponse(res, myId || undefined);
              if (normalized.length > 0) {
                setCachedConversationMessages(thread.id, normalized);
              }
            })
            .catch(() => {});
        }
      });
    } catch {
      const fallback = await getCachedConversations(activeRole);
      if (fallback && fallback.length > 0) {
        setThreads(fallback, String(activeRole));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setCurrentUserId, setThreads]);

  // Re-fetch whenever the screen comes back into focus so the last message
  // sent in a chat is reflected immediately without a manual pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations]),
  );

  const filteredThreads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return threads;

    return threads.filter((thread) => {
      const haystack = `${thread.name} ${thread.role} ${thread.lastMessage}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, threads]);

  const openConversation = (conversation: ConversationSummaryDto) => {
    const lastMsgId = getBackendMessageId(conversation.lastMessageDetail);
    markConversationReadLocally(conversation.id, lastMsgId, conversation.timestamp);
    if (lastMsgId && conversation.hasUnreadMessages) {
      ApiService.markMessageAsRead(lastMsgId).catch(() => {});
    }
    setThreads((prev) =>
      prev.map((item) =>
        item.id === conversation.id
          ? { ...item, hasUnreadMessages: false, unreadCount: 0 }
          : item,
      ),
    );
    router.push({
      pathname: '/chat',
      params: {
        conversationId: conversation.id,
        participantId: String(conversation.participantId || ''),
        participantName: conversation.name,
        participantRole: conversation.role,
        chatType: conversation.lastMessageDetail?.chatType || '',
      },
    });
  };

  const openActionSheet = (conversation: ConversationSummaryDto) => {
    setSelectedConversation(conversation);
    setShowActions(true);
  };

  const closeAllModals = () => {
    setShowActions(false);
    setShowDeleteModal(false);
    setShowReportReasons(false);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;

    const target = selectedConversation;
    const previous = [...threads];
    const next = threads.filter((thread) => thread.id !== target.id);
    setThreads(next);
    closeAllModals();

    try {
      await ApiService.deleteConversation(target.id);
      setCachedConversations(next, role);
      setSelectedConversation(null);
    } catch (err: any) {
      setThreads(previous);
      Alert.alert(
        'Delete failed',
        err?.response?.data?.responseMessage || err?.message || 'Unable to delete this conversation.',
      );
    }
  };

  const handleReportConversation = async (reason: string) => {
    if (!selectedConversation) return;

    const target = selectedConversation;
    closeAllModals();
    try {
      await ApiService.reportConversation(target.id, reason, target.name);
      setShowReportSuccess(true);
    } catch (err: any) {
      Alert.alert(
        'Report failed',
        err?.response?.data?.responseMessage || err?.message || 'Unable to submit your report. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#121212]">
      <View className="flex-1 px-6 pt-12">
        <View className="mb-6 flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-[#333333] dark:text-white">Messages</Text>
          <TouchableOpacity
            onPress={() => {
              setThreads([]);
              setQuery('');
            }}>
            <Text className="text-base font-semibold text-[#EB5757]">Clear</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5 flex-row items-center rounded-full border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-[#1E1E1E]">
          <Ionicons name="search-outline" size={20} color={isDark ? '#A0A0A0' : '#B5AFBE'} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for chats and messages"
            placeholderTextColor={isDark ? '#8A8A8A' : '#B5AFBE'}
            className="ml-3 flex-1 text-[15px] text-[#2B2833] dark:text-white"
          />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B2D85" />
          </View>
        ) : filteredThreads.length ? (
          <FlatList
            data={filteredThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationRow conversation={item} onPress={openConversation} onLongPress={openActionSheet} />
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            onRefresh={() => {
              setRefreshing(true);
              fetchConversations(true);
            }}
            refreshing={refreshing}
          />
        ) : (
          <MessageEmptyState />
        )}
      </View>

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
                setSelectedConversation(null);
              }}>
              <Text className="text-base font-bold text-white">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
