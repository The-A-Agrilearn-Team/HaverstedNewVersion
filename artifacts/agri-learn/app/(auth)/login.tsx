import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result.error) {
      setError("Invalid email or password");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismissAll();
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

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={C.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={C.textTertiary}
                value={email}
                onChangeText={setEmail}
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
