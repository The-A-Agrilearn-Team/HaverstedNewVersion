import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";
import { useProfileStats } from "@/hooks/useProgress";

const C = Colors.light;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, signOut, refreshProfile } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [])
  );

  const { data: stats = { completed: 0, bookmarks: 0, listings: 0 } } = useProfileStats();

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")){
        signOut();
      }
      return signOut();
    }
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
          Create an account to access all learning modules, track your progress, and list produce in the marketplace.
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

  const roleColor: Record<string, string> = {
    farmer: C.success,
    buyer: C.accent,
    retailer: "#7C3AED",
    admin: C.error,
  };
  const thisColor = roleColor[profile?.role ?? "farmer"] ?? C.primary;

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
        <View style={[styles.roleBadge, { backgroundColor: `${thisColor}18` }]}>
          <View style={[styles.roleDot, { backgroundColor: thisColor }]} />
          <Text style={[styles.roleText, { color: thisColor }]}>
            {(profile?.role ?? "farmer").charAt(0).toUpperCase() + (profile?.role ?? "farmer").slice(1)}
          </Text>
        </View>
        {profile?.location && (
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={C.textSecondary} />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{stats.completed}</Text>
          <Text style={styles.statLbl}>Completed</Text>
        </View>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statNum}>{stats.bookmarks}</Text>
          <Text style={styles.statLbl}>Bookmarks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{stats.listings}</Text>
          <Text style={styles.statLbl}>Listings</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuGroup}>
          <MenuRow icon="user" label="Personal Information" onPress={() => router.push("/profile/edit")} />
          <MenuRow icon="map-pin" label="Location" value={profile?.location ?? "Not set"} onPress={() => router.push("/profile/edit")} />
          <MenuRow icon="globe" label="Language" value={profile?.language_preference ?? "English"} onPress={() => router.push("/profile/edit")} last />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Learning</Text>
        <View style={styles.menuGroup}>
          <MenuRow icon="bookmark" label="Saved Modules" badge={stats.bookmarks > 0 ? String(stats.bookmarks) : undefined} />
          <MenuRow icon="award" label="My Progress" badge={stats.completed > 0 ? `${stats.completed} done` : undefined} />
          <MenuRow icon="download" label="Offline Content" last />
        </View>
      </View>

      {(profile?.role === "farmer" || profile?.role === "admin") && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Marketplace</Text>
          <View style={styles.menuGroup}>
            <MenuRow icon="package" label="My Listings" badge={stats.listings > 0 ? String(stats.listings) : undefined} />
            <MenuRow icon="message-circle" label="Messages" />
            <MenuRow icon="plus-circle" label="Create New Listing" onPress={() => router.push("/listing/create")} last />
          </View>
        </View>
      )}

      {profile?.role === "admin" && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Administration</Text>
          <View style={styles.menuGroup}>
            <MenuRow
              icon="shield"
              label="Admin Dashboard"
              value="Manage app"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/admin");
              }}
              last
            />
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

      <Text style={styles.versionText}>AgriLearn v1.0.0</Text>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function MenuRow({
  icon, label, value, badge, last, onPress,
}: {
  icon: string; label: string; value?: string; badge?: string; last?: boolean; onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
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
        {badge && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Feather name="chevron-right" size={18} color={C.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  guestContainer: {
    flex: 1, backgroundColor: C.background, alignItems: "center", paddingHorizontal: 32, gap: 16,
  },
  guestIconBox: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  guestTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: C.text, textAlign: "center" },
  guestSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22 },
  signInBtn: { width: "100%", backgroundColor: C.primary, borderRadius: 14, padding: 16, alignItems: "center" },
  signInBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  registerBtn: { width: "100%", borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1.5, borderColor: C.border },
  registerBtnText: { color: C.text, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  header: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 24, gap: 6 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#fff" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  email: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  roleDot: { width: 7, height: 7, borderRadius: 3.5 },
  roleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  statsRow: { flexDirection: "row", marginHorizontal: 20, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
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
  badgePill: { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  menuValue: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  signOutSection: { marginHorizontal: 20, marginBottom: 8 },
  signOutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: `${C.error}10`, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: `${C.error}20`,
  },
  signOutText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.error },
  versionText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary, textAlign: "center", marginBottom: 8 },
});
