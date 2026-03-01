import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAVY = '#2F2D8C';
const { width } = Dimensions.get('window');

const lightTheme = {
  overlay: 'rgba(180,180,200,0.55)',
  card: '#FFFFFF',
  textPrimary: '#1a1a2e',
  textBrand: NAVY,
  circleBorder: NAVY,
  checkColor: NAVY,
  closeColor: '#888',
};

const darkTheme = {
  overlay: 'rgba(0,0,0,0.70)',
  card: '#1C1C3A',
  textPrimary: '#EEEEF8',
  textBrand: '#8888DD',
  circleBorder: '#6B6BD6',
  checkColor: '#6B6BD6',
  closeColor: '#6666AA',
};

export default function ResetPasswordSuccessScreen() {
  const isDark = useColorScheme() === 'dark';
  const t = isDark ? darkTheme : lightTheme;

  function handleLogin() {
    router.replace('/login');
  }

  function handleClose() {
    router.replace('/login');
  }

  return (
    <View style={[styles.overlay, { backgroundColor: t.overlay }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centeredContainer}>
          <View style={[styles.card, { backgroundColor: t.card }]}>
            {/* Card Header: logo + close */}
            <View style={styles.cardHeader}>
              <View style={styles.brandRow}>
               <Image source={require('@/app/img/logo-icon.webp')} />
              </View>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={10}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={t.closeColor} />
              </TouchableOpacity>
            </View>

            {/* Success circle */}
            <View style={[styles.successCircle, { borderColor: t.circleBorder }]}>
              <Ionicons name="checkmark" size={44} color={t.checkColor} />
            </View>

            {/* Message */}
            <Text style={[styles.successText, { color: t.textPrimary }]}>
              Password changed successfully
            </Text>

            {/* Login button */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.85}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: width - 48,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  closeButton: {
    padding: 2,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: NAVY,
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});