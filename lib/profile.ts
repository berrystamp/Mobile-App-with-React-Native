import { TProfileType, User } from '@/types';

export type ProfilePayload = {
  id?: number;
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
  ordersCount?: number;
  orders?: number;
  deliveredCount?: number;
  deliveredOrders?: number;
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
  const insight = nestedProfile?.insight || {};

  return {
    id: body.id,
    firstName: body.firstName || body.givenName || firstName,
    lastName: body.lastName || body.familyName || lastName,
    name,
    username: body.username || body.userName || nestedProfile?.userName || nestedProfile?.name,
    email: body.email,
    phoneNumber: body.phoneNumber || body.phone,
    address: body.address || body.location,
    city: body.city,
    state: body.state,
    country: body.country,
    postalCode: body.postalCode,
    profilePicturePath:
      body.profilePicturePath ||
      body.profilePicture ||
      body.profileImagePath ||
      body.avatarUrl ||
      body.imageUrl ||
      nestedProfile?.profileImage?.url ||
      nestedProfile?.profilePic,
    profileImageUrl: body.profileImageUrl || body.avatar || body.image || nestedProfile?.profileImage?.url,
    coverPic:
      body.coverPic ||
      body.coverPhotoPath ||
      body.coverImagePath ||
      nestedProfile?.coverPic ||
      nestedProfile?.coverPhotoPath,
    coverImageUrl: body.coverImageUrl || body.coverUrl || nestedProfile?.coverImage?.url,
    profileType: body.profileType || body.role,
    role: body.role || body.profileType,
    ordersCount: body.ordersCount || body.totalOrders || insight.totalCompletedOrders,
    orders: body.orders,
    deliveredCount: body.deliveredCount || body.totalDelivered || insight.totalCompletedOrders,
    deliveredOrders: body.deliveredOrders,
    roles: body.roles,
    customerProfile: body.customerProfile,
    printerProfile: body.printerProfile,
    designerProfile: body.designerProfile,
  };
};

export const mergeUserAndProfile = (user: User | null, profile: ProfilePayload) => {
  const fullName = `${profile.firstName || user?.firstName || ''} ${profile.lastName || user?.lastName || ''}`.trim();
  return {
    fullName: fullName || profile.name || user?.name || profile.username || user?.username || 'User',
    username: profile.username || user?.username || profile.name || user?.name || '',
    role: profile.profileType || profile.role || user?.profileType || 'CUSTOMER',
    address: profile.address || 'No address added yet.',
    city: profile.city || user?.city || '',
    state: profile.state || user?.state || '',
    country: profile.country || user?.country || '',
    postalCode: profile.postalCode || user?.postalCode || '',
    email: profile.email || user?.email || '',
    phone: profile.phoneNumber || user?.phoneNumber || '',
    avatar: profile.profilePicturePath || profile.profileImageUrl || user?.profilePicturePath,
    orders: profile.ordersCount || profile.orders || 0,
    received: profile.deliveredCount || profile.deliveredOrders || 0,
    roles: profile.roles || user?.roles,
    customerProfile: profile.customerProfile || user?.customerProfile,
    printerProfile: profile.printerProfile || user?.printerProfile,
    designerProfile: profile.designerProfile || user?.designerProfile,
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
