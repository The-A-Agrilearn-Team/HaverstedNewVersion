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
import { useModuleCount } from "@/hooks/useModules";
import { useListingCount, useRecentListings } from "@/hooks/useListings";
import Colors from "@/constants/colors";
import { useFeaturedModules } from "@/hooks/useModules";
import { useRecentListings } from "@/hooks/useListings";
import { useUnreadCount } from "@/hooks/useNotifications";

const PRIMARY = "#2D6A4F";
const PRIMARY_DARK = "#1B4332";
const LIME = "#52B788";
const LIME_LIGHT = "#B7E4C7";
const LIME_PALE = "#D8F3DC";
const WHITE = "#FFFFFF";
const BG = "#F0FAF4";
const TEXT = "#1A2E22";
const TEXT_SUB = "#4B7A62";
const ORANGE = "#F2994A";

const QUICK_ACCESS = [
  {
    label: "Learning\nModules",
    icon: "book-open",
    color: PRIMARY,
    bg: LIME_PALE,
    route: "/(tabs)/learn",
  },
  {
    label: "Market\nplace",
    icon: "shopping-bag",
    color: "#1D6A7E",
    bg: "#DBEAFE",
    route: "/(tabs)/market",
  },
  {
    label: "Service\nWindow",
    icon: "tool",
    color: "#7C3AED",
    bg: "#EDE9FE",
    route: "/(tabs)/windows",
  },
];

