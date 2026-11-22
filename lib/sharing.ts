import { Platform, Share } from 'react-native';

type ResourceType = 'design' | 'collection' | 'profile';

// Point this at the deployed Expo web app when it uses a separate domain.
const SHARE_ORIGIN = (process.env.EXPO_PUBLIC_SHARE_ORIGIN || 'https://berrystamp.com').replace(/\/+$/, '');

export function resourceShareUrl(type: ResourceType, id: string | number, profileId?: string | number) {
  const encodedId = encodeURIComponent(String(id));
  if (type === 'design') return `${SHARE_ORIGIN}/products?designId=${encodedId}`;
  if (type === 'profile') return `${SHARE_ORIGIN}/my-shop?profileId=${encodedId}`;
  if (profileId == null || String(profileId).trim() === '') {
    throw new Error('The shop for this collection is unavailable. Please refresh and try again.');
  }
  return `${SHARE_ORIGIN}/my-shop?profileId=${encodeURIComponent(String(profileId))}&collectionId=${encodedId}`;
}

export async function shareResourceLink(title: string, url: string) {
  return Share.share({
    title,
    message: `${title}\n${url}`,
    ...(Platform.OS === 'ios' ? { url } : {}),
  });
}
