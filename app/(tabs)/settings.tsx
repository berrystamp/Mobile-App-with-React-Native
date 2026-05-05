import ApiService from "@/services/apiClient";
import {
  getPushPermissionStatus,
  pushNotificationsSupported,
  registerForPushNotifications,
} from "@/services/notificationService";
import { useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen = "main" | "notifications" | "email-notifications" | "change-email" | "change-password";

interface EmailSettings {
  supportEmail: boolean;
  orderEmail: boolean;
  newsEmail: boolean;
  otherEmail: boolean;
  promotionEmail: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useTheme(isDark: boolean) {
  return {
    bg: isDark ? "#121212" : "#F2F2F2",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subtext: isDark ? "#A0A0A0" : "#666666",
    border: isDark ? "#333333" : "#E6E6E6",
    inputBorder: isDark ? "#444444" : "#CCCCCC",
    primary: "#4B3A99",
  };
}

// ─── Row component ────────────────────────────────────────────────────────────
function SettingRow({
  label,
  onPress,
  surface,
  text,
  border,
}: {
  label: string;
  onPress: () => void;
  surface: string;
  text: string;
  border: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.row, { backgroundColor: surface, borderBottomColor: border }]}
    >
      <Text style={[styles.rowLabel, { color: text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({
  visible,
  message,
  onClose,
  surface,
  text,
  insets,
}: {
  visible: boolean;
  message: string;
  onClose: () => void;
  surface: string;
  text: string;
  insets: { bottom: number };
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.successSheet, { backgroundColor: surface, paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={text} />
          </TouchableOpacity>
          <View style={styles.successIconWrap}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.successMsg, { color: text }]}>{message}</Text>
          <TouchableOpacity style={styles.gotItBtn} onPress={onClose}>
            <Text style={styles.gotItTxt}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Theme Bottom Sheet ───────────────────────────────────────────────────────
type ThemePreference = "light" | "dark" | "system";

function ThemeSheet({
  visible,
  onClose,
  surface,
  text,
  border,
  subtext,
  insets,
}: {
  visible: boolean;
  onClose: () => void;
  surface: string;
  text: string;
  border: string;
  subtext: string;
  insets: { bottom: number };
}) {
  const { colorScheme, setColorScheme } = useColorScheme();
  // Map NativeWind scheme to our preference type (system = undefined in NativeWind)
  const [preference, setPreference] = useState<ThemePreference>(
    (colorScheme as ThemePreference) ?? "system"
  );

  const apply = (val: ThemePreference) => {
    setPreference(val);
    setColorScheme(val === "system" ? "system" : val);
  };

  const options: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System mode" },
  ];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.themeSheet, { backgroundColor: surface, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.themeSheetHandle} />
          <View style={styles.themeSheetHeader}>
            <Text style={[styles.themeSheetTitle, { color: text }]}>Theme</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={text} />
            </TouchableOpacity>
          </View>

          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => apply(opt.value)}
              activeOpacity={0.7}
              style={[
                styles.themeOption,
                { borderBottomColor: border, borderBottomWidth: i < options.length - 1 ? StyleSheet.hairlineWidth : 0 },
              ]}
            >
              <Text style={[styles.themeOptionLabel, { color: text }]}>{opt.label}</Text>
              <View style={[styles.radio, { borderColor: preference === opt.value ? "#4B3A99" : border }]}>
                {preference === opt.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          <Text style={[styles.themeHint, { color: subtext }]}>
            If &quot;system&quot; is selected, Berrystamp will automatically adjust your appearance based on your device&apos;s system setting.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen: Main Settings ────────────────────────────────────────────────────
function MainScreen({
  onNavigate,
  isDark,
  insets,
}: {
  onNavigate: (s: Screen) => void;
  isDark: boolean;
  insets: { top: number; bottom: number };
}) {
  const router = useRouter();
  const { bg, surface, text, border, subtext } = useTheme(isDark);
  const [showTheme, setShowTheme] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={[styles.header, { backgroundColor: surface, paddingTop: insets.top + 12, borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Settings and privacy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 8 }}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <SettingRow label="Notifications" onPress={() => onNavigate("notifications")} surface={surface} text={text} border={border} />
          <SettingRow label="Change email" onPress={() => onNavigate("change-email")} surface={surface} text={text} border={border} />
          <SettingRow label="Change Password" onPress={() => onNavigate("change-password")} surface={surface} text={text} border={border} />
          <SettingRow label="Theme" onPress={() => setShowTheme(true)} surface={surface} text={text} border={border} />
        </View>
      </ScrollView>

      <ThemeSheet
        visible={showTheme}
        onClose={() => setShowTheme(false)}
        surface={surface}
        text={text}
        border={border}
        subtext={subtext}
        insets={insets}
      />
    </View>
  );
}

// ─── Screen: Notifications ────────────────────────────────────────────────────
function NotificationsScreen({
  onNavigate,
  onBack,
  isDark,
  insets,
}: {
  onNavigate: (s: Screen) => void;
  onBack: () => void;
  isDark: boolean;
  insets: { top: number };
}) {
  const { bg, surface, text, border, subtext } = useTheme(isDark);
  const pushEnabled = useNotificationStore((s) => s.pushEnabled);
  const setPushEnabled = useNotificationStore((s) => s.setPushEnabled);
  const setExpoPushToken = useNotificationStore((s) => s.setExpoPushToken);
  const [toggling, setToggling] = useState(false);

  // Sync toggle with actual OS permission on mount
  useEffect(() => {
    getPushPermissionStatus().then((granted) => {
      if (!granted && pushEnabled) setPushEnabled(false);
    });
  }, []);

  const handlePushToggle = async (value: boolean) => {
    if (toggling) return;

    // In Expo Go, push notifications are not supported — show a clear message
    if (!pushNotificationsSupported) {
      Alert.alert(
        "Not available in Expo Go",
        "Push notifications require a development build. Run `expo run:android` or `expo run:ios` to test this feature.",
      );
      return;
    }

    setToggling(true);
    try {
      if (value) {
        const token = await registerForPushNotifications();
        if (token) {
          setPushEnabled(true);
          setExpoPushToken(token);
        } else {
          Alert.alert(
            "Permission required",
            "Push notifications are blocked. Please enable them in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  if (Platform.OS === "ios") {
                    Linking.openURL("app-settings:");
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ],
          );
        }
      } else {
        Alert.alert(
          "Disable notifications",
          "To fully disable push notifications, please turn them off in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
        setPushEnabled(false);
        setExpoPushToken(null);
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={[styles.header, { backgroundColor: surface, paddingTop: insets.top + 12, borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 8 }}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <View style={[styles.row, { backgroundColor: surface, borderBottomColor: border }]}>
            <Text style={[styles.rowLabel, { color: text }]}>Push notification</Text>
            {toggling
              ? <ActivityIndicator size="small" color="#4B3A99" />
              : (
                <Switch
                  value={pushEnabled}
                  onValueChange={handlePushToggle}
                  trackColor={{ false: "#D0D0D0", true: "#4B3A99" }}
                  thumbColor="#FFFFFF"
                />
              )
            }
          </View>
          <SettingRow
            label="Email Notification"
            onPress={() => onNavigate("email-notifications")}
            surface={surface}
            text={text}
            border={border}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Screen: Email Notifications ─────────────────────────────────────────────
function EmailNotificationsScreen({
  onBack,
  isDark,
  insets,
}: {
  onBack: () => void;
  isDark: boolean;
  insets: { top: number };
}) {
  const { bg, surface, text, border } = useTheme(isDark);
  const [settings, setSettings] = useState<EmailSettings>({
    supportEmail: true,
    orderEmail: true,
    newsEmail: false,
    otherEmail: false,
    promotionEmail: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await ApiService.getMailSettings();
        if (res?.responseBody) {
          setSettings({
            supportEmail: res.responseBody.supportEmail ?? true,
            orderEmail: res.responseBody.orderEmail ?? true,
            newsEmail: res.responseBody.newsEmail ?? false,
            otherEmail: res.responseBody.otherEmail ?? false,
            promotionEmail: res.responseBody.promotionEmail ?? false,
          });
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = async (key: keyof EmailSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      setSaving(true);
      await ApiService.updateMailSettings(updated);
    } catch {
      setSettings(settings);
      Alert.alert("Error", "Failed to update email settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const rows: { key: keyof EmailSettings; label: string }[] = [
    { key: "orderEmail", label: "Order Messages" },
    { key: "supportEmail", label: "Order Updates" },
    { key: "newsEmail", label: "Order delivery" },
    { key: "promotionEmail", label: "Promotions" },
    { key: "otherEmail", label: "Other" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={[styles.header, { backgroundColor: surface, paddingTop: insets.top + 12, borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Notifications</Text>
        <View style={{ width: 36 }}>
          {saving && <ActivityIndicator size="small" color="#4B3A99" />}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#4B3A99" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: 8 }}>
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            {rows.map((row, i) => (
              <View
                key={row.key}
                style={[styles.row, { backgroundColor: surface, borderBottomColor: i < rows.length - 1 ? border : "transparent" }]}
              >
                <Text style={[styles.rowLabel, { color: text }]}>{row.label}</Text>
                <Switch
                  value={settings[row.key]}
                  onValueChange={() => toggle(row.key)}
                  trackColor={{ false: "#D0D0D0", true: "#4B3A99" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Screen: Change Email ─────────────────────────────────────────────────────
function ChangeEmailScreen({
  onBack,
  isDark,
  insets,
}: {
  onBack: () => void;
  isDark: boolean;
  insets: { top: number; bottom: number };
}) {
  const { bg, surface, text, subtext, inputBorder, primary, border } = useTheme(isDark);
  const [step, setStep] = useState<"input" | "otp">("input");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(34);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setCountdown(34);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleProceed = async () => {
    if (!email.trim()) { Alert.alert("Error", "Please enter your email address."); return; }
    try {
      setLoading(true);
      await ApiService.requestEmailChange(email.trim());
      setStep("otp");
      startCountdown();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.responseMessage || e?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.replace(/[^0-9]/g, "").slice(-1);
    setOtp(next);
    if (val && idx < 4) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 5) { Alert.alert("Error", "Please enter the full 5-digit code."); return; }
    try {
      setLoading(true);
      await ApiService.verifyEmailChange(email.trim(), code);
      setSuccess(true);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.responseMessage || e?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await ApiService.requestEmailChange(email.trim());
      startCountdown();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.responseMessage || e?.message || "Failed to resend.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={[styles.header, { backgroundColor: surface, paddingTop: insets.top + 12, borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Change Email</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40 }}>
        <Text style={[styles.bigTitle, { color: text }]}>Your Email Address</Text>
        <Text style={[styles.bigSubtitle, { color: subtext }]}>
          {step === "input"
            ? "This will be used to verify your account whenever you want to take any action on the app."
            : "Enter the email address you registered with"}
        </Text>

        {step === "input" ? (
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter Email"
            placeholderTextColor={subtext}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.emailInput, { color: text, borderColor: email ? primary : inputBorder }]}
          />
        ) : (
          <>
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { otpRefs.current[i] = r; }}
                  value={digit}
                  onChangeText={(v) => handleOtpChange(v, i)}
                  onKeyPress={(e) => handleOtpKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[styles.otpBox, { color: text, borderColor: digit ? primary : inputBorder }]}
                />
              ))}
            </View>
            <View style={styles.resendRow}>
              <Text style={[styles.resendText, { color: subtext }]}>Didn&apos;t get the code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                <Text style={[styles.resendLink, { color: countdown > 0 ? subtext : primary }]}>Resend</Text>
              </TouchableOpacity>
            </View>
            {countdown > 0 && (
              <Text style={[styles.countdownText, { color: primary }]}>{countdown}secs</Text>
            )}
          </>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
        <TouchableOpacity
          onPress={step === "input" ? handleProceed : handleVerify}
          disabled={loading}
          style={[styles.proceedBtn, { opacity: loading ? 0.7 : 1 }]}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" size="small" />
            : <Text style={styles.proceedTxt}>Proceed</Text>
          }
        </TouchableOpacity>
      </View>

      <SuccessModal
        visible={success}
        message="Email change successfully!"
        onClose={() => { setSuccess(false); onBack(); }}
        surface={surface}
        text={text}
        insets={insets}
      />
    </View>
  );
}

// ─── Screen: Change Password ──────────────────────────────────────────────────
function ChangePasswordScreen({
  onBack,
  isDark,
  insets,
}: {
  onBack: () => void;
  isDark: boolean;
  insets: { top: number; bottom: number };
}) {
  const { bg, surface, text, subtext, inputBorder, primary, border } = useTheme(isDark);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      await ApiService.changePassword({ oldPassword, newPassword });
      setSuccess(true);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.responseMessage || e?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({
    label,
    value,
    onChange,
    show,
    onToggle,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.pwFieldWrap}>
      <Text style={[styles.pwLabel, { color: primary }]}>{label}</Text>
      <View style={[styles.pwInputRow, { borderColor: value ? primary : inputBorder }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={
            label.includes("New") ? "Enter Password"
            : label.includes("Confirm") ? "Re-enter Password"
            : "Enter old password"
          }
          placeholderTextColor={subtext}
          secureTextEntry={!show}
          style={[styles.pwInput, { color: text }]}
        />
        <TouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={subtext} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={[styles.header, { backgroundColor: surface, paddingTop: insets.top + 12, borderBottomColor: border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Settings and privacy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40 }}>
        <Text style={[styles.bigTitle, { color: text }]}>Setup new password 🔒</Text>
        <Text style={[styles.bigSubtitle, { color: subtext }]}>Kindly create a new password for your account.</Text>

        <PasswordField
          label="Old Password"
          value={oldPassword}
          onChange={setOldPassword}
          show={showOld}
          onToggle={() => setShowOld((v) => !v)}
        />
        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew((v) => !v)}
        />
        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
        />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          style={[styles.proceedBtn, { opacity: loading ? 0.7 : 1 }]}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" size="small" />
            : <Text style={styles.proceedTxt}>Reset Password</Text>
          }
        </TouchableOpacity>
      </View>

      <SuccessModal
        visible={success}
        message="Password resets successfully"
        onClose={() => { setSuccess(false); onBack(); }}
        surface={surface}
        text={text}
        insets={insets}
      />
    </View>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>("main");

  const navigate = (s: Screen) => setScreen(s);
  const goBack = () => {
    if (screen === "email-notifications") setScreen("notifications");
    else setScreen("main");
  };

  if (screen === "notifications") {
    return <NotificationsScreen onNavigate={navigate} onBack={goBack} isDark={isDark} insets={insets} />;
  }
  if (screen === "email-notifications") {
    return <EmailNotificationsScreen onBack={goBack} isDark={isDark} insets={insets} />;
  }
  if (screen === "change-email") {
    return <ChangeEmailScreen onBack={goBack} isDark={isDark} insets={insets} />;
  }
  if (screen === "change-password") {
    return <ChangePasswordScreen onBack={goBack} isDark={isDark} insets={insets} />;
  }

  return <MainScreen onNavigate={navigate} isDark={isDark} insets={insets} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 15 },
  bigTitle: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  bigSubtitle: { fontSize: 14, lineHeight: 21, marginBottom: 32 },
  emailInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  otpBox: {
    width: 56,
    height: 60,
    borderWidth: 1.5,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
  resendRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 4 },
  resendText: { fontSize: 13 },
  resendLink: { fontSize: 13, fontWeight: "700" },
  countdownText: { textAlign: "center", fontSize: 13, marginTop: 4, fontWeight: "600" },
  pwFieldWrap: { marginBottom: 20 },
  pwLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  pwInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  pwInput: { flex: 1, fontSize: 14, paddingVertical: 10 },
  proceedBtn: {
    backgroundColor: "#4B3A99",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  proceedTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  successSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  closeBtn: { alignSelf: "flex-end", marginBottom: 8 },
  successIconWrap: { marginBottom: 16 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4B3A99",
    alignItems: "center",
    justifyContent: "center",
  },
  successMsg: { fontSize: 16, fontWeight: "600", marginBottom: 28, textAlign: "center" },
  gotItBtn: {
    backgroundColor: "#4B3A99",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  gotItTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  // theme sheet
  themeSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  themeSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D0D0",
    alignSelf: "center",
    marginBottom: 16,
  },
  themeSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  themeSheetTitle: { fontSize: 17, fontWeight: "600" },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  themeOptionLabel: { fontSize: 15 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#4B3A99",
  },
  themeHint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
});