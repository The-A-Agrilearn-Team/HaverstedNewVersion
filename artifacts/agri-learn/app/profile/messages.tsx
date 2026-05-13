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
import { useConversations, useUnreadCount } from "@/hooks/useNotifications";

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

  const { data: conversations = [], isLoading, refetch } = useConversations();
  const { data: totalUnread = 0 } = useUnreadCount();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const openChat = (conv: typeof conversations[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/profile/chat" as any,
      params: {
        listingId: conv.listingId ?? "",
        otherId: conv.otherUserId,
        otherName: conv.otherName,
        listingTitle: conv.listingTitle,
      },
    });
  };

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
          {totalUnread > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{totalUnread > 99 ? "99+" : totalUnread}</Text>
            </View>
          )}
        </View>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      >
        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ paddingTop: 80 }} />
        ) : conversations.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="message-circle" size={36} color={C.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>
              {profile?.role === "farmer"
                ? "When buyers contact you about your listings, conversations will appear here."
                : "Browse the marketplace and tap \"Contact Seller\" on a listing to start a conversation."}
            </Text>
            <Pressable
              style={styles.ctaBtn}
              onPress={() => router.replace("/(tabs)/market")}
            >
              <Feather name="shopping-bag" size={15} color={C.primary} />
              <Text style={styles.ctaBtnText}>Go to Marketplace</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {conversations.map((conv) => {
              const isLastMine = conv.lastMessageSenderId === user?.id;
              const preview = (isLastMine ? "You: " : "") + (conv.lastMessageText.length > 60 ? conv.lastMessageText.slice(0, 60) + "…" : conv.lastMessageText);

              return (
                <Pressable
                  key={conv.threadKey}
                  style={({ pressed }) => [
                    styles.threadCard,
                    conv.unreadCount > 0 && styles.threadCardUnread,
                    { opacity: pressed ? 0.93 : 1 },
                  ]}
                  onPress={() => openChat(conv)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(conv.otherName)}</Text>
                    {conv.unreadCount > 0 && (
                      <View style={styles.unreadDot}>
                        <Text style={styles.unreadDotText}>
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.threadTop}>
                      <Text
                        style={[styles.threadName, conv.unreadCount > 0 && styles.threadNameBold]}
                        numberOfLines={1}
                      >
                        {conv.otherName}
                      </Text>
                      <Text style={styles.threadTime}>{timeAgo(conv.lastMessageTime)}</Text>
                    </View>

                    {!!conv.listingTitle && (
                      <View style={styles.listingTag}>
                        <Feather name="package" size={10} color={C.primary} />
                        <Text style={styles.listingTagText} numberOfLines={1}>
                          {conv.listingTitle}
                        </Text>
                      </View>
                    )}

                    <Text
                      style={[styles.threadPreview, conv.unreadCount > 0 && styles.threadPreviewBold]}
                      numberOfLines={1}
                    >
                      {preview}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={16} color={C.textTertiary} style={{ flexShrink: 0 }} />
                </Pressable>
              );
            })}
          </View>
        )}
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
