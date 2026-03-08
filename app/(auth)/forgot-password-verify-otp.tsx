import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAVY = '#2F2D8C';
const INDIGO = '#6B6BD6';
const OTP_LENGTH = 5;
const RESEND_SECONDS = 60;

export default function ForgotPasswordVerifyOtpScreen() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const isDark = useColorScheme() === 'dark';
  const t = isDark ? darkTheme : lightTheme;

  // Countdown timer
  useEffect(() => {
    if (seconds === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  function handleResend() {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setFocusedIndex(0);
    setSeconds(RESEND_SECONDS);
    setCanResend(false);
    inputRefs.current[0]?.focus();
  }

  function handleChange(text: string, index: number) {
    // Only accept single digit
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        const next = [...otp];
        next[index - 1] = '';
        setOtp(next);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  }

  const filled = otp.every(d => d !== '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={t.textPrimary} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Header */}
          <Text style={[styles.title, { color: t.textPrimary }]}>Forgot Password</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            Enter the code sent to your email address
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {Array(OTP_LENGTH)
              .fill(null)
              .map((_, i) => (
                <TextInput
                  key={i}
                  ref={ref => { inputRefs.current[i] = ref; }}
                  style={[
                    styles.otpBox,
                    { backgroundColor: t.otpBg, color: t.textPrimary },
                    focusedIndex === i && [styles.otpBoxFocused, { backgroundColor: t.bg }],
                    otp[i] ? [styles.otpBoxFilled, { backgroundColor: t.bg }] : null,
                  ]}
                  value={otp[i]}
                  onChangeText={text => handleChange(text, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  onFocus={() => setFocusedIndex(i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  caretHidden
                  autoFocus={i === 0}
                />
              ))}
          </View>

          {/* Resend row */}
          <View style={styles.resendRow}>
            <Text style={[styles.resendText, { color: t.textSecondary }]}>Didn&apos;t get the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={!canResend}>
              <Text style={[styles.resendLink, !canResend && styles.resendDisabled]}>
                Resend
              </Text>
            </TouchableOpacity>
          </View>

          {/* Countdown */}
          {!canResend && (
            <Text style={styles.countdown}>{seconds}secs</Text>
          )}
        </View>

        {/* Proceed button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.proceedButton, !filled && styles.proceedButtonDisabled]}
            activeOpacity={0.85}
            disabled={!filled}
            onPress={() => router.push('/reset-password')}
          >
            <Text style={styles.proceedButtonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const lightTheme = {
  bg: '#FFFFFF',
  textPrimary: '#1a1a2e',
  textSecondary: '#555',
  textMuted: '#888',
  otpBg: '#F2F2F5',
};

const darkTheme = {
  bg: '#12122A',
  textPrimary: '#EEEEF8',
  textSecondary: '#BBBBDD',
  textMuted: '#888899',
  otpBg: '#1E1E3A',
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
  },
  backButton: {
    marginTop: 8,
    marginLeft: 20,
    alignSelf: 'flex-start',
    padding: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  otpBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  otpBoxFocused: {
    borderColor: INDIGO,
  },
  otpBoxFilled: {
    borderColor: NAVY,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: INDIGO,
  },
  resendDisabled: {
    opacity: 0.45,
  },
  countdown: {
    marginTop: 6,
    fontSize: 14,
    color: INDIGO,
    fontWeight: '500',
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
  proceedButtonDisabled: {
    opacity: 0.55,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
