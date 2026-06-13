import { useAuth } from '@/context/AuthContext'; // Import the Context
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen'; // 1. Import SplashScreen 

// 2. Prevent the splash screen from auto-hiding immediately
SplashScreen.hideAsync();

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Use Context to accurately track if the auth check is finished
  const { isAuthenticated, isLoading } = useAuth(); 
  const { needsInterestOnboarding } = useAuthStore();

  useEffect(() => {
    // Do not start the 20-second countdown until checkAuth() is completely finished
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // Respect your onboarding flow if they are authenticated
        if (needsInterestOnboarding) {
           router.replace('/(auth)/interests');
        } else {
           router.replace('/(tabs)');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }, 3000); // 20 seconds delay
    
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, needsInterestOnboarding, router]);

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