const LATEST_UPDATES = [
  {
    icon: "book",
    color: PRIMARY,
    bg: LIME_PALE,
    label: "New Module",
    value: "Organic Pest Control",
  },
  {
    icon: "package",
    color: ORANGE,
    bg: "#FEF3C7",
    label: "Fresh Produce",
    value: "Tomatoes available near you",
  },
  {
    icon: "settings",
    color: "#7C3AED",
    bg: "#EDE9FE",
    label: "Tractor Services",
    value: "3 providers near you",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: modules = [], isLoading: modulesLoading, refetch: refetchModules } = useFeaturedModules();
  const { data: listings = [], isLoading: listingsLoading, refetch: refetchListings } = useRecentListings();
  const { data: unreadCount = 0 } = useUnreadCount();

  const firstName =
    profile?.full_name?.split(" ")[0] ?? (user ? "Farmer" : "Friend");
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "G";

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchListings();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={PRIMARY}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Feather name="feather" size={16} color={WHITE} />
          </View>
          <Text style={styles.logoText}>AgriLearn</Text>
        </View>
        <View style={styles.headerActions}>
          {!user && (
            <Pressable
              style={styles.signInBadge}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(auth)/login");
              }}
            >
              <Text style={styles.signInBadgeText}>Sign In</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.notifButton}
            onPress={() => {
              if (user) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/profile/messages");
              } else {
                router.push("/(auth)/login");
              }
            }}
          >
            <Feather name="bell" size={22} color={C.text} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* ── Welcome ────────────────────────────────────── */}
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>Welcome back, {firstName}! 👋</Text>
        <Text style={styles.welcomeSub}>
          Learn, connect and grow your farming business
        </Text>
      </View>

      {/* ── Banner ─────────────────────────────────────── */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerTag}>🌿 Season's Best</Text>
          <Text style={styles.bannerHeading}>
            Grow smarter,{"\n"}farm better
          </Text>
          <Text style={styles.bannerSub}>
            Practical guides built for{"\n"}South African conditions
          </Text>
          <Pressable
            style={styles.bannerBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)/learn");
            }}
          >
            <Text style={styles.bannerBtnText}>Explore</Text>
            <Feather name="arrow-right" size={14} color={PRIMARY} />
          </Pressable>
        </View>

        <View style={styles.bannerRight}>
          <View style={styles.bannerOrb1} />
          <View style={styles.bannerOrb2} />
          <View style={styles.bannerStats}>
            <View style={styles.bannerStatPill}>
              <Text style={styles.bannerStatNum}>{moduleCount}</Text>
              <Text style={styles.bannerStatLabel}>Modules</Text>
            </View>
            <View style={[styles.bannerStatPill, { marginTop: 10 }]}>
              <Text style={styles.bannerStatNum}>{listingCount}</Text>
              <Text style={styles.bannerStatLabel}>Listings</Text>
            </View>
          </View>
        </View>

        {/* decorative leaf blobs */}
        <View style={styles.bannerBlob1} />
        <View style={styles.bannerBlob2} />
      </View>

      {/* ── Quick Access ───────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickRow}>
          {QUICK_ACCESS.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.quickCard,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push(item.route as any);
              }}
            >
              <View
                style={[styles.quickIconWrap, { backgroundColor: item.bg }]}
              >
                <Feather name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Latest Updates ─────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          <Pressable onPress={() => router.push("/(tabs)/market")}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.updatesList}>
          {LATEST_UPDATES.map((item, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.updateCard,
                { opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                if (i === 0) router.push("/(tabs)/learn");
                else router.push("/(tabs)/market");
              }}
            >
              <View style={[styles.updateIcon, { backgroundColor: item.bg }]}>
                <Feather name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.updateLabel}>{item.label}</Text>
                <Text style={styles.updateValue}>{item.value}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={TEXT_SUB} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Recent Produce ─────────────────────────────── */}
      {recentListings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Fresh Produce</Text>
            <Pressable onPress={() => router.push("/(tabs)/market")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {recentListings.slice(0, 5).map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.produceCard,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={() => router.push(`/product/${item.id}` as any)}
              >
                <View style={styles.produceIconBox}>
                  <Feather name="package" size={20} color={PRIMARY} />
                </View>
                <Text style={styles.produceTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.producePrice}>
                  R{Number(item.price).toFixed(2)}
                </Text>
                <Text style={styles.produceUnit}>per {item.unit}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        {listingsLoading ? (
          <ActivityIndicator color={C.primary} style={{ paddingLeft: 20 }} />
        ) : (
          <View style={styles.listingsCol}>
            {listings.slice(0, 3).map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.listingCard, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!user) {
                    router.push("/(auth)/login");
                    return;
                  }
                  router.push(`/product/${item.id}`);
                }}
              >
                <View style={styles.listingIconBox}>
                  <Feather name="package" size={22} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingTitle}>{item.title}</Text>
                  <Text style={styles.listingFarmer}>
                    {item.farmer_name} · {item.location}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.listingPrice}>R{Number(item.price).toFixed(2)}</Text>
                  <Text style={styles.listingUnit}>per {item.unit}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ── Sign in nudge for guests ────────────────────── */}
      {!user && (
        <Pressable
          style={styles.guestNudge}
          onPress={() => router.push("/(auth)/login")}
        >
          <Feather name="log-in" size={15} color={PRIMARY} />
          <Text style={styles.guestNudgeText}>
            Sign in to track progress & list your produce
          </Text>
          <Feather name="chevron-right" size={14} color={PRIMARY} />
        </Pressable>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: BG,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 20, fontFamily: "Inter_700Bold", color: PRIMARY },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: C.background,
  },
  notifBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: BG,
  },
  badgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: WHITE },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: LIME_LIGHT,
  },
  avatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: WHITE },

  /* Welcome */
  welcome: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 18 },
  welcomeTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: TEXT },
  welcomeSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: TEXT_SUB,
    marginTop: 3,
  },

  /* Banner */
  banner: {
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    overflow: "hidden",
    minHeight: 180,
    flexDirection: "row",
    padding: 24,
    shadowColor: PRIMARY_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerLeft: { flex: 1, justifyContent: "space-between", zIndex: 2 },
  bannerTag: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: LIME_LIGHT,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 10,
  },
  bannerHeading: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: WHITE,
    lineHeight: 28,
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
    lineHeight: 17,
    marginBottom: 16,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: WHITE,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  bannerBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: PRIMARY,
  },
  bannerRight: {
    width: 90,
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 2,
  },
  bannerOrb1: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  bannerOrb2: {
    position: "absolute",
    right: 20,
    top: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bannerStats: { gap: 8 },
  bannerStatPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    backdropFilter: "blur(4px)",
  },
  bannerStatNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: WHITE },
  bannerStatLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  bannerBlob1: {
    position: "absolute",
    bottom: -30,
    left: 100,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(82,183,136,0.18)",
  },
  bannerBlob2: {
    position: "absolute",
    bottom: 10,
    left: 140,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(82,183,136,0.12)",
  },

  /* Section */
  section: { marginBottom: 28 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: TEXT },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium", color: PRIMARY },

  /* Quick Access */
  quickRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: TEXT,
    textAlign: "center",
    lineHeight: 16,
  },

  /* Updates */
  updatesList: { paddingHorizontal: 20, gap: 10 },
  updateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  updateIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  updateLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: TEXT_SUB },
  updateValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: TEXT,
    marginTop: 1,
  },

  /* Produce cards */
  produceCard: {
    width: 130,
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  produceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: LIME_PALE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  produceTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: TEXT,
    textAlign: "center",
  },
  producePrice: { fontSize: 15, fontFamily: "Inter_700Bold", color: PRIMARY },
  produceUnit: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: TEXT_SUB,
  },

  /* CTA */
  ctaCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: PRIMARY_DARK,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: PRIMARY_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaOrb: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(82,183,136,0.15)",
  },
  ctaTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: WHITE,
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 8,
  },
  ctaSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 22,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: WHITE,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 30,
  },
  ctaBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: PRIMARY },

  /* Guest nudge */
  guestNudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: LIME_PALE,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: LIME_LIGHT,
  },
  guestNudgeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: PRIMARY,
  },
});
