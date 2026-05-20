import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { useFeaturedModules, useModules } from "@/hooks/useModules";
import { useRecentListings } from "@/hooks/useListings";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useProgress, type Progress } from "@/hooks/useProgress";

const C = Colors.light;

const QUICK_ACCESS = [
  { label: "Learning\nModules",   icon: "book-open",    color: "#52B788", bg: "#F0FAF4", route: "/(tabs)/learn" },
  { label: "Market\nplace",       icon: "shopping-bag", color: "#3B82F6", bg: "#EFF6FF", route: "/(tabs)/market" },
  
];

const CATEGORIES = [
  { label: "Crops",        icon: "sun",          color: "#52B788", bg: "#F0FAF4" },
  { label: "Livestock",    icon: "heart",         color: "#F2994A", bg: "#FFF7ED" },
  { label: "Irrigation",   icon: "droplet",       color: "#3B82F6", bg: "#EFF6FF" },
  { label: "Soil",         icon: "layers",        color: "#92400E", bg: "#FEF3C7" },
  { label: "Pest Control", icon: "shield",        color: "#DC2626", bg: "#FEF2F2" },
  { label: "Business",     icon: "trending-up",   color: "#7C3AED", bg: "#F5F3FF" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: modules = [], isLoading: modulesLoading, refetch: refetchModules } = useFeaturedModules();
  const { data: allModules = [] } = useModules();
  const { data: listings = [], isLoading: listingsLoading, refetch: refetchListings } = useRecentListings();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: progressData } = useProgress();

  const inProgressModules = React.useMemo(() => {
    if (!user || !progressData || !Array.isArray(progressData)) return [];
    const inProgress = (progressData as Progress[])
      .filter((p) => !p.completed && p.progress_pct > 0)
      .sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime())
      .slice(0, 3);
    return inProgress.map((p) => {
      const mod = allModules.find((m) => m.id === p.module_id);
      return mod ? { ...mod, progress_pct: p.progress_pct } : null;
    }).filter(Boolean) as (typeof allModules[0] & { progress_pct: number })[];
  }, [progressData, allModules, user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchModules(), refetchListings()]);
    setRefreshing(false);
  };

  const firstName = profile?.full_name?.split(" ")[0] ?? (user ? "Farmer" : "Friend");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F7F8F5" }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Feather name="feather" size={18} color="#fff" />
          </View>
          <Text style={styles.logoText}>AgriLearn</Text>
        </View>
        <View style={styles.headerRight}>
          {!user && (
            <Pressable
              style={styles.signInBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(auth)/login");
              }}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.notifBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              user ? router.push("/profile/messages") : router.push("/(auth)/login");
            }}
          >
            <Feather name="bell" size={20} color={C.text} />
            {unreadCount > 0 && (
              <View style={styles.notifDot}>
                <Text style={styles.notifDotText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
          {user && (
            <Pressable
              style={styles.avatarBtn}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Text style={styles.avatarText}>
                {(profile?.full_name?.[0] ?? "F").toUpperCase()}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20 }}>
        <Text style={styles.welcomeSmall}>{greeting()}, {firstName}! 👋</Text>
        <Text style={styles.welcomeSub}>Learn, connect and grow your farming business</Text>
      </View>

      {/* ── Hero Banner ── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <LinearGradient
          colors={["#1B4332", "#2D6A4F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          {/* decorative circles */}
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={styles.heroContent}>
            <View style={{ flex: 1 }}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>🌿  Season's Best</Text>
              </View>
              <Text style={styles.heroTitle}>Grow smarter,{"\n"}farm better</Text>
              <Text style={styles.heroSub}>
                Practical guides built for{"\n"}South African conditions
              </Text>
              <Pressable
                style={({ pressed }) => [styles.heroBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/learn");
                }}
              >
                <Text style={styles.heroBtnText}>Explore</Text>
                <Feather name="arrow-right" size={14} color={C.primary} />
              </Pressable>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatNum}>{modules.length || 16}</Text>
                <Text style={styles.heroStatLabel}>Modules</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatNum}>{listings.length || 19}</Text>
                <Text style={styles.heroStatLabel}>Listings</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ── Guest banner ── */}
      {!user && (
        <Pressable
          style={styles.guestBanner}
          onPress={() => router.push("/(auth)/login")}
        >
          <Feather name="info" size={15} color={C.primary} />
          <Text style={styles.guestText}>
            Sign in to save progress, bookmark modules, and list produce.
          </Text>
          <Feather name="chevron-right" size={13} color={C.primary} />
        </Pressable>
      )}

      {/* ── Quick Access ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickRow}>
          {QUICK_ACCESS.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.quickCard, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push(item.route as any);
              }}
            >
              <View style={[styles.quickIconBox, { backgroundColor: item.bg }]}>
                <Feather name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Continue Learning ── */}
      {user && inProgressModules.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Continue Learning</Text>
            <Pressable onPress={() => router.push("/(tabs)/learn")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {inProgressModules.map((mod) => (
              <Pressable
                key={mod.id}
                style={({ pressed }) => [styles.continueCard, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/module/${mod.id}`);
                }}
              >
                <View style={styles.continueIconBox}>
                  <Feather name="book-open" size={20} color={C.primary} />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={styles.continueTitle} numberOfLines={1}>{mod.title}</Text>
                  <View style={styles.continueProgressRow}>
                    <View style={styles.continueTrack}>
                      <View
                        style={[
                          styles.continueFill,
                          { width: `${Math.round(mod.progress_pct)}%` as any },
                        ]}
                      />
                    </View>
                    <Text style={styles.continuePct}>{Math.round(mod.progress_pct)}%</Text>
                  </View>
                  <Text style={styles.continueMeta}>{mod.category} · {mod.duration_minutes}m</Text>
                </View>
                <View style={styles.continueArrow}>
                  <Feather name="play" size={13} color={C.primary} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* ── Browse Topics ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Topics</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.label}
              style={({ pressed }) => [styles.catChip, { opacity: pressed ? 0.75 : 1 }]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/learn");
              }}
            >
              <View style={[styles.catIcon, { backgroundColor: cat.bg }]}>
                <Feather name={cat.icon as any} size={16} color={cat.color} />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Featured Modules ── */}
      <View style={[styles.section, { marginBottom: 32 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Modules</Text>
          <Pressable onPress={() => router.push("/(tabs)/learn")}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        {modulesLoading ? (
          <ActivityIndicator color={C.primary} style={{ marginLeft: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
          >
            {modules.slice(0, 5).map((mod) => (
              <Pressable
                key={mod.id}
                style={({ pressed }) => [styles.modCard, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/module/${mod.id}`);
                }}
              >
                <View style={styles.modTopBar}>
                  <View style={[styles.levelPill, {
                    backgroundColor:
                      mod.level === "beginner" ? "#D1FAE5"
                      : mod.level === "intermediate" ? "#FEF3C7"
                      : "#FCE7F3",
                  }]}>
                    <Text style={[styles.levelPillText, {
                      color:
                        mod.level === "beginner" ? "#059669"
                        : mod.level === "intermediate" ? "#D97706"
                        : "#DB2777",
                    }]}>{mod.level}</Text>
                  </View>
                  <View style={styles.durationRow}>
                    <Feather name="clock" size={11} color={C.textSecondary} />
                    <Text style={styles.durationText}>{mod.duration_minutes}m</Text>
                  </View>
                </View>
                <Text style={styles.modTitle} numberOfLines={2}>{mod.title}</Text>
                <Text style={styles.modDesc} numberOfLines={2}>{mod.description}</Text>
                <View style={styles.modFooter}>
                  <Text style={styles.modCat}>{mod.category}</Text>
                  <View style={styles.modArrow}>
                    <Feather name="arrow-right" size={13} color={C.primary} />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ── Recent Listings ── */}
      <View style={[styles.section, { marginBottom: 36 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          <Pressable onPress={() => router.push("/(tabs)/market")}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        {listingsLoading ? (
          <ActivityIndicator color={C.primary} style={{ marginLeft: 20 }} />
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {listings.slice(0, 3).map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.listCard, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!user) { router.push("/(auth)/login"); return; }
                  router.push(`/product/${item.id}`);
                }}
              >
                <View style={styles.listIconBox}>
                  <Feather name="package" size={20} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listSub}>{item.farmer_name} · {item.location}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.listPrice}>R{Number(item.price).toFixed(2)}</Text>
                  <Text style={styles.listUnit}>/{item.unit}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  signInBtn: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  signInBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  notifDot: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#F7F8F5",
  },
  notifDotText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  /* greeting */
  welcomeSmall: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.text },
  welcomeSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },

  /* hero */
  heroBanner: {
    borderRadius: 22,
    overflow: "hidden",
    padding: 24,
    minHeight: 200,
  },
  heroCircle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -40,
    right: 60,
  },
  heroCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -30,
    right: -20,
  },
  heroContent: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  heroBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)" },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
    lineHeight: 19,
    marginBottom: 18,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignSelf: "flex-start",
  },
  heroBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.primary },
  heroStats: { gap: 10, minWidth: 72 },
  heroStatCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  heroStatNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  heroStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 2 },

  /* guest banner */
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${C.primary}0D`,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 13,
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${C.primary}20`,
  },
  guestText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.primary },

  /* section */
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: C.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.primary },

  /* quick access */
  quickRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
    textAlign: "center",
    lineHeight: 16,
  },

  /* categories */
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    width: "30%",
    flexGrow: 1,
  },
  catIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.text },

  /* module cards */
  modCard: {
    width: 216,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelPillText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  durationText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  modTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 21 },
  modDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 17 },
  modFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  modCat: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.primaryLight },
  modArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: `${C.primary}12`,
    alignItems: "center",
    justifyContent: "center",
  },

  /* listing cards */
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  listIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: `${C.primary}10`,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  listSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  listPrice: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.primary },
  listUnit: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },

  /* continue learning */
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  continueIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: `${C.primary}10`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  continueTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  continueProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  continueTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: `${C.primary}18`,
    overflow: "hidden",
  },
  continueFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: C.primary,
  },
  continuePct: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: C.primary,
    minWidth: 28,
    textAlign: "right",
  },
  continueMeta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  continueArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${C.primary}12`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
