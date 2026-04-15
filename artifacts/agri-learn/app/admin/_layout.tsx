
import { Feather } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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
import Colors from "@/constants/colors";
import ADMIN_CONFIG from "@/constants/adminConfig";

 

const C = Colors.light;

 

export default function AdminLayout() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

 

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

 

    const emailMatch =
      email.trim().toLowerCase() === ADMIN_CONFIG.email.toLowerCase();
    const passMatch = password === ADMIN_CONFIG.password;

 

    if (!emailMatch || !passMatch) {
      setLoading(false);
      setError("Incorrect admin credentials. Please try again.");
      return;
    }

 

    const result = await signIn(ADMIN_CONFIG.email, ADMIN_CONFIG.password);
    setLoading(false);

 

    if (result.error) {
      setError(
        "Admin account not found in the system. Please follow the setup instructions in the README."
      );
      return;
    }

 

    setVerified(true);
  };

 

  if (!verified) {
    return (
<KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: C.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
>
<View style={[styles.gateContainer, { paddingTop: insets.top + 32 }]}>
<View style={styles.gateIconBox}>
<Feather name="shield" size={32} color={C.error} />
</View>
<Text style={styles.gateTitle}>Admin Verification</Text>
<Text style={styles.gateSub}>
            Enter your administrator credentials to continue.
</Text>

 

          {error ? (
<View style={styles.errorBox}>
<Feather name="alert-circle" size={15} color={C.error} />
<Text style={styles.errorText}>{error}</Text>
</View>
          ) : null}

 

          <View style={styles.fieldGroup}>
<Text style={styles.label}>Email</Text>
<View style={styles.inputWrapper}>
<Feather
                name="mail"
                size={17}
                color={C.textSecondary}
                style={styles.inputIcon}
              />
<TextInput
                style={styles.input}
                placeholder="admin@agrilearn.co.za"
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
<Feather
                name="lock"
                size={17}
                color={C.textSecondary}
                style={styles.inputIcon}
              />
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
                style={styles.eyeBtn}
>
<Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={17}
                  color={C.textSecondary}
                />
</Pressable>
</View>
</View>

 

          <Pressable
            style={({ pressed }) => [
              styles.verifyBtn,
              { opacity: pressed || loading ? 0.85 : 1 },
            ]}
            onPress={handleVerify}
            disabled={loading}
>
            {loading ? (
<ActivityIndicator color="#fff" />
            ) : (
<>
<Feather name="shield" size={18} color="#fff" />
<Text style={styles.verifyBtnText}>Verify & Enter</Text>
</>
            )}
</Pressable>

 

          <Pressable
            style={({ pressed }) => [
              styles.cancelBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.replace("/(tabs)")}
>
<Text style={styles.cancelBtnText}>Cancel</Text>
</Pressable>
</View>
</KeyboardAvoidingView>
    );
  }

 

  return (
<Stack
      screenOptions={{
        headerStyle: { backgroundColor: C.surface },
        headerTintColor: C.text,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
        headerShadowVisible: false,
        headerLeft: () => (
<Pressable
            onPress={() => router.back()}
            style={{ padding: 4, marginLeft: 4 }}
>
<Feather name="arrow-left" size={22} color={C.text} />
</Pressable>
        ),
      }}
>
<Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />
<Stack.Screen name="users" options={{ title: "User Management" }} />
<Stack.Screen
        name="listings"
        options={{ title: "Marketplace Moderation" }}
      />
<Stack.Screen name="modules" options={{ title: "Learning Modules" }} />
<Stack.Screen name="logs" options={{ title: "Activity Log" }} />
</Stack>
  );
}

 

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    paddingHorizontal: 28,
    gap: 16,
  },
  gateIconBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: `${C.error}12`,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 4,
  },
  gateTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: C.text,
    textAlign: "center",
  },
  gateSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${C.error}12`,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: C.error,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
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
  eyeBtn: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.error,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  verifyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  cancelBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  cancelBtnText: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});



