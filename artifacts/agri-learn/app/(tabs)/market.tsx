import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";
import { useListings, useMyListings } from "@/hooks/useListings";

const C = Colors.light;

const CAT_FILTERS = ["All", "Vegetables", "Fruits", "Grains", "Livestock", "Poultry", "Dairy"];

const CATEGORY_ICONS: Record<string, string> = {
  Vegetables: "layers",
  Fruits: "sun",
  Grains: "wind",
  Livestock: "heart",
  Poultry: "feather",
  Dairy: "droplet",
};

export default function MarketScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");

  const isFarmer = user && (profile?.role === "farmer" || profile?.role === "admin");

  const { data: allListings = [], isLoading, refetch } = useListings();
  const { data: myListings = [], isLoading: myLoading, refetch: myRefetch } = useMyListings(
    isFarmer ? user?.id : undefined
  );

  const sourceListings = viewMode === "mine" ? myListings : allListings;
  const sourceLoading = viewMode === "mine" ? myLoading : isLoading;

  const filtered = sourceListings.filter((l) => {
    const matchSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      ((l as any).farmer_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || l.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const canList = isFarmer;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topBarRow}>
          <View>
            <Text style={styles.pageTitle}>Marketplace</Text>
            <Text style={styles.pageSubtitle}>
              {sourceLoading
                ? "Loading..."
                : viewMode === "mine"
                ? `${filtered.length} of your listing${filtered.length !== 1 ? "s" : ""}`
                : `${allListings.length} product${allListings.length !== 1 ? "s" : ""} available`}
            </Text>
          </View>
          {canList && (
            <Pressable
              style={styles.addButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/listing/create");
              }}
            >
              <Feather name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>List</Text>
            </Pressable>
          )}
        </View>

        {isFarmer && (
          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.toggleBtn, viewMode === "all" && styles.toggleBtnActive]}
              onPress={() => { setViewMode("all"); Haptics.selectionAsync(); }}
            >
              <Feather name="shopping-bag" size={14} color={viewMode === "all" ? "#fff" : C.textSecondary} />
              <Text style={[styles.toggleBtnText, viewMode === "all" && styles.toggleBtnTextActive]}>
                All Products
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, viewMode === "mine" && styles.toggleBtnActive]}
              onPress={() => { setViewMode("mine"); Haptics.selectionAsync(); }}
            >
              <Feather name="user" size={14} color={viewMode === "mine" ? "#fff" : C.textSecondary} />
              <Text style={[styles.toggleBtnText, viewMode === "mine" && styles.toggleBtnTextActive]}>
                My Listings
              </Text>
            </Pressable>
          </View>
        )}
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={C.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, farmers, location..."
            placeholderTextColor={C.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={C.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filterScroll}
      >
        {CAT_FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => {
              setActiveFilter(f);
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={sourceLoading}
            onRefresh={() => { refetch(); myRefetch(); }}
            tintColor={C.primary}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100, gap: 12 }}
      >
        {sourceLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingText}>Loading listings...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name={viewMode === "mine" ? "user" : "shopping-bag"} size={40} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>
              {viewMode === "mine" ? "No listings yet" : "No products found"}
            </Text>
            <Text style={styles.emptyText}>
              {viewMode === "mine"
                ? "Tap + List to create your first listing"
                : "Try a different search or category"}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.listingCard, { opacity: pressed ? 0.95 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/product/${item.id}`);
              }}
            >
              {item.image_url ? (
                <View style={styles.listingThumb}>
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.listingThumbImg}
                    contentFit="cover"
                    transition={200}
                  />
                </View>
              ) : (
                <View style={[styles.listingIcon, { backgroundColor: `${C.primary}12` }]}>
                  <Feather name={(CATEGORY_ICONS[item.category] ?? "package") as any} size={26} color={C.primary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.listingTop}>
                  <Text style={styles.listingTitle}>{item.title}</Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>R{Number(item.price).toFixed(2)}</Text>
                    <Text style={styles.unitText}>/{item.unit}</Text>
                  </View>
                </View>
                <Text style={styles.listingDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.listingMeta}>
                  {viewMode !== "mine" && (item as any).farmer_name && (
                    <View style={styles.metaChip}>
                      <Feather name="user" size={11} color={C.textSecondary} />
                      <Text style={styles.metaText}>{(item as any).farmer_name}</Text>
                    </View>
                  )}
                  <View style={styles.metaChip}>
                    <Feather name="map-pin" size={11} color={C.textSecondary} />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Feather name="package" size={11} color={C.textSecondary} />
                    <Text style={styles.metaText}>{item.quantity} {item.unit}</Text>
                  </View>
                  {item.image_url && (
                    <View style={styles.metaChip}>
                      <Feather name="camera" size={11} color={C.primary} />
                      <Text style={[styles.metaText, { color: C.primary }]}>Photo</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))
        )}

        {!user && (
          <Pressable
            style={styles.ctaBanner}
            onPress={() => router.push("/(auth)/login")}
          >
            <Feather name="log-in" size={18} color={C.primary} />
            <Text style={styles.ctaText}>Sign in to contact sellers and list your products</Text>
            <Feather name="chevron-right" size={16} color={C.primary} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: C.background },
  topBarRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  pageTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: C.text },
  pageSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text },
  filterScroll: { maxHeight: 50, marginBottom: 4 },
  filtersRow: { paddingHorizontal: 20, gap: 8, alignItems: "center" },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  filterTextActive: { color: "#fff" },
  loadingState: { alignItems: "center", paddingTop: 60, gap: 14 },
  loadingText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textTertiary },
  listingCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: C.surfaceSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 8, borderRadius: 9,
  },
  toggleBtnActive: { backgroundColor: C.primary },
  toggleBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  toggleBtnTextActive: { color: "#fff" },
  listingThumb: { width: 56, height: 56, borderRadius: 14, overflow: "hidden" },
  listingThumbImg: { width: 56, height: 56, borderRadius: 14 },
  listingIcon: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  listingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  listingTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text, flex: 1, marginRight: 8 },
  priceBadge: { flexDirection: "row", alignItems: "baseline" },
  priceText: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.primary },
  unitText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  listingDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 18, marginBottom: 8 },
  listingMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  ctaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: `${C.primary}10`,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  ctaText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: C.primary },
});
