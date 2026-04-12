export type TProfileType = 'CUSTOMER' | 'DESIGNER' | 'PRINTER';
export type DesignCategory = string;
export type DesignTheme = string;
export type PrintItem = string;
export type PaymentFunder = 'self' | 'sponsored';
export type PaymentMethod = 'debit' | 'bank_transfer' | 'paypal' | 'ussd' | 'opay';

export interface CustomDesignSpec {
  designFor: DesignCategory;
  designTheme: DesignTheme;
  printItems: PrintItem[];
}

export interface Designer {
  id: string;
  username: string;
  avatar: string;
  coverImage: string;
  specialty: string;
  verified: boolean;
  completedOrders: number;
  rating: number;
  ratingScore: number;
}

export interface OrderOffer {
  id: string;
  title: string;
  designImage: string;
  designAmount: number;
  printingAmount: number;
  deliveryAmount: number;
  dueDate: string;
  needPickupLogistics: boolean;
}

export interface RootStackParamList {
  [key: string]: object | undefined;
  CardPayment: { offer: OrderOffer; method: PaymentMethod };
  CustomDesign: undefined;
  DesignerMessage: { designer: Designer; spec: CustomDesignSpec };
  OnDemandDesigners: { spec: CustomDesignSpec };
  OrderDetails: { offer: OrderOffer; designer: Designer };
  PaymentMethod: { offer: OrderOffer };
  PaymentMethodSelect: { funder: PaymentFunder; offer: OrderOffer };
  SelectDesignFor: { current?: DesignCategory | '' };
  SelectDesignTheme: { current?: DesignTheme | '' };
  SelectItems: { current?: PrintItem[] };
}

export interface Artist {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  profilePicturePath?: string;
  rating: number;
  totalDesigns?: number;
  bio?: string;
  location?: string;
  profileType: TProfileType;
}

export interface Mock {
  id: number;
  name: string;
  category?: string;
  imagePath: string;
  price: number;
  available: boolean;
  availableQty?: number;
  colours?: string[];
}

export interface Design {
  id: number;
  title: string;
  description: string;
  slug: string;
  imagePath: string;
  category: string;
  liked: boolean;
  likes: number;
  views: number;
  mocks: Mock[];
  profile: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    profilePicturePath?: string;
  };
  createdAt: string;
  updatedAt: string;
  amount?: number;
  tags?: string[];
  categories?: string[];
  designerId?: number;
  designerName?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  username: string;
  phoneNumber: string;
  areaCode?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  profilePicturePath?: string;
  bio?: string;
  profileType: TProfileType;
  roles?: string[];
  activated: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  customerProfile?: {
    profileType: TProfileType;
    status?: string;
    userName?: string;
    name?: string;
    bio?: string;
    categories?: string[];
    profilePic?: string;
    coverPic?: string;
    coverPhotoPath?: string;
    profileImage?: { url?: string };
    coverImage?: { url?: string };
    insight?: {
      totalFollowers?: number;
      totalFollowing?: number;
      totalUploads?: number;
      totalCompletedOrders?: number;
      totalCancelledOrders?: number;
      totalReviews?: number;
      totalEarnings?: number;
      jobSuccessPercentage?: number;
      rating?: {
        avgStars?: number;
      };
    };
  };
  printerProfile?: {
    profileType: TProfileType;
    status?: string;
    userName?: string;
    name?: string;
    bio?: string;
    categories?: string[];
    profilePic?: string;
    coverPic?: string;
    coverPhotoPath?: string;
    profileImage?: { url?: string };
    coverImage?: { url?: string };
    insight?: {
      totalFollowers?: number;
      totalFollowing?: number;
      totalUploads?: number;
      totalCompletedOrders?: number;
      totalCancelledOrders?: number;
      totalReviews?: number;
      totalEarnings?: number;
      jobSuccessPercentage?: number;
      rating?: {
        avgStars?: number;
      };
    };
  };
  designerProfile?: {
    profileType: TProfileType;
    status?: string;
    userName?: string;
    name?: string;
    bio?: string;
    categories?: string[];
    profilePic?: string;
    coverPic?: string;
    coverPhotoPath?: string;
    profileImage?: { url?: string };
    coverImage?: { url?: string };
    insight?: {
      totalFollowers?: number;
      totalFollowing?: number;
      totalUploads?: number;
      totalCompletedOrders?: number;
      totalCancelledOrders?: number;
      totalReviews?: number;
      totalEarnings?: number;
      jobSuccessPercentage?: number;
      rating?: {
        avgStars?: number;
      };
    };
  };
}

export interface CartItem {
  id: number;
  quantity: number;
  design: Design;
  mock: Mock;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export type ManageOrderStatus = 'Active' | 'Completed' | 'Canceled';

export interface ManageOrderItem {
  id: string;
  code: string;
  title: string;
  shopName: string;
  amount: number;
  status: ManageOrderStatus;
  description: string;
  designer: string;
  updatedAt: string;
  createdAt: string;
  dueOn: string;
  purpose: string;
  itemsToPrint: string[];
  uploadedDesigns?: string[];
}

export interface Conversation {
  id: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  profile: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicturePath?: string;
  };
}

export interface Message {
  id: number | string;
  content?: string;
  text?: string;
  senderId: number | string;
  receiverId?: number | string;
  read?: boolean;
  seen?: boolean;
  createdAt?: string;
  timestamp?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  imagePath?: string;
  designCount: number;
  designs: Design[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface LoginResponse {
  idToken: string;
  user: User;
}

export interface Wallet {
  id: number;
  balance: number;
  currency: string;
}

export interface WalletHistory {
  id: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  createdAt: string;
}
