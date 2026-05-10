import { useAppAlert } from "@/components/common/AppAlert";
import { useAuth } from "@/context/AuthContext";
import { useFileUpload } from "@/hooks/useFileUpload";
import { DEFAULT_DESIGN_THEMES } from "@/lib/customDesign";
import { mergeUserAndProfile, normalizeProfileResponse } from "@/lib/profile";
import ApiService from "@/services/apiClient";
import { toProfileType, useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Backend stubs — wire these up when your API is ready ───────────────────
async function deactivateAccount(): Promise<void> {
  // TODO: replace with real API call, e.g.:
  // await ApiService.deactivateAccount();
  throw new Error("deactivateAccount: not yet implemented");
}

async function deleteAccount(): Promise<void> {
  // TODO: replace with real API call, e.g.:
  // await ApiService.deleteAccount();
  throw new Error("deleteAccount: not yet implemented");
}
// ────────────────────────────────────────────────────────────────────────────

const defaultAvatar = "https://ui-avatars.com/api/?background=4B3A99&color=fff&size=128&name=U";

const toImage = (path?: string) => {
  if (!path || path === "string") return "";
  if (path.startsWith("http") || path.startsWith("file:") || path.startsWith("content:")) return path;
  return "https://backend-prod-api.berrystamp.com/" + path.replace(/^\/+/, "");
};

// Spec categories matching the design
const SPEC_CATEGORIES = [
  "Abstract art", "Minimalist","Illustration","Geometry art","Creative art", "Conceptual", "Fun and playful",
  "Typographic", "Feminine", "Masculine", "Nature", "Kiddies",
  ...DEFAULT_DESIGN_THEMES.filter(
    (t) => !["Abstract art", "Minimalist","Illustration","Geometry art","Creative art", "Conceptual", "Fun and playful",
  "Typographic", "Feminine", "Masculine", "Nature", "Kiddies"].includes(t)
  ),
];

// ─── Deactivate & Delete Screen ─────────────────────────────────────────────
function DeactivateDeleteScreen({
  isDark, onBack, onDeactivate, onDelete, logout, insets,
}: {
  isDark: boolean;
  onBack: () => void;
  onDeactivate: () => Promise<void>;
  onDelete: () => Promise<void>;
  logout: () => void;
  insets: { top: number; bottom: number };
}) {
  type Action = "deactivate" | "delete" | null;
  const [selected, setSelected] = useState<Action>("deactivate");
  const [confirmModal, setConfirmModal] = useState<Action>(null);
  const [loading, setLoading] = useState(false);
  const { show: showAlert, element: alertElement } = useAppAlert();

  const bg = isDark ? "#121212" : "#F0F0F0";
  const surface = isDark ? "#1E1E1E" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#1A1A1A";
  const subtext = isDark ? "#A0A0A0" : "#666666";
  const border = isDark ? "#333" : "#E0E0E0";
  const primary = "#4B3A99";

  const handleProceed = () => setConfirmModal(selected);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (confirmModal === "deactivate") {
        await onDeactivate();
        logout();
      } else {
        await onDelete();
        logout();
      }
    } catch {
      // stub — will work once backend is wired
      showAlert({
        type: 'warning',
        title: confirmModal === "deactivate" ? "Deactivate" : "Delete",
        message: "This feature is not yet available. It will be connected to the backend soon.",
      });
    } finally {
      setLoading(false);
      setConfirmModal(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={[{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", backgroundColor: surface }]}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "600", color: text }}>Deactivate and deletion</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: text, marginBottom: 12 }}>
          Deactivating or deleting your{"\n"}Berrystamp account
        </Text>
        <Text style={{ fontSize: 14, color: subtext, lineHeight: 21, marginBottom: 32 }}>
          If you want to temporarily close your account, you can deactivate it. If you want to permanently remove your data from Berrystamp, you can delete your account
        </Text>

        {/* Deactivate card */}
        <TouchableOpacity
          onPress={() => setSelected("deactivate")}
          activeOpacity={0.85}
          style={[{
            backgroundColor: surface, borderRadius: 12, padding: 16,
            marginBottom: 16, borderWidth: 1, borderColor: border,
            flexDirection: "row", alignItems: "flex-start",
          }]}
        >
          <View style={[{
            width: 22, height: 22, borderRadius: 11, borderWidth: 2,
            borderColor: selected === "deactivate" ? primary : border,
            alignItems: "center", justifyContent: "center", marginRight: 14, marginTop: 2,
          }]}>
            {selected === "deactivate" && (
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: primary }} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: primary, marginBottom: 6 }}>Deactivate account</Text>
            <Text style={{ fontSize: 13, color: subtext, lineHeight: 19 }}>
              Deactivating your account is reversible. Your works will not be shown on Berrystamp for the moment
            </Text>
          </View>
        </TouchableOpacity>

        {/* Delete card */}
        <TouchableOpacity
          onPress={() => setSelected("delete")}
          activeOpacity={0.85}
          style={[{
            backgroundColor: surface, borderRadius: 12, padding: 16,
            borderWidth: 1, borderColor: border,
            flexDirection: "row", alignItems: "flex-start",
          }]}
        >
          <View style={[{
            width: 22, height: 22, borderRadius: 11, borderWidth: 2,
            borderColor: selected === "delete" ? primary : border,
            alignItems: "center", justifyContent: "center", marginRight: 14, marginTop: 2,
          }]}>
            {selected === "delete" && (
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: primary }} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: primary, marginBottom: 6 }}>Delete account</Text>
            <Text style={{ fontSize: 13, color: subtext, lineHeight: 19 }}>
              Deleting your account is permanent and irreversible. You won&apos;t be able to your information after the action.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Proceed button */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, backgroundColor: bg }}>
        <TouchableOpacity
          onPress={handleProceed}
          style={{ backgroundColor: "#E53935", borderRadius: 28, paddingVertical: 16, alignItems: "center" }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>Proceed</Text>
        </TouchableOpacity>
      </View>

      {/* Confirm modal */}
      <Modal transparent visible={confirmModal !== null} animationType="slide" onRequestClose={() => setConfirmModal(null)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setConfirmModal(null)} />
          <View style={{ backgroundColor: surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: text }}>
                {confirmModal === "deactivate" ? "Deactivate" : "Delete"}
              </Text>
              <TouchableOpacity onPress={() => setConfirmModal(null)}>
                <Ionicons name="close" size={22} color={text} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, color: subtext, textAlign: "center", lineHeight: 21, marginBottom: 28 }}>
              {confirmModal === "deactivate"
                ? "Are you sure you want to deactivate this account? You will be able to retrieve the account."
                : "Are you sure you want to logout from this account? You will have to pass through login process next time"}
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setConfirmModal(null)}
                style={{ flex: 1, borderRadius: 28, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: border }}
              >
                <Text style={{ color: text, fontSize: 15, fontWeight: "600" }}>Do it later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={loading}
                style={{ flex: 1, borderRadius: 28, paddingVertical: 14, alignItems: "center", backgroundColor: "#E53935" }}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                      {confirmModal === "deactivate" ? "Deactivate" : "Logout"}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {alertElement}
    </View>
  );
}
// ────────────────────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const role = useAuthStore((state) => toProfileType(state.role));
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const { uploading, uploadFile } = useFileUpload();
  const { show: showAlert, element: alertElement } = useAppAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [specifications, setSpecifications] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState(defaultAvatar);
  const [coverUri, setCoverUri] = useState("");
  const [showSpecs, setShowSpecs] = useState(false);
  const [specSearch, setSpecSearch] = useState("");
  const [showDeactivateDelete, setShowDeactivateDelete] = useState(false);
  const [storedAvatarPath, setStoredAvatarPath] = useState("");
  const [storedCoverPath, setStoredCoverPath] = useState("");

  const isCustomer = role === "CUSTOMER";

  const bg = isDark ? "#121212" : "#F2F2F2";
  const surface = isDark ? "#1E1E1E" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "#A0A0A0" : "#666666";
  const border = isDark ? "#333333" : "#E6E6E6";
  const primary = isDark ? "#8A7AE6" : "#4B3A99";
  const inputBorder = isDark ? "#444" : "#CCCCCC";

  const filteredSpecs = useMemo(() => {
    const all = SPEC_CATEGORIES;
    if (!specSearch.trim()) return all;
    return all.filter((s) => s.toLowerCase().includes(specSearch.toLowerCase()));
  }, [specSearch]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await ApiService.getMyProfile();
      const normalized = normalizeProfileResponse(profileData);
      const merged = mergeUserAndProfile(user, normalized);
      const currentProfile =
        role === "DESIGNER" ? merged.designerProfile
        : role === "PRINTER" ? merged.printerProfile
        : merged.customerProfile;

      const profilePic = currentProfile?.profileImage?.url || currentProfile?.profilePic || normalized.profilePicturePath || "";
      const coverPic = currentProfile?.coverPic || currentProfile?.coverPhotoPath || currentProfile?.coverImage?.url || normalized.coverPic || "";

      setFullName(merged.fullName || "");
      setBrandName(currentProfile?.name || currentProfile?.userName || "");
      setBio(currentProfile?.bio || "");
      // categories is the field used by the API (same as what my-shop reads)
      setSpecifications(
        currentProfile?.categories ||
        currentProfile?.specifications ||
        currentProfile?.printingSpecifications ||
        []
      );
      setAvatarUri(toImage(profilePic) || defaultAvatar);
      setCoverUri(toImage(coverPic));
      setStoredAvatarPath(profilePic || "");
      setStoredCoverPath(coverPic || "");
    } catch (error: any) {
      showAlert({ type: 'error', title: 'Unable to load profile', message: error?.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  const pickImage = async (setter: (uri: string) => void, aspect: [number, number]) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { showAlert({ type: 'warning', title: 'Permission required', message: 'Allow access to your photos.' }); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images" as any, aspect, quality: 0.85 });
    if (!result.canceled && result.assets?.[0]?.uri) setter(result.assets[0].uri);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let avatarPath = storedAvatarPath;
      let coverPath = storedCoverPath;

      if (avatarUri && (avatarUri.startsWith("file:") || avatarUri.startsWith("content:"))) {
        const uploaded = await uploadFile(avatarUri);
        avatarPath = uploaded.path;
      }
      if (!isCustomer && coverUri && (coverUri.startsWith("file:") || coverUri.startsWith("content:"))) {
        const uploaded = await uploadFile(coverUri);
        coverPath = uploaded.path;
      }

      const payload: any = {
        name: isCustomer ? fullName.trim() : brandName.trim() || fullName.trim(),
        ...(isCustomer ? {} : { bio: bio.trim() }),
        profilePic: avatarPath.replace("https://berry-stamp-prod.s3.amazonaws.com/", "") || undefined,
        ...(isCustomer ? {} : { coverPic: coverPath.replace("https://berry-stamp-prod.s3.amazonaws.com/", "") || undefined }),
        // send both field names so the backend accepts whichever it expects
        ...(role === "DESIGNER" || role === "PRINTER"
          ? {
              categories: specifications.filter(Boolean),
            }
          : {}),
      };

      await ApiService.updateMyProfile(payload);
      await refreshUser();
      setStoredAvatarPath(avatarPath);
      setStoredCoverPath(coverPath);
      showAlert({ type: 'success', title: 'Saved', message: 'Profile updated successfully.' });
    } catch (error: any) {
      // Extract the most descriptive message the backend returned
      const msg =
        error?.response?.data?.responseMessage ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string" ? error.response.data : null) ||
        error?.message ||
        "Please try again.";
      showAlert({ type: 'error', title: 'Save failed', message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bg }}><ActivityIndicator size="large" color={primary} /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Cover */}
        <View style={[styles.coverWrap]}>
          {coverUri
            ? <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#1A1A2E" }]} />
          }
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.38)" }]} />
          <View style={[styles.coverHeader, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.coverBtn}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.coverTitle}>Account</Text>
            <TouchableOpacity onPress={() => pickImage(setCoverUri, [16, 9])} style={styles.coverBtn}>
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar */}
        <View style={[styles.avatarRow, { backgroundColor: surface }]}>
          <TouchableOpacity onPress={() => pickImage(setAvatarUri, [1, 1])} activeOpacity={0.85} style={styles.avatarWrap}>
            <Image source={{ uri: avatarUri || defaultAvatar }} style={styles.avatar} />
            <View style={[styles.avatarCam, { backgroundColor: primary, borderColor: surface }]}>
              <Ionicons name="camera-outline" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form card */}
        <View style={[styles.formCard, { backgroundColor: surface }]}>

          {/* Full Name */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: primary }]}>Full Name</Text>
            <TextInput
              value={fullName} onChangeText={setFullName}
              placeholder="Enter full name" placeholderTextColor={textMuted}
              style={[styles.input, { color: text, borderColor: inputBorder }]}
            />
          </View>

          {/* Brand name */}
          {!isCustomer && (
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: primary }]}>Brand name</Text>
              <TextInput
                value={brandName} onChangeText={setBrandName}
                placeholder="Enter brand name" placeholderTextColor={textMuted}
                style={[styles.input, { color: text, borderColor: inputBorder }]}
              />
            </View>
          )}

          {/* Bio */}
          {!isCustomer && (
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: primary }]}>Bio</Text>
              <TextInput
                value={bio} onChangeText={setBio}
                placeholder="Tell people about yourself" placeholderTextColor={textMuted}
                multiline numberOfLines={4}
                style={[styles.input, styles.bioInput, { color: text, borderColor: inputBorder }]}
              />
            </View>
          )}

          {/* Add Specification */}
          {(role === "DESIGNER" || role === "PRINTER") && (
            <TouchableOpacity onPress={() => setShowSpecs(true)} style={[styles.specRow, { borderColor: inputBorder }]} activeOpacity={0.75}>
              <View style={[styles.specIcon, { borderColor: primary }]}>
                <Ionicons name="add" size={18} color={primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.specRowTitle, { color: text }]}>Add Specification</Text>
                {specifications.filter(Boolean).length > 0 && (
                  <Text numberOfLines={1} style={[styles.specRowSub, { color: textMuted }]}>
                    {specifications.filter(Boolean).slice(0, 4).join(", ")}...
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={textMuted} />
            </TouchableOpacity>
          )}

          {/* Account Management */}
          <Text style={[styles.sectionTitle, { color: text }]}>Account Management</Text>

          {!isCustomer && (
            <TouchableOpacity onPress={() => router.push("/payment-details")} style={[styles.mgmtRow, { borderBottomColor: border }]}>
              <Text style={[styles.mgmtText, { color: text }]}>Edit  payment details</Text>
              <Ionicons name="chevron-forward" size={18} color={textMuted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setShowDeactivateDelete(true)} style={[styles.mgmtRow, { borderBottomColor: border }]}>
            <Text style={[styles.mgmtText, { color: text }]}>Deactivate</Text>
            <Ionicons name="chevron-forward" size={18} color={textMuted} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDeactivateDelete(true)} style={[styles.mgmtRow, { borderBottomColor: border }]}>
            <Text style={[styles.mgmtText, { color: text }]}>Deletion</Text>
            <Ionicons name="chevron-forward" size={18} color={textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => showAlert({
              type: 'confirm',
              title: 'Log out',
              message: 'Are you sure you want to log out?',
              buttons: [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log out', style: 'destructive', onPress: logout },
              ],
            })}
            style={[styles.mgmtRow, { borderBottomColor: "transparent" }]}
          >
            <Ionicons name="log-out-outline" size={18} color="#E53935" style={{ marginRight: 8 }} />
            <Text style={[styles.mgmtText, { color: "#E53935" }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={18} color={textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Save button ─────────────────────────────────────────────────── */}
      <View style={[styles.saveBar, { backgroundColor: surface, borderTopColor: border, paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || uploading}
          style={[styles.saveBtn, { backgroundColor: primary, opacity: saving || uploading ? 0.65 : 1 }]}
          activeOpacity={0.85}
        >
          {saving || uploading
            ? <ActivityIndicator color="#FFFFFF" size="small" />
            : <Text style={styles.saveBtnTxt}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Specs Modal ─────────────────────────────────────────────────── */}
      <Modal transparent={false} visible={showSpecs} animationType="slide" onRequestClose={() => setShowSpecs(false)}>
        <View style={{ flex: 1, backgroundColor: surface }}>
          <View style={[styles.modalHdr, { paddingTop: insets.top + 12, borderBottomColor: border }]}>
            <TouchableOpacity onPress={() => setShowSpecs(false)}>
              <Ionicons name="arrow-back" size={22} color={text} />
            </TouchableOpacity>
            <Text style={[styles.modalHdrTitle, { color: text }]}>Add specification</Text>
            <TouchableOpacity onPress={() => setShowSpecs(false)} style={[styles.specSaveBtn, { backgroundColor: primary }]}>
              <Text style={styles.specSaveBtnTxt}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.specSearchWrap, { borderColor: border }]}>
            <Ionicons name="search-outline" size={16} color={textMuted} style={{ marginRight: 8 }} />
            <TextInput
              value={specSearch} onChangeText={setSpecSearch}
              placeholder="Search Category" placeholderTextColor={textMuted}
              style={[styles.specSearchInput, { color: text }]}
            />
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {filteredSpecs.map((spec) => {
              const isSel = specifications.includes(spec);
              return (
                <TouchableOpacity
                  key={spec}
                  onPress={() => setSpecifications((p) => isSel ? p.filter((s) => s !== spec) : [...p, spec])}
                  style={[styles.specItem, { borderBottomColor: border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.specItemTxt, { color: isSel ? primary : text, fontWeight: isSel ? "700" : "400" }]}>{spec}</Text>
                  <View style={[styles.specCheckbox, { borderColor: isSel ? primary : border, backgroundColor: isSel ? primary : "transparent" }]}>
                    {isSel && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* ── Deactivate & Delete Modal ────────────────────────────────────── */}
      <Modal transparent={false} visible={showDeactivateDelete} animationType="slide" onRequestClose={() => setShowDeactivateDelete(false)}>
        <DeactivateDeleteScreen
          isDark={isDark}
          onBack={() => setShowDeactivateDelete(false)}
          onDeactivate={deactivateAccount}
          onDelete={deleteAccount}
          logout={logout}
          insets={insets}
        />
      </Modal>
      {alertElement}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  coverWrap: { height: 180, position: "relative" },
  coverHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  coverBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  coverTitle: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  avatarRow: { paddingHorizontal: 20, paddingTop: 0, paddingBottom: 0 },
  avatarWrap: { marginTop: -36, position: "relative", alignSelf: "flex-start" },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: "#FFFFFF" },
  avatarCam: { position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  formCard: { marginHorizontal: 0, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  bioInput: { height: 100, textAlignVertical: "top" },
  specRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 16 },
  specIcon: { width: 32, height: 32, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginRight: 12 },
  specRowTitle: { fontSize: 14, fontWeight: "500" },
  specRowSub: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  mgmtRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  mgmtText: { flex: 1, fontSize: 14 },
  modalHdr: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  modalHdrTitle: { fontSize: 16, fontWeight: "600" },
  specSaveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  specSaveBtnTxt: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  specSearchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginVertical: 14, borderWidth: 1, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10 },
  specSearchInput: { flex: 1, fontSize: 14 },
  specItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  specItemTxt: { flex: 1, fontSize: 15 },
  specCheckbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  saveBar: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, paddingHorizontal: 20 },
  saveBtn: { borderRadius: 28, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  saveBtnTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
