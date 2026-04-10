import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import type { ShopProfile } from './types';
import { FALLBACK_AVATAR, FALLBACK_COVER, toCountLabel } from './utils';

export function ShopHeader({
  profile,
  textColor,
  mutedColor,
  primaryColor,
  borderColor,
  onBack,
  onEdit,
  onOpenReviews,
  onOpenFollowers,
  onOpenFollowing,
}: {
  profile: ShopProfile;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  borderColor: string;
  onBack: () => void;
  onEdit: () => void;
  onOpenReviews: () => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
}) {
  return (
    <>
      <View style={{ height: 200, position: 'relative' }}>
        <Image source={{ uri: profile.cover || FALLBACK_COVER }} style={{ width: '100%', height: '100%' }} />
        <View style={{ position: 'absolute', top: 52, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={onBack} style={iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} style={iconBtn}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Image source={{ uri: profile.avatar || FALLBACK_AVATAR }} style={{ width: 72, height: 72, borderRadius: 36, marginTop: -34, borderWidth: 3, borderColor: '#fff' }} />

      <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: textColor, fontSize: 24, fontWeight: '700', flex: 1 }}>{profile.fullName}</Text>
        <TouchableOpacity onPress={onOpenReviews}>
          <Text style={{ color: primaryColor, fontSize: 14 }}>{toCountLabel(profile.reviews, 'review')}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: textColor, fontSize: 14 }}>{toCountLabel(profile.uploads, 'design')}</Text>
        <Text style={{ color: primaryColor, marginHorizontal: 6 }}>|</Text>
        <TouchableOpacity onPress={onOpenFollowers}>
          <Text style={{ color: primaryColor, fontSize: 14 }}>{toCountLabel(profile.followers, 'follower')}</Text>
        </TouchableOpacity>
        <Text style={{ color: primaryColor, marginHorizontal: 6 }}>|</Text>
        <TouchableOpacity onPress={onOpenFollowing}>
          <Text style={{ color: primaryColor, fontSize: 14 }}>{toCountLabel(profile.following, 'following')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ marginTop: 10, color: mutedColor, fontSize: 14, lineHeight: 20 }} numberOfLines={2}>
        {profile.bio || 'Tell people what your shop creates and the kind of projects you are open to.'}
      </Text>

      <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap' }}>
        {profile.categories.slice(0, 6).map((item) => (
          <View key={item} style={{ borderWidth: 1, borderColor, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 8 }}>
            <Text style={{ color: mutedColor, fontSize: 12 }}>{item}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const iconBtn = {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'rgba(0,0,0,0.35)',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
