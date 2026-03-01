import { FloatingLabelInput } from '@/components/floating-label-input';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAVY = '#2F2D8C';

const lightTheme = {
  bg: '#FFFFFF',
  textPrimary: '#1a1a2e',
  textMuted: '#888',
  iconColor: '#1a1a2e',
  errorColor: '#D93025',
};

const darkTheme = {
  bg: '#12122A',
  textPrimary: '#EEEEF8',
  textMuted: '#888899',
  iconColor: '#EEEEF8',
  errorColor: '#FF6B6B',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const isDark = useColorScheme() === 'dark';
  const t = isDark ? darkTheme : lightTheme;

  const emailError = touched && !EMAIL_REGEX.test(email.trim())
    ? email.trim() === ''
      ? 'Email is required'
      : 'Enter a valid email address'
    : null;

  const isValid = EMAIL_REGEX.test(email.trim());

  // function handleProceed() {
    
  //   setTouched(true);
  //   if (!isValid) return;
  //   // TODO: call forgot-password API
  // }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={10}
      >
        <Ionicons name="arrow-back" size={22} color={t.iconColor} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.textPrimary }]}>
              Forgot Password
            </Text>
            <Text style={[styles.subtitle, { color: t.textMuted }]}>
              Enter the email address you registered with
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <FloatingLabelInput
              label="Enter Email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (!touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
            {emailError ? (
              <Text style={[styles.errorText, { color: t.errorColor }]}>
                {emailError}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        {/* Proceed button pinned to bottom */}
        <View style={[styles.footer, { backgroundColor: t.bg }]}>
          <TouchableOpacity
            style={[
              styles.proceedButton,
              !isValid && styles.proceedButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={() => router.push('/forgot-password-verify-otp')}
          >
            <Text style={styles.proceedButtonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  backButton: {
    marginTop: 4,
    marginLeft: 20,
    alignSelf: 'flex-start',
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputWrapper: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  proceedButton: {
    backgroundColor: NAVY,
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
