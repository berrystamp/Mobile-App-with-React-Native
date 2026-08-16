import { normalizeDesignListResponse } from "@/lib/designs";
import {
  mergeUserAndProfile,
  normalizePaymentDetails,
  normalizeProfileResponse,
} from "@/lib/profile";
import ApiService from "@/services/apiClient";
import type { User } from "@/types";
import type { CollectionItem, ReviewItem, ShopData } from "./types";

const API_ORIGIN = "https://backend-dev-api.berrystamp.com";
export const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200";
export const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300";

export const toAbsoluteImage = (path?: string) => {
  if (!path || path === "string") return "";
  if (path.startsWith("http") || path.startsWith("file:")) return path;
  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
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
  const direct = String(person?.name || "").trim();
  if (direct) return direct;
  const built = `${person?.firstName || ""} ${person?.lastName || ""}`.trim();
  return built || person?.username || person?.userName || "User";
};

export const toCountLabel = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

export async function fetchShopData(
  activeRole: "CUSTOMER" | "DESIGNER" | "PRINTER",
  targetProfileId?: number,
): Promise<ShopData> {
  const myProfileResponse = targetProfileId
    ? await ApiService.getUserProfile(targetProfileId).catch(() =>
      ApiService.getMyProfile(),
    )
    : await ApiService.getMyProfile();

  const normalized = normalizeProfileResponse(myProfileResponse);
  const merged = mergeUserAndProfile(normalized);

  // Keep for legacy compatibility if some fields still hide in here
  const roleProfile =
    activeRole === "DESIGNER"
      ? merged.designerProfile
      : activeRole === "PRINTER"
        ? merged.printerProfile
        : merged.customerProfile;

  const insight = roleProfile?.insight || myProfileResponse?.responseBody?.insight || {};

  // The ID is now directly at the root in the flat payload.
  // When viewing as owner (no targetProfileId), prefer the nested role profile's id
  // since merged.id may be the user ID rather than the profile ID used by the API.
  const profileId =
    roleProfile?.profileId ||
    roleProfile?.id ||
    merged.id ||
    targetProfileId;

  // Use the resolved profileId for collections (owner case had undefined here before)
  const collectionsId = targetProfileId ?? profileId;

  const currentUser = (await ApiService.getCurrentUser()) as User | null;
  const [designsResponse, collectionsResponse, paymentResponse] =
    await Promise.all([
      ApiService.getDesigns({ page: 0, size: 40, designer: profileId || undefined }),
      ApiService.getCollections(collectionsId, 0, 40).catch(() => ({
        responseBody: { content: [] },
      })),
      ApiService.getPaymentDetails().catch(() => null),
    ]);

  const [followerResponse, followingResponse, reviewResponse] =
    await Promise.all([
      ApiService.getFollowers(profileId || undefined, 0, 100).catch(() => ({
        responseBody: { content: [] },
      })),
      ApiService.getFollowing(profileId || undefined, 0, 100).catch(() => ({
        responseBody: { content: [] },
      })),
      ApiService.getShopReviews(profileId || undefined, 0, 50).catch(() => ({
        responseBody: { content: [] },
      })),
    ]);

  const designs = normalizeDesignListResponse(designsResponse);
  const collections = unwrapList(collectionsResponse).map(
    (item: any): CollectionItem => ({
      id: item?.id || String(Math.random()),
      name: String(item?.name || item?.title || "Untitled collection"),
      imagePath: toAbsoluteImage(
        item?.picture,
      ),
      description: item.description,
      designCount: Number(
        item?.designCount || item?.designsCount || item?.designs?.length || 0,
      ),
    }),
  );

  const reviews = unwrapList(reviewResponse)
    .map(
      (item: any, index: number): ReviewItem => ({
        id: item?.id || `review-${index}`,
        author: toDisplayName(
          item?.profile || item?.user || item?.author || {},
        ),
        avatar: toAbsoluteImage(
          item?.profile?.profilePicturePath ||
          item?.user?.profilePicturePath ||
          item?.avatar,
        ),
        comment: String(item?.comment || item?.review || item?.message || ""),
        stars: Number(item?.stars || item?.rating || item?.rate || 0),
        createdAt: item?.createdAt || item?.date,
      }),
    )
    .filter((item: ReviewItem) => item.comment);

  const followers = unwrapList(followerResponse);
  const following = unwrapList(followingResponse);
  const payment = normalizePaymentDetails(paymentResponse || {});
  const isFollowing = Boolean(
    targetProfileId &&
    followers.some(
      (item: any) =>
        item?.userId === currentUser?.id,
    ),
  );

  const shopName =
    roleProfile?.name ||
    merged.fullName ||
    "My Shop";

  return {
    profile: {
      profileId,
      fullName: shopName,
      username: merged.username || merged.fullName || "shop",

      // Pull bio and categories from the merged root, fallback to roleProfile
      bio: merged.bio || roleProfile?.bio || "",
      categories: Array.isArray(merged.categories) && merged.categories.length > 0
        ? merged.categories
        : Array.isArray(roleProfile?.categories)
          ? roleProfile.categories
          : [],

      cover: toAbsoluteImage(
        merged.cover ||
        roleProfile?.coverPic ||
        roleProfile?.coverPhotoPath
      ),

      avatar: toAbsoluteImage(
        merged.avatar ||
        roleProfile?.profilePic
      ),

      // Look at the new root properties first, fallback to insight/arrays
      followers: Number(merged.followersCount || insight.totalFollowers || followers.length || 0),
      following: Number(merged.followingCount || insight.totalFollowing || following.length || 0),
      reviews: Number(insight.totalReviews || reviews.length || 0),
      uploads: Number(insight.totalUploads || designs.length || 0),

      isFollowing,
    },
    designs,
    collections,
    reviews,
    followers,
    following,
    shouldPromptPayment: !Boolean(
      payment.bankName && payment.accountName && payment.accountNumber,
    ),
  };
}
