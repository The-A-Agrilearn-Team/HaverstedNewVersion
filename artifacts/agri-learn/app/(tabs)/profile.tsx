import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";

const C = Colors.light;

const LANGUAGES = ["English", "isiZulu", "Sesotho", "Afrikaans", "isiXhosa"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.guestContainer, { paddingTop: insets.top + 60 }]}>
        <View style={styles.guestIconBox}>
          <Feather name="user" size={40} color={C.primary} />
        </View>
        <Text style={styles.guestTitle}>You're not signed in</Text>
        <Text style={styles.guestSubtitle}>
          Create an account to access learning modules, save your progress, and list your produce in the marketplace.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.signInBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(auth)/login");
          }}
        >
          <Text style={styles.signInBtnText}>Sign In</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.registerBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.registerBtnText}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  const initials = (profile?.full_name ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleColor = {
    farmer: C.success,
    buyer: C.accent,
    retailer: "#7C3AED",
    admin: C.error,
  }[profile?.role ?? "farmer"] ?? C.primary;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{profile?.full_name ?? "User"}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: `${roleColor}18` }]}>
          <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
          <Text style={[styles.roleText, { color: roleColor }]}>
            {(profile?.role ?? "farmer").charAt(0).toUpperCase() + (profile?.role ?? "farmer").slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLbl}>Completed</Text>
        </View>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLbl}>Bookmarks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLbl}>Listings</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuGroup}>
          <MenuRow icon="user" label="Personal Information" />
          <MenuRow icon="map-pin" label="Location" value={profile?.location ?? "Not set"} />
          <MenuRow icon="globe" label="Language" value={profile?.language_preference ?? "English"} last />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Learning</Text>
        <View style={styles.menuGroup}>
          <MenuRow icon="bookmark" label="Saved Modules" />
          <MenuRow icon="award" label="My Progress" />
          <MenuRow icon="download" label="Offline Content" last />
        </View>
      </View>

      {(profile?.role === "farmer" || profile?.role === "admin") && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Marketplace</Text>
          <View style={styles.menuGroup}>
            <MenuRow icon="package" label="My Listings" />
            <MenuRow icon="message-circle" label="Messages" last />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.menuGroup}>
          <MenuRow icon="help-circle" label="Help & FAQ" />
          <MenuRow icon="shield" label="Privacy Policy" />
          <MenuRow icon="file-text" label="Terms of Service" last />
        </View>
      </View>

      <View style={styles.signOutSection}>
        <Pressable
          style={({ pressed }) => [styles.signOutButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleSignOut}
        >
          <Feather name="log-out" size={18} color={C.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function MenuRow({
  icon,
  label,
  value,
  last,
}: {
  icon: string;
  label: string;
  value?: string;
  last?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        !last && styles.menuRowBorder,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.menuRowLeft}>
        <View style={styles.menuIcon}>
          <Feather name={icon as any} size={18} color={C.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRowRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Feather name="chevron-right" size={18} color={C.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  guestContainer: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  guestIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${C.primary}12`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  guestTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: C.text, textAlign: "center" },
  guestSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22 },
  signInBtn: {
    width: "100%",
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  signInBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  registerBtn: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  registerBtnText: { color: C.text, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#fff" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  email: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleDot: { width: 7, height: 7, borderRadius: 3.5 },
  roleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  stat: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.border },
  statNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  statLbl: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  menuGroup: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  menuRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  menuRowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: C.text },
  menuRowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  menuValue: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  signOutSection: { marginHorizontal: 20, marginBottom: 16 },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: `${C.error}10`,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: `${C.error}20`,
  },
  signOutText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.error },
});
