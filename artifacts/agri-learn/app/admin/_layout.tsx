import { Feather } from "@expo/vector-icons";
import { router, Stack, usePathname } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
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

const OTP_LENGTH = 6;
const TOTP_STEP = 30;

enum Step {
  Credentials,
  MFA,
}

function generateTOTP(secret: number): { code: string; remaining: number } {
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / TOTP_STEP);
  const raw = ((secret * (window + 1)) % 900000) + 100000;
  const code = raw.toString().padStart(6, "0");
  const remaining = TOTP_STEP - (now % TOTP_STEP);
  return { code, remaining };
}

function isPathActive(currentPath: string, itemPath: string) {
  if (itemPath === "/admin") return currentPath === "/admin";
  return currentPath.startsWith(itemPath);
}

const MOBILE_BREAKPOINT = 768;

function AdminBottomNav({
  pathname,
  onSignOut,
  insets,
}: {
  pathname: string;
  onSignOut: () => void;
  insets: { bottom: number };
}) {
  const allItems = [
    ...MAIN_NAV,
    { id: "logs", label: "Settings", icon: "settings", path: "/admin/logs" },
  ];

  return (
    <View style={[bottomNav.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {allItems.map((item) => {
        const active = isPathActive(pathname, item.path);
        return (
          <Pressable
            key={item.id}
            style={bottomNav.tab}
            onPress={() => router.replace(item.path as any)}
          >
            <Feather
              name={item.icon as any}
              size={20}
              color={active ? SIDEBAR_ACTIVE : "#9CA3AF"}
            />
            <Text style={[bottomNav.tabLabel, active && bottomNav.tabLabelActive]}>
              {item.label === "Learning Modules" ? "Modules" : item.label}
            </Text>
          </Pressable>
        );
      })}
      <Pressable style={bottomNav.tab} onPress={onSignOut}>
        <Feather name="log-out" size={20} color="#9CA3AF" />
        <Text style={bottomNav.tabLabel}>Sign Out</Text>
      </Pressable>
    </View>
  );
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
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;

  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState<Step>(Step.Credentials);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [totpCode, setTotpCode] = useState("");
  const [countdown, setCountdown] = useState(TOTP_STEP);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const refreshTOTP = useCallback(() => {
    const { code, remaining } = generateTOTP(ADMIN_CONFIG.mfaSecret);
    setTotpCode(code);
    setCountdown(remaining);
  }, []);

  useEffect(() => {
    if (step !== Step.MFA) return;
    refreshTOTP();
    const interval = setInterval(() => {
      const { code, remaining } = generateTOTP(ADMIN_CONFIG.mfaSecret);
      setTotpCode(code);
      setCountdown(remaining);
      if (remaining === TOTP_STEP) {
        setOtp(Array(OTP_LENGTH).fill(""));
        otpRefs.current[0]?.focus();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [step, refreshTOTP]);

  const handleVerifyCredentials = async () => {
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Incorrect admin credentials. Please try again.");
      return;
    }

    const result = await signIn(ADMIN_CONFIG.email, ADMIN_CONFIG.password);
    setLoading(false);

    if (result.error) {
      setError("Admin account not found. Please check setup instructions.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep(Step.MFA);
  };

  const handleVerifyMFA = () => {
    const entered = otp.join("");
    if (entered.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    const { code } = generateTOTP(ADMIN_CONFIG.mfaSecret);
    if (entered !== code) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Incorrect authentication code. Please check and try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setError("");
    setVerified(true);
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setVerified(false);
    setStep(Step.Credentials);
    setEmail("");
    setPassword("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    router.replace("/(tabs)");
  };

  const resetToCredentials = async () => {
    await signOut();
    setStep(Step.Credentials);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
  };

  if (!verified) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#FAFAF8" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[gate.container, { paddingTop: insets.top + 32 }]}>

          {/* ── Step indicator ── */}
          <View style={gate.steps}>
            <View style={gate.stepRow}>
              <View style={[gate.stepDot, gate.stepDotActive]}>
                <Feather name="lock" size={12} color="#fff" />
              </View>
              <View style={[gate.stepLine, step === Step.MFA && gate.stepLineActive]} />
              <View style={[gate.stepDot, step === Step.MFA && gate.stepDotActive]}>
                <Feather name="shield" size={12} color={step === Step.MFA ? "#fff" : "#9CA3AF"} />
              </View>
            </View>
            <View style={gate.stepLabels}>
              <Text style={[gate.stepLabel, gate.stepLabelActive]}>Credentials</Text>
              <Text style={[gate.stepLabel, step === Step.MFA && gate.stepLabelActive]}>
                MFA Verification
              </Text>
            </View>
          </View>

          {step === Step.Credentials ? (
            <>
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
                    placeholder="Admin email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
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
                    autoComplete="password"
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
                onPress={handleVerifyCredentials}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="arrow-right" size={17} color="#fff" />
                    <Text style={gate.verifyBtnText}>Continue to MFA</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [gate.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={gate.cancelBtnText}>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[gate.iconBox, { backgroundColor: "rgba(45,106,79,0.12)" }]}>
                <Feather name="smartphone" size={30} color="#2D6A4F" />
              </View>
              <Text style={gate.title}>Two-Factor Auth</Text>
              <Text style={gate.sub}>
                Enter the 6-digit code from your authenticator app.
              </Text>

              {error ? (
                <View style={gate.errorBox}>
                  <Feather name="alert-circle" size={15} color="#DC2626" />
                  <Text style={gate.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Demo TOTP display */}
              <View style={gate.demoBadge}>
                <Feather name="info" size={13} color="#2D6A4F" />
                <Text style={gate.demoBadgeText}>Demo Mode — Authenticator Code:</Text>
                <Text style={gate.demoCode}>{totpCode}</Text>
                <View style={gate.countdownPill}>
                  <Text style={gate.countdownText}>{countdown}s</Text>
                </View>
              </View>

              {/* OTP boxes */}
              <View style={gate.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(r) => { otpRefs.current[i] = r; }}
                    style={[gate.otpBox, digit && gate.otpBoxFilled]}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, i)}
                    onKeyPress={(e) => handleOtpKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    textAlign="center"
                  />
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [gate.verifyBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={handleVerifyMFA}
              >
                <Feather name="shield" size={17} color="#fff" />
                <Text style={gate.verifyBtnText}>Verify & Enter</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [gate.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={resetToCredentials}
              >
                <Text style={gate.cancelBtnText}>← Back</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }

  const stackContent = (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="listings" />
      <Stack.Screen name="modules" />
      <Stack.Screen name="logs" />
    </Stack>
  );

  if (isMobile) {
    return (
      <View style={{ flex: 1, flexDirection: "column", backgroundColor: "#F0F4F2" }}>
        <View style={[mobileHeader.bar, { paddingTop: insets.top + 8 }]}>
          <View style={mobileHeader.logoRow}>
            <View style={mobileHeader.logoIcon}>
              <Feather name="feather" size={14} color="#fff" />
            </View>
            <Text style={mobileHeader.logoTitle}>AgriLearn</Text>
            <Text style={mobileHeader.badge}>Admin</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>{stackContent}</View>
        <AdminBottomNav
          pathname={pathname}
          onSignOut={handleSignOut}
          insets={insets}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#F0F4F2" }}>
      <AdminSidebar pathname={pathname} profile={profile} onSignOut={handleSignOut} />
      <View style={{ flex: 1 }}>{stackContent}</View>
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

  // ── Steps ──
  steps: {
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    marginBottom: 8,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "#2D6A4F",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    maxWidth: 80,
  },
  stepLineActive: {
    backgroundColor: "#2D6A4F",
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
  stepLabelActive: {
    color: "#2D6A4F",
    fontFamily: "Inter_600SemiBold",
  },

  // ── Common ──
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

  // ── MFA / OTP ──
  demoBadge: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    backgroundColor: "rgba(45,106,79,0.07)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(45,106,79,0.18)",
    padding: 12,
  },
  demoBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#2D6A4F",
    flex: 1,
    flexBasis: "60%",
  },
  demoCode: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1B3A2A",
    letterSpacing: 4,
  },
  countdownPill: {
    backgroundColor: "#2D6A4F",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countdownText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  otpBoxFilled: {
    borderColor: "#2D6A4F",
    backgroundColor: "rgba(45,106,79,0.05)",
  },
});

const bottomNav = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
  tabLabelActive: {
    color: SIDEBAR_ACTIVE,
    fontFamily: "Inter_600SemiBold",
  },
});

const mobileHeader = StyleSheet.create({
  bar: {
    backgroundColor: SIDEBAR_BG,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: SIDEBAR_ACTIVE,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  badge: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: SIDEBAR_ACTIVE,
    backgroundColor: "rgba(82,183,136,0.2)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
    overflow: "hidden",
  },
});
