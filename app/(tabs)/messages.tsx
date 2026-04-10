import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, SafeAreaView, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

import { ConversationRow } from '@/components/messages/ConversationRow';
import { MessageEmptyState } from '@/components/messages/MessageEmptyState';
import type { ConversationSummaryDto } from '@/lib/messages';
import { getMergedConversations } from '@/lib/messages';
import ApiService from '@/services/apiClient';

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
  const [query, setQuery] = useState('');
  const [threads, setThreads] = useState<ConversationSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummaryDto | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportReasons, setShowReportReasons] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getConversations(0, 60);
      setThreads(await getMergedConversations(response));
    } catch {
      setThreads(await getMergedConversations([]));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filteredThreads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return threads;

    return threads.filter((thread) => {
      const haystack = `${thread.name} ${thread.role} ${thread.lastMessage}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, threads]);

  const openConversation = (conversation: ConversationSummaryDto) => {
    router.push({
      pathname: '/(tabs)/chat',
      params: {
        conversationId: conversation.id,
        participantId: String(conversation.participantId || ''),
        participantName: conversation.name,
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

    const previous = [...threads];
    setThreads((current) => current.filter((thread) => thread.id !== selectedConversation.id));
    closeAllModals();

    try {
      await ApiService.deleteConversation(selectedConversation.id);
      setSelectedConversation(null);
    } catch {
      setThreads(previous);
    }
  };

  const handleReportConversation = async (reason: string) => {
    if (!selectedConversation) return;

    closeAllModals();
    try {
      await ApiService.reportConversation(selectedConversation.id, reason);
    } finally {
      setShowReportSuccess(true);
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
              fetchConversations();
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
