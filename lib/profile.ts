import { User } from '@/types';

export type ProfilePayload = {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profilePicturePath?: string;
  profileImageUrl?: string;
  profileType?: 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
  role?: 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
  ordersCount?: number;
  orders?: number;
  deliveredCount?: number;
  deliveredOrders?: number;
};

export type PaymentDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export const normalizeProfileResponse = (input: any): ProfilePayload => {
  const body = input?.responseBody || input?.data || input || {};
  return {
    id: body.id,
    firstName: body.firstName || body.givenName,
    lastName: body.lastName || body.familyName,
    username: body.username || body.userName,
    email: body.email,
    phoneNumber: body.phoneNumber || body.phone,
    address: body.address || body.location,
    profilePicturePath:
      body.profilePicturePath || body.profileImagePath || body.avatarUrl || body.imageUrl,
    profileImageUrl: body.profileImageUrl || body.avatar || body.image,
    profileType: body.profileType || body.role,
    role: body.role || body.profileType,
    ordersCount: body.ordersCount || body.totalOrders,
    orders: body.orders,
    deliveredCount: body.deliveredCount || body.totalDelivered,
    deliveredOrders: body.deliveredOrders,
  };
};

export const mergeUserAndProfile = (user: User | null, profile: ProfilePayload) => {
  const fullName = `${profile.firstName || user?.firstName || ''} ${profile.lastName || user?.lastName || ''}`.trim();
  return {
    fullName: fullName || profile.username || user?.username || 'User',
    username: profile.username || user?.username || '',
    role: profile.profileType || profile.role || user?.profileType || 'CUSTOMER',
    address: profile.address || 'No address added yet.',
    email: profile.email || user?.email || '',
    phone: profile.phoneNumber || user?.phoneNumber || '',
    avatar: profile.profilePicturePath || profile.profileImageUrl || user?.profilePicturePath,
    orders: profile.ordersCount || profile.orders || 0,
    received: profile.deliveredCount || profile.deliveredOrders || 0,
  };
};

export const normalizePaymentDetails = (input: any): PaymentDetails => {
  const body = input?.responseBody || input || {};
  return {
    bankName: body.bankName || body.bank || '',
    accountNumber: body.accountNumber || body.accountNo || '',
    accountName: body.accountName || body.name || '',
  };
};
