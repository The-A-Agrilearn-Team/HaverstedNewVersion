
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { useAdminStats } from "@/hooks/useAdmin";

 

const C = Colors.light;

 

const NAV_ITEMS = [
  { label: "Users",       sub: "Manage accounts & roles", icon: "users",     color: "#3B82F6", route: "/admin/users" },
  { label: "Listings",    sub: "Moderate marketplace",    icon: "package",   color: "#F2994A", route: "/admin/listings" },
  { label: "Modules",     sub: "Manage learning content", icon: "book-open", color: "#2D6A4F", route: "/admin/modules" },
  { label: "Activity Log",sub: "View recent actions",     icon: "activity",  color: "#7C3AED", route: "/admin/logs" },
];

 

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { data: stats, isLoading, refetch } = useAdminStats();

 

  const STAT_CARDS = [
    { label: "Total Users",    value: stats?.totalUsers ?? 0,    icon: "users",     color: "#3B82F6" },
    { label: "New Today",      value: stats?.newUsersToday ?? 0, icon: "user-plus",  color: "#059669" },
    { label: "Active Listings",value: stats?.activeListings ?? 0,icon: "shopping-bag",color: "#F2994A" },
    { label: "Modules",        value: stats?.totalModules ?? 0,  icon: "book-open",  color: "#2D6A4F" },
  ];

 

  return (
<ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={C.primary} />}
>
<View style={[styles.header, { paddingTop: insets.top + 16 }]}>
<View style={styles.adminBadge}>
<Feather name="shield" size={14} color="#fff" />
<Text style={styles.adminBadgeText}>Admin Panel</Text>
</View>
<Text style={styles.headerTitle}>Dashboard</Text>
<Text style={styles.headerSub}>Welcome back, {profile?.full_name?.split(" ")[0] ?? "Admin"}</Text>
</View>

 

      <View style={styles.statsGrid}>
        {isLoading
          ? <ActivityIndicator color={C.primary} style={{ padding: 20 }} />
          : STAT_CARDS.map((s) => (
<View key={s.label} style={styles.statCard}>
<View style={[styles.statIcon, { backgroundColor: `${s.color}15` }]}>
<Feather name={s.icon as any} size={20} color={s.color} />
</View>
<Text style={styles.statValue}>{s.value}</Text>
<Text style={styles.statLabel}>{s.label}</Text>
</View>
          ))
        }
</View>

 

      <View style={styles.section}>
<Text style={styles.sectionLabel}>Management</Text>
<View style={styles.navGroup}>
          {NAV_ITEMS.map((item, i) => (
<Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.navRow,
                i < NAV_ITEMS.length - 1 && styles.navRowBorder,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => router.push(item.route as any)}
>
<View style={[styles.navIcon, { backgroundColor: `${item.color}15` }]}>
<Feather name={item.icon as any} size={20} color={item.color} />
</View>
<View style={{ flex: 1 }}>
<Text style={styles.navLabel}>{item.label}</Text>
<Text style={styles.navSub}>{item.sub}</Text>
</View>
<Feather name="chevron-right" size={18} color={C.textTertiary} />
</Pressable>
          ))}
</View>
</View>

 

      <View style={{ height: 60 }} />
</ScrollView>
  );
}

 

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: C.primary,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  adminBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 4 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 26, fontFamily: "Inter_700Bold", color: C.text },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10,
  },
  navGroup: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  navRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  navRowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  navIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  navSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
});

