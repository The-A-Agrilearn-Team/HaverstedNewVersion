import { Feather } from "@expo/vector-icons";
import { router, Stack, usePathname } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import ADMIN_CONFIG from "@/constants/adminConfig";

const SIDEBAR_BG = "#1B3A2A";
const SIDEBAR_ACTIVE = "#2D6A4F";
const SIDEBAR_TEXT = "#FFFFFF";
const SIDEBAR_MUTED = "rgba(255,255,255,0.55)";
const SIDEBAR_LABEL = "rgba(255,255,255,0.4)";
const SIDEBAR_WIDTH = 260;

const MAIN_NAV = [
  { id: "index",    label: "Dashboard",        icon: "grid",         path: "/admin" },
  { id: "users",    label: "Users",             icon: "users",        path: "/admin/users" },
  { id: "modules",  label: "Learning Modules",  icon: "book-open",    path: "/admin/modules" },
  { id: "listings", label: "Marketplace",       icon: "shopping-bag", path: "/admin/listings" },
];

const ACCOUNT_NAV = [
  { id: "logs", label: "Settings", icon: "settings", path: "/admin/logs" },
];

function isPathActive(currentPath: string, itemPath: string) {
  if (itemPath === "/admin") return currentPath === "/admin";
  return currentPath.startsWith(itemPath);
}

function AdminSidebar({
  pathname,
  profile,
  onSignOut,
}: {
  pathname: string;
  profile: any;
  onSignOut: () => void;
}) {
  const initials = (profile?.full_name ?? "SA")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={sidebar.container}>
      <View style={sidebar.logoRow}>
        <View style={sidebar.logoIcon}>
          <Feather name="feather" size={18} color="#fff" />
        </View>
        <View>
          <Text style={sidebar.logoTitle}>AgriLearn</Text>
          <Text style={sidebar.logoSub}>Admin Portal</Text>
        </View>
      </View>

      <Text style={sidebar.sectionLabel}>MAIN MENU</Text>
      {MAIN_NAV.map((item) => {
        const active = isPathActive(pathname, item.path);
        return (
          <Pressable
            key={item.id}
            style={[sidebar.navItem, active && sidebar.navItemActive]}
            onPress={() => router.replace(item.path as any)}
          >
            <Feather
              name={item.icon as any}
              size={18}
              color={active ? SIDEBAR_TEXT : SIDEBAR_MUTED}
            />
            <Text style={[sidebar.navLabel, active && sidebar.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}

      <Text style={[sidebar.sectionLabel, { marginTop: 28 }]}>ACCOUNT</Text>
      {ACCOUNT_NAV.map((item) => {
        const active = isPathActive(pathname, item.path);
        return (
          <Pressable
            key={item.id}
            style={[sidebar.navItem, active && sidebar.navItemActive]}
            onPress={() => router.replace(item.path as any)}
          >
            <Feather
              name={item.icon as any}
              size={18}
              color={active ? SIDEBAR_TEXT : SIDEBAR_MUTED}
            />
            <Text style={[sidebar.navLabel, active && sidebar.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}

      <View style={{ flex: 1 }} />

      <View style={sidebar.userCard}>
        <View style={sidebar.userAvatar}>
          <Text style={sidebar.userAvatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={sidebar.userName} numberOfLines={1}>
            {profile?.full_name ?? "Super Admin"}
          </Text>
          <Text style={sidebar.userRole}>
            {profile?.role ?? "Superadmin"}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [sidebar.signOut, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onSignOut}
      >
        <Feather name="log-out" size={16} color={SIDEBAR_MUTED} />
        <Text style={sidebar.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

export default function AdminLayout() {
  const { signIn, signOut, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);

    const emailMatch = email.trim().toLowerCase() === ADMIN_CONFIG.email.toLowerCase();
    const passMatch = password === ADMIN_CONFIG.password;

    if (!emailMatch || !passMatch) {
      setLoading(false);
      setError("Incorrect admin credentials. Please try again.");
      return;
    }

    const result = await signIn(ADMIN_CONFIG.email, ADMIN_CONFIG.password);
    setLoading(false);

    if (result.error) {
      setError("Admin account not found. Please check setup instructions.");
      return;
    }

    setVerified(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setVerified(false);
    setEmail("");
    setPassword("");
    router.replace("/(tabs)");
  };

  if (!verified) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#FAFAF8" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[gate.container, { paddingTop: insets.top + 32 }]}>
          <View style={gate.iconBox}>
            <Feather name="shield" size={30} color="#2D6A4F" />
          </View>
          <Text style={gate.title}>Admin Portal</Text>
          <Text style={gate.sub}>
            Enter your administrator credentials to continue.
          </Text>

          {error ? (
            <View style={gate.errorBox}>
              <Feather name="alert-circle" size={15} color="#DC2626" />
              <Text style={gate.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={gate.fieldGroup}>
            <Text style={gate.label}>Email</Text>
            <View style={gate.inputWrapper}>
              <Feather name="mail" size={16} color="#9CA3AF" style={{ paddingLeft: 14 }} />
              <TextInput
                style={gate.input}
                placeholder="admin@agrilearn.co.za"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={gate.fieldGroup}>
            <Text style={gate.label}>Password</Text>
            <View style={gate.inputWrapper}>
              <Feather name="lock" size={16} color="#9CA3AF" style={{ paddingLeft: 14 }} />
              <TextInput
                style={[gate.input, { paddingRight: 48 }]}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, padding: 4 }}
              >
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#9CA3AF" />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [gate.verifyBtn, { opacity: pressed || loading ? 0.85 : 1 }]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="shield" size={17} color="#fff" />
                <Text style={gate.verifyBtnText}>Verify & Enter</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [gate.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={gate.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#F0F4F2" }}>
      <AdminSidebar pathname={pathname} profile={profile} onSignOut={handleSignOut} />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="users" />
          <Stack.Screen name="listings" />
          <Stack.Screen name="modules" />
          <Stack.Screen name="logs" />
        </Stack>
      </View>
    </View>
  );
}

const sidebar = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: SIDEBAR_BG,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
    flexDirection: "column",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2D6A4F",
    alignItems: "center",
    justifyContent: "center",
  },
  logoTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: SIDEBAR_TEXT,
    lineHeight: 20,
  },
  logoSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: SIDEBAR_MUTED,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: SIDEBAR_LABEL,
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: SIDEBAR_ACTIVE,
  },
  navLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: SIDEBAR_MUTED,
  },
  navLabelActive: {
    color: SIDEBAR_TEXT,
    fontFamily: "Inter_600SemiBold",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SIDEBAR_ACTIVE,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  userName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: SIDEBAR_TEXT,
  },
  userRole: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: SIDEBAR_MUTED,
    textTransform: "capitalize",
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  signOutText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: SIDEBAR_MUTED,
  },
});

const gate = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    gap: 16,
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(45,106,79,0.1)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220,38,38,0.08)",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  errorText: { fontSize: 13, color: "#DC2626", fontFamily: "Inter_500Medium", flex: 1 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#2D6A4F",
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  verifyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cancelBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  cancelBtnText: { color: "#1A1A1A", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
