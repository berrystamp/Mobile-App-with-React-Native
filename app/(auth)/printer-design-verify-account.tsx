import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Rect } from 'react-native-svg';

const NAVY = '#2F2D8C';
const INDIGO = '#6B6BD6';
const INDIGO_FAINT = '#C5C5F0';

function PrinterDesignVerifyAccount() {
  return (
    <Svg width="200" height="160" viewBox="0 0 200 160">
      {/* Decorative dots */}
      <Circle cx="18" cy="52" r="5" fill={INDIGO_FAINT} />
      <Circle cx="38" cy="22" r="3.5" fill={INDIGO_FAINT} />
      <Circle cx="162" cy="48" r="4" fill={INDIGO_FAINT} />
      <Circle cx="182" cy="22" r="3" fill={INDIGO_FAINT} />
      <Circle cx="28" cy="128" r="4" fill={INDIGO_FAINT} />
      <Circle cx="172" cy="132" r="4.5" fill={INDIGO_FAINT} />
      <Circle cx="100" cy="8" r="2.5" fill={INDIGO_FAINT} />

      {/* Open flap – triangle pointing up, rendered first (behind letter) */}
      <Polygon
        points="22,68 100,18 178,68"
        fill={INDIGO}
      />

      {/* Letter card – sits in front of flap, peeking out from envelope opening */}
      {/* White card body */}
      <Rect x="68" y="28" width="64" height="58" rx="4" fill="#FFFFFF" />
      {/* Red accent stripe */}
      <Rect x="78" y="40" width="44" height="6" rx="3" fill="#E8496A" />
      {/* Gray text lines */}
      <Rect x="78" y="53" width="44" height="4" rx="2" fill="#D0D0E8" />
      <Rect x="78" y="63" width="32" height="4" rx="2" fill="#D0D0E8" />

      {/* Envelope body (renders on top of letter bottom, creating the "inside" look) */}
      <Rect x="22" y="68" width="156" height="84" rx="8" fill={INDIGO} />

      {/* Fold lines – bottom V shape suggesting the base fold crease */}
      <Line x1="22" y1="152" x2="100" y2="108" stroke="#8888E0" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="178" y1="152" x2="100" y2="108" stroke="#8888E0" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export default function VerifyAccountScreen() {
  const isDark = useColorScheme() === 'dark';
  const t = isDark ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Centered illustration + copy */}
      <View style={styles.content}>
        <PrinterDesignVerifyAccount />

        <Text style={styles.title}>Welcome to Berrystamp</Text>

        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          A verification code has been sent to your email.{' '}
          <Text style={[styles.subtitleBold, { color: t.textPrimary }]}>Kindly verify your account now.</Text>
        </Text>
      </View>

      {/* Proceed button pinned to bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.proceedButton}
          activeOpacity={0.85}
          onPress={() => router.push('/PrinterDesignerVerify-otp' as never)}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const lightTheme = {
  bg: '#FFFFFF',
  textPrimary: '#333',
  textSecondary: '#666',
};

const darkTheme = {
  bg: '#12122A',
  textPrimary: '#EEEEF8',
  textSecondary: '#888899',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: INDIGO,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitleBold: {
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  proceedButton: {
    backgroundColor: NAVY,
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
