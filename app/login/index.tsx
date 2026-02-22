import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

// Floating label input component
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  rightIcon,
  isDark,
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedLabel, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedLabel, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelTop = animatedLabel.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 6],
  });

  const labelFontSize = animatedLabel.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 11],
  });

  const labelColor = animatedLabel.interpolate({
    inputRange: [0, 1],
    outputRange: ["#aaa", "#4B3A99"],
  });

  return (
    <View
      style={[
        styles.floatingWrapper,
        {
          borderColor: isFocused ? "#4B3A99" : isDark ? "#333" : "#E5E5EA",
          backgroundColor: isDark ? "#1E1E1E" : "#fff",
        },
      ]}
    >
      <Animated.Text
        style={[styles.floatingLabel, { top: labelTop, fontSize: labelFontSize, color: labelColor }]}
      >
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
        style={[
          styles.floatingInput,
          { color: isDark ? "#fff" : "#1a1a1a" },
        ]}
      />
      {rightIcon && (
        <View style={styles.floatingRight}>{rightIcon}</View>
      )}
    </View>
  );
};

const LoginScreen = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      router.replace("/home");
    } catch (error: any) {
      console.log(error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? "#121212" : "#F5F5F7";
  const textColor = isDark ? "#fff" : "#1a1a1a";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Title */}
      <Text style={[styles.title, { color: textColor }]}>
        Welcome <Text style={{ color: "#4B3A99" }}>Back</Text>
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? "#888" : "#666" }]}>
        We are so happy to see you
      </Text>

      <View style={styles.form}>
        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <FloatingLabelInput
              label="Enter Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              isDark={isDark}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <FloatingLabelInput
              label="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry={secure}
              isDark={isDark}
              rightIcon={
                <TouchableOpacity onPress={() => setSecure(!secure)}>
                  <Ionicons
                    name={secure ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              }
            />
          )}
        />
        {errors.password && (
          <Text style={styles.error}>{errors.password.message}</Text>
        )}

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotRow} onPress={() => {}}>
          <View style={styles.checkbox}>
            <View style={styles.checkboxInner} />
          </View>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          disabled={!isValid || loading}
          onPress={handleSubmit(onSubmit)}
          style={[
            styles.loginButton,
            { backgroundColor: isValid ? "#3D2E8E" : "#C5C1DA" },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log in</Text>
          )}
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? "#333" : "#E0E0E0" }]} />
          <Text style={[styles.dividerText, { color: isDark ? "#666" : "#999" }]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? "#333" : "#E0E0E0" }]} />
        </View>

        {/* Google Button */}
        <TouchableOpacity
          style={[
            styles.socialButton,
            { borderColor: isDark ? "#333" : "#E5E5EA", backgroundColor: isDark ? "#1E1E1E" : "#fff" },
          ]}
          onPress={() => {}}
        >
          <Image
            source={{ uri: "https://www.google.com/favicon.ico" }}
            style={styles.socialIcon}
          />
          <Text style={[styles.socialText, { color: textColor }]}>
            SignUp with Google
          </Text>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity
          style={[
            styles.socialButton,
            { borderColor: isDark ? "#333" : "#E5E5EA", backgroundColor: isDark ? "#1E1E1E" : "#fff" },
          ]}
          onPress={() => {}}
        >
          <Ionicons name="logo-apple" size={20} color={textColor} style={{ marginRight: 10 }} />
          <Text style={[styles.socialText, { color: textColor }]}>
            SignUp with Apple
          </Text>
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={styles.signupRow}>
          <Text style={[styles.signupPrompt, { color: isDark ? "#888" : "#666" }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/home")}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    marginBottom: 36,
  },
  form: {
    gap: 12,
  },
  floatingWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    height: 58,
    paddingHorizontal: 14,
    justifyContent: "flex-end",
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    left: 14,
    fontWeight: "400",
  },
  floatingInput: {
    fontSize: 15,
    paddingBottom: 8,
    paddingTop: 16,
    paddingRight: 36,
  },
  floatingRight: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  forgotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#4B3A99",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  forgotText: {
    color: "#4B3A99",
    fontSize: 13,
    fontWeight: "500",
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: "500",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 4,
  },
  socialText: {
    fontSize: 15,
    fontWeight: "500",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signupPrompt: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    color: "#4B3A99",
    fontWeight: "600",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: -6,
  },
});