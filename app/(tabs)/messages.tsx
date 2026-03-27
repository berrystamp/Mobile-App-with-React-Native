import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { ConversationSummaryDto } from '@/lib/messages';
import { normalizeConversationsResponse } from '@/lib/messages';
import ApiService from '@/services/apiClient';
import { ConversationRow } from '@/components/messages/ConversationRow';
import { MessageEmptyState } from '@/components/messages/MessageEmptyState';

const reportReasons = [
  { id: 'not-trustworthy', label: 'Not trustworthy' },
  { id: 'not-skilled', label: 'Not skilled' },
  { id: 'hate-speech', label: 'Hate speech or symbols' },
  { id: 'scam', label: 'Scam and fraud' },
  { id: 'bullying', label: 'Bullying harassment' },
];

export default function MessagesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [threads, setThreads] = useState<ConversationSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummaryDto | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportReasons, setShowReportReasons] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getConversations(0, 60);
      setThreads(normalizeConversationsResponse(response));
    } catch (error) {
      console.error('Unable to fetch conversations', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filteredThreads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return threads;
    }

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
    } catch (error) {
      console.warn('Report endpoint unavailable', error);
    } finally {
      setShowReportSuccess(true);
    }
  };

  const handleClearAll = () => {
    setThreads([]);
    setQuery('');
  };

  const renderHeader = () => (
    <View style={styles.screenHeader}>
      <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.push('/'))} style={styles.headerButton}>
        <Ionicons name="arrow-back" size={24} color="#2C2733" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Message</Text>
      <TouchableOpacity onPress={handleClearAll} style={styles.headerButton}>
        <Text style={styles.clearAction}>Clear</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.searchShell}>
          <Ionicons name="search-outline" size={20} color="#B5AFBE" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for chats and messages"
            placeholderTextColor="#B5AFBE"
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#3F2FA0" />
          </View>
        ) : filteredThreads.length ? (
          <FlatList
            data={filteredThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationRow conversation={item} onPress={openConversation} onLongPress={openActionSheet} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchConversations}
            refreshing={false}
          />
        ) : (
          <MessageEmptyState />
        )}
      </View>

      <Modal transparent visible={showActions} animationType="slide" onRequestClose={closeAllModals}>
        <Pressable style={styles.backdrop} onPress={closeAllModals}>
          <Pressable style={styles.bottomSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                setShowActions(false);
                setShowDeleteModal(true);
              }}>
              <Ionicons name="trash-outline" size={22} color="#FF6B63" />
              <Text style={styles.sheetActionText}>Delete</Text>
            </TouchableOpacity>
            <View style={styles.sheetDivider} />
            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                setShowActions(false);
                setShowReportReasons(true);
              }}>
              <Ionicons name="alert-circle-outline" size={22} color="#FF6B63" />
              <Text style={styles.sheetActionText}>Report</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={showDeleteModal} animationType="fade" onRequestClose={closeAllModals}>
        <View style={styles.centeredBackdrop}>
          <View style={styles.dialogCard}>
            <TouchableOpacity style={styles.dialogClose} onPress={closeAllModals}>
              <Ionicons name="close" size={20} color="#2B2833" />
            </TouchableOpacity>
            <Text style={styles.dialogText}>Are you sure you want to delete this chat? your conversation with this user will not be seen again</Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.dialogAction} onPress={closeAllModals}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.dialogActionDivider} />
              <TouchableOpacity style={styles.dialogAction} onPress={handleDeleteConversation}>
                <Text style={styles.dialogDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showReportReasons} animationType="slide" onRequestClose={closeAllModals}>
        <Pressable style={styles.backdrop} onPress={closeAllModals}>
          <Pressable style={[styles.bottomSheet, styles.reportSheet]} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.reportSheetTitle}>Report</Text>
            {reportReasons.map((reason) => (
              <TouchableOpacity key={reason.id} style={styles.reasonRow} onPress={() => handleReportConversation(reason.label)}>
                <Text style={styles.reasonText}>{reason.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={showReportSuccess} animationType="slide" onRequestClose={() => setShowReportSuccess(false)}>
        <View style={styles.centeredBackdrop}>
          <View style={styles.successSheet}>
            <Text style={styles.successTitle}>Report</Text>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={54} color="#3452B3" />
            </View>
            <Text style={styles.successHeading}>Thanks for reporting</Text>
            <Text style={styles.successBody}>We will review your report and take action if there is a violation of community Guidelines</Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                setShowReportSuccess(false);
                setSelectedConversation(null);
              }}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 18 },
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerButton: { minWidth: 56 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2B2833' },
  clearAction: { textAlign: 'right', color: '#FF726B', fontSize: 16, fontWeight: '500' },
  searchShell: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FAF9FC',
    borderWidth: 1,
    borderColor: '#F0ECF6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 18,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#2B2833' },
  listContent: { paddingBottom: 20 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(23, 19, 29, 0.25)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 32 },
  sheetHandle: { width: 52, height: 5, borderRadius: 4, backgroundColor: '#E5DFEF', alignSelf: 'center', marginBottom: 18 },
  sheetAction: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 10 },
  sheetActionText: { fontSize: 17, color: '#2F2A36', fontWeight: '600' },
  sheetDivider: { height: 1, backgroundColor: '#F1EDF6', marginVertical: 10 },
  centeredBackdrop: { flex: 1, backgroundColor: 'rgba(17, 15, 22, 0.42)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialogCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, width: '100%', maxWidth: 340 },
  dialogClose: { alignSelf: 'flex-end' },
  dialogText: { marginTop: 8, color: '#4D4759', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  dialogActions: { marginTop: 20, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#EFEAF6' },
  dialogAction: { flex: 1, alignItems: 'center', paddingTop: 14 },
  dialogActionDivider: { width: 1, height: 26, backgroundColor: '#EFEAF6' },
  dialogCancelText: { color: '#8F879F', fontSize: 16, fontWeight: '500' },
  dialogDeleteText: { color: '#FF6B63', fontSize: 16, fontWeight: '600' },
  reportSheet: { paddingTop: 20 },
  reportSheetTitle: { fontSize: 18, fontWeight: '700', color: '#2F2A36', textAlign: 'center', marginBottom: 16 },
  reasonRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2EEF8' },
  reasonText: { fontSize: 15, color: '#4D4759' },
  successSheet: { width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, alignItems: 'center' },
  successTitle: { fontSize: 17, fontWeight: '700', color: '#2F2A36', marginBottom: 8 },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#EAF0FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successHeading: { fontSize: 20, fontWeight: '700', color: '#2B2833', marginBottom: 8 },
  successBody: { color: '#6E677C', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 18 },
  doneButton: { width: '100%', backgroundColor: '#FF726B', borderRadius: 18, alignItems: 'center', paddingVertical: 14 },
  doneButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
