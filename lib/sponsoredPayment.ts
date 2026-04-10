import type { PaymentFunder, PaymentMethod } from '@/types';

export interface SponsoredPaymentDraft {
  designFor: string;
  designTheme: string;
  items: string[];
  size: string;
  color: string;
  quantity: number;
  deliveryDate: string;
  printerId: string;
  printerName: string;
  funder: PaymentFunder;
  paymentMethod: PaymentMethod;
}

export const DEFAULT_SP_DRAFT: SponsoredPaymentDraft = {
  designFor: '',
  designTheme: '',
  items: [],
  size: 'M',
  color: 'Blue',
  quantity: 1,
  deliveryDate: '',
  printerId: '',
  printerName: '',
  funder: 'sponsored',
  paymentMethod: 'debit',
};

export const SP_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const SP_COLORS = [
  { name: 'Red', hex: '#F23B2F' },
  { name: 'Blue', hex: '#021DCC' },
  { name: 'Green', hex: '#3A8323' },
  { name: 'Yellow', hex: '#E8E545' },
  { name: 'Purple', hex: '#7E1D95' },
  { name: 'Pink', hex: '#D76AB9' },
  { name: 'Orange', hex: '#E9A63A' },
  { name: 'Brown', hex: '#9D3A35' },
] as const;

export const encodeSponsoredDraft = (draft: SponsoredPaymentDraft) => encodeURIComponent(JSON.stringify(draft));

export const decodeSponsoredDraft = (value?: string) => {
  if (!value) return { ...DEFAULT_SP_DRAFT };
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SP_DRAFT };
    return {
      designFor: typeof parsed.designFor === 'string' ? parsed.designFor : '',
      designTheme: typeof parsed.designTheme === 'string' ? parsed.designTheme : '',
      items: Array.isArray(parsed.items) ? parsed.items.filter((item: unknown): item is string => typeof item === 'string') : [],
      size: typeof parsed.size === 'string' ? parsed.size : 'M',
      color: typeof parsed.color === 'string' ? parsed.color : 'Blue',
      quantity: typeof parsed.quantity === 'number' && parsed.quantity > 0 ? parsed.quantity : 1,
      deliveryDate: typeof parsed.deliveryDate === 'string' ? parsed.deliveryDate : '',
      printerId: typeof parsed.printerId === 'string' ? parsed.printerId : '',
      printerName: typeof parsed.printerName === 'string' ? parsed.printerName : '',
      funder: parsed.funder === 'self' ? 'self' : 'sponsored',
      paymentMethod: typeof parsed.paymentMethod === 'string' ? (parsed.paymentMethod as PaymentMethod) : 'debit',
    } satisfies SponsoredPaymentDraft;
  } catch {
    return { ...DEFAULT_SP_DRAFT };
  }
};

export const sponsoredOrderBreakdown = (quantity: number) => {
  const units = Math.max(1, quantity);
  const designAmount = 30000;
  const printingAmount = 5000 * units;
  const deliveryAmount = 2000;
  return {
    designAmount,
    printingAmount,
    deliveryAmount,
    total: designAmount + printingAmount + deliveryAmount,
  };
};
