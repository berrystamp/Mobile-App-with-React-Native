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
  profileType?: 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
  fullName: string;
  username: string;
  bio: string;
  location?: string;
  categories: string[];
  cover: string;
  avatar: string;
  followers: number;
  following: number;
  reviews: number;
  uploads: number;
  rating?: number;
  jobSuccess?: number;
  isFollowing?: boolean;
};

export type GalleryItem = {
  id: number | string;
  imageUrl: string;
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
  gallery: GalleryItem[];
  followers: any[];
  following: any[];
  shouldPromptPayment: boolean;
};
