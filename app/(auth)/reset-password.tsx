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
  strengthBg: '#E8E8F0',
};

const darkTheme = {
  bg: '#12122A',
  textPrimary: '#EEEEF8',
  textMuted: '#888899',
  iconColor: '#EEEEF8',
  errorColor: '#FF6B6B',
  strengthBg: '#2A2A4A',
};

type StrengthLevel = 'weak' | 'fair' | 'strong' | null;

function getPasswordStrength(password: string): StrengthLevel {
  if (password.length === 0) return null;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
}

const STRENGTH_COLORS: Record<NonNullable<StrengthLevel>, string> = {
  weak: '#D93025',
  fair: '#F5A623',
  strong: '#27AE60',
};

const STRENGTH_LABELS: Record<NonNullable<StrengthLevel>, string> = {
  weak: 'Weak',
  fair: 'Fair',
  strong: 'Strong',
};

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const isDark = useColorScheme() === 'dark';
  const t = isDark ? darkTheme : lightTheme;

  const strength = getPasswordStrength(password);

  const passwordError = touchedPassword
    ? password.length === 0
      ? 'Password is required'
      : password.length < 6
      ? 'Password must be at least 6 characters'
      : strength === 'weak'
      ? 'Password is too weak — add uppercase, numbers or symbols'
      : null
    : null;

  const confirmError = touchedConfirm
    ? confirmPassword.length === 0
      ? 'Please confirm your password'
      : confirmPassword !== password
      ? 'Passwords do not match'
      : null
    : null;

  const isValid =
    password.length >= 6 &&
    strength !== 'weak' &&
    confirmPassword === password;

  // function handleSubmit() {
  //   setTouchedPassword(true);
  //   setTouchedConfirm(true);
  //   if (!isValid) return;
  //   // TODO: call reset-password API
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
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: t.textMuted }]}>
              Enter new password
            </Text>
          </View>

          {/* Password Field */}
          <FloatingLabelInput
            label="Enter Password"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (!touchedPassword) setTouchedPassword(true);
            }}
            onBlur={() => setTouchedPassword(true)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword(v => !v)}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={t.iconColor}
                />
              </TouchableOpacity>
            }
          />

          {/* Password strength bar */}
          {password.length > 0 && strength && (
            <View style={styles.strengthWrapper}>
              <View style={styles.strengthBars}>
                {(['weak', 'fair', 'strong'] as const).map((level, i) => {
                  const levels = ['weak', 'fair', 'strong'];
                  const currentIndex = levels.indexOf(strength);
                  const filled = i <= currentIndex;
                  return (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: t.strengthBg },
                        filled && { backgroundColor: STRENGTH_COLORS[strength] },
                      ]}
                    />
                  );
                })}
              </View>
              <Text
                style={[
                  styles.strengthLabel,
                  { color: STRENGTH_COLORS[strength] },
                ]}
              >
                {STRENGTH_LABELS[strength]}
              </Text>
            </View>
          )}

          {/* Password error */}
          {passwordError ? (
            <Text style={[styles.errorText, { color: t.errorColor }]}>
              {passwordError}
            </Text>
          ) : null}

          {/* Confirm Password Field */}
          <View style={styles.confirmWrapper}>
            <FloatingLabelInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (!touchedConfirm) setTouchedConfirm(true);
              }}
              onBlur={() => setTouchedConfirm(true)}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirm(v => !v)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={t.iconColor}
                  />
                </TouchableOpacity>
              }
            />

            {/* Confirm error or match indicator */}
            {confirmError ? (
              <Text style={[styles.errorText, { color: t.errorColor }]}>
                {confirmError}
              </Text>
            ) : confirmPassword.length > 0 && confirmPassword === password ? (
              <View style={styles.matchRow}>
                <Ionicons name="checkmark-circle" size={14} color="#27AE60" />
                <Text style={[styles.matchText, { color: '#27AE60' }]}>
                  Passwords match
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Submit button pinned to bottom */}
        <View style={[styles.footer, { backgroundColor: t.bg }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isValid && styles.submitButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!isValid}
            onPress={() => {
              if (!isValid) {
                return;
              }
              router.push('/reset-password-success');
            }}
          >
            <Text style={styles.submitButtonText}>Reset Password</Text>
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
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  strengthWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 14,
    gap: 10,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 5,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  confirmWrapper: {
    marginTop: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 10,
    marginLeft: 4,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -12,
    marginBottom: 10,
    marginLeft: 4,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: NAVY,
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
