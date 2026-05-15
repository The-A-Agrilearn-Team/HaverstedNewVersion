import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";

const C = Colors.light;

type Status = "loading" | "verified" | "recovery" | "error";

function paramsFromUrl(url: string) {
  const hashPart = url.includes("#") ? url.split("#")[1] : "";
  const queryPart = url.includes("?") ? url.split("?")[1].split("#")[0] : "";
  const combined = [queryPart, hashPart].filter(Boolean).join("&");
  return new URLSearchParams(combined);
}

export default function AuthCallbackScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processUrl = async (url: string | null) => {
      if (!url) {
        setErrorMessage("No authentication data found in the link.");
        setStatus("error");
        return;
      }

      const params = paramsFromUrl(url);
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");

      if (errorParam) {
        setErrorMessage(errorDescription || errorParam);
        setStatus("error");
        return;
      }

      const code = params.get("code");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setErrorMessage(error.message);
            setStatus("error");
            return;
          }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            setErrorMessage(error.message);
            setStatus("error");
            return;
          }
        } else {
          setErrorMessage("Invalid or expired link. Please request a new one.");
          setStatus("error");
          return;
        }

        if (type === "recovery") {
          setStatus("recovery");
        } else {
          setStatus("verified");
        }
      } catch {
        setErrorMessage("Something went wrong. Please try again.");
        setStatus("error");
      }
    };

    Linking.getInitialURL().then(processUrl);
  }, []);

  const handleGoToLogin = () => {
    router.replace("/(auth)/login");
  };

  const handleGoToReset = () => {
    router.replace("/(auth)/forgot-password");
  };

  if (status === "loading") {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Verifying your link…</Text>
      </View>
    );
  }

  if (status === "verified") {
    return (
      <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.iconCircle, { backgroundColor: `${C.success}18` }]}>
          <Feather name="check-circle" size={40} color={C.success} />
        </View>
        <Text style={styles.title}>Email verified!</Text>
        <Text style={styles.subtitle}>
          Your email address has been successfully confirmed. You can now sign in to your AgriLearn account.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleGoToLogin}
        >
          <Text style={styles.buttonText}>Go to Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (status === "recovery") {
    return (
      <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.iconCircle, { backgroundColor: `${C.primary}18` }]}>
          <Feather name="lock" size={40} color={C.primary} />
        </View>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Your recovery link has been verified. Tap the button below to set a new password for your account.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleGoToReset}
        >
          <Text style={styles.buttonText}>Set New Password</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.iconCircle, { backgroundColor: `${C.error}18` }]}>
        <Feather name="alert-circle" size={40} color={C.error} />
      </View>
      <Text style={styles.title}>Link invalid</Text>
      <Text style={styles.subtitle}>{errorMessage}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
        onPress={handleGoToLogin}
      >
        <Text style={styles.buttonText}>Back to Sign In</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: C.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
});
