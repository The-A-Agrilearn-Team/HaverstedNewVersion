import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { useNotifications, useMarkAllRead, useMarkOneRead } from "@/hooks/useNotifications";

const C = Colors.light;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [tab, setTab] = useState<"inbox" | "tips">("inbox");

  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markOneRead = useMarkOneRead();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAllRead.mutate();
  };

  const handleTapNotification = (id: string, isRead: boolean) => {
    if (!isRead) {
      markOneRead.mutate(id);
    }
  };

  const isFarmer = profile?.role === "farmer" || profile?.role === "retailer";

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Messages</Text>
          {unreadCount > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <Pressable style={styles.navBtn} onPress={handleMarkAllRead}>
            <Feather name="check-square" size={20} color={C.primary} />
          </Pressable>
        ) : (
          <View style={styles.navBtn} />
        )}
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "inbox" && styles.tabActive]}
          onPress={() => setTab("inbox")}
        >
          <Text style={[styles.tabText, tab === "inbox" && styles.tabTextActive]}>
            Inbox {unreadCount > 0 ? `(${unreadCount})` : ""}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "tips" && styles.tabActive]}
          onPress={() => setTab("tips")}
        >
          <Text style={[styles.tabText, tab === "tips" && styles.tabTextActive]}>Tips</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />
        }
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 60 }}
      >
        {tab === "inbox" ? (
          <>
            {isLoading ? (
              <ActivityIndicator color={C.primary} style={{ paddingTop: 60 }} />
            ) : !isFarmer ? (
              <View style={styles.infoBanner}>
                <Feather name="info" size={18} color={C.primary} />
                <Text style={styles.infoText}>
                  As a buyer, use the "Contact Seller" button on any listing to reach a farmer directly.
                </Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Feather name="inbox" size={36} color={C.textTertiary} />
                </View>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySub}>
                  When buyers express interest in your listings, their enquiries will appear here.
                </Text>
                <Pressable
                  style={styles.marketBtn}
                  onPress={() => router.replace("/(tabs)/market")}
                >
                  <Feather name="shopping-bag" size={15} color={C.primary} />
                  <Text style={styles.marketBtnText}>View Marketplace</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {unreadCount > 0 && (
                  <Pressable style={styles.markAllRow} onPress={handleMarkAllRead}>
                    <Text style={styles.markAllText}>Mark all as read</Text>
                  </Pressable>
                )}
                {notifications.map((n) => (
                  <Pressable
                    key={n.id}
                    style={[styles.card, !n.is_read && styles.cardUnread]}
                    onPress={() => handleTapNotification(n.id, n.is_read)}
                  >
                    <View style={styles.cardIcon}>
                      <Feather name="user" size={20} color={C.primary} />
                      {!n.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.cardTopRow}>
                        <Text style={[styles.cardSender, !n.is_read && { color: C.text }]}>
                          {n.buyer_name}
                        </Text>
                        <Text style={styles.cardTime}>{timeAgo(n.created_at)}</Text>
                      </View>
                      <View style={styles.listingTag}>
                        <Feather name="package" size={11} color={C.primary} />
                        <Text style={styles.listingTagText} numberOfLines={1}>{n.listing_title}</Text>
                      </View>
                      <Text style={styles.cardMessage} numberOfLines={3}>{n.message}</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}
          </>
        ) : (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Tips to get more enquiries</Text>
            {[
              { icon: "camera", tip: "Add a clear harvest photo to your listing" },
              { icon: "file-text", tip: "Write a detailed product description" },
              { icon: "map-pin", tip: "Include your exact location for local buyers" },
              { icon: "tag", tip: "Price your produce competitively" },
              { icon: "refresh-cw", tip: "Keep your listing status up to date" },
            ].map((t, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <Feather name={t.icon as any} size={14} color={C.primary} />
                </View>
                <Text style={styles.tipText}>{t.tip}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  navBadge: { backgroundColor: C.error, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  navBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  tabs: { flexDirection: "row", backgroundColor: C.surfaceSecondary, margin: 16, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: C.border },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 9 },
  tabActive: { backgroundColor: C.surface, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.textSecondary },
  tabTextActive: { color: C.text, fontFamily: "Inter_600SemiBold" },
  infoBanner: { flexDirection: "row", gap: 10, backgroundColor: `${C.primary}10`, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${C.primary}20`, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 20 },
  empty: { alignItems: "center", gap: 12, paddingVertical: 40, paddingHorizontal: 16 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 21 },
  marketBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: C.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  marketBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.primary },
  markAllRow: { alignItems: "flex-end" },
  markAllText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.primary },
  card: { flexDirection: "row", gap: 12, backgroundColor: C.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border, alignItems: "flex-start" },
  cardUnread: { borderColor: `${C.primary}40`, backgroundColor: `${C.primary}05` },
  cardIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" },
  unreadDot: { position: "absolute", top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: C.error, borderWidth: 1.5, borderColor: C.background },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardSender: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  cardTime: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary },
  listingTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${C.primary}10`, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, alignSelf: "flex-start" },
  listingTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.primary, maxWidth: 200 },
  cardMessage: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 19 },
  tipsCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 14 },
  tipsTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 19 },
});
