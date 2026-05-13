import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { useOrders, Order } from "@/hooks/useOrders";

const C = Colors.light;

const STATUS_CONFIG: Record<Order["status"], { label: string; bg: string; color: string; icon: string }> = {
  confirmed:        { label: "Confirmed",        bg: "#DBEAFE", color: "#2563EB", icon: "check-circle" },
  ready_for_pickup: { label: "Ready for Pickup", bg: "#FEF3C7", color: "#D97706", icon: "package" },
  completed:        { label: "Completed",        bg: "#D1FAE5", color: "#059669", icon: "star" },
  cancelled:        { label: "Cancelled",        bg: "#FEE2E2", color: "#DC2626", icon: "x-circle" },
};

type Tab = "all" | "buying" | "selling";

const TABS: { key: Tab; label: string }[] = [
  { key: "all",     label: "All Orders" },
  { key: "buying",  label: "Buying" },
  { key: "selling", label: "Selling" },
];

function StatusBadge({ status }: { status: Order["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Feather name={cfg.icon as any} size={11} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function OrderCard({ order, userId }: { order: Order; userId: string }) {
  const isBuyer = order.buyer_id === userId;
  const otherParty = isBuyer ? order.farmer_name : order.buyer_name;
  const otherRole  = isBuyer ? "Farmer" : "Buyer";
  const total = (order.quantity * order.price_per_unit).toFixed(2);
  const date = new Date(order.created_at).toLocaleDateString([], {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
      onPress={() => {
        Haptics.selectionAsync();
        router.push({ pathname: "/profile/order-detail", params: { orderId: order.id } });
      }}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <Text style={styles.listingTitle}>{order.listing_title}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Feather name="chevron-right" size={18} color={C.textTertiary} />
      </View>

      <View style={styles.divider} />

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Feather name="user" size={13} color={C.textSecondary} />
          <Text style={styles.metaLabel}>{otherRole}</Text>
          <Text style={styles.metaValue}>{otherParty}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="layers" size={13} color={C.textSecondary} />
          <Text style={styles.metaLabel}>Qty</Text>
          <Text style={styles.metaValue}>{order.quantity} {order.unit}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="tag" size={13} color={C.textSecondary} />
          <Text style={styles.metaLabel}>Total</Text>
          <Text style={[styles.metaValue, { color: C.primary }]}>R{total}</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View style={[styles.rolePill, isBuyer ? styles.rolePillBuyer : styles.rolePillSeller]}>
          <Text style={[styles.rolePillText, isBuyer ? styles.rolePillTextBuyer : styles.rolePillTextSeller]}>
            {isBuyer ? "Buying" : "Selling"}
          </Text>
        </View>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </Pressable>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { icon: string; title: string; body: string }> = {
    all:     { icon: "shopping-bag", title: "No orders yet",         body: "Your orders will appear here once you buy or sell produce." },
    buying:  { icon: "shopping-cart", title: "No purchases yet",     body: "Browse the market and make an offer to get started." },
    selling: { icon: "sun",          title: "No sales yet",          body: "When buyers accept your listings, orders will appear here." },
  };
  const m = messages[tab];
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Feather name={m.icon as any} size={32} color={C.primary} />
      </View>
      <Text style={styles.emptyTitle}>{m.title}</Text>
      <Text style={styles.emptyBody}>{m.body}</Text>
      {tab !== "selling" && (
        <Pressable
          style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.push("/(tabs)/market")}
        >
          <Text style={styles.emptyBtnText}>Browse Market</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: orders = [], isLoading, refetch, isRefetching } = useOrders();
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered = orders.filter((o) => {
    if (activeTab === "buying")  return o.buyer_id === user?.id;
    if (activeTab === "selling") return o.farmer_id === user?.id;
    return true;
  });

  if (!user) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.navBar}>
          <Pressable style={styles.navBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.navTitle}>My Orders</Text>
          <View style={styles.navBtn} />
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Feather name="lock" size={32} color={C.primary} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <Text style={styles.emptyBody}>You need to be signed in to see your purchase and sale history.</Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.emptyBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>My Orders</Text>
        <View style={styles.navBtn} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(t.key);
            }}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
            {activeTab === t.key && filtered.length > 0 && (
              <View style={styles.tabCount}>
                <Text style={styles.tabCountText}>{filtered.length}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Loading orders…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            filtered.length === 0 && styles.listEmpty,
            { paddingBottom: insets.bottom + 32 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }
        >
          {filtered.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            filtered.map((order) => (
              <OrderCard key={order.id} order={order} userId={user.id} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },

  tabRow: {
    flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 8, borderRadius: 10,
    backgroundColor: C.surfaceSecondary,
  },
  tabActive: { backgroundColor: C.primary },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  tabTextActive: { color: "#fff" },
  tabCount: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  tabCountText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },

  list: { padding: 16, gap: 12 },
  listEmpty: { flex: 1 },

  card: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 14, gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  cardTopLeft: { flex: 1, gap: 6 },
  listingTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.text },

  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  divider: { height: 1, backgroundColor: C.borderLight },

  cardMeta: { flexDirection: "row", gap: 8 },
  metaItem: { flex: 1, gap: 2 },
  metaLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textTertiary, textTransform: "uppercase" },
  metaValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },

  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rolePill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  rolePillBuyer: { backgroundColor: "#EFF6FF" },
  rolePillSeller: { backgroundColor: "#F0FDF4" },
  rolePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  rolePillTextBuyer: { color: "#2563EB" },
  rolePillTextSeller: { color: "#059669" },
  dateText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: `${C.primary}15`, alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text, textAlign: "center" },
  emptyBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 20 },
  emptyBtn: {
    marginTop: 8, backgroundColor: C.primary, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
