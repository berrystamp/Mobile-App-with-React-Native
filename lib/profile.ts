import { TProfileType, User } from '@/types';

export type ProfilePayload = {
  id?: number;
  userId?: number; // Added from new payload
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  profilePicturePath?: string;
  profileImageUrl?: string;
  coverPic?: string;
  coverImageUrl?: string;
  profileType?: 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
  role?: 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
  status?: string; // Added from new payload
  bio?: string; // Added from new payload
  categories?: string[]; // Added from new payload
  ordersCount?: number;
  orders?: number;
  deliveredCount?: number;
  deliveredOrders?: number;
  followersCount?: number; // Extracted from insight
  followingCount?: number; // Extracted from insight
  roles?: string[];
  customerProfile?: any;
  printerProfile?: any;
  designerProfile?: any;
};

export type PaymentDetails = {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

export const normalizeProfileResponse = (input: any): ProfilePayload => {
  const body = input?.responseBody || input?.data || input || {};
  
  // Keeps support for older nested profile structures
  const nestedProfile =
    (body.profileType === 'CUSTOMER' ? body.customerProfile : undefined) ||
    (body.profileType === 'PRINTER' ? body.printerProfile : undefined) ||
    (body.profileType === 'DESIGNER' ? body.designerProfile : undefined) ||
    body.customerProfile ||
    body.printerProfile ||
    body.designerProfile ||
    {};

  const name = body.name || nestedProfile?.name || '';
  const [firstName = '', ...rest] = String(name).trim().split(/\s+/).filter(Boolean);
  const lastName = rest.join(' ');
  
  // Insight is now directly on the body in the new payload
  const insight = body.insight || nestedProfile?.insight || {};

  return {
    id: body.id,
    userId: body.userId || nestedProfile?.userId,
    firstName: body.firstName || body.givenName || firstName,
    lastName: body.lastName || body.familyName || lastName,
    name,
    
    // Updated to catch userEmail, userName, and userPhone from the new payload
    username: body.userName || body.username || nestedProfile?.userName || nestedProfile?.name,
    email: body.userEmail || body.email || nestedProfile?.userEmail || nestedProfile?.email,
    phoneNumber: body.userPhone || body.phoneNumber || body.phone || nestedProfile?.userPhone,
    
    address: body.address || body.location || nestedProfile?.address,
    city: body.city || nestedProfile?.city,
    state: body.state || nestedProfile?.state,
    country: body.country || nestedProfile?.country,
    postalCode: body.postalCode || nestedProfile?.postalCode,

    // Updated image parsing to accurately capture profileImage.url and coverImage.url
    profilePicturePath:
      body.profilePic ||
      body.profilePicturePath ||
      body.profilePicture ||
      body.profileImagePath ||
      nestedProfile?.profilePic,
      
    profileImageUrl: 
      body.profileImage?.url || 
      body.profileImageUrl || 
      body.avatarUrl ||
      body.avatar || 
      body.imageUrl || 
      body.image || 
      nestedProfile?.profileImage?.url,

    coverPic:
      body.coverPic ||
      body.coverPhotoPath ||
      body.coverImagePath ||
      nestedProfile?.coverPic ||
      nestedProfile?.coverPhotoPath,
      
    coverImageUrl: 
      body.coverImage?.url || 
      body.coverImageUrl || 
      body.coverUrl || 
      nestedProfile?.coverImage?.url,

    profileType: body.profileType || body.role,
    role: body.role || body.profileType,
    
    // New fields mapped from the backend
    status: body.status || nestedProfile?.status,
    bio: body.bio || nestedProfile?.bio,
    categories: body.categories || nestedProfile?.categories || [],

    // Stats and Insights
    ordersCount: body.ordersCount || body.totalOrders || insight.totalCompletedOrders || 0,
    orders: body.orders,
    deliveredCount: body.deliveredCount || body.totalDelivered || insight.totalCompletedOrders || 0,
    deliveredOrders: body.deliveredOrders,
    followersCount: insight.totalFollowers || 0,
    followingCount: insight.totalFollowing || 0,

    roles: body.roles,
    customerProfile: body.customerProfile,
    printerProfile: body.printerProfile,
    designerProfile: body.designerProfile,
  };
};

export const mergeUserAndProfile = (profile: ProfilePayload) => {
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
  
  return {
    id: profile?.id,
    userId: profile?.userId,
    fullName: fullName || profile?.name || profile?.username || 'User',
    username:  profile?.name || profile?.username || '',
    role: profile?.profileType || profile?.role || 'CUSTOMER',
    address: profile?.address || 'No address added yet.',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || '',
    postalCode: profile?.postalCode || '',
    email: profile?.email || '',
    phone: profile?.phoneNumber || '',
    
    // Extracted flat fields
    avatar: profile?.profilePicturePath || profile?.profileImageUrl,
    cover: profile?.coverPic || profile?.coverImageUrl,
    bio: profile?.bio || '',
    categories: profile?.categories || [],
    followersCount: profile?.followersCount || 0,
    followingCount: profile?.followingCount || 0,
    status: profile?.status,

    orders: profile?.ordersCount || profile?.orders || 0,
    received: profile?.deliveredCount || profile?.deliveredOrders || 0,
    roles: profile?.roles,
    
    // Retain nested profiles for backward compatibility
    customerProfile: profile?.customerProfile,
    printerProfile: profile?.printerProfile,
    designerProfile: profile?.designerProfile,
  };
};

export const normalizePaymentDetails = (input: any): PaymentDetails => {
  const body = input?.responseBody || input || {};
  return {
    bankName: body.bankName || body.bank || '',
    bankCode: body.bankCode || body.bank_code || body.bankId || '',
    accountNumber: body.accountNumber || body.accountNo || '',
    accountName: body.accountName || body.name || '',
  };
};

export const getAvailableProfileTypes = (user: User | null, profile: ProfilePayload): TProfileType[] => {
  const roleSet = new Set<TProfileType>();
  const addRole = (value?: string | null) => {
    const normalized = String(value || '').toUpperCase();
    if (normalized === 'CUSTOMER' || normalized === 'DESIGNER' || normalized === 'PRINTER') {
      roleSet.add(normalized as TProfileType);
    }
  };

  addRole(user?.profileType);
  addRole(profile.profileType);
  addRole(profile.role);
  (user?.roles || profile.roles || []).forEach(addRole);
  if (user?.customerProfile || profile.customerProfile) roleSet.add('CUSTOMER');
  if (user?.designerProfile || profile.designerProfile) roleSet.add('DESIGNER');
  if (user?.printerProfile || profile.printerProfile) roleSet.add('PRINTER');

  if (!roleSet.size) roleSet.add('CUSTOMER');
  return Array.from(roleSet);
};
