import { Feather } from "@expo/vector-icons";
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
import { useAuth } from "@/context/AuthContext";
import { useAdminStats } from "@/hooks/useAdmin";

const BG = "#F0F4F2";
const BANNER_GREEN = "#2D6A4F";
const CARD_BG = "#FFFFFF";
const LIVE_GREEN = "#2D9B6F";

function LiveBadge() {
  return (
    <View style={styles.liveBadge}>
      <Feather name="arrow-up-right" size={12} color={LIVE_GREEN} />
      <Text style={styles.liveText}>Live</Text>
    </View>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  sublabel,
  loading,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
  sublabel: string;
  loading?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardTop}>
        <View style={[styles.statIconBg, { backgroundColor: iconBg }]}>
          <Feather name={icon as any} size={20} color={iconColor} />
        </View>
        <LiveBadge />
      </View>
      {loading ? (
        <ActivityIndicator color="#9CA3AF" size="small" style={{ marginVertical: 8 }} />
      ) : (
        <Text style={styles.statValue}>{value}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sublabel}</Text>
    </View>
  );
}

function RLSErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorBanner}>
      <View style={styles.errorIconBox}>
        <Feather name="alert-triangle" size={22} color="#D97706" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.errorTitle}>Database Setup Required</Text>
        <Text style={styles.errorBody}>
          The database has a policy conflict (infinite recursion in RLS). Run the SQL fix to resolve it:
        </Text>
        <View style={styles.errorSteps}>
          <Text style={styles.errorStep}>1. Open your Supabase dashboard → SQL Editor</Text>
          <Text style={styles.errorStep}>2. Open the file: <Text style={styles.codePath}>supabase/fix_rls.sql</Text></Text>
          <Text style={styles.errorStep}>3. Paste and run it, then reload the app</Text>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.retryBtn, { opacity: pressed ? 0.7 : 1 }]}
         onPress={() => onRetry()}
      >
        <Feather name="refresh-cw" size={14} color="#2D6A4F" />
      </Pressable>
    </View>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { data: stats, isLoading, error, refetch } = useAdminStats();

  const isRLSError = (error as any)?.message === "RLS_RECURSION" ||
    (error as any)?.message?.includes("infinite recursion");

  const initials = (profile?.full_name ?? "SA")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refetch} tintColor={BANNER_GREEN} />
      }
    >
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <View style={styles.adminBadge}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.adminName}>{profile?.full_name ?? "Super Admin"}</Text>
        </View>
      </View>

      {(error && isRLSError) && (
        <RLSErrorBanner onRetry={refetch} />
      )}

      {(error && !isRLSError) && (
        <View style={styles.genericError}>
          <Feather name="wifi-off" size={16} color="#DC2626" />
          <Text style={styles.genericErrorText}>
            Could not load stats — {(error as any)?.message ?? "check your connection"}
          </Text>
          <Pressable onPress={() => refetch()} style={styles.retryInline}>
            <Text style={styles.retryInlineText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.welcomeBanner}>
        <View style={styles.bannerLeaf}>
          <Feather name="feather" size={64} color="rgba(255,255,255,0.12)" />
        </View>
        <Text style={styles.bannerGreeting}>Welcome back,</Text>
        <Text style={styles.bannerTitle}>AgriLearn Admin Portal</Text>
        <View style={styles.bannerPills}>
          <View style={styles.pill}>
            <Feather name="users" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.pillText}>
              {isLoading ? "…" : `${stats?.totalUsers ?? 0} registered users`}
            </Text>
          </View>
          <View style={styles.pill}>
            <Feather name="book-open" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.pillText}>
              {isLoading ? "…" : `${stats?.totalModules ?? 0} learning modules`}
            </Text>
          </View>
          <View style={styles.pill}>
            <Feather name="shopping-bag" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.pillText}>
              {isLoading ? "…" : `${stats?.activeListings ?? 0} active listings`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="users"
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3B82F6"
          value={stats?.totalUsers ?? 0}
          label="Total Users"
          sublabel={`${stats?.newUsersThisMonth ?? 0} new this month`}
          loading={isLoading}
        />
        <StatCard
          icon="activity"
          iconBg="rgba(16,185,129,0.12)"
          iconColor="#10B981"
          value={stats?.farmersCount ?? 0}
          label="Total Farmers"
          sublabel={`${stats?.retailersCount ?? 0} retailers`}
          loading={isLoading}
        />
        <StatCard
          icon="shopping-bag"
          iconBg="rgba(242,153,74,0.12)"
          iconColor="#F2994A"
          value={stats?.activeListings ?? 0}
          label="Active Listings"
          sublabel={`of ${stats?.totalListings ?? 0} total`}
          loading={isLoading}
        />
        <StatCard
          icon="layers"
          iconBg="rgba(124,58,237,0.12)"
          iconColor="#7C3AED"
          value={stats?.totalModules ?? 0}
          label="Learning Modules"
          sublabel={`across ${stats?.categoriesCount ?? 0} categories`}
          loading={isLoading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    gap: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  adminAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2D6A4F",
    alignItems: "center",
    justifyContent: "center",
  },
  adminAvatarText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  adminName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  errorIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  errorTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#92400E",
    marginBottom: 4,
  },
  errorBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#78350F",
    lineHeight: 18,
    marginBottom: 8,
  },
  errorSteps: { gap: 3 },
  errorStep: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#92400E",
    lineHeight: 18,
  },
  codePath: {
    fontFamily: "Inter_600SemiBold",
    color: "#1B4332",
  },
  retryBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  genericError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  genericErrorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#DC2626",
  },
  retryInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#DC2626",
  },
  retryInlineText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  welcomeBanner: {
    backgroundColor: BANNER_GREEN,
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  bannerLeaf: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  bannerGreeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 16,
  },
  bannerPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.9)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  liveText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: LIVE_GREEN,
  },
  statValue: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 4,
    lineHeight: 38,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  statSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
});
