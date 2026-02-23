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

const BRAND_BLUE = '#5B8DEF';
const NAVY = '#2F2D8C';
const INDIGO = '#6B6BD6';

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

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.title}>
              Welcome to <Text style={styles.brandName}>Berrystamp.</Text>
            </Text>
            <Text style={styles.subtitle}>Let's get to know you more</Text>
          </View>

          {/* Form Fields */}
          <FloatingLabelInput
            label="Enter Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoComplete="name"
          />
          <FloatingLabelInput
            label="Enter Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FloatingLabelInput
            label="Enter Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FloatingLabelInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            }
          />
          <FloatingLabelInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} hitSlop={8}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            }
          />

          {/* Updates Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSendUpdates(v => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, sendUpdates && styles.checkboxChecked]}>
              {sendUpdates && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Send updates and promotions to my email</Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton} activeOpacity={0.85}>
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
            <Text style={styles.socialButtonText}>SignUp with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Ionicons name="logo-apple" size={22} color="#000" />
            <Text style={styles.socialButtonText}>SignUp with Apple</Text>
          </TouchableOpacity>

          {/* Footer Links */}
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.link} onClick={()=> router.push("/login")}>Log in</Text>
          </Text>

          <Text style={styles.termsText}>
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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#1a1a2e',
    textAlign: 'center',
  },
  brandName: {
    color: BRAND_BLUE,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    color: '#1a1a2e',
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
    borderColor: '#aaa',
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
    color: '#555',
    flex: 1,
  },
  signUpButton: {
    backgroundColor: NAVY,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
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
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#aaa',
    fontSize: 13,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: INDIGO,
    borderRadius: 28,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 10,
  },
  socialButtonText: {
    fontSize: 15,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  loginText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
    marginTop: 6,
    marginBottom: 12,
  },
  link: {
    color: BRAND_BLUE,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    lineHeight: 20,
  },
});
