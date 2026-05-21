import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";


const C = Colors.light;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();



  

  

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* Header */}
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Messages</Text>
          
        </View>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      >
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.background,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  navCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  navBadge: {
    backgroundColor: C.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  navBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  empty: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  ctaBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.primary },
  list: { paddingTop: 8 },
  threadCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.background,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  threadCardUnread: {
    backgroundColor: `${C.primary}04`,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${C.primary}18`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
  },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.primary },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primary,
    borderWidth: 2,
    borderColor: C.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  unreadDotText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  threadTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  threadName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: C.text,
    flex: 1,
  },
  threadNameBold: { fontFamily: "Inter_700Bold" },
  threadTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.textTertiary,
    flexShrink: 0,
    marginLeft: 8,
  },
  listingTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${C.primary}10`,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  listingTagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: C.primary,
    maxWidth: 180,
  },
  threadPreview: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  threadPreviewBold: {
    fontFamily: "Inter_500Medium",
    color: C.text,
  },
});
