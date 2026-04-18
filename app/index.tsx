import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import * as NativeSplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

NativeSplashScreen.preventAutoHideAsync().catch(() => {});

export default function SplashScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isHydrated, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(async () => {
      await NativeSplashScreen.hideAsync().catch(() => {});
      if (isLoggedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isHydrated, isLoggedIn, router]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#3D2DB5' : '#FFFFFF'}
      />
      <LinearGradient
        colors={isDark ? ['#3D2DB5', '#2A1E8A', '#1A1040'] : ['#FFFFFF', '#F5F3FF', '#EDE9FF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={isDark ? require('../assets/splash-dark.png') : require('../assets/splash-light.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '65%', height: '65%' },
});
