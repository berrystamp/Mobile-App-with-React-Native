import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ProductActionSheet } from '@/components/product/ProductActionSheet';

type Review = {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
  rating: number;
  date: string;
  comment: string;
};

type Mockup = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  price: string;
};

type RelatedProduct = {
  id: string;
  title: string;
  artist: string;
  image: ImageSourcePropType;
  price: string;
};

const brand = '#463197';
const heroImages: ImageSourcePropType[] = [
  require('@/assets/images/item1.png'),
  require('@/assets/images/item2.png'),
  require('@/assets/images/item3.png'),
  require('@/assets/images/item4.png'),
];

const mockups: Mockup[] = [
  { id: 'm1', title: 'Long Sleeve Men Shirt', image: require('@/assets/images/item1.png'), price: '₦5,000' },
  { id: 'm2', title: 'Body fit', image: require('@/assets/images/item2.png'), price: '₦5,000' },
  { id: 'm3', title: 'Round neck', image: require('@/assets/images/item3.png'), price: '₦5,000' },
  { id: 'm4', title: 'Tote Bag', image: require('@/assets/images/item4.png'), price: '₦5,000' },
];

const relatedProducts: RelatedProduct[] = [
  { id: 'r1', title: 'My Mind Mug', artist: 'Mohh_Jumah', image: require('@/assets/images/item1.png'), price: '₦3,000' },
  { id: 'r2', title: 'We Meuuve Slang Design', artist: 'Mohh_Jumah', image: require('@/assets/images/item2.png'), price: '₦3,000' },
  { id: 'r3', title: 'Sapa Be Like', artist: 'Mohh_Jumah', image: require('@/assets/images/item3.png'), price: '₦3,000' },
  { id: 'r4', title: 'Fun and Peaceful Emotion', artist: 'Mohh_Jumah', image: require('@/assets/images/item4.png'), price: '₦3,000' },
];

const reviews: Review[] = [
  {
    id: '1',
    name: 'Wittig Iyon',
    avatar: require('@/assets/images/item1.png'),
    rating: 4,
    date: '8/3/2022',
    comment: 'Your work is a masterpiece of creativity, elegance, and attention to detail. Truly awe-inspiring and captivating.',
  },
  {
    id: '2',
    name: 'Ada Johnson',
    avatar: require('@/assets/images/item2.png'),
    rating: 5,
    date: '8/2/2022',
    comment: 'The mockup quality is excellent and the print finish looks premium. Delivery notes were also very clear.',
  },
  {
    id: '3',
    name: 'Micheal Creed',
    avatar: require('@/assets/images/item3.png'),
    rating: 4,
    date: '7/29/2022',
    comment: 'Fast turnaround, responsive designer, and the fit guide helped me choose the right size without stress.',
  },
];

const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = [
  { name: 'Red', value: '#F44336' },
  { name: 'Blue', value: '#1E40AF' },
  { name: 'Green', value: '#2E7D32' },
  { name: 'Yellow', value: '#FDE047' },
  { name: 'Purple', value: '#7E22CE' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Brown', value: '#92400E' },
  { name: 'White', value: '#FFFFFF', border: '#D1D5DB' },
  { name: 'Grey', value: '#737373' },
  { name: 'Gold', value: '#C9A227' },
  { name: 'Silver', value: '#CBD5E1' },
  { name: 'Navy', value: '#1E3A8A' },
  { name: 'Sky', value: '#38BDF8' },
  { name: 'Black', value: '#111827' },
  { name: 'Crimson', value: '#BE123C' },
];
const printingTypes = ['Screen printing', 'Direct to screen', 'Sublimation', 'Direct to garment'];
const reviewBreakdown = [
  { stars: 5, count: 60, width: '83%' as const },
  { stars: 4, count: 30, width: '62%' as const },
  { stars: 3, count: 15, width: '42%' as const },
  { stars: 2, count: 8, width: '22%' as const },
  { stars: 1, count: 2, width: '11%' as const },
];

function RatingStars({ value }: { value: number }) {
  return (
    <View className="flex-row items-center gap-x-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Ionicons
          key={index}
          name={index < value ? 'star' : 'star-outline'}
          size={12}
          color="#FDB022"
        />
      ))}
    </View>
  );
}

