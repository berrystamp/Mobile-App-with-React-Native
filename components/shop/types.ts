import type { Design } from '@/types';

export type TabType = 'designs' | 'collections';

export type CollectionItem = {
  id: number | string;
  name: string;
  description:string
  imagePath?: string;
  designCount: number;
};

export type ShopProfile = {
  profileId: number;
  fullName: string;
  username: string;
  bio: string;
  categories: string[];
  cover: string;
  avatar: string;
  followers: number;
  following: number;
  reviews: number;
  uploads: number;
  isFollowing?: boolean;
};

export type ReviewItem = {
  id: string | number;
  author: string;
  avatar?: string;
  comment: string;
  stars: number;
  createdAt?: string;
};

export type GridItem = {
  id: string | number;
  title: string;
  subtitle: string;
  imagePath?: string;
  type: 'design' | 'collection';
};

export type ShopData = {
  profile: ShopProfile;
  designs: Design[];
  collections: CollectionItem[];
  reviews: ReviewItem[];
  followers: any[];
  following: any[];
  shouldPromptPayment: boolean;
};
