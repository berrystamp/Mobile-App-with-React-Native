import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StatusBar, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type AccountType, useAuthStore } from '@/store/authStore';

export default function ChooseAccountScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAccountType } = useAuthStore();

  const theme = {
    background: isDark ? '#121212' : '#FAFAFA',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    purple: '#4B3A99',
    lightPurple: isDark ? '#4B3A9930' : '#EFEAFE',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    subtext: isDark ? '#B8B4C8' : '#8A8298',
    border: isDark ? '#2E2E2E' : '#EFEFEF',
  };

  const accounts = [
    {
      type: 'customer' as AccountType,
      title: 'Customer',
      description: 'Explore and buy unique designs from talented designers worldwide.',
      icon: <Ionicons name="cart-outline" size={22} color={theme.purple} />,
      signupPath: '/(auth)/signup',
    },
    {
      type: 'designer' as AccountType,
      title: 'Designer',
      description: 'Create and sell your own unique designs to customers worldwide.',
      icon: <MaterialCommunityIcons name="palette-outline" size={22} color={theme.purple} />,
      signupPath: '/(auth)/printer-designer-sign-up',
    },
    {
      type: 'printer' as AccountType,
      title: 'Printer',
      description: 'Print and distribute designs created by talented designers.',
      icon: <MaterialCommunityIcons name="printer-outline" size={22} color={theme.purple} />,
      signupPath: '/(auth)/printer-designer-sign-up',
    },
  ];

  const handleSelectType = (type: AccountType, signupPath: string) => {
    setAccountType(type);
    router.push(signupPath as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Back to login */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color={theme.text} />
        <Text style={{ fontSize: 14, color: theme.subtext, marginLeft: 6 }}>Back to login</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <Image
          source={isDark ? require('@/assets/logo02.png') : require('@/assets/logo01.png')}
          style={{ width: 160, height: 48 }}
          resizeMode="contain"
        />
      </View>

      <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', color: theme.text, marginBottom: 8 }}>
        Create an Account
      </Text>
      <Text style={{ fontSize: 14, textAlign: 'center', color: theme.subtext, marginBottom: 28, lineHeight: 20 }}>
        Select the type of account you want to create.{'\n'}
        Every user also gets a customer account.
      </Text>

      <View style={{ gap: 12 }}>
        {accounts.map((account) => (
          <TouchableOpacity
            key={account.type}
            activeOpacity={0.8}
            onPress={() => handleSelectType(account.type, account.signupPath)}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: 18,
              borderRadius: 16,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0 : 0.04,
              shadowRadius: 4,
              elevation: isDark ? 0 : 2,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14, backgroundColor: theme.lightPurple }}>
              {account.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: theme.purple, marginBottom: 4 }}>
                {account.title}
              </Text>
              <Text style={{ fontSize: 13, color: theme.subtext, lineHeight: 19 }}>
                {account.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.subtext} style={{ marginTop: 2 }} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