function SectionCard({
  title,
  subtitle,
  details,
  onPress,
}: {
  title: string;
  subtitle: string;
  details: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 rounded-[18px] border border-[#ECE8FF] bg-white px-4 py-4"
      activeOpacity={0.85}>
      <View className="flex-row items-center gap-x-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F2EFFF]">
          <Ionicons name="add" size={22} color={brand} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-[#2F2F2F]">{title}</Text>
          <Text className="mt-1 text-xs text-[#8A8A8A]">{subtitle}</Text>
          <Text className="mt-1 text-xs font-medium text-[#5D5D5D]">{details}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#979797" />
      </View>
    </TouchableOpacity>
  );
}

function QuantityStepper({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <View className="flex-row items-center gap-x-3">
      <TouchableOpacity
        className="h-8 w-8 items-center justify-center rounded-md bg-[#0F4AA3]"
        onPress={() => onChange(Math.max(1, value - 1))}>
        <Ionicons name="remove" size={16} color="#FFFFFF" />
      </TouchableOpacity>
      <Text className="min-w-[14px] text-center text-sm font-semibold text-[#2F2F2F]">{value}</Text>
      <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-md bg-[#0F4AA3]" onPress={() => onChange(value + 1)}>
        <Ionicons name="add" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

export default function ProductsScreen() {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [itemSpecVisible, setItemSpecVisible] = useState(false);
  const [printSpecVisible, setPrintSpecVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [printingTypeMenuVisible, setPrintingTypeMenuVisible] = useState(false);
  const [toast, setToast] = useState<'cart' | 'favorite' | null>(null);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Blue');
  const [quantity, setQuantity] = useState(1);
  const [limitQuantity, setLimitQuantity] = useState(true);

  const [printingType, setPrintingType] = useState('Screen printing');
  const [budgetFrom, setBudgetFrom] = useState('8000');
  const [budgetTo, setBudgetTo] = useState('10000');
  const [preferredDate, setPreferredDate] = useState('20 Dec 2026');
  const [hasOwnItem, setHasOwnItem] = useState<'pickup' | 'inventory'>('inventory');

  const specificationSummary = useMemo(
    () => `${selectedColor}, ${selectedSize}, ${quantity} ${quantity > 1 ? 'pcs' : 'pc'}`,
    [quantity, selectedColor, selectedSize],
  );

  const printSummary = useMemo(
    () => `${printingType}, ₦${budgetFrom} - ₦${budgetTo}, ${preferredDate}`,
    [budgetFrom, budgetTo, preferredDate, printingType],
  );

  const handleAddToCart = () => {
    setToast('cart');
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleFavorite = () => {
    const nextValue = !favorite;
    setFavorite(nextValue);
    setToast('favorite');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <View className="flex-1 bg-[#FAFAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <View className="bg-[#AFAFAF] px-5 pb-6 pt-14">
          <View className="mb-5 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View className="flex-1 px-3">
              <Text className="text-lg font-semibold text-white">Japan Night</Text>
              <Text className="text-xs text-white/85">Designed by Berrystamp</Text>
            </View>
            <View className="flex-row items-center gap-x-1">
              <TouchableOpacity onPress={handleToggleFavorite} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Ionicons name="share-social-outline" size={21} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center">
            <Image source={heroImages[activeImageIndex]} resizeMode="contain" className="h-[360px] w-full" />
            <View className="mt-2 flex-row gap-x-2">
              {heroImages.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => setActiveImageIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full ${activeImageIndex === index ? 'bg-[#2F2F2F]' : 'bg-[#D7D7D7]'}`}
                />
              ))}
            </View>
          </View>
        </View>

        <View className="-mt-4 rounded-t-[28px] bg-[#FAFAFC] px-5 pt-6">
          <Text className="text-[30px] font-semibold leading-9 text-[#232323]">Long Sleeve Men Shirt</Text>
          <Text className="mt-2 text-base text-[#4E79FF]">From Japan tour Collection</Text>

          <View className="mt-3 flex-row items-end justify-between">
            <View>
              <Text className="text-sm text-[#8A8A8A]">475 piece available</Text>
              <View className="mt-2 flex-row items-center gap-x-2">
                <View className="rounded-md bg-[#F6C645] px-2 py-1">
                  <Text className="text-xs font-semibold text-white">★ 4.5</Text>
                </View>
                <Text className="text-sm text-[#7A7A7A]">120 reviews</Text>
              </View>
            </View>
            <Text className="text-[32px] font-bold text-[#3F3190]">₦5,000</Text>
          </View>

          <View className="mt-5 rounded-[20px] bg-white px-4 py-4 shadow-sm shadow-black/5">
            <Text className="text-base font-semibold text-[#2F2F2F]">Description</Text>
            <Text className="mt-2 text-sm leading-6 text-[#646464]">
              Japan Night brings a playful yet haunting twist to everyday style. It captures the thrill of the night with a fearless street-art finish and premium mockup presentation.
            </Text>
          </View>

          <View className="mt-5">
            <SectionCard
              title="Add Item Specification"
              subtitle="Color, size and quantity"
              details={specificationSummary}
              onPress={() => setItemSpecVisible(true)}
            />
            <SectionCard
              title="Add Printing Specification"
              subtitle="Type, budget and time frame"
              details={printSummary}
              onPress={() => setPrintSpecVisible(true)}
            />
            <TouchableOpacity className="mt-2 rounded-[18px] border border-[#E9E9F4] bg-white px-4 py-4" activeOpacity={0.85}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-x-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F6F1FF]">
                    <Ionicons name="chatbox-ellipses-outline" size={18} color={brand} />
                  </View>
                  <Text className="text-sm font-semibold text-[#4B3CA0]">Request customization</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#979797" />
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-7 rounded-[22px] bg-white px-4 py-5 shadow-sm shadow-black/5">
            <Text className="text-base font-semibold text-[#2F2F2F]">Policy</Text>
            <Text className="mt-3 text-sm leading-6 text-[#666666]">
              To be delivered anywhere in Nigeria after 10 days. Note that delivery days might be sooner based on your location.
            </Text>
            <Text className="mt-3 text-sm leading-6 text-[#666666]">
              Return is free with tangible reason within 10 days after delivery.
            </Text>
          </View>

          <View className="mt-7">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-[#232323]">Designer Reviews</Text>
              <TouchableOpacity onPress={() => setReviewVisible(true)}>
                <Text className="text-sm font-semibold text-[#4E79FF]">See more</Text>
              </TouchableOpacity>
            </View>

            <View className="rounded-[22px] bg-white px-4 py-5 shadow-sm shadow-black/5">
              <View className="flex-row justify-between gap-x-4">
                <View className="w-[44%] items-center rounded-[18px] bg-[#F6F3FF] px-3 py-4">
                  <Text className="text-[30px] font-bold text-[#3F3190]">4/5</Text>
                  <View className="mt-2"><RatingStars value={4} /></View>
                  <Text className="mt-4 text-[24px] font-semibold text-[#2F2F2F]">152</Text>
                  <Text className="text-xs text-[#818181]">Reviews</Text>
                </View>
                <View className="flex-1 justify-center gap-y-2">
                  {reviewBreakdown.map((item) => (
                    <View key={item.stars} className="flex-row items-center gap-x-2">
                      <Text className="w-5 text-xs text-[#444444]">{item.stars}</Text>
                      <Ionicons name="star" size={12} color="#FDB022" />
                      <Text className="w-8 text-xs text-[#7A7A7A]">({item.count})</Text>
                      <View className="h-2 flex-1 rounded-full bg-[#ECE8FF]">
                        <View className="h-2 rounded-full bg-[#4C3CA4]" style={{ width: item.width }} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View className="mt-6 border-t border-[#F0F0F0] pt-5">
                <View className="flex-row gap-x-3">
                  <Image source={reviews[0].avatar} className="h-12 w-12 rounded-full" />
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-[#2F2F2F]">{reviews[0].name}</Text>
                    <View className="mt-1 flex-row items-center gap-x-2">
                      <RatingStars value={reviews[0].rating} />
                      <Text className="text-xs text-[#7A7A7A]">• {reviews[0].date}</Text>
                    </View>
                    <Text className="mt-3 text-base leading-8 text-[#444444]">{reviews[0].comment}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-7">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-[#232323]">Select Mockup</Text>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-[#4E79FF]">View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {mockups.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setActiveImageIndex(mockups.findIndex((mockup) => mockup.id === item.id))}
                  className="w-40 rounded-[18px] bg-white p-3 shadow-sm shadow-black/5">
                  <Image source={item.image} resizeMode="cover" className="h-28 w-full rounded-2xl bg-[#F3F4F6]" />
                  <Text className="mt-3 text-sm font-medium text-[#2F2F2F]" numberOfLines={2}>{item.title}</Text>
                  <Text className="mt-1 text-sm font-semibold text-[#3F3190]">{item.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="mt-7 pb-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-[#232323]">More like this</Text>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-[#4E79FF]">View all</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap justify-between">
              {relatedProducts.map((item) => (
                <View key={item.id} className="mb-4 w-[48%] rounded-[18px] bg-white p-3 shadow-sm shadow-black/5">
                  <Image source={item.image} className="h-36 w-full rounded-2xl bg-[#F4F4F4]" resizeMode="cover" />
                  <TouchableOpacity className="absolute right-5 top-5 h-8 w-8 items-center justify-center rounded-full bg-white/90">
                    <Ionicons name="heart-outline" size={16} color="#7A7A7A" />
                  </TouchableOpacity>
                  <Text className="mt-3 text-sm font-medium text-[#2F2F2F]">{item.title}</Text>
                  <Text className="mt-1 text-xs text-[#7A7A7A]">By {item.artist}</Text>
                  <Text className="mt-1 text-base font-semibold text-[#2F2F2F]">{item.price}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#ECECEC] bg-white px-5 pb-8 pt-4">
        <View className="flex-row gap-x-3">
          <TouchableOpacity className="flex-1 items-center justify-center rounded-2xl border border-[#D8D0FF] py-4">
            <Text className="text-base font-semibold text-[#4A3BA5]">Add to cart</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddToCart} className="flex-1 items-center justify-center rounded-2xl bg-[#4A369F] py-4">
            <Text className="text-base font-semibold text-white">Print now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {toast ? (
        <View className="absolute bottom-28 left-5 right-5 rounded-[24px] bg-white px-4 py-4 shadow-lg shadow-black/10">
          <View className="flex-row items-center gap-x-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#DDF7E9]">
              <Ionicons name="checkmark" size={20} color="#36A86D" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#2F2F2F]">
                {toast === 'cart' ? 'Product added to cart!' : favorite ? 'Product added to favorite successfully!' : 'Product removed from favorites.'}
              </Text>
              <Text className="mt-1 text-xs text-[#7A7A7A]">
                {toast === 'cart' ? '3 products in cart' : 'You can access it anytime from your favorites tab.'}
              </Text>
            </View>
            {toast === 'cart' ? (
              <TouchableOpacity onPress={() => router.push('/cart')}>
                <Text className="text-sm font-semibold text-[#3366CC]">Go to Cart</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}

      <ProductActionSheet visible={itemSpecVisible} title="Item specification" onClose={() => setItemSpecVisible(false)}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
          <Text className="mb-3 text-sm font-medium text-[#464646]">Choose size</Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                className={`min-w-[40px] rounded-md border px-3 py-2 ${selectedSize === size ? 'border-[#4A369F] bg-[#F2EFFF]' : 'border-[#D7D7D7] bg-white'}`}
                onPress={() => setSelectedSize(size)}>
                <Text className={`text-center text-sm ${selectedSize === size ? 'font-semibold text-[#4A369F]' : 'text-[#4F4F4F]'}`}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity className="mb-3 flex-row items-center gap-x-2" onPress={() => setLimitQuantity(!limitQuantity)}>
            <View className={`h-5 w-5 items-center justify-center rounded-full border ${limitQuantity ? 'border-[#4A369F]' : 'border-[#D0D0D0]'}`}>
              {limitQuantity ? <View className="h-2.5 w-2.5 rounded-full bg-[#4A369F]" /> : null}
            </View>
            <Text className="text-sm text-[#444444]">Limit Quantity</Text>
          </TouchableOpacity>

          <View className="mb-6 flex-row items-center gap-x-4">
            <Text className="text-sm text-[#6A6A6A]">Quantity:</Text>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </View>

          <Text className="mb-3 text-sm font-medium text-[#464646]">Select colors</Text>
          <View className="mb-8 flex-row flex-wrap justify-between gap-y-4">
            {colors.map((color) => {
              const selected = selectedColor === color.name;
              return (
                <TouchableOpacity key={color.name} className="w-[15%] items-center" onPress={() => setSelectedColor(color.name)}>
                  <View
                    className={`h-8 w-8 rounded-sm border ${selected ? 'border-[#4A369F]' : 'border-transparent'}`}
                    style={{ backgroundColor: color.value, borderColor: color.border ?? (selected ? '#4A369F' : 'transparent') }}
                  />
                  <Text className="mt-1 text-[10px] text-[#666666]">{color.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={() => setItemSpecVisible(false)} className="rounded-2xl bg-[#4A369F] py-4">
            <Text className="text-center text-base font-semibold text-white">Save</Text>
          </TouchableOpacity>
        </ScrollView>
      </ProductActionSheet>

      <ProductActionSheet visible={printSpecVisible} title="Print Specification" onClose={() => setPrintSpecVisible(false)}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
          <Text className="mb-2 text-sm font-medium text-[#444444]">Select printing type</Text>
          <TouchableOpacity
            className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E2E2E2] bg-white px-4 py-4"
            onPress={() => setPrintingTypeMenuVisible(true)}>
            <Text className="text-sm text-[#3F3F3F]">{printingType}</Text>
            <Ionicons name="chevron-down" size={18} color="#7B7B7B" />
          </TouchableOpacity>

          <Text className="mb-2 text-sm font-medium text-[#444444]">Budget Range(₦)</Text>
          <View className="mb-4 flex-row justify-between gap-x-3">
            <TextInput
              value={budgetFrom}
              onChangeText={setBudgetFrom}
              keyboardType="number-pad"
              placeholder="From"
              className="flex-1 rounded-xl border border-[#E2E2E2] px-4 py-4 text-sm text-[#2F2F2F]"
            />
            <TextInput
              value={budgetTo}
              onChangeText={setBudgetTo}
              keyboardType="number-pad"
              placeholder="To"
              className="flex-1 rounded-xl border border-[#E2E2E2] px-4 py-4 text-sm text-[#2F2F2F]"
            />
          </View>

          <Text className="mb-2 text-sm font-medium text-[#444444]">Preferred Date of Delivery</Text>
          <TextInput
            value={preferredDate}
            onChangeText={setPreferredDate}
            placeholder="Preferred delivery date"
            className="mb-5 rounded-xl border border-[#E2E2E2] px-4 py-4 text-sm text-[#2F2F2F]"
          />

          <Text className="mb-3 text-sm font-medium text-[#444444]">Do You Have Your Own Item</Text>
          <TouchableOpacity className="mb-3 flex-row gap-x-3" onPress={() => setHasOwnItem('pickup')}>
            <View className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border ${hasOwnItem === 'pickup' ? 'border-[#4A369F]' : 'border-[#D0D0D0]'}`}>
              {hasOwnItem === 'pickup' ? <View className="h-2.5 w-2.5 rounded-full bg-[#4A369F]" /> : null}
            </View>
            <Text className="flex-1 text-sm leading-5 text-[#555555]">Yes, I have my items and I would like a pickup and delivery service</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mb-8 flex-row gap-x-3" onPress={() => setHasOwnItem('inventory')}>
            <View className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border ${hasOwnItem === 'inventory' ? 'border-[#4A369F]' : 'border-[#D0D0D0]'}`}>
              {hasOwnItem === 'inventory' ? <View className="h-2.5 w-2.5 rounded-full bg-[#4A369F]" /> : null}
            </View>
            <Text className="flex-1 text-sm leading-5 text-[#555555]">No, get item from the printer&apos;s inventory with delivery service</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPrintSpecVisible(false)} className="rounded-2xl bg-[#4A369F] py-4">
            <Text className="text-center text-base font-semibold text-white">Apply</Text>
          </TouchableOpacity>
        </ScrollView>
      </ProductActionSheet>

      <ProductActionSheet visible={reviewVisible} title="Review" onClose={() => setReviewVisible(false)}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
          <View className="flex-row justify-between gap-x-4">
            <View className="w-[44%] items-center rounded-[18px] bg-[#F6F3FF] px-3 py-4">
              <Text className="text-[30px] font-bold text-[#3F3190]">4/5</Text>
              <View className="mt-2"><RatingStars value={4} /></View>
              <Text className="mt-4 text-[24px] font-semibold text-[#2F2F2F]">152</Text>
              <Text className="text-xs text-[#818181]">Reviews</Text>
            </View>
            <View className="flex-1 justify-center gap-y-2">
              {reviewBreakdown.map((item) => (
                <View key={item.stars} className="flex-row items-center gap-x-2">
                  <Text className="w-5 text-xs text-[#444444]">{item.stars}</Text>
                  <Ionicons name="star" size={12} color="#FDB022" />
                  <Text className="w-8 text-xs text-[#7A7A7A]">({item.count})</Text>
                  <View className="h-2 flex-1 rounded-full bg-[#ECE8FF]">
                    <View className="h-2 rounded-full bg-[#4C3CA4]" style={{ width: item.width }} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-7 gap-y-5">
            {reviews.map((review) => (
              <View key={review.id} className="border-b border-[#F0F0F0] pb-5">
                <View className="flex-row gap-x-3">
                  <Image source={review.avatar} className="h-12 w-12 rounded-full" />
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-[#2F2F2F]">{review.name}</Text>
                    <View className="mt-1 flex-row items-center gap-x-2">
                      <RatingStars value={review.rating} />
                      <Text className="text-xs text-[#7A7A7A]">• {review.date}</Text>
                    </View>
                    <Text className="mt-3 text-base leading-8 text-[#444444]">{review.comment}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </ProductActionSheet>

      <ProductActionSheet
        visible={printingTypeMenuVisible}
        title="Printing types"
        onClose={() => setPrintingTypeMenuVisible(false)}>
        <View>
          {printingTypes.map((type, index) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setPrintingType(type);
                setPrintingTypeMenuVisible(false);
              }}
              className={`flex-row items-center justify-between py-4 ${index !== printingTypes.length - 1 ? 'border-b border-[#EFEFEF]' : ''}`}>
              <View>
                <Text className="text-base text-[#2F2F2F]">{type}</Text>
                {type === 'Direct to garment' ? <Text className="mt-1 text-xs text-[#8A8A8A]">Best for detailed artwork and low-volume orders</Text> : null}
              </View>
              {printingType === type ? <MaterialCommunityIcons name="check-circle" size={22} color={brand} /> : null}
            </TouchableOpacity>
          ))}
        </View>
      </ProductActionSheet>
    </View>
  );
}
