import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";

const C = Colors.light;

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zu", label: "isiZulu" },
  { code: "xh", label: "isiXhosa" },
  { code: "af", label: "Afrikaans" },
  { code: "st", label: "Sesotho" },
  { code: "tn", label: "Setswana" },
  { code: "ts", label: "Xitsonga" },
  { code: "nso", label: "Sepedi" },
  { code: "ve", label: "Tshivenda" },
  { code: "nr", label: "isiNdebele" },
  { code: "ss", label: "siSwati" },
];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [language, setLanguage] = useState(profile?.language_pref ?? "en");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      e.fullName = "Name must be at least 2 characters";
    if (phone && !/^(\+27|0)[6-8][0-9]{8}$/.test(phone.replace(/\s/g, "")))
      e.phone = "Enter a valid South African phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!hasChanges) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("No Changes", "You haven't made any changes to your profile.");
      return;
    }
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
      language_pref: language,
    });
    setSaving(false);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Could not save", error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved!", "Your profile has been updated successfully.", [
        { text: "OK", onPress: () => router.replace("/(tabs)/profile") },
      ]);
    }
  };

  const hasChanges =
    fullName !== (profile?.full_name ?? "") ||
    phone !== (profile?.phone ?? "") ||
    location !== (profile?.location ?? "") ||
    language !== (profile?.language_pref ?? "en");

  const initials = (fullName || profile?.full_name || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => {
            if (hasChanges) {
              Alert.alert("Discard changes?", "You have unsaved changes.", [
                { text: "Keep editing", style: "cancel" },
                { text: "Discard", style: "destructive", onPress: () => router.replace("/(tabs)/profile") },
              ]);
            } else {
              router.replace("/(tabs)/profile");
            }
          }}
        >
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>Edit Profile</Text>
        <Pressable
          style={({ pressed }) => [
            styles.saveNavBtn,
            saving && styles.saveNavBtnDisabled,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveNavBtnText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.avatarName}>{fullName || "Your Name"}</Text>
            <Text style={styles.avatarEmail}>{user?.email}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>
                {(profile?.role ?? "user").charAt(0).toUpperCase() + (profile?.role ?? "user").slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Personal Details</Text>
        <View style={styles.card}>
          <FieldRow
            icon="user"
            label="Full Name"
            placeholder="e.g. Thabo Nkosi"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            autoCapitalize="words"
          />
          <View style={styles.divider} />
          <FieldRow
            icon="phone"
            label="Phone Number"
            placeholder="e.g. 071 234 5678"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={[styles.card, styles.readonlyCard]}>
          <View style={styles.fieldRowContainer}>
            <View style={styles.iconBox}>
              <Feather name="mail" size={16} color={C.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <Text style={styles.readonlyValue}>{user?.email}</Text>
            </View>
            <View style={styles.lockedBadge}>
              <Feather name="lock" size={11} color={C.textTertiary} />
              <Text style={styles.lockedText}>Fixed</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldRowContainer}>
            <View style={styles.iconBox}>
              <Feather name="shield" size={16} color={C.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Account Role</Text>
              <Text style={styles.readonlyValue}>
                {(profile?.role ?? "user").charAt(0).toUpperCase() + (profile?.role ?? "user").slice(1)}
              </Text>
            </View>
            <View style={styles.lockedBadge}>
              <Feather name="lock" size={11} color={C.textTertiary} />
              <Text style={styles.lockedText}>Fixed</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.card}>
          <View style={styles.fieldRowContainer}>
            <View style={styles.iconBox}>
              <Feather name="map-pin" size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Farm / City</Text>
              <TextInput
                style={styles.inlineInput}
                placeholder="e.g. Durban, KZN"
                placeholderTextColor={C.textTertiary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={[styles.fieldLabel, { paddingHorizontal: 16, paddingTop: 4, marginBottom: 10 }]}>
            Or pick a province
          </Text>
          <View style={styles.provincesGrid}>
            {SA_PROVINCES.map((prov) => (
              <Pressable
                key={prov}
                style={({ pressed }) => [
                  styles.provinceChip,
                  location === prov && styles.provinceChipActive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  setLocation(prov);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.provinceChipText,
                  location === prov && styles.provinceChipTextActive,
                ]}>
                  {prov}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Preferred Language</Text>
        <View style={styles.card}>
          <View style={styles.langGrid}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                style={({ pressed }) => [
                  styles.langChip,
                  language === lang.code && styles.langChipActive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  setLanguage(lang.code);
                  Haptics.selectionAsync();
                }}
              >
                {language === lang.code && (
                  <Feather name="check" size={12} color="#fff" />
                )}
                <Text style={[
                  styles.langChipText,
                  language === lang.code && styles.langChipTextActive,
                ]}>
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            saving && styles.saveBtnDisabled,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function FieldRow({
  icon, label, placeholder, value, onChangeText, error, keyboardType, autoCapitalize,
}: {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View>
      <View style={styles.fieldRowContainer}>
        <View style={styles.iconBox}>
          <Feather name={icon as any} size={16} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            style={[styles.inlineInput, !!error && styles.inlineInputError]}
            placeholder={placeholder}
            placeholderTextColor={C.textTertiary}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
          />
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.background,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  saveNavBtn: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: "center",
  },
  saveNavBtnDisabled: { backgroundColor: C.textTertiary },
  saveNavBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  scroll: { padding: 20, gap: 8 },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  avatarName: { fontSize: 17, fontFamily: "Inter_700Bold", color: C.text },
  avatarEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  rolePill: {
    alignSelf: "flex-start",
    backgroundColor: `${C.primary}14`,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  rolePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.primary },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 4,
    overflow: "hidden",
  },
  readonlyCard: { opacity: 0.75 },
  fieldRowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${C.primary}12`,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.textSecondary, marginBottom: 4 },
  inlineInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.text,
    paddingVertical: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: C.border,
    paddingBottom: 4,
  },
  inlineInputError: { borderBottomColor: C.error },
  readonlyValue: { fontSize: 15, fontFamily: "Inter_500Medium", color: C.text },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginTop: 2,
  },
  lockedText: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.textTertiary },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: C.error,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  divider: { height: 1, backgroundColor: C.borderLight, marginHorizontal: 16 },
  provincesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  provinceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surfaceSecondary,
  },
  provinceChipActive: { backgroundColor: `${C.primary}14`, borderColor: C.primary },
  provinceChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary },
  provinceChipTextActive: { color: C.primary },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surfaceSecondary,
  },
  langChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  langChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  langChipTextActive: { color: "#fff" },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: C.background,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
  },
  saveBtnDisabled: { backgroundColor: C.border },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
