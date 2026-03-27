import type { CustomDesignSpec, Designer, OrderOffer } from '@/types';

export const MOCK_DESIGNERS: Designer[] = [
  {
    id: 'designer-1',
    username: 'Falcon Prints',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    specialty: 'Brand and apparel design',
    verified: true,
    completedOrders: 128,
    rating: 96,
    ratingScore: 4.8,
  },
  {
    id: 'designer-2',
    username: 'Studio Mint',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    specialty: 'Flyers, merch and social assets',
    verified: true,
    completedOrders: 84,
    rating: 92,
    ratingScore: 4.6,
  },
  {
    id: 'designer-3',
    username: 'North Ink',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    coverImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
    specialty: 'Event visuals and print-ready layouts',
    verified: false,
    completedOrders: 56,
    rating: 89,
    ratingScore: 4.4,
  },
  {
    id: 'designer-4',
    username: 'Aura Lab',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    specialty: 'Fashion-forward campaign graphics',
    verified: true,
    completedOrders: 73,
    rating: 94,
    ratingScore: 4.7,
  },
];

export const MOCK_SPEC: CustomDesignSpec = {
  designFor: 'Fashion Show',
  designTheme: 'Fun',
  printItems: ['Flier', 'Tshirt', 'Hoodie'],
};

export const MOCK_OFFER: OrderOffer = {
  id: 'offer-1',
  title: 'Design for Fashion show on (Flier, Tshirt and Hoodie)',
  designImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  designAmount: 30000,
  printingAmount: 15000,
  deliveryAmount: 5000,
  dueDate: '23/12/2026',
  needPickupLogistics: true,
};
