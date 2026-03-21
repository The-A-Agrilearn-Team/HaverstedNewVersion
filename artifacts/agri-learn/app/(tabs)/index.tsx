import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { supabase, LearningModule, ProductListing } from "@/lib/supabase";

const C = Colors.light;

const CATEGORIES = [
  { label: "Crops", icon: "sun", color: "#52B788" },
  { label: "Livestock", icon: "heart", color: "#F2994A" },
  { label: "Irrigation", icon: "droplet", color: "#3B82F6" },
  { label: "Soil", icon: "layers", color: "#92400E" },
  { label: "Pest Control", icon: "shield", color: "#DC2626" },
  { label: "Business", icon: "trending-up", color: "#7C3AED" },
];

const MOCK_MODULES: LearningModule[] = [
  {
    id: "1", title: "Intro to Crop Rotation", description: "Learn how to improve soil health through strategic crop rotation techniques.", category: "Crops", level: "beginner", content: "", image_url: undefined, duration_minutes: 15, language: "en", created_at: new Date().toISOString(),
  },
  {
    id: "2", title: "Water Management Basics", description: "Efficient irrigation strategies for small-scale farms.", category: "Irrigation", level: "beginner", content: "", duration_minutes: 20, language: "en", created_at: new Date().toISOString(),
  },
  {
    id: "3", title: "Soil Testing & pH", description: "Understanding soil composition and how to optimize it for better yields.", category: "Soil", level: "intermediate", content: "", duration_minutes: 25, language: "en", created_at: new Date().toISOString(),
  },
];

const MOCK_LISTINGS: ProductListing[] = [
  { id: "1", farmer_id: "f1", farmer_name: "Sipho Ndlovu", title: "Fresh Tomatoes", description: "Ripe farm-fresh tomatoes", category: "Vegetables", price: 12.50, quantity: 50, unit: "kg", location: "Durban, KZN", status: "active", created_at: new Date().toISOString() },
  { id: "2", farmer_id: "f2", farmer_name: "Thabo Molefe", title: "Free-Range Eggs", description: "Organic free-range eggs", category: "Poultry", price: 4.00, quantity: 200, unit: "dozen", location: "Johannesburg, GP", status: "active", created_at: new Date().toISOString() },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [modules, setModules] = useState<LearningModule[]>(MOCK_MODULES);
  const [listings, setListings] = useState<ProductListing[]>(MOCK_LISTINGS);
  const [refreshing, setRefreshing] = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const firstName = profile?.full_name?.split(" ")[0] ?? "Farmer";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{firstName}</Text>
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
          <Pressable style={styles.notifButton}>
            <Feather name="bell" size={22} color={C.text} />
          </Pressable>
        </View>
      </View>

      {!user && (
        <View style={styles.guestBanner}>
          <Feather name="info" size={16} color={C.primary} />
          <Text style={styles.guestBannerText}>
            Sign in to access all features, save progress, and list products.
          </Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Modules</Text>
        </View>
        <View style={[styles.statCard, styles.statCardCenter]}>
          <Text style={styles.statNumber}>48</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Languages</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Topics</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.label}
              style={({ pressed }) => [
                styles.categoryChip,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/learn");
              }}
            >
              <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}18` }]}>
                <Feather name={cat.icon as any} size={18} color={cat.color} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Modules</Text>
          <Pressable onPress={() => router.push("/(tabs)/learn")}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
          {modules.map((mod) => (
            <Pressable
              key={mod.id}
              style={({ pressed }) => [styles.moduleCard, { opacity: pressed ? 0.95 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/module/${mod.id}`);
              }}
            >
              <View style={styles.moduleMeta}>
                <View style={[styles.levelBadge, { backgroundColor: mod.level === "beginner" ? "#D1FAE5" : mod.level === "intermediate" ? "#FEF3C7" : "#FCE7F3" }]}>
                  <Text style={[styles.levelText, { color: mod.level === "beginner" ? "#059669" : mod.level === "intermediate" ? "#D97706" : "#DB2777" }]}>{mod.level}</Text>
                </View>
                <Text style={styles.moduleDuration}>
                  <Feather name="clock" size={11} color={C.textSecondary} /> {mod.duration_minutes}m
                </Text>
              </View>
              <Text style={styles.moduleTitle}>{mod.title}</Text>
              <Text style={styles.moduleDesc} numberOfLines={2}>{mod.description}</Text>
              <View style={styles.moduleFooter}>
                <Text style={styles.moduleCategory}>{mod.category}</Text>
                <Feather name="arrow-right" size={16} color={C.primary} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          <Pressable onPress={() => router.push("/(tabs)/market")}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.listingsCol}>
          {listings.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.listingCard, { opacity: pressed ? 0.95 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/product/${item.id}`);
              }}
            >
              <View style={styles.listingIconBox}>
                <Feather name="package" size={22} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listingTitle}>{item.title}</Text>
                <Text style={styles.listingFarmer}>{item.farmer_name} · {item.location}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.listingPrice}>R{item.price.toFixed(2)}</Text>
                <Text style={styles.listingUnit}>per {item.unit}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  name: { fontSize: 26, fontFamily: "Inter_700Bold", color: C.text },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  signInBadge: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  signInBadgeText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${C.primary}10`,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  guestBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.primary },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: C.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statCard: { flex: 1, alignItems: "center" },
  statCardCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statNumber: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  seeAll: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.primary },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    width: "30%",
    flexGrow: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.text },
  moduleCard: {
    width: 220,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  moduleMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  moduleDuration: { fontSize: 12, color: C.textSecondary, fontFamily: "Inter_400Regular" },
  moduleTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  moduleDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 18 },
  moduleFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moduleCategory: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primaryLight },
  listingsCol: { paddingHorizontal: 20, gap: 10 },
  listingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  listingIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${C.primary}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  listingTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  listingFarmer: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  listingPrice: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.primary },
  listingUnit: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
});
