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

const ROLES = [
  { key: "farmer", label: "Farmer", icon: "sun", desc: "Sell produce & learn" },
  { key: "buyer", label: "Buyer", icon: "shopping-bag", desc: "Buy from farmers" },
  { key: "retailer", label: "Retailer", icon: "briefcase", desc: "Bulk purchasing" },
];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await signUp(email.trim().toLowerCase(), password, fullName, role);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRegisteredEmail(email.trim().toLowerCase());
      setVerificationSent(true);
    }
  };

  if (verificationSent) {
    return (
      <View
        style={[
          styles.verifyContainer,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.verifyIconCircle}>
          <Feather name="mail" size={36} color={C.primary} />
        </View>
        <Text style={styles.verifyTitle}>Check your email</Text>
        <Text style={styles.verifySubtitle}>
          We sent a verification link to{"\n"}
          <Text style={{ color: C.primary, fontFamily: "Inter_600SemiBold" }}>
            {registeredEmail}
          </Text>
          {"\n\n"}
          Open the link in your email to confirm your account, then come back here to sign in.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.primaryButtonText}>Go to Sign In</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.linkButton, { opacity: pressed ? 0.6 : 1, marginTop: 8 }]}
          onPress={() => setVerificationSent(false)}
        >
          <Text style={styles.linkText}>
            Wrong email? <Text style={{ color: C.primary }}>Try again</Text>
          </Text>
        </Pressable>
      </View>
    );
  }

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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join AgriLearn to start learning and selling</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={C.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={18} color={C.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={C.textTertiary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

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
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={C.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 48 }]}
                placeholder="Min 6 characters"
                placeholderTextColor={C.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={C.textSecondary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <Pressable
                  key={r.key}
                  style={[
                    styles.roleCard,
                    role === r.key && styles.roleCardSelected,
                  ]}
                  onPress={() => {
                    setRole(r.key);
                    Haptics.selectionAsync();
                  }}
                >
                  <Feather
                    name={r.icon as any}
                    size={22}
                    color={role === r.key ? C.primary : C.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleLabel,
                      role === r.key && styles.roleLabelSelected,
                    ]}
                  >
                    {r.label}
                  </Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { opacity: pressed || loading ? 0.85 : 1 },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.linkButton, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.linkText}>Already have an account? <Text style={{ color: C.primary }}>Sign in</Text></Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1 },
  header: { marginTop: 8, marginBottom: 28 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary },
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
  input: { flex: 1, padding: 14, fontSize: 16, fontFamily: "Inter_400Regular", color: C.text },
  eyeButton: { position: "absolute", right: 14, padding: 4 },
  roleRow: { flexDirection: "row", gap: 10 },
  roleCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
    gap: 4,
  },
  roleCardSelected: {
    borderColor: C.primary,
    backgroundColor: `${C.primary}08`,
  },
  roleLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  roleLabelSelected: { color: C.primary },
  roleDesc: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textTertiary, textAlign: "center" },
  primaryButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  linkButton: { alignItems: "center", paddingVertical: 4 },
  linkText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  verifyContainer: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  verifyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: `${C.primary}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  verifyTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: C.text,
    textAlign: "center",
    marginBottom: 12,
  },
  verifySubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
});
