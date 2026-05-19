import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
const COOLDOWN_SECONDS = 60;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setEmailNotConfirmed(false);
    setResendSuccess(false);
    setResendError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result.error) {
      if (result.emailNotConfirmed) {
        setEmailNotConfirmed(true);
        setError("");
      } else {
        setError("Invalid email or password. Please try again.");
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismissAll();
    }
  };

  const handleResend = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setResendError("Enter your email address above first.");
      return;
    }
    setResendLoading(true);
    setResendError("");
    setResendSuccess(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await resendVerificationEmail(normalizedEmail);
    setResendLoading(false);
    if (result.error) {
      setResendError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setResendSuccess(true);
      startCooldown();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAdminLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.dismissAll();
    router.replace("/admin");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Feather name="feather" size={32} color={C.primary} />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your AgriLearn account</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={C.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {emailNotConfirmed ? (
            <View style={styles.verifyBanner}>
              <View style={styles.verifyBannerHeader}>
                <Feather name="mail" size={18} color="#92400E" />
                <Text style={styles.verifyBannerTitle}>Email not verified</Text>
              </View>
              <Text style={styles.verifyBannerBody}>
                Please check your inbox and click the verification link to activate your account.
                If you can't find it, we can send it again.
              </Text>

              {resendSuccess ? (
                <View style={styles.resendSuccessRow}>
                  <Feather name="check-circle" size={14} color={C.primary} />
                  <Text style={styles.resendSuccessText}>
                    Verification email sent!
                    {cooldown > 0 ? ` Resend again in ${cooldown}s.` : ""}
                  </Text>
                </View>
              ) : null}

              {resendError ? (
                <Text style={styles.resendErrorText}>{resendError}</Text>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.resendButton,
                  (cooldown > 0 || resendLoading) && styles.resendButtonDisabled,
                  { opacity: pressed && cooldown === 0 && !resendLoading ? 0.85 : 1 },
                ]}
                onPress={handleResend}
                disabled={cooldown > 0 || resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color={C.primary} />
                ) : (
                  <>
                    <Feather name="send" size={14} color={cooldown > 0 ? C.textSecondary : C.primary} />
                    <Text style={[styles.resendButtonText, cooldown > 0 && { color: C.textSecondary }]}>
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={C.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={C.textTertiary}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (emailNotConfirmed) setEmailNotConfirmed(false);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={C.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 48 }]}
                placeholder="••••••••"
                placeholderTextColor={C.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={C.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.forgotButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={styles.forgotButtonText}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { opacity: pressed || loading ? 0.85 : 1 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.adminSection}>
            <View style={styles.adminSectionHeader}>
              <Feather name="shield" size={14} color={C.error} />
              <Text style={styles.adminSectionLabel}>Staff / Admin Access</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.adminButton,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleAdminLogin}
            >
              <Feather name="shield" size={18} color={C.error} />
              <Text style={styles.adminButtonText}>Login as Administrator</Text>
            </Pressable>
            <Text style={styles.adminHint}>
              Uses fixed system credentials. Contact your supervisor for access.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.replace("/(auth)/register")}
          >
            <Text style={styles.secondaryButtonText}>Create an Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1 },
  header: { alignItems: "center", marginTop: 24, marginBottom: 36 },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: `${C.primary}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: C.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
  },
  form: { gap: 16 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${C.error}12`,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  errorText: { fontSize: 14, color: C.error, fontFamily: "Inter_500Medium", flex: 1 },

  verifyBanner: {
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FCD34D",
    padding: 16,
    gap: 10,
  },
  verifyBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifyBannerTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#92400E",
  },
  verifyBannerBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#78350F",
    lineHeight: 19,
  },
  resendSuccessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resendSuccessText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: C.primary,
    flex: 1,
  },
  resendErrorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.error,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: `${C.primary}12`,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: `${C.primary}30`,
    alignSelf: "flex-start",
  },
  resendButtonDisabled: {
    backgroundColor: C.surface,
    borderColor: C.border,
  },
  resendButtonText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.primary,
  },

  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: C.text,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginTop: -6,
  },
  forgotButtonText: {
    color: C.primary,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  primaryButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 13, color: C.textSecondary, fontFamily: "Inter_400Regular" },
  adminSection: {
    backgroundColor: `${C.error}08`,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: `${C.error}20`,
    padding: 16,
    gap: 12,
  },
  adminSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adminSectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.error,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: `${C.error}12`,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${C.error}30`,
  },
  adminButtonText: {
    color: C.error,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  adminHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textTertiary,
    textAlign: "center",
  },
  secondaryButton: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  secondaryButtonText: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
