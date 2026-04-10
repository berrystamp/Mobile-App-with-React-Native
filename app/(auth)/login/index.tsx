import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { z } from "zod";
import { useAuth } from "../../../context/AuthContext";
import { useAuthStore } from "@/store/authStore";
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
    <View className={`border rounded-xl h-[58px] px-3.5 justify-end relative ${isFocused ? "border-[#4B3A99] dark:border-[#7A6AE6]" : isDark ? "border-[#333333] bg-[#1E1E1E]" : "border-[#E5E5EA] bg-white"}`}>
      <Animated.Text style={[{ position: "absolute", left: 14, fontWeight: "400" }, { top: labelTop, fontSize: labelFontSize, color: labelColor }]}>{label}</Animated.Text>
      <TextInput value={value} onChangeText={onChangeText} onFocus={handleFocus} onBlur={handleBlur} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize="none" className={`text-[15px] pb-2 pt-4 ${rightIcon ? "pr-9" : "pr-2"} ${isDark ? "text-white" : "text-[#1a1a1a]"}`} />
      {rightIcon && <View className="absolute right-[14px] top-0 bottom-0 justify-center">{rightIcon}</View>}
    </View>
  );
};

export default function LoginScreen() {
  const { login } = useAuth();
  
    const { role: selectedProfileType } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null); // New state for UI errors

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema), mode: "onChange", defaultValues: { email: "", password: "" },
  });
  console.log("Selected Profile Type:", selectedProfileType);
  const onSubmit = async (data: FormData) => {
    setServerError(null); // Clear previous errors
    setLoading(true);
    
    const result = await login(data.email, data.password, rememberMe, selectedProfileType??"customer");
    
    setLoading(false);

    if (!result.success) {
      setServerError(result.error || "An unexpected error occurred.");
    }
  };

  return (
    <View className="flex-1 px-6 justify-center bg-[#F5F5F7] dark:bg-[#121212]">
      <Text className="text-[26px] font-bold text-center text-[#1A1A1A] dark:text-white mb-1.5">
        Welcome <Text className="text-[#4B3A99] dark:text-[#7A6AE6]">Back</Text>
      </Text>
      <Text className="text-center text-[15px] text-[#666666] dark:text-[#888888]">
        We are so happy to see you
      </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/choose-account")} activeOpacity={0.7}>
      <Text className="text-center text-xs font-bold text-[#4B3A99] dark:text-[#7A6AE6] uppercase tracking-widest mt-2 mb-6">
        Logging in as {selectedProfileType}
      </Text>
        </TouchableOpacity>

      {/* Render Server Errors in the UI gracefully */}
      {serverError && (
        <View className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <Text className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
                {serverError}
            </Text>
        </View>
      )}

      <View className="flex-col gap-y-3">
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <FloatingLabelInput label="Enter Email" value={value} onChangeText={onChange} keyboardType="email-address" isDark={isDark} />
        )} />
        {errors.email && <Text className="text-red-500 dark:text-[#FF6B6B] text-xs -mt-1.5 ml-1">{errors.email.message}</Text>}

        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <FloatingLabelInput label="Password" value={value} onChangeText={onChange} secureTextEntry={secure} isDark={isDark} rightIcon={<TouchableOpacity onPress={() => setSecure(!secure)} hitSlop={8}><Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={20} color={isDark ? "#A0A0A0" : "#999"} /></TouchableOpacity>} />
        )} />
        {errors.password && <Text className="text-red-500 dark:text-[#FF6B6B] text-xs -mt-1.5 ml-1">{errors.password.message}</Text>}

        <View className="flex-row items-center justify-between mt-0.5 mb-1">
            <TouchableOpacity className="flex-row items-center" onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                <View className={`w-4 h-4 border-[1.5px] rounded mr-2 items-center justify-center ${rememberMe ? 'border-[#4B3A99] bg-[#4B3A99]' : 'border-[#A0A0A0] bg-transparent'}`}>
                    {rememberMe && <Ionicons name="checkmark" size={10} color="#fff" />}
                </View>
                <Text className={`text-[13px] ${isDark ? "text-gray-300" : "text-[#666]"}`}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/forgot-password")}>
              <Text className="text-[#4B3A99] dark:text-[#7A6AE6] text-[13px] font-medium">Forgot Password?</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity disabled={!isValid || loading} onPress={handleSubmit(onSubmit)} className={`py-4 rounded-[30px] items-center mt-2 mb-1 ${!isValid ? 'bg-[#C5C1DA] dark:bg-[#4B3A99]/50' : 'bg-[#3D2E8E] dark:bg-[#5E4CBA]'}`} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-semibold">Log in</Text>}
        </TouchableOpacity>

        <View className="flex-row justify-center items-center mt-3">
          <Text className="text-[14px] text-[#666666] dark:text-[#888888]">Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")} activeOpacity={0.7}>
            <Text className="text-[14px] font-semibold text-[#4B3A99] dark:text-[#7A6AE6]">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}