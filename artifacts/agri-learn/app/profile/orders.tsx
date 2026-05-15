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
import { useOrders, Order } from "@/hooks/useOrders";

const C = Colors.light;

const STATUS_CONFIG: Record<Order["status"], { label: string; color: string; bg: string; icon: string }> = {
  confirmed:        { label: "Confirmed",        color: "#2563EB", bg: "#EFF6FF", icon: "check-circle" },
  ready_for_pickup: { label: "Ready for Pickup", color: "#D97706", bg: "#FFFBEB", icon: "package" },
  completed:        { label: "Completed",        color: "#059669", bg: "#F0FDF4", icon: "check-circle" },
  cancelled:        { label: "Cancelled",        color: "#DC2626", bg: "#FEF2F2", icon: "x-circle" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { data: orders = [], isLoading, refetch } = useOrders();

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const buyerOrders  = orders.filter((o) => o.buyer_id  === user?.id);
  const farmerOrders = orders.filter((o) => o.farmer_id === user?.id);

  const renderOrder = (order: Order) => {
    const cfg = STATUS_CONFIG[order.status];
    const isBuyer = order.buyer_id === user?.id;
    const counterparty = isBuyer ? order.farmer_name : order.buyer_name;
    const total = (order.quantity * order.price_per_unit).toFixed(2);

    return (
      <Pressable
        key={order.id}
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.93 : 1 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/profile/order-detail?orderId=${order.id}` as any);
        }}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{order.listing_title}</Text>
            <View style={styles.counterpartyRow}>
              <Feather name="user" size={11} color={C.textSecondary} />
              <Text style={styles.counterpartyText}>
                {isBuyer ? "Farmer" : "Buyer"}: {counterparty}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Feather name={cfg.icon as any} size={11} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Quantity</Text>
            <Text style={styles.metaValue}>{order.quantity} {order.unit}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Price/unit</Text>
            <Text style={styles.metaValue}>R{Number(order.price_per_unit).toFixed(2)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Total</Text>
            <Text style={[styles.metaValue, styles.totalValue]}>R{total}</Text>
          </View>
          <Text style={styles.dateText}>{timeAgo(order.created_at)}</Text>
        </View>
      </Pressable>
    );
  };

  const renderSection = (title: string, list: Order[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {list.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptySectionText}>No orders here yet.</Text>
        </View>
      ) : (
        list.map(renderOrder)
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>My Orders</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: insets.bottom + 60 }}
      >
        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ paddingTop: 80 }} />
        ) : orders.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="shopping-bag" size={36} color={C.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>
              Orders are created when a farmer accepts your offer in a chat conversation.
            </Text>
            <Pressable style={styles.ctaBtn} onPress={() => router.replace("/(tabs)/market")}>
              <Feather name="shopping-bag" size={15} color={C.primary} />
              <Text style={styles.ctaBtnText}>Browse Marketplace</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {buyerOrders.length > 0 && renderSection("As Buyer", buyerOrders)}
            {farmerOrders.length > 0 && renderSection("As Farmer", farmerOrders)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, marginTop: 8,
  },
  card: {
    backgroundColor: C.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  counterpartyRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  counterpartyText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardDivider: { height: 1, backgroundColor: C.border, marginVertical: 10 },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 16 },
  metaItem: { gap: 2 },
  metaLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textTertiary, textTransform: "uppercase" },
  metaValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },
  totalValue: { color: C.primary },
  dateText: { marginLeft: "auto", fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary },
  empty: { alignItems: "center", gap: 12, paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 21 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: C.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  ctaBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.primary },
  emptySection: { backgroundColor: C.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
  emptySectionText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center" },
});
