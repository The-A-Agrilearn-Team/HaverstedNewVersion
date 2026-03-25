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
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";
import { useSupplyWindows, SupplyWindow } from "@/hooks/useWindows";

const C = Colors.light;

const STATUS_COLOR: Record<string, string> = {
  open: C.success,
  filled: C.primary,
  closed: C.textTertiary,
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  filled: "Filled",
  closed: "Closed",
};

const CAT_ICONS: Record<string, string> = {
  Vegetables: "layers",
  Fruits: "sun",
  Grains: "wind",
  Livestock: "heart",
  Poultry: "feather",
  Dairy: "droplet",
  Other: "package",
};

export default function WindowsScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [refreshing, setRefreshing] = useState(false);

  const isRetailer = profile?.role === "retailer" || profile?.role === "admin";
  const isFarmer = profile?.role === "farmer" || profile?.role === "admin";

  const { data: myWindows = [], isLoading: myLoading, refetch: refetchMy } = useSupplyWindows(
    { retailerId: user?.id }
  );
  const { data: openWindows = [], isLoading: openLoading, refetch: refetchOpen } = useSupplyWindows(
    { status: "open" }
  );

  const displayWindows = activeTab === "my" ? myWindows : openWindows;
  const isLoading = activeTab === "my" ? myLoading : openLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchMy(), refetchOpen()]);
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 60 }]}>
        <Feather name="lock" size={40} color={C.textTertiary} />
        <Text style={styles.gateTitle}>Sign In Required</Text>
        <Text style={styles.gateText}>Create an account to access Supply Windows.</Text>
        <Pressable style={styles.gateBtn} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.gateBtnText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (!isRetailer && !isFarmer) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 60 }]}>
        <Feather name="briefcase" size={40} color={C.textTertiary} />
        <Text style={styles.gateTitle}>Not Available</Text>
        <Text style={styles.gateText}>Supply Windows are for retailers and farmers only.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topBarRow}>
          <View>
            <Text style={styles.pageTitle}>Supply Windows</Text>
            <Text style={styles.pageSubtitle}>
              {isRetailer ? "Post your supply needs, receive farmer applications" : "Browse open windows and apply"}
            </Text>
          </View>
          {isRetailer && (
            <Pressable
              style={styles.newBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/window/create");
              }}
            >
              <Feather name="plus" size={20} color="#fff" />
              <Text style={styles.newBtnText}>Post</Text>
            </Pressable>
          )}
        </View>

        {isRetailer && (
          <View style={styles.segmentRow}>
            <Pressable
              style={[styles.segment, activeTab === "my" && styles.segmentActive]}
              onPress={() => setActiveTab("my")}
            >
              <Text style={[styles.segmentText, activeTab === "my" && styles.segmentTextActive]}>
                My Windows
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segment, activeTab === "all" && styles.segmentActive]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.segmentText, activeTab === "all" && styles.segmentTextActive]}>
                All Open
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 60 }} />
        ) : displayWindows.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>
              {activeTab === "my" ? "No windows posted yet" : "No open windows"}
            </Text>
            {isRetailer && activeTab === "my" && (
              <Text style={styles.emptyText}>
                Post your first supply window to start receiving applications from farmers.
              </Text>
            )}
          </View>
        ) : (
          displayWindows.map((w) => (
            <WindowCard key={w.id} window={w} isFarmer={isFarmer && !isRetailer} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function WindowCard({ window: w, isFarmer }: { window: SupplyWindow; isFarmer: boolean }) {
  const daysLeft = Math.ceil((new Date(w.deadline).getTime() - Date.now()) / 86400000);
  const statusColor = STATUS_COLOR[w.status] ?? C.textTertiary;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.93 : 1 }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/window/${w.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.catIcon, { backgroundColor: `${C.primary}12` }]}>
          <Feather name={(CAT_ICONS[w.category] ?? "package") as any} size={20} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={2}>{w.title}</Text>
          <Text style={styles.cardRetailer}>{w.retailer_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABEL[w.status]}</Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{w.description}</Text>

      <View style={styles.cardMeta}>
        <MetaBit icon="package" label={`${w.quantity_needed.toLocaleString()} ${w.unit}`} />
        <MetaBit icon="tag" label={`R${w.price_offered.toFixed(2)}/${w.unit}`} />
        <MetaBit icon="map-pin" label={w.location} />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Feather name="clock" size={13} color={daysLeft < 3 ? C.error : C.textSecondary} />
          <Text style={[styles.footerText, daysLeft < 3 && { color: C.error }]}>
            {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left` : "Expired"}
          </Text>
        </View>
        <View style={styles.footerRight}>
          <Feather name="users" size={13} color={C.textSecondary} />
          <Text style={styles.footerText}>{w.applicant_count ?? 0} applicants</Text>
          {isFarmer && w.status === "open" && (
            <View style={styles.applyBadge}>
              <Text style={styles.applyBadgeText}>Apply →</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function MetaBit({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.metaBit}>
      <Feather name={icon as any} size={12} color={C.textSecondary} />
      <Text style={styles.metaBitText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: C.background, alignItems: "center", paddingHorizontal: 32, gap: 16 },
  gateTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  gateText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22 },
  gateBtn: { backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  gateBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  topBar: { backgroundColor: C.background, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  topBarRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: C.text },
  pageSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  newBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  segmentRow: { flexDirection: "row", backgroundColor: C.surfaceSecondary, borderRadius: 10, padding: 3 },
  segment: { flex: 1, paddingVertical: 7, alignItems: "center", borderRadius: 8 },
  segmentActive: { backgroundColor: C.surface, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  segmentText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  segmentTextActive: { color: C.text, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: "center", gap: 12, paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 20 },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  catIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text, flex: 1 },
  cardRetailer: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 20 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaBit: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.surfaceSecondary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  metaBitText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: 10 },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary },
  applyBadge: { backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  applyBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
