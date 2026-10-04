import { useAppAlert } from '@/components/common/AppAlert';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

// Complete BerryStamp FAQ Data
const BERRYSTAMP_FAQS: FaqItem[] = [
  {
    id: '1',
    question: 'What is BerryStamp?',
    answer:
      'BerryStamp is a print-on-demand platform based in Nigeria that helps creators, brands, and businesses produce, print, and ship custom apparel and merchandise with no minimum order quantities.',
  },
  {
    id: '2',
    question: 'How do I place an order?',
    answer:
      'Select a garment or product from the catalog, upload your custom design or logo using our builder, select sizes and colors, and proceed to checkout.',
  },
  {
    id: '3',
    question: 'What artwork formats are accepted for printing?',
    answer:
      'We recommend high-resolution PNG, SVG, or PDF files with transparent backgrounds at 300 DPI to ensure crisp print quality.',
  },
  {
    id: '4',
    question: 'How long does production and delivery take?',
    answer:
      'Production typically takes 2–4 business days. Delivery within Lagos takes 1–2 business days, while nationwide delivery across Nigeria takes 3–5 business days.',
  },
  {
    id: '5',
    question: 'Is there a minimum order quantity (MOQ)?',
    answer:
      'No, there is no minimum order requirement. You can order a single custom t-shirt or bulk orders for events and merch drops.',
  },
  {
    id: '6',
    question: 'What printing methods do you offer?',
    answer:
      'We utilize Direct-to-Film (DTF), Direct-to-Garment (DTG), Screen Printing, and Embroidery depending on the product material and order quantity.',
  },
  {
    id: '7',
    question: 'Can I sell my own merchandise on BerryStamp?',
    answer:
      'Yes! BerryStamp allows creators to set up storefronts or integrate with e-commerce stores so fans can buy your merch on demand without inventory costs.',
  },
  {
    id: '8',
    question: 'What payment methods are supported?',
    answer:
      'We support all major Nigerian payment channels including Debit Cards, Bank Transfers, and USSD via secure payment gateways like Paystack and Flutterwave.',
  },
  {
    id: '9',
    question: 'How do I track my order?',
    answer:
      'Once your order is processed and handed to our delivery partner, you will receive a tracking link via email and SMS to follow your delivery status.',
  },
  {
    id: '10',
    question: 'What is your return and refund policy?',
    answer:
      'If your item arrives damaged, defective, or misprinted, contact support within 48 hours with photo evidence for a free reprint or full refund.',
  },
];

export default function FaqScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [openId, setOpenId] = useState<string | null>(null);
  const { element: alertElement } = useAppAlert();

  // Color Palette
  const bg = isDark ? '#121212' : '#F7F7FB';
  const surface = isDark ? '#1E1E1E' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#1F1B2A';
  const subtext = isDark ? '#A0A0A0' : '#686479';
  const border = isDark ? '#2A2A2A' : '#F0EEF7';
  const primary = '#4732A1';
  const numBg = isDark ? '#2A2147' : primary;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: insets.top + 8,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? '#2A2A2A' : '#ECEAF7',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : '#2B2833'} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 20, fontWeight: '700', color: text }}>
          FAQ
        </Text>
      </View>

      {/* Accordion FAQ List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {BERRYSTAMP_FAQS.map((item, index) => {
          const expanded = openId === item.id;
          return (
            <View
              key={item.id}
              style={{
                marginBottom: 10,
                borderRadius: 16,
                backgroundColor: surface,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                onPress={() => setOpenId(expanded ? null : item.id)}
                activeOpacity={0.75}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: numBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: '500',
                    color: text,
                    lineHeight: 20,
                  }}
                >
                  {item.question}
                </Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={subtext}
                />
              </TouchableOpacity>

              {expanded && (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <Text style={{ fontSize: 13, lineHeight: 22, color: subtext }}>
                    {item.answer}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Render Alert Modal Container */}
      {alertElement}
    </View>
  );
}