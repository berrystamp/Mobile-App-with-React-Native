import React, { useState, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated
} from 'react-native';
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { toAccountType, toProfileType, useAuthStore } from '@/store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================================
// CUSTOM FLOATING LABEL INPUT
// ==========================================
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  rightIcon,
  leftIcon,
  leftElement,
  isDark,
  autoCapitalize = "none"
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedLabel, { toValue: 1, duration: 150, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedLabel, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    }
  };

  const labelTop = animatedLabel.interpolate({ inputRange: [0, 1], outputRange: [18, 8] });
  const labelFontSize = animatedLabel.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = animatedLabel.interpolate({ inputRange: [0, 1], outputRange: ["#A0A0A0", "#4B3A99"] });

  return (
    <View
      className={`border rounded-xl h-[60px] flex-row items-center relative ${
        isFocused ? "border-[#4B3A99] dark:border-[#7A6AE6]" : isDark ? "border-[#333333] bg-[#1E1E1E]" : "border-[#E5E5EA] bg-white"
      }`}
    >
      {/* Optional Left Element (e.g., Country Code) */}
      {leftElement && (
        <View className={`h-full flex-row items-center pl-4 pr-3 border-r ${isDark ? "border-[#333333]" : "border-[#E5E5EA]"}`}>
          {leftElement}
        </View>
      )}

      {/* Optional Left Icon (e.g., Location Pin) */}
      {leftIcon && (
        <View className="pl-4 pr-1">
          {leftIcon}
        </View>
      )}

      {/* Input Area */}
      <View className="flex-1 justify-end h-full pb-2.5 pt-4 px-3.5 relative">
        <Animated.Text style={[{ position: "absolute", left: leftIcon ? 0 : 14, fontWeight: "400" }, { top: labelTop, fontSize: labelFontSize, color: labelColor }]}>
          {label}
        </Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          className={`text-[15px] p-0 m-0 leading-tight ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
        />
      </View>

      {/* Optional Right Icon (e.g., Show/Hide Password) */}
      {rightIcon && (
        <View className="pr-4 justify-center">
          {rightIcon}
        </View>
      )}
    </View>
  );
};


// ==========================================
// MAIN SCREEN COMPONENT
// ==========================================
export default function SignUpScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { role: selectedProfileType, signUp, setHasSelectedInterests, setNeedsInterestOnboarding } = useAuthStore();
  const isBusiness = selectedProfileType?.toUpperCase() !== 'CUSTOMER';
  // Form States
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');       // Customer/Designer only
  const [businessName, setBusinessName] = useState(''); // Printer only
  // const [address,setAddess] = useState('');
  // const [phoneNumber, setPhoneNumber] = useState('');   // Printer only
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendUpdates, setSendUpdates] = useState(false);

  // Validation Logic
  const isFormValid =
    fullName.trim() !== '' &&
    // address.trim() !== '' &&
    EMAIL_REGEX.test(email.trim()) &&
    password.length >= 6 &&
    (isBusiness ? (businessName.trim() !== '' ) : (username.trim() !== ''));

  // Submit Handler
  async function handleSignUp() {
    if (!isFormValid) return;

    setIsLoading(true);
    const normalizedProfileType = toProfileType(selectedProfileType);

    // Build the payload exactly as defined in your Swagger docs
    const payload = {
        name: fullName.trim(),
        email: email.trim(),
        username: isBusiness ? "" : username.trim(),
        businessName: isBusiness ? businessName.trim() : "",
        // phoneNumber: isBusiness ? phoneNumber.trim() : "",
        areaCode: isBusiness ? "+234" : "", 
        password: password,
        sendPromotionEmail: sendUpdates,
        // address: {
        //     address: address.trim(),
        //     city: "Lagos",       // Add a default to prevent DB null constraint errors
        //     state: "Lagos",      // Add a default to prevent DB null constraint errors
        //     country: "NG",  // ✅ FIX: Send a valid country string instead of ""
        //     postalCode: "100001",// Add a default
        //     longitude: 0,
        //     latitude: 0
        // },
        referralCode: referralCode.trim()
    };

    try {
        const response = await fetch('https://berrystamp-backend-dev-4cn29.ondigitalocean.app/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'profileType': normalizedProfileType,
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const accountType = toAccountType(normalizedProfileType);
            console.log(accountType)
            signUp(accountType);
            setHasSelectedInterests(accountType !== 'customer');
            setNeedsInterestOnboarding(accountType === 'customer');
            Alert.alert("Success", "Account created! Please verify your email.");
            router.push({
              pathname: '/(auth)/verify-account',
              params: { email: email.trim() },
            });
        } else {
            const errorData = await response.json();
            Alert.alert("Registration Failed", errorData.message || "An error occurred.");
            console.log("Registration Error:", errorData);
        }
    } catch (error) {
        console.error("Sign Up Error:", error);
        Alert.alert("Network Error", "Unable to reach the server.");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#121212]" : "bg-[#FAFAFA]"}`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header */}
          <View className="items-center mt-12 mb-10">
            <Text className={`text-[24px] font-bold text-center ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
              Welcome to Berrystamp!
            </Text>
            <Text className={`text-center text-[15px] mt-2 ${isDark ? "text-[#A0A0A0]" : "text-[#666666]"}`}>
              You are signing up as a {isBusiness ? "Designer/Printer" : "Customer"}. {isBusiness ? "Please provide your shop details to get started." : "Please fill in your details to create an account."}
            </Text>
          </View>

          {/* Form Fields */}
          <View className="flex-col gap-y-4">
              
              {/* Full Name (All) */}
              <FloatingLabelInput 
                  label="Enter Full Name" 
                  value={fullName} 
                  onChangeText={setFullName} 
                  autoCapitalize="words" 
                  isDark={isDark} 
              />

              {/* Dynamic Field: Shop Name OR Username */}
              {isBusiness ? (
                  <FloatingLabelInput 
                      label="Enter Shop Name" 
                      value={businessName} 
                      onChangeText={setBusinessName} 
                      autoCapitalize="words" 
                      isDark={isDark} 
                  />
              ) : (
                  <FloatingLabelInput 
                      label="Enter Username" 
                      value={username} 
                      onChangeText={setUsername} 
                      autoCapitalize="none" 
                      isDark={isDark} 
                  />
              )}
              {/* Email (All) */}
              <FloatingLabelInput 
                  label="Enter Email" 
                  value={email} 
                  onChangeText={setEmail} 
                  keyboardType="email-address" 
                  autoCapitalize="none" 
                  isDark={isDark} 
              />

              {/* Address (All) */}
              {/* <FloatingLabelInput 
                  label="Address" 
                  value={address} 
                  onChangeText={setAddress} 
                  autoCapitalize="words" 
                  isDark={isDark} 
                  leftIcon={<Ionicons name="location-outline" size={20} color={isDark ? "#A0A0A0" : "#666"} />}
              /> */}

              {/* Phone Number (Printer Only) */}
              {/* {isBusiness && (
                  <FloatingLabelInput 
                      label="Enter Phone Number" 
                      value={phoneNumber} 
                      onChangeText={setPhoneNumber} 
                      keyboardType="phone-pad" 
                      isDark={isDark} 
                      leftElement={
                        <>
                          <Text className={`text-[15px] ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>+234</Text>
                          <Ionicons name="chevron-down" size={14} color={isDark ? "#A0A0A0" : "#666"} style={{ marginLeft: 4 }} />
                        </>
                      }
                  />
              )} */}


      

              {/* Password (All) */}
              <FloatingLabelInput
                  label="Enter Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  isDark={isDark}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                      <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={isDark ? '#A0A0A0' : '#999'} />
                    </TouchableOpacity>
                  }
              />
              
                      {/* Referral Code (All) */}
              <FloatingLabelInput 
                  label="Enter Referral Code (optional)" 
                  value={referralCode} 
                  onChangeText={setReferralCode} 
                  autoCapitalize="none" 
                  isDark={isDark} 
              />
              {/* Updates Checkbox */}
              <TouchableOpacity className="flex-row items-center mt-1 mb-6" onPress={() => setSendUpdates(v => !v)} activeOpacity={0.7}>
                <View className={`w-5 h-5 border-[1.5px] rounded mr-2.5 items-center justify-center ${sendUpdates ? 'border-[#4B3A99] bg-[#4B3A99]' : 'border-[#A0A0A0] bg-transparent'}`}>
                  {sendUpdates && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text className={`text-[13.5px] flex-1 ${isDark ? "text-[#A0A0A0]" : "text-[#666666]"}`}>
                    Send updates and promotions to my email
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                className={`rounded-full py-4 items-center mb-6 ${!isFormValid ? 'bg-[#C5C1DA] dark:bg-[#4B3A99]/50' : 'bg-[#3D2E8E] dark:bg-[#5E4CBA]'}`}
                activeOpacity={0.85}
                onPress={handleSignUp}
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white text-base font-semibold">Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Footer Links */}
              <View className="flex-row justify-center items-center mt-2 mb-4">
                <Text className={`text-sm ${isDark ? "text-[#A0A0A0]" : "text-[#666666]"}`}>
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={()=> router.push("/login")}>
                  <Text className="text-sm font-semibold text-[#4B3A99] dark:text-[#7A6AE6]">Log in</Text>
                </TouchableOpacity>
              </View>

              <Text className={`text-center text-xs leading-5 ${isDark ? "text-[#888888]" : "text-[#888]"}`}>
                By signing up, you agree to our{' '}
                <Text className="text-[#4B3A99] dark:text-[#7A6AE6]">terms of services</Text>
                {' '}and that you have read our{' '}
                <Text className="text-[#4B3A99] dark:text-[#7A6AE6]">privacy policy</Text>
              </Text>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
