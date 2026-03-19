export type ConversationRole = 'Designer' | 'Printers';

export type MessageComposerAttachment = 'gallery' | 'file';

export type ChatMessageType = 'text' | 'bundle' | 'offer';

export interface ConversationSummary {
  id: string;
  name: string;
  role: ConversationRole;
  avatarColor: string;
  avatarEmoji: string;
  lastMessage: string;
  unreadCount: number;
  updatedAtLabel: string;
  online?: boolean;
}

export interface BundlePreviewItem {
  id: string;
  image: any;
  label?: string;
  overlayText?: string;
}

export interface OfferCardData {
  title: string;
  priceLabel: string;
  previousPriceLabel?: string;
  description: string;
  image: any;
  ctaLabel: string;
}

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  author: 'me' | 'other';
  text?: string;
  createdAtLabel: string;
  status?: 'sent' | 'seen';
  offer?: OfferCardData;
  bundle?: {
    title: string;
    items: BundlePreviewItem[];
    footerLabel: string;
  };
}

export interface ReportReason {
  id: string;
  label: string;
}

const productImage1 = require('@/assets/images/item1.png');
const productImage2 = require('@/assets/images/item2.png');
const productImage3 = require('@/assets/images/item3.png');
const productImage4 = require('@/assets/images/item4.png');

export const messageThreads: ConversationSummary[] = [
  {
    id: 'de-sportman',
    name: 'De_Sportman',
    role: 'Printers',
    avatarColor: '#B8E5C0',
    avatarEmoji: '🧢',
    lastMessage: 'Let’s discuss your printing preferences please.',
    unreadCount: 0,
    updatedAtLabel: '2h',
    online: true,
  },
  {
    id: 'mohh-jumah-designer',
    name: 'Mohh_Jumah',
    role: 'Designer',
    avatarColor: '#A9D8FF',
    avatarEmoji: '🤓',
    lastMessage: 'Your concept draft is ready for review.',
    unreadCount: 1,
    updatedAtLabel: '2h',
  },
  {
    id: 'falcon-prints',
    name: 'Falcon Prints',
    role: 'Printers',
    avatarColor: '#FFD7A1',
    avatarEmoji: '🧔🏾',
    lastMessage: 'Thanks for contacting Falcon prints, let us proceed.',
    unreadCount: 0,
    updatedAtLabel: '4h',
  },
  {
    id: 'glow-studio',
    name: 'Glow Studio',
    role: 'Designer',
    avatarColor: '#F5B9C1',
    avatarEmoji: '👱🏽',
    lastMessage: 'I can animate the mockup in two styles for you.',
    unreadCount: 0,
    updatedAtLabel: '6h',
  },
  {
    id: 'print-hub',
    name: 'Print Hub',
    role: 'Printers',
    avatarColor: '#CAB8FF',
    avatarEmoji: '🧑🏾‍🦱',
    lastMessage: 'Pickup logistics can be arranged for tomorrow.',
    unreadCount: 3,
    updatedAtLabel: '1d',
  },
];

export const emptyMessageThreads: ConversationSummary[] = [];

export const reportReasons: ReportReason[] = [
  { id: 'not-trustworthy', label: 'Not trustworthy' },
  { id: 'not-skilled', label: 'He is not skilled' },
  { id: 'hate-speech', label: 'Hate speech or symbols' },
  { id: 'violent-extremism', label: 'Violent extremism' },
  { id: 'false-information', label: 'False information' },
  { id: 'scam', label: 'Scam and fraud' },
  { id: 'deceptive', label: 'Deceptive' },
  { id: 'bullying', label: 'Bullying harassment' },
];

export const chatMessagesByThread: Record<string, ChatMessage[]> = {
  'de-sportman': [
    {
      id: 'bundle-1',
      type: 'bundle',
      author: 'me',
      createdAtLabel: '11:58 AM',
      bundle: {
        title: 'Selected products',
        footerLabel: 'View the 5 Products',
        items: [
          { id: 'bundle-item-1', image: productImage1 },
          { id: 'bundle-item-2', image: productImage2 },
          { id: 'bundle-item-3', image: productImage3 },
          { id: 'bundle-item-4', image: productImage4, overlayText: '+2 Items' },
        ],
      },
    },
    {
      id: 'text-1',
      type: 'text',
      author: 'me',
      text: 'Hi, Good day.\nI’d like to hire you for printing service',
      createdAtLabel: '12:02 PM',
      status: 'seen',
    },
    {
      id: 'offer-1',
      type: 'offer',
      author: 'other',
      createdAtLabel: '12:04 PM',
      offer: {
        title: 'Long Sleeve men Shirt',
        priceLabel: '₦8,000 - ₦10,000',
        description: 'Custom order offer',
        image: productImage1,
        ctaLabel: 'View Details',
      },
    },
    {
      id: 'text-2',
      type: 'text',
      author: 'other',
      text: 'Hi Mohh_Jumah. I used AlphaWorld app to come up with the animation concept.',
      createdAtLabel: '12:06 PM',
      status: 'seen',
    },
    {
      id: 'text-3',
      type: 'text',
      author: 'me',
      text: 'Hi, Good morning\nThank you for contacting Falcon prints. Let’s discuss your printing preferences please.',
      createdAtLabel: '12:12 PM',
      status: 'seen',
    },
  ],
};

export const defaultComposerSuggestions = [
  'Hi, Good day.',
  'I’d like to hire you for printing service',
];
