import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView,
  Modal, Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useFileUpload } from "@/hooks/useFileUpload";
import { DEFAULT_DESIGN_THEMES } from "@/lib/customDesign";
import { mergeUserAndProfile, normalizeProfileResponse } from "@/lib/profile";
import { useAppTheme } from "@/lib/theme/appTheme";
import ApiService from "@/services/apiClient";
import { toProfileType, useAuthStore } from "@/store/authStore";

const defaultAvatar = "https://ui-avatars.com/api/?background=4B3A99&color=fff&size=128&name=U";

const toImage = (path?: string) => {
  if (!path || path === "string") return "";
  if (path.startsWith("http") || path.startsWith("file:") || path.startsWith("content:")) return path;
  return "https://backend-prod-api.berrystamp.com/" + path.replace(/^\/+/, "");
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const role = useAuthStore((state) => toProfileType(state.role));
  const theme = useAppTheme();
  const { uploading, uploadFile } = useFileUpload();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [specifications, setSpecifications] = useState<string[]>([""]);
  const [avatarUri, setAvatarUri] = useState(defaultAvatar);
  const [coverUri, setCoverUri] = useState("");
  const [showSpecs, setShowSpecs] = useState(false);
  const [storedAvatarPath, setStoredAvatarPath] = useState("");
  const [storedCoverPath, setStoredCoverPath] = useState("");
  const initialSnapshot = useRef("");

  // Customer only needs full name (no username, bio, cover, payment details)
  const isCustomer = role === "CUSTOMER";
  const title = isCustomer ? "Edit Profile" : role === "PRINTER" ? "Printer Account" : "Designer Account";

  const snapshot = useMemo(
    () => JSON.stringify({ fullName, brandName, bio, specifications, avatarUri, coverUri }),
    [avatarUri, bio, coverUri, fullName, brandName, specifications],
  );

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

      setFullName(merged.fullName || merged.firstName || "");
      setBrandName(currentProfile?.name || currentProfile?.userName || "");
      setBio(currentProfile?.bio || "");
      setSpecifications(currentProfile?.specifications || currentProfile?.printingSpecifications || [""]);
      setAvatarUri(toImage(profilePic) || defaultAvatar);
      setCoverUri(toImage(coverPic));
      setStoredAvatarPath(profilePic || "");
      setStoredCoverPath(coverPic || "");
      initialSnapshot.current = snapshot;
    } catch (error: any) {
      Alert.alert("Unable to load profile", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [role, user, snapshot]);

  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  const pickImage = async (setter: (uri: string) => void, aspect: [number, number]) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission required", "Allow access to your photos."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, aspect, quality: 0.85 });
    if (!result.canceled && result.assets?.[0]?.uri) setter(result.assets[0].uri);
  };

  const saveChanges = async (showSuccess = false) => {
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
      ...(role === "DESIGNER" || role === "PRINTER" ? { specifications: specifications.filter(Boolean) } : {}),
    };

    await ApiService.updateMyProfile(payload);
    await refreshUser();
    setStoredAvatarPath(avatarPath);
    setStoredCoverPath(coverPath);
    initialSnapshot.current = snapshot;
    if (showSuccess) Alert.alert("Saved", "Profile updated successfully.");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveChanges(true);
    } catch (error: any) {
      Alert.alert("Save failed", error?.response?.data?.responseMessage || error?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={[styles.centered, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: theme.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Cover / Header area — only for designer/printer */}
        {!isCustomer ? (
          <View style={[styles.coverWrap, { backgroundColor: theme.surfaceMuted }]}>
            {coverUri ? <Image source={{ uri: coverUri }} style={styles.coverImage} /> : null}
            <View style={styles.coverOverlay} />
            <View style={styles.coverHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity onPress={handleSave} disabled={saving || uploading} style={styles.saveButton}>
                <Text style={styles.saveText}>{saving || uploading ? "..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={() => pickImage(setCoverUri, [16, 9])} style={styles.coverAction}>
              <Ionicons name="image-outline" size={16} color="#FFFFFF" />
              <Text style={styles.coverActionText}>{coverUri ? "Change cover" : "Add cover"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Customer: simple header
          <View style={[styles.simpleHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.simpleHeaderTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving || uploading}>
              <Text style={[styles.saveLink, saving || uploading ? { color: theme.textMuted } : { color: theme.primary }]}>
                {saving || uploading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.profileSection}>
          {/* Avatar — only for designer/printer */}
          {!isCustomer && (
            <TouchableOpacity onPress={() => pickImage(setAvatarUri, [1, 1])} activeOpacity={0.85} style={styles.avatarWrap}>
              <Image source={{ uri: avatarUri || defaultAvatar }} style={styles.avatar} />
              <View style={[styles.avatarCamera, { borderColor: theme.background, backgroundColor: theme.primary }]}>
                <Ionicons name="camera-outline" size={15} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            {/* Full name always */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
              />
            </View>

            {/* Brand name for designer/printer only */}
            {!isCustomer && (
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{role === "PRINTER" ? "Print Shop Name" : "Brand / Shop Name"}</Text>
                <TextInput
                  value={brandName}
                  onChangeText={setBrandName}
                  placeholder={"Enter " + (role === "PRINTER" ? "print shop name" : "brand name")}
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                />
              </View>
            )}

            {/* Bio for designer/printer only */}
            {!isCustomer && (
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Bio</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell people about yourself"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.bioInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
                />
              </View>
            )}

            {/* Specifications for designer/printer */}
            {(role === "DESIGNER" || role === "PRINTER") && (
              <TouchableOpacity onPress={() => setShowSpecs(true)} style={[styles.specCard, { backgroundColor: theme.surfaceMuted }]}>
                <View style={[styles.specIconWrap, { backgroundColor: theme.surface }]}>
                  <Ionicons name="add" size={20} color={theme.primary} />
                </View>
                <View style={styles.specTextWrap}>
                  <Text style={[styles.specTitle, { color: theme.text }]}>Add Specification</Text>
                  {specifications.filter(Boolean).length > 0 && (
                    <Text numberOfLines={1} style={[styles.specSubtitle, { color: theme.textMuted }]}>
                      {specifications.filter(Boolean).slice(0, 3).join(", ")}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}

            {/* Account management */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Management</Text>

            {/* Payment details only for designer/printer */}
            {!isCustomer && (
              <TouchableOpacity onPress={() => router.push("/payment-details")} style={[styles.managementCard, { backgroundColor: theme.surfaceMuted }]}>
                <Ionicons name="card-outline" size={18} color={theme.textMuted} />
                <Text style={[styles.managementText, { color: theme.text }]}>Payment details</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => {}} style={[styles.managementCard, { backgroundColor: theme.surfaceMuted }]}>
              <Ionicons name="alert-circle-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.managementText, { color: theme.text }]}>Deactivate account</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {}} style={[styles.managementCard, { backgroundColor: theme.surfaceMuted }]}>
              <Ionicons name="trash-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.managementText, { color: theme.text }]}>Delete account</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Alert.alert("Log out", "Are you sure?", [{ text: "Cancel", style: "cancel" }, { text: "Log out", style: "destructive", onPress: logout }])} style={[styles.managementCard, { backgroundColor: theme.surfaceMuted }]}>
              <Ionicons name="log-out-outline" size={18} color="#FF6B63" />
              <Text style={[styles.managementText, { color: "#FF6B63" }]}>Log out</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Specs Modal */}
      <Modal transparent visible={showSpecs} animationType="slide" onRequestClose={() => setShowSpecs(false)}>
        <View style={[styles.modalScreen, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSpecs(false)}>
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Specifications</Text>
            <TouchableOpacity onPress={() => { setSpecifications((s) => [...s, ""]); }}>
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
            {DEFAULT_DESIGN_THEMES.map((spec) => {
              const isSelected = specifications.includes(spec);
              return (
                <TouchableOpacity
                  key={spec}
                  onPress={() => setSpecifications((s) => isSelected ? s.filter((i) => i !== spec) : [...s.filter(Boolean), spec])}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: isSelected ? theme.primary : theme.surface, borderRadius: 12, padding: 14 }}
                >
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: isSelected ? "#FFFFFF" : theme.text }}>{spec}</Text>
                  {isSelected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={{ padding: 20 }}>
            <TouchableOpacity onPress={() => setShowSpecs(false)} style={{ backgroundColor: theme.primary, borderRadius: 24, paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  coverWrap: { height: 200, position: "relative" },
  coverImage: { ...StyleSheet.absoluteFillObject },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  coverHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  saveButton: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 },
  saveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  coverAction: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", marginTop: 4, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 20 },
  coverActionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "500" },
  simpleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, paddingTop: 56, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  simpleHeaderTitle: { fontSize: 17, fontWeight: "600" },
  saveLink: { fontSize: 15, fontWeight: "600" },
  profileSection: { padding: 16 },
  avatarWrap: { alignSelf: "flex-start", marginBottom: 16, position: "relative" },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarCamera: { position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 18, padding: 16, gap: 12 },
  formField: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  bioInput: { height: 90, textAlignVertical: "top" },
  specCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14 },
  specIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  specTextWrap: { flex: 1 },
  specTitle: { fontSize: 14, fontWeight: "500" },
  specSubtitle: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginTop: 8 },
  managementCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, gap: 12 },
  managementText: { flex: 1, fontSize: 14, fontWeight: "500" },
  modalScreen: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: "600" },
});
