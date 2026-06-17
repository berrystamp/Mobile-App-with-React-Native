import React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';

import type { ConversationSummaryDto } from '@/lib/messages';
import { Ionicons } from '@expo/vector-icons';
import { AvatarBadge } from './AvatarBadge';

interface ConversationRowProps {
  conversation: ConversationSummaryDto;
  onPress: (conversation: ConversationSummaryDto) => void;
  onLongPress: (conversation: ConversationSummaryDto) => void;
}

export function ConversationRow({ conversation, onPress, onLongPress }: ConversationRowProps) {
  const isDark = useColorScheme() === 'dark';
  const isGalleryPreview = conversation.lastMessage === '[Product gallery]';
  const isOrderRequest = conversation.lastMessageDetail?.chatType === 'ORDER_REQUEST';
  const isOrder = conversation.lastMessageDetail?.chatType === 'ORDER';

  const lastMessageText = isOrderRequest
    ? 'You received an order request'
    : isOrder
    ? 'You have an active order'
    : isGalleryPreview
    ? 'Product gallery'
    : conversation.lastMessage;

  return (
    <Pressable
      onPress={() => onPress(conversation)}
      onLongPress={() => onLongPress(conversation)}
      className={`flex-row items-center gap-4 py-[18px] border-b ${
        isDark ? 'border-[#2B2B2B]' : 'border-[#F1EDF7]'
      }`}
      style={({ pressed }) => [
        pressed && { opacity: 0.75 }
      ]}
    >
      <AvatarBadge
        color={conversation.avatarColor}
        emoji={conversation.avatarEmoji}
        imageUrl={conversation.avatarThumbnailUrl || conversation.avatarPreviewUrl || conversation.avatarImageUrl}
        label={conversation.avatarInitials}
      />
      
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1.5">
          <View className="flex-row items-center shrink">
            <Text 
              className={`text-[15px]  font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#222222]'}`}
            >
              {conversation.name}
            </Text>
            <Text 
              className={`text-[14px]  ${isDark ? 'text-[#9791AD]' : 'text-[#9792A8]'}`}
            >
              {' - '} {conversation.participantProfileType?.toLocaleLowerCase()}
            </Text>
          </View>
          <Text 
            className={`text-[14px] ${isDark ? 'text-[#9C95AD]' : 'text-[#A39BB3]'}`}
          >
            {conversation.updatedAtLabel}
          </Text>
        </View>
        
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center">
            {isGalleryPreview ? <Ionicons name="images-outline" size={16} color={isDark ? '#B8B4C8' : '#8A8298'} /> : null}
            <Text
              className={`flex-1 text-[14px] ${isDark ? 'text-[#B8B4C8]' : 'text-[#8A8298]'} ${isGalleryPreview ? 'ml-2' : ''}`}
              numberOfLines={1}
            >
              {lastMessageText}
            </Text>
          </View>
          
          {conversation.unreadCount > 0 ? (
            <View className="min-w-[22px] h-[22px] rounded-full bg-[#4A3298] items-center justify-center px-1.5">
              <Text className="text-white text-[12px] font-bold">
                {conversation.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

