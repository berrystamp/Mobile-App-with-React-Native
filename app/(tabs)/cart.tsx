import React, { useState, useMemo } from 'react';
import { Image, ScrollView, Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageSource: any; 
  variantText: string; 
  checked: boolean; // Added checked state
}

interface SuggestedItem {
  id: string;
  name: string;
  author: string;
  price: number;
  imageSource: any;
}

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 1. Initial State for Cart Items
  const [cartItems, setCartItems] = useState<CartItem[]>([
      {id: '1', name: 'Long Sleeve men Shirt', price: 5000, quantity: 2, imageSource: require('@/assets/images/item1.png'), variantText: 'M, White & Black, Front', checked: true},
      {id: '2', name: 'Long Sleeve men Shirt', price: 5000, quantity: 4, imageSource: require('@/assets/images/item2.png'), variantText: 'M, White & Black, Front', checked: false},
      {id: '3', name: 'Long Sleeve men Shirt', price: 5000, quantity: 2, imageSource: require('@/assets/images/item3.png'), variantText: 'M, White & Black, Front', checked: false},
  ]);

  // 2. Data Array for "More like this"
  const suggestedItems: SuggestedItem[] = [
      { id: 's1', name: 'My Mind Mug', author: 'Mohh_Jumah', price: 3000, imageSource: require('@/assets/images/item1.png') },
      { id: 's2', name: 'We Meuuve Slang design', author: 'Mohh_Jumah', price: 3000, imageSource: require('@/assets/images/item2.png') },
      { id: 's3', name: 'Abstract Art Tee', author: 'Creative_Soul', price: 4500, imageSource: require('@/assets/images/item3.png') },
  ];

  // --- HANDLERS ---

  const handleClearCart = () => setCartItems([]);

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleCheck = (id: string) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleUpdateQuantity = (id: string, type: 'increase' | 'decrease') => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
        // Prevent quantity from dropping below 1
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    }));
  };

  // 3. Dynamic Subtotal Calculation (Only counts checked items)
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return item.checked ? sum + (item.price * item.quantity) : sum;
    }, 0);
  }, [cartItems]);


  return (
    // Added dark:bg-[#121212] for dark mode background
    <ScrollView className='bg-white dark:bg-[#121212] w-full h-full pt-12 px-1' contentContainerStyle={{paddingBottom: 40}}>
      
      {/* Header */}
      <View className='w-full flex flex-row justify-between items-center px-6 py-4'>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <View>
          <Text className='text-[#333333] dark:text-white text-xl font-semibold'>
            Cart
          </Text>
        </View>
        <TouchableOpacity onPress={handleClearCart}>
          <Text className={`${cartItems.length === 0 ? 'text-[#eb5757a5]' : 'text-[#EB5757]'} text-lg font-semibold`}>
             Clear
          </Text>
        </TouchableOpacity>
      </View> 

      { cartItems.length === 0 ? (
        <View className='items-center pt-24 h-full'>
          <View className='w-64 h-64 items-center justify-center mb-1'>
            <Image source={require('@/assets/images/shopping-cart.png')} resizeMode='contain' style={{ width: '100%', height: '100%' }} />
          </View>
          <Text className='font-bold text-[#333333] dark:text-white text-2xl'>Cart is empty!</Text>
          <Text className='text-[#828282] dark:text-gray-400 w-72 leading-relaxed text-center mt-2'>You have not yet added any item to cart, explore beautiful designs now and add them to cart</Text>
        </View>
      ) : (
        <>
        {/* Cart Items List */}
        {cartItems.map((item) => (
          <View key={item.id} className='items-center flex justify-center w-full'>
            <View 
              // Replaced inline styles with Tailwind shadows and dark mode borders
              className='flex-row bg-white dark:bg-[#1E1E1E] my-3 w-[92%] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'
            >
              
              <View style={{height: 90, width: 80}} className='object-cover object-center justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden p-1 mr-3'>
                <Image source={item.imageSource} resizeMode='cover' style={{ width: '100%', height: '100%' }} /> 
              </View>

              <View className='flex-1 flex-col py-1.5 justify-between'>
                <View>
                  <Text className='text-lg font-bold text-[#333333] dark:text-white' numberOfLines={1}>{item.name}</Text>
                  <Text className='text-xs text-[#828282] dark:text-gray-400 font-semibold mt-0.5'>{item.variantText}</Text> 
                </View>

                {/* Quantity Controls Row */}
                <View className='flex-row items-center space-x-2 mt-2'>
                  <TouchableOpacity 
                    onPress={() => handleUpdateQuantity(item.id, 'decrease')}
                    className='w-7 h-7 bg-[#0056D2] rounded-md justify-center items-center'
                  >
                      <Ionicons name="remove-outline" size={16} color="white" />
                  </TouchableOpacity>
                  
                  <Text className='text-lg font-bold w-6 text-center text-black dark:text-white'>{item.quantity}</Text>
                  
                  <TouchableOpacity 
                    onPress={() => handleUpdateQuantity(item.id, 'increase')}
                    className='w-7 h-7 bg-[#0056D2] rounded-md justify-center items-center'
                  >
                      <Ionicons name="add-outline" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className='items-end flex-col justify-between py-1.5 pl-3'>
                  <View className='flex-row items-center space-x-1.5'>
                      <TouchableOpacity>
                        <Ionicons name="heart-outline" size={18} color={isDark ? "#A0A0A0" : "#828282"} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                        <Ionicons name="close-outline" size={18} color="#EB5757" />
                      </TouchableOpacity>
                  </View>

                  {/* Interactive Checkbox */}
                  <TouchableOpacity onPress={() => handleToggleCheck(item.id)} className='my-auto py-1'>
                       {item.checked ? (
                              <View className='w-5 h-5 border border-[#0056D2] rounded-md justify-center items-center bg-[#0056D2]'>
                                  <Ionicons name="checkmark" size={12} color="white" />
                              </View>
                          ) : (
                              <View className='w-5 h-5 border border-gray-400 dark:border-gray-600 rounded-md' />
                          )}
                  </TouchableOpacity>
                  <Text className='text-lg font-extrabold text-[#333333] dark:text-white'>₦{(item.price * item.quantity).toLocaleString()}</Text> 
              </View>

            </View>
          </View>
        ))}
      
        {/* Cart Summary Section */}
        <View className="px-6 mt-6 w-full">
            <Text className="text-lg font-bold text-[#333333] dark:text-white mb-5">Cart Summary</Text>

            <View className="flex-row justify-between mb-3.5">
                <Text className="text-[#828282] dark:text-gray-400 text-base font-medium">Design cost</Text>
                <Text className="text-[#333333] dark:text-white text-base font-semibold">₦ {subtotal.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-3.5">
                <Text className="text-[#828282] dark:text-gray-400 text-base font-medium">Printing cost</Text>
                <Text className="text-[#BDBDBD] dark:text-gray-600 text-base font-semibold">-</Text>
            </View>
            <View className="flex-row justify-between mb-5">
                <Text className="text-[#828282] dark:text-gray-400 text-base font-medium">Pickup/delivery</Text>
                <Text className="text-[#BDBDBD] dark:text-gray-600 text-base font-semibold">-</Text>
            </View>

            <View className="h-[1px] bg-gray-200 dark:bg-gray-800 w-full mb-5" />

            <View className="flex-row justify-between mb-8">
                <Text className="text-[#333333] dark:text-white font-bold text-lg">Subtotal</Text>
                <Text className="text-[#333333] dark:text-white font-bold text-lg">₦ {subtotal.toLocaleString()}</Text>
            </View>

            <View className="flex-row items-start space-x-2 mb-8 pr-2">
                <Ionicons name="information-circle-outline" size={20} color="#2D71E3" />
                <Text className="text-[#2D71E3] text-xs leading-5 flex-1">
                    Items printing and pickup/delivery charge not included yet. Printing and delivery cost will be added after selecting a printer and negotiating printing cost. after which you&apos;d be directed to a checkout page
                </Text>
            </View>

            <TouchableOpacity 
              disabled={subtotal === 0}
              className={`w-full rounded-full py-4 items-center justify-center ${subtotal === 0 ? 'bg-gray-400 dark:bg-gray-700' : 'bg-[#3B2D85]'}`}
            >
                <Text className="text-white font-bold text-base">Print Product</Text>
            </TouchableOpacity>
        </View>

        {/* More Like This Section mapped dynamically */}
        <View className="pl-6 mt-10 w-full mb-4">
            <Text className="text-lg font-bold text-[#333333] dark:text-white mb-4">More like this</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
                {suggestedItems.map((suggested) => (
                  <View key={suggested.id} className="mr-4 w-44">
                      <View className="w-full h-44 bg-[#F5F5F5] dark:bg-[#1E1E1E] rounded-xl mb-3 overflow-hidden relative justify-center items-center border border-transparent dark:border-gray-800">
                         <Image source={suggested.imageSource} resizeMode='contain' style={{ width: '80%', height: '80%' }} />
                         <TouchableOpacity className="absolute top-3 right-3 bg-white/70 dark:bg-black/50 p-1.5 rounded-full">
                             <Ionicons name="heart-outline" size={20} color={isDark ? "#FFF" : "#333"} />
                         </TouchableOpacity>
                      </View>
                      <Text className="text-[#333333] dark:text-white font-semibold text-sm" numberOfLines={1}>{suggested.name}</Text>
                      <Text className="text-[#828282] dark:text-gray-400 text-xs mt-0.5">By {suggested.author}</Text>
                      <Text className="text-[#333333] dark:text-white font-bold mt-1 text-base">₦{suggested.price.toLocaleString()}</Text>
                  </View>
                ))}
            </ScrollView>
        </View>

      </>
      )}
      
    </ScrollView>
  );
}