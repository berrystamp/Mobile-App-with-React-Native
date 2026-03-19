import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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

import {
  emptyMessageThreads,
  messageThreads,
  reportReasons,
  type ConversationSummary,
} from '@/app/data/messages';
import { ConversationRow } from '@/components/messages/ConversationRow';
import { MessageEmptyState } from '@/components/messages/MessageEmptyState';

export default function MessagesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [threads, setThreads] = useState(messageThreads);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportReasons, setShowReportReasons] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

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

  const openConversation = (conversation: ConversationSummary) => {
    router.push({
      pathname: '/(tabs)/chat',
      params: { conversationId: conversation.id },
    });
  };

  const openActionSheet = (conversation: ConversationSummary) => {
    setSelectedConversation(conversation);
    setShowActions(true);
  };

  const closeAllModals = () => {
    setShowActions(false);
    setShowDeleteModal(false);
    setShowReportReasons(false);
  };

  const handleDeleteConversation = () => {
    if (!selectedConversation) {
      return;
    }

    setThreads((current) =>
      current.filter((thread) => thread.id !== selectedConversation.id),
    );
    closeAllModals();
    setSelectedConversation(null);
  };

  const handleReportConversation = () => {
    closeAllModals();
    setShowReportSuccess(true);
  };

  const handleClearAll = () => {
    setThreads(emptyMessageThreads);
    setQuery('');
  };

  const renderHeader = () => (
    <View style={styles.screenHeader}>
      <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
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

        {filteredThreads.length ? (
          <FlatList
            data={filteredThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationRow
                conversation={item}
                onPress={openConversation}
                onLongPress={openActionSheet}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
            <Text style={styles.dialogText}>
              Are you sure you want to delete this chat? your conversation with this user will not be seen again
            </Text>
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

      <Modal
        transparent
        visible={showReportReasons}
        animationType="slide"
        onRequestClose={closeAllModals}>
        <Pressable style={styles.backdrop} onPress={closeAllModals}>
          <Pressable style={[styles.bottomSheet, styles.reportSheet]} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.reportSheetTitle}>Report</Text>
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={styles.reasonRow}
                onPress={handleReportConversation}>
                <Text style={styles.reasonText}>{reason.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={showReportSuccess}
        animationType="slide"
        onRequestClose={() => setShowReportSuccess(false)}>
        <View style={styles.centeredBackdrop}>
          <View style={styles.successSheet}>
            <Text style={styles.successTitle}>Report</Text>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={54} color="#3452B3" />
            </View>
            <Text style={styles.successHeading}>Thanks for reporting</Text>
            <Text style={styles.successBody}>
              We will review your report and take action if there is a violation of community Guidelines
            </Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerButton: {
    minWidth: 56,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2833',
  },
  clearAction: {
    textAlign: 'right',
    color: '#FF726B',
    fontSize: 16,
    fontWeight: '500',
  },
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2B2833',
  },
  listContent: {
    paddingBottom: 24,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 13, 28, 0.42)',
    justifyContent: 'flex-end',
  },
  centeredBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 13, 28, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bottomSheet: {
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
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  sheetActionText: {
    fontSize: 16,
    color: '#26222E',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F0ECF6',
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  dialogClose: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  dialogText: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
    color: '#413D4A',
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 18,
  },
  dialogActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EFEAF5',
  },
  dialogAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  dialogActionDivider: {
    width: 1,
    backgroundColor: '#EFEAF5',
  },
  dialogCancelText: {
    color: '#6E697B',
    fontSize: 17,
    fontWeight: '500',
  },
  dialogDeleteText: {
    color: '#FF6B63',
    fontSize: 17,
    fontWeight: '600',
  },
  reportSheet: {
    maxHeight: '80%',
  },
  reportSheetTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#26222E',
    marginBottom: 16,
  },
  reasonRow: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECF6',
  },
  reasonText: {
    fontSize: 16,
    color: '#26222E',
  },
  successSheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 28,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2833',
    marginBottom: 28,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    borderColor: '#3452B3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2833',
    marginBottom: 12,
  },
  successBody: {
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'center',
    color: '#8D8798',
    marginBottom: 28,
  },
  doneButton: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#4A3298',
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
