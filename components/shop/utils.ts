import { mergeUserAndProfile, normalizePaymentDetails, normalizeProfileResponse } from '@/lib/profile';
import ApiService from '@/services/apiClient';
import type { User } from '@/types';
import type { CollectionItem, ReviewItem, ShopData } from './types';

const API_ORIGIN = 'https://berrystamp-backend-dev-4cn29.ondigitalocean.app';
export const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200';
export const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300';

export const toAbsoluteImage = (path?: string) => {
  if (!path || path === 'string') return '';
  if (path.startsWith('http') || path.startsWith('file:')) return path;
  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
};

export const unwrapList = (response: any): any[] => {
  const body = response?.responseBody || response?.data || response || {};
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.results)) return body.results;
  return [];
};

export const toDisplayName = (person: any) => {
  const direct = String(person?.name || '').trim();
  if (direct) return direct;
  const built = `${person?.firstName || ''} ${person?.lastName || ''}`.trim();
  return built || person?.username || person?.userName || 'User';
};

export const toCountLabel = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;

export async function fetchShopData(activeRole: 'CUSTOMER' | 'DESIGNER' | 'PRINTER', targetProfileId?: number): Promise<ShopData> {
  const currentUser = (await ApiService.getCurrentUser()) as User | null;
  const [myProfileResponse, designsResponse, collectionsResponse, paymentResponse, currentFollowingResponse] = await Promise.all([
    targetProfileId ? ApiService.getUserProfile(targetProfileId).catch(() => ApiService.getMyProfile()) : ApiService.getMyProfile(),
    targetProfileId ? ApiService.getDesigns({ page: 0, size: 40, designer: targetProfileId }) : ApiService.getCustomDesigns(0, 40),
    ApiService.getMyCollections(0, 40).catch(() => ({ responseBody: { content: [] } })),
    ApiService.getPaymentDetails().catch(() => null),
    targetProfileId ? ApiService.getFollowing(undefined, 0, 100).catch(() => ({ responseBody: { content: [] } })) : Promise.resolve({ responseBody: { content: [] } }),
  ]);

  const normalized = normalizeProfileResponse(myProfileResponse);
  const merged = mergeUserAndProfile(currentUser, normalized);
  const roleProfile =
    activeRole === 'DESIGNER'
      ? merged.designerProfile
      : activeRole === 'PRINTER'
        ? merged.printerProfile
        : merged.customerProfile;

  const insight = roleProfile?.insight || {};
  const profileId = Number(targetProfileId || normalized.id || currentUser?.id || roleProfile?.id || 0);
  const [followerResponse, followingResponse, reviewResponse] = await Promise.all([
    ApiService.getFollowers(profileId || undefined, 0, 100).catch(() => ({ responseBody: { content: [] } })),
    ApiService.getFollowing(profileId || undefined, 0, 100).catch(() => ({ responseBody: { content: [] } })),
    ApiService.getShopReviews(profileId || undefined, 0, 50).catch(() => ({ responseBody: { content: [] } })),
  ]);

  const designs = unwrapList(designsResponse);
  const collections = unwrapList(collectionsResponse).map(
    (item: any): CollectionItem => ({
      id: item?.id || String(Math.random()),
      name: String(item?.name || item?.title || 'Untitled collection'),
      imagePath: toAbsoluteImage(item?.imagePath || item?.coverPath || item?.previewImage || item?.image?.url),
      designCount: Number(item?.designCount || item?.designsCount || item?.designs?.length || 0),
    }),
  );

  const reviews = unwrapList(reviewResponse)
    .map(
      (item: any, index: number): ReviewItem => ({
        id: item?.id || `review-${index}`,
        author: toDisplayName(item?.profile || item?.user || item?.author || {}),
        avatar: toAbsoluteImage(item?.profile?.profilePicturePath || item?.user?.profilePicturePath || item?.avatar),
        comment: String(item?.comment || item?.review || item?.message || ''),
        stars: Number(item?.stars || item?.rating || item?.rate || 0),
        createdAt: item?.createdAt || item?.date,
      }),
    )
    .filter((item: ReviewItem) => item.comment);

  const followers = unwrapList(followerResponse);
  const following = unwrapList(followingResponse);
  const currentFollowing = unwrapList(currentFollowingResponse);
  const payment = normalizePaymentDetails(paymentResponse || {});
  const isFollowing = Boolean(
    targetProfileId &&
      currentFollowing.some((item: any) => Number(item?.id || item?.profileId || item?.profile?.id || item?.followingProfileId) === profileId),
  );

  return {
    profile: {
      profileId,
      fullName: merged.fullName || merged.username || 'My Shop',
      username: merged.username || merged.fullName || 'shop',
      bio: roleProfile?.bio || currentUser?.bio || '',
      categories: Array.isArray(roleProfile?.categories) ? roleProfile.categories : [],
      cover: toAbsoluteImage(roleProfile?.coverPic || roleProfile?.coverPhotoPath || normalized.coverPic || normalized.coverImageUrl),
      avatar: toAbsoluteImage(roleProfile?.profilePic || normalized.profilePicturePath || normalized.profileImageUrl || merged.avatar),
      followers: Number(insight.totalFollowers || followers.length || 0),
      following: Number(insight.totalFollowing || following.length || 0),
      reviews: Number(insight.totalReviews || reviews.length || 0),
      uploads: Number(insight.totalUploads || designs.length || 0),
      isFollowing,
    },
    designs,
    collections,
    reviews,
    followers,
    following,
    shouldPromptPayment: !Boolean(payment.bankName && payment.accountName && payment.accountNumber),
  };
}
