export type TProfileType = 'CUSTOMER' | 'DESIGNER' | 'PRINTER';

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
  email: string;
  username: string;
  phoneNumber: string;
  profilePicturePath?: string;
  bio?: string;
  profileType: TProfileType;
  activated: boolean;
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
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  read: boolean;
  createdAt: string;
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