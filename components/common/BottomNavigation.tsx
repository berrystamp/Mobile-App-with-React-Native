import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, Href } from 'expo-router';
import { useAppTheme } from '@/lib/theme/appTheme';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH / 5;
const MIDDLE_ITEM_SIZE = 64;

export interface BottomNavigationProps {
  onNavigate?: (route: string) => void;
}

type NavItem = {
  name: string;
  link: Href;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onNavigate }) => {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = useAppTheme();

  const theme = {
    background: isDark 
      ? ['rgba(46, 37, 94, 0.95)', 'rgba(75, 58, 153, 0.85)']
      : ['rgba(255, 255, 255, 0.95)', 'rgba(242, 242, 242, 0.85)'],
    activeTint: themeColors.primary,
    inactiveTint: themeColors.textMuted,
    liquidColor: isDark 
      ? ['rgba(138, 122, 230, 0.45)', 'rgba(75, 58, 153, 0.35)']
      : ['rgba(75, 58, 153, 0.25)', 'rgba(75, 58, 153, 0.15)'],
    borderColor: themeColors.border,
    shadowColor: isDark ? '#000000' : themeColors.primary,
    middleBackground: themeColors.surface,
    middleBorder: themeColors.primary,
  };

  const navItems: NavItem[] = [
    { name: 'Home', link: '/', icon: 'home', iconOutline: 'home-outline' },
    { name: 'Favorites', link: '/favorites', icon: 'heart', iconOutline: 'heart-outline' },
    { name: 'Messages', link: '/messages', icon: 'mail', iconOutline: 'mail-outline' },
    { name: 'Cart', link: '/cart', icon: 'cart', iconOutline: 'cart-outline' },
    { name: 'Profile', link: '/profile', icon: 'person', iconOutline: 'person-outline' },
  ];

  const checkIsActive = (link: string) => {
    if (link === '/') {
      return pathname === '/' || pathname === '/index' || pathname === '/(tabs)';
    }
    return pathname.startsWith(link);
  };

  const activeIndex = navItems.findIndex((item) => checkIsActive(item.link as string));
  const liquidAnim = useRef(new Animated.Value(activeIndex === -1 ? 2 : activeIndex)).current;
  const middlePulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetIndex = activeIndex === -1 ? 2 : activeIndex;
    
    Animated.parallel([
      Animated.spring(liquidAnim, {
        toValue: targetIndex,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Pulse animation for middle item when active
    if (targetIndex === 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(middlePulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(middlePulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      middlePulseAnim.setValue(1);
    }
  }, [activeIndex]);

  const translateX = liquidAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, ITEM_WIDTH, ITEM_WIDTH * 2, ITEM_WIDTH * 3, ITEM_WIDTH * 4],
  });

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-ITEM_WIDTH, ITEM_WIDTH * 2],
  });

  const scaleMap = [0, 1, 2, 3, 4].map((i) =>
    liquidAnim.interpolate({
      inputRange: [i - 0.6, i, i + 0.6],
      outputRange: [1, i === 2 ? 1.4 : 1.2, 1],
      extrapolate: 'clamp',
    })
  );

  return (
    <View style={styles.wrapper}>
      {/* Glassmorphic background with gradient */}
      <LinearGradient
        colors={theme.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.container, { borderTopColor: theme.borderColor }]}
      >
        {/* Frosted overlay effect */}
        <View style={[
          styles.frostOverlay,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)' }
        ]} />

        {/* Liquid wave effect */}
        <Animated.View
          style={[
            styles.waveContainer,
            {
              transform: [{ translateX: waveTranslateX }],
            },
          ]}
        >
          <Svg height="70" width={ITEM_WIDTH * 3}>
            <Path
              d={`M0,35 Q${ITEM_WIDTH * 0.75},20 ${ITEM_WIDTH * 1.5},35 T${ITEM_WIDTH * 3},35`}
              stroke={theme.liquidColor[0]}
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          </Svg>
        </Animated.View>

        {/* Navigation items */}
        {navItems.map((item, index) => {
          const isActive = checkIsActive(item.link as string);
          const isMiddle = index === 2;

          if (isMiddle) {
            return (
              <View key={item.name} style={styles.middleWrapper}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (onNavigate) onNavigate(item.name);
                    router.replace(item.link);
                  }}
                >
                  <Animated.View
                    style={[
                      styles.middleNavItem,
                      {
                        backgroundColor: theme.activeTint,
                        borderColor: theme.middleBorder,
                        transform: [{ scale: isActive ? middlePulseAnim : 1 }],
                        shadowColor: theme.activeTint,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.middleGradient}
                    />
                    <Ionicons
                      name={isActive ? item.icon : item.iconOutline}
                      size={32}
                      color="#FFFFFF"
                    />
                  </Animated.View>
                </TouchableOpacity>
                
                {/* Liquid droplets around middle item */}
                {isActive && (
                  <>
                    <Animated.View style={[styles.droplet, styles.droplet1, { opacity: middlePulseAnim }]} />
                    <Animated.View style={[styles.droplet, styles.droplet2, { opacity: middlePulseAnim }]} />
                    <Animated.View style={[styles.droplet, styles.droplet3, { opacity: middlePulseAnim }]} />
                  </>
                )}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.7}
              style={styles.navItem}
              onPress={() => {
                if (onNavigate) onNavigate(item.name);
                router.replace(item.link);
              }}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: scaleMap[index] }],
                  },
                ]}
              >
                <Ionicons
                  name={isActive ? item.icon : item.iconOutline}
                  size={24}
                  color={isActive ? theme.activeTint : theme.inactiveTint}
                />
              </Animated.View>
              {isActive && index !== 2 && (
                <View style={[styles.activeDot, { backgroundColor: theme.activeTint }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

export default BottomNavigation;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    overflow: 'visible',
    width: '100%',
    position: 'relative',
  },
  frostOverlay: {
    ...StyleSheet.absoluteFillObject,
    backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
  },
  waveContainer: {
    position: 'absolute',
    height: 70,
    width: ITEM_WIDTH * 3,
    left: 0,
    top: 0,
    zIndex: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  middleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 10,
  },
  middleNavItem: {
    width: MIDDLE_ITEM_SIZE,
    height: MIDDLE_ITEM_SIZE,
    borderRadius: MIDDLE_ITEM_SIZE / 2,
    backgroundColor: '#4A3F8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -MIDDLE_ITEM_SIZE / 2 - 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  middleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: MIDDLE_ITEM_SIZE / 2,
  },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  droplet: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A3F8F',
    opacity: 0.3,
  },
  droplet1: {
    top: -5,
    left: 15,
  },
  droplet2: {
    top: 5,
    right: 10,
  },
  droplet3: {
    bottom: 10,
    left: 5,
  },
});
