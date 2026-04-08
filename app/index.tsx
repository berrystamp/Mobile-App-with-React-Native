import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import * as NativeSplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';


export default function SplashScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isHydrated, isLoggedIn, role, hasSelectedInterests } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    const timer = setTimeout(async () => {
      if (!isLoggedIn) {
        router.replace('/(auth)/choose-account');
      } 
      await NativeSplashScreen.hideAsync();
    }, 1200);

    return () => clearTimeout(timer);
  }, [hasSelectedInterests, isHydrated, isLoggedIn, role, router]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#3E2F8A' : '#FFFFFF'}
      />

      <LinearGradient
        colors={
          isDark
            ? ['#3E2F8A', '#3E2F8A', 'rgba(0, 0, 0, 0.06)']
            : ['#FFFFFF', '#FFFFFF', 'rgba(0, 0, 0, 0.06)']
        }
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Image
        source={
          isDark
            ? require('../assets/splash-dark.png')
            : require('../assets/splash-light.png')
        }
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '65%',
    height: '65%',
  },
});
