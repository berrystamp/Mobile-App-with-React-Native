import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import type { ConversationSummaryDto } from '@/lib/messages';
import { AvatarBadge } from './AvatarBadge';

interface ConversationRowProps {
  conversation: ConversationSummaryDto;
  onPress: (conversation: ConversationSummaryDto) => void;
  onLongPress: (conversation: ConversationSummaryDto) => void;
}

export function ConversationRow({ conversation, onPress, onLongPress }: ConversationRowProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable
      onPress={() => onPress(conversation)}
      onLongPress={() => onLongPress(conversation)}
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: isDark ? '#2B2B2B' : '#F1EDF7' },
        pressed && styles.pressed,
      ]}>
      <AvatarBadge color={conversation.avatarColor} emoji={conversation.avatarEmoji} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: isDark ? '#FFFFFF' : '#222222' }]}>{conversation.name}</Text>
            <Text style={[styles.role, { color: isDark ? '#9791AD' : '#9792A8' }]}>• {conversation.role}</Text>
          </View>
          <Text style={[styles.time, { color: isDark ? '#9C95AD' : '#A39BB3' }]}>{conversation.updatedAtLabel}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.preview, { color: isDark ? '#B8B4C8' : '#8A8298' }]} numberOfLines={1}>
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
  },
  role: {
    fontSize: 14,
  },
  time: {
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preview: {
    flex: 1,
    fontSize: 14,
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
