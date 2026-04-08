import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/lib/theme/appTheme';
import { useAuthStore, isCustomerRole } from '@/store/authStore';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  onSearchPress?: () => void;
  type?: string;
  title?: string;
  onBackPress?: () => void;
  rightAction?: boolean;
  rightActionText?: string;
  onRightAction?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  type,
  title,
  onBackPress,
  rightAction,
  rightActionText,
  onRightAction,
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const insets = useSafeAreaInsets();
  
  // Use React Native's built-in hook to detect the current system/app theme
  const colorScheme = useColorScheme();

  const hiddenRoutes = ['/cart', '/printers', '/products', '/chat', '/select-printer', '/checkout'];
  if (type !== 'back' && !isCustomerRole(role)) {
    return null;
  }
  if (type !== 'back' && hiddenRoutes.includes(pathname)) {
    return null;
  }
  // Dynamically set the logo based on the color scheme
  const logoSource = colorScheme === 'dark' 
    ? require('@/assets/splash-dark.png')
    : require('@/assets/splash-light.png');

  if (type === 'back') {
    return (
      <View 
        className="flex-row items-center justify-between pb-[14px] px-4 border-b bg-transparent"
        style={{ borderBottomColor: theme.border, paddingTop: Math.max(insets.top, 16) + 10 }}
      >
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center" 
          onPress={onBackPress || (() => router.back())}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        
        <Text 
          className="flex-1 text-center text-lg font-bold mx-3" 
          style={{ color: theme.text }} 
          numberOfLines={1}
        >
          {title || ''}
        </Text>
        
        <View className="min-w-[40px] items-end">
          {rightAction ? (
            <TouchableOpacity onPress={onRightAction}>
              <Text 
                className="text-[15px] font-semibold" 
                style={{ color: theme.primary }}
              >
                {rightActionText || 'Action'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row justify-between items-center px-5 pb-6 bg-transparent" style={{ paddingTop: Math.max(insets.top, 16) + 12 }}> 
      <View>
        <Image 
          source={logoSource} 
    
           style={{width: 140, height: 30}}
          contentFit="contain" 
        />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="w-10 h-10 rounded-full justify-center items-center"

          onPress={onSearchPress || (() => router.push('/(tabs)/Search'))}
        >
          <Ionicons name="search-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
