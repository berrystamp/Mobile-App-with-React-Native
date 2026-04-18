import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { z } from "zod";
import { useAuth } from "../../../context/AuthContext";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

const FloatingLabelInput = ({
  label, value, onChangeText, secureTextEntry, keyboardType, rightIcon, isDark,
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedLabel, { toValue: 1, duration: 150, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) Animated.timing(animatedLabel, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  };

  const labelTop = animatedLabel.interpolate({ inputRange: [0, 1], outputRange: [16, 6] });
  const labelFontSize = animatedLabel.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = animatedLabel.interpolate({ inputRange: [0, 1], outputRange: ["#aaa", "#4B3A99"] });

  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 12,
        height: 58,
        paddingHorizontal: 14,
        justifyContent: 'flex-end',
        position: 'relative',
        borderColor: isFocused ? '#4B3A99' : isDark ? '#333333' : '#E5E5EA',
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      }}
    >
      <Animated.Text style={{ position: "absolute", left: 14, fontWeight: "400", top: labelTop, fontSize: labelFontSize, color: labelColor }}>
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={{ fontSize: 15, paddingBottom: 8, paddingTop: 16, paddingRight: rightIcon ? 36 : 8, color: isDark ? '#FFFFFF' : '#1a1a1a' }}
      />
      {rightIcon && (
        <View style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}>
          {rightIcon}
        </View>
      )}
    </View>
  );
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema), mode: "onChange", defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setLoading(true);
    // Always login as CUSTOMER - users can switch to designer/printer from profile
    const result = await login(data.email, data.password, rememberMe, 'CUSTOMER');
    setLoading(false);
    if (!result.success) {
      setServerError(result.error || "An unexpected error occurred.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#F5F5F7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Image
            source={isDark ? require('@/assets/logo02.png') : require('@/assets/logo01.png')}
            style={{ width: 180, height: 52 }}
            resizeMode="contain"
          />
        </View>

        <Text style={{ fontSize: 26, fontWeight: '700', textAlign: 'center', color: isDark ? '#FFFFFF' : '#1A1A1A', marginBottom: 6 }}>
          Welcome <Text style={{ color: '#4B3A99' }}>Back</Text>
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 15, color: isDark ? '#888888' : '#666666', marginBottom: 28 }}>
          Sign in to your Berrystamp account
        </Text>

        {serverError && (
          <View style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2', borderWidth: 1, borderColor: isDark ? 'rgba(239,68,68,0.4)' : '#FCA5A5', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: isDark ? '#FCA5A5' : '#DC2626', fontSize: 14, textAlign: 'center' }}>{serverError}</Text>
          </View>
        )}

        <View style={{ gap: 12 }}>
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <FloatingLabelInput label="Email address" value={value} onChangeText={onChange} keyboardType="email-address" isDark={isDark} />
          )} />
          {errors.email && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: -8, marginLeft: 4 }}>{errors.email.message}</Text>}

          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <FloatingLabelInput
              label="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry={secure}
              isDark={isDark}
              rightIcon={
                <TouchableOpacity onPress={() => setSecure(!secure)} hitSlop={8}>
                  <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={20} color={isDark ? "#A0A0A0" : "#999"} />
                </TouchableOpacity>
              }
            />
          )} />
          {errors.password && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: -8, marginLeft: 4 }}>{errors.password.message}</Text>}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 4 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
              <View style={{ width: 16, height: 16, borderWidth: 1.5, borderRadius: 4, marginRight: 8, alignItems: 'center', justifyContent: 'center', borderColor: rememberMe ? '#4B3A99' : '#A0A0A0', backgroundColor: rememberMe ? '#4B3A99' : 'transparent' }}>
                {rememberMe && <Ionicons name="checkmark" size={10} color="#fff" />}
              </View>
              <Text style={{ fontSize: 13, color: isDark ? '#CCCCCC' : '#666666' }}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={{ color: '#4B3A99', fontSize: 13, fontWeight: '500' }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            disabled={!isValid || loading}
            onPress={handleSubmit(onSubmit)}
            style={{ paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginTop: 8, backgroundColor: !isValid ? '#C5C1DA' : '#3D2E8E' }}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Log in</Text>}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: isDark ? '#888888' : '#666666' }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/choose-account")} activeOpacity={0.7}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#4B3A99' }}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
