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
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FloatingLabelInput } from '@/components/floating-label-input';
import { useColorScheme } from '@/hooks/use-color-scheme';

const BRAND_BLUE = '#5B8DEF';
const NAVY = '#2F2D8C';
const INDIGO = '#6B6BD6';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StrengthLevel = 'weak' | 'fair' | 'strong';

function getPasswordStrength(pwd: string): StrengthLevel | null {
  if (pwd.length === 0) return null;
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
}

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  weak: '#D93025',
  fair: '#F5A623',
  strong: '#27AE60',
};

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  weak: 'Weak',
  fair: 'Fair',
  strong: 'Strong',
};

export default function SignUpScreen() {
const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendUpdates, setSendUpdates] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const isDark = useColorScheme() === 'dark';
  const t = isDark ? darkTheme : lightTheme;

  const strength = getPasswordStrength(password);

  const errors = {
    fullName: touched.fullName && fullName.trim() === '' ? 'Full name is required' : null,
    username: touched.username && username.trim() === '' ? 'Username is required' : null,
    email: touched.email
      ? email.trim() === '' ? 'Email is required'
        : !EMAIL_REGEX.test(email.trim()) ? 'Enter a valid email address'
        : null
      : null,
    password: touched.password
      ? password === '' ? 'Password is required'
        : password.length < 6 ? 'Password must be at least 6 characters'
        : strength === 'weak' ? 'Too weak — add uppercase, numbers or symbols'
        : null
      : null,
    confirmPassword: touched.confirmPassword
      ? confirmPassword === '' ? 'Please confirm your password'
        : confirmPassword !== password ? 'Passwords do not match'
        : null
      : null,
  };

  const isFormValid =
    fullName.trim() !== '' &&
    username.trim() !== '' &&
    EMAIL_REGEX.test(email.trim()) &&
    password.length >= 6 &&
    strength !== 'weak' &&
    confirmPassword === password;

  function mark(field: keyof typeof touched) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }

  function handleSignUp() {
    setTouched({ fullName: true, username: true, email: true, password: true, confirmPassword: true });
    if (!isFormValid) return;
    // TODO: call sign-up API
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
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
              Welcome to <Text style={styles.brandName}>Berrystamp.</Text>
            </Text>
            <Text style={[styles.subtitle, { color: t.textPrimary }]}>Let's get to know you more</Text>
          </View>

          {/* Form Fields */}
          <FloatingLabelInput
            label="Enter Full Name"
            value={fullName}
            onChangeText={setFullName}
            onBlur={() => mark('fullName')}
            autoCapitalize="words"
            autoComplete="name"
          />
          {errors.fullName ? <Text style={[styles.errorText, { color: t.errorColor }]}>{errors.fullName}</Text> : null}

          <FloatingLabelInput
            label="Enter Username"
            value={username}
            onChangeText={setUsername}
            onBlur={() => mark('username')}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.username ? <Text style={[styles.errorText, { color: t.errorColor }]}>{errors.username}</Text> : null}

          <FloatingLabelInput
            label="Enter Email"
            value={email}
            onChangeText={setEmail}
            onBlur={() => mark('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {errors.email ? <Text style={[styles.errorText, { color: t.errorColor }]}>{errors.email}</Text> : null}

          <FloatingLabelInput
            label="Password"
            value={password}
            onChangeText={text => { setPassword(text); mark('password'); }}
            onBlur={() => mark('password')}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={t.iconColor}
                />
              </TouchableOpacity>
            }
          />
          {/* Strength bar */}
          {password.length > 0 && strength ? (
            <View style={styles.strengthWrapper}>
              <View style={styles.strengthBars}>
                {(['weak', 'fair', 'strong'] as const).map((level, i) => {
                  const filled = i <= ['weak', 'fair', 'strong'].indexOf(strength);
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
              <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength] }]}>
                {STRENGTH_LABELS[strength]}
              </Text>
            </View>
          ) : null}
          {errors.password ? <Text style={[styles.errorText, { color: t.errorColor }]}>{errors.password}</Text> : null}

          <FloatingLabelInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={text => { setConfirmPassword(text); mark('confirmPassword'); }}
            onBlur={() => mark('confirmPassword')}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} hitSlop={8}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={t.iconColor}
                />
              </TouchableOpacity>
            }
          />
          {errors.confirmPassword ? (
            <Text style={[styles.errorText, { color: t.errorColor }]}>{errors.confirmPassword}</Text>
          ) : confirmPassword.length > 0 && confirmPassword === password ? (
            <View style={styles.matchRow}>
              <Ionicons name="checkmark-circle" size={14} color="#27AE60" />
              <Text style={[styles.matchText, { color: '#27AE60' }]}>Passwords match</Text>
            </View>
          ) : null}

          {/* Updates Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSendUpdates(v => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, { borderColor: t.checkboxBorder }, sendUpdates && styles.checkboxChecked]}>
              {sendUpdates && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkboxLabel, { color: t.textSecondary }]}>Send updates and promotions to my email</Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, !isFormValid && styles.signUpButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSignUp}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: t.dividerLine }]} />
            <Text style={[styles.dividerText, { color: t.textMuted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: t.dividerLine }]} />
          </View>

          {/* Social Buttons */}
          <TouchableOpacity style={[styles.socialButton, { borderColor: INDIGO }]} activeOpacity={0.8}>
            <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
            <Text style={[styles.socialButtonText, { color: t.textPrimary }]}>SignUp with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { borderColor: INDIGO }]} activeOpacity={0.8}>
            <Ionicons name="logo-apple" size={22} color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.socialButtonText, { color: t.textPrimary }]}>SignUp with Apple</Text>
          </TouchableOpacity>

          {/* Footer Links */}
          <Text style={[styles.loginText, { color: t.textSecondary }]}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={()=> router.push("/login")}>Log in</Text>
          </Text>

          <Text style={[styles.termsText, { color: t.textMuted }]}>
            {'By signing up, you agree to our '}
            <Text style={styles.link}>terms of services</Text>
            {'\nand that you have read our '}
            <Text style={styles.link}>privacy policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const lightTheme = {
  bg: '#fff',
  textPrimary: '#1a1a2e',
  textSecondary: '#555',
  textMuted: '#888',
  checkboxBorder: '#aaa',
  dividerLine: '#E0E0E0',
  iconColor: '#999',
  errorColor: '#D93025',
  strengthBg: '#E8E8F0',
};

const darkTheme = {
  bg: '#12122A',
  textPrimary: '#EEEEF8',
  textSecondary: '#BBBBDD',
  textMuted: '#888899',
  checkboxBorder: '#555580',
  dividerLine: '#2D2D60',
  iconColor: '#7777AA',
  errorColor: '#FF6B6B',
  strengthBg: '#2A2A4A',
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
  brandName: {
    color: BRAND_BLUE,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: INDIGO,
    borderColor: INDIGO,
  },
  checkboxLabel: {
    fontSize: 13,
    flex: 1,
  },
  signUpButton: {
    backgroundColor: NAVY,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 10,
    marginLeft: 4,
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
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 28,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 10,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  loginText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 12,
  },
  link: {
    color: BRAND_BLUE,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 20,
  },
});
