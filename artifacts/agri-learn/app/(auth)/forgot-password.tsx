import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const C = Colors.light;

type Mode = "request" | "update";

function paramsFromUrl(url: string) {
  const [, hash = ""] = url.split("#");
  const query = url.includes("?") ? url.split("?")[1].split("#")[0] : "";
  return new URLSearchParams([query, hash].filter(Boolean).join("&"));
}

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { session, requestPasswordReset, updatePassword } = useAuth();
  const [mode, setMode] = useState<Mode>(session ? "update" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session && mode === "request") {
      setMode("update");
      setMessage("Enter a new password for your account.");
    }
  }, [session, mode]);

  useEffect(() => {
    const handleRecoveryUrl = async (url: string | null) => {
      if (!url) return;
      const params = paramsFromUrl(url);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const code = params.get("code");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setError(error.message);
          return;
        }
        setMode("update");
        setMessage("Enter a new password for your account.");
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(error.message);
          return;
        }
        setMode("update");
        setMessage("Enter a new password for your account.");
      }
    };

    Linking.getInitialURL().then(handleRecoveryUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleRecoveryUrl(url);
    });

    return () => subscription.remove();
  }, []);

  const handleSendReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await requestPasswordReset(normalizedEmail);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setMessage("If an account exists for this email, a password reset link has been sent. Open the link to set a new password.");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("Your password has been updated successfully. You can now sign in with your new password.");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const isUpdateMode = mode === "update";

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
          <View style={styles.iconContainer}>
            <Feather name={isUpdateMode ? "lock" : "mail"} size={30} color={C.primary} />
          </View>
          <Text style={styles.title}>{isUpdateMode ? "Set a new password" : "Forgot password?"}</Text>
          <Text style={styles.subtitle}>
            {isUpdateMode
              ? "Choose a secure password to update your AgriLearn account."
              : "Enter your account email and we will send you a secure reset link."}
          </Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={C.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={styles.successBox}>
              <Feather name="check-circle" size={16} color={C.primary} />
              <Text style={styles.successText}>{message}</Text>
            </View>
          ) : null}

          {isUpdateMode ? (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>New password</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color={C.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 48 }]}
                    placeholder="••••••••"
                    placeholderTextColor={C.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
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

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm new password</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color={C.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={C.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { opacity: pressed || loading ? 0.85 : 1 },
                ]}
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Update Password</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
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

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { opacity: pressed || loading ? 0.85 : 1 },
                ]}
                onPress={handleSendReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                )}
              </Pressable>
            </>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1 },
  header: { alignItems: "center", marginTop: 24, marginBottom: 36 },
  iconContainer: {
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
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
  successBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: `${C.primary}12`,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  successText: { fontSize: 14, color: C.primary, fontFamily: "Inter_500Medium", flex: 1, lineHeight: 20 },
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
