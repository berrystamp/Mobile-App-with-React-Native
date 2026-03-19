import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ConversationSummary } from '@/app/data/messages';
import { AvatarBadge } from './AvatarBadge';

interface ConversationRowProps {
  conversation: ConversationSummary;
  onPress: (conversation: ConversationSummary) => void;
  onLongPress: (conversation: ConversationSummary) => void;
}

export function ConversationRow({ conversation, onPress, onLongPress }: ConversationRowProps) {
  return (
    <Pressable
      onPress={() => onPress(conversation)}
      onLongPress={() => onLongPress(conversation)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <AvatarBadge color={conversation.avatarColor} emoji={conversation.avatarEmoji} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{conversation.name}</Text>
            <Text style={styles.role}>• {conversation.role}</Text>
          </View>
          <Text style={styles.time}>{conversation.updatedAtLabel}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.preview} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          {conversation.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EDF7',
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  role: {
    fontSize: 14,
    color: '#9792A8',
  },
  time: {
    fontSize: 14,
    color: '#A39BB3',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preview: {
    flex: 1,
    fontSize: 14,
    color: '#8A8298',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4A3298',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
