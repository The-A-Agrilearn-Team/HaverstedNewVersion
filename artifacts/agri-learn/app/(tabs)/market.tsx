import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";
import { ProductListing } from "@/lib/supabase";

const C = Colors.light;

const CAT_FILTERS = ["All", "Vegetables", "Fruits", "Grains", "Livestock", "Poultry", "Dairy"];

const MOCK_LISTINGS: ProductListing[] = [
  { id: "1", farmer_id: "f1", farmer_name: "Sipho Ndlovu", title: "Fresh Tomatoes", description: "Ripe, juicy farm-fresh tomatoes. Grown without pesticides using organic methods.", category: "Vegetables", price: 12.50, quantity: 50, unit: "kg", location: "Durban, KZN", status: "active", created_at: new Date().toISOString() },
  { id: "2", farmer_id: "f2", farmer_name: "Thabo Molefe", title: "Free-Range Eggs", description: "Organic free-range eggs from happy hens. Fresh daily.", category: "Poultry", price: 4.00, quantity: 200, unit: "dozen", location: "Johannesburg, GP", status: "active", created_at: new Date().toISOString() },
  { id: "3", farmer_id: "f3", farmer_name: "Nomvula Dlamini", title: "Butternut Squash", description: "Large, sweet butternut squash. Perfect for soups and roasting.", category: "Vegetables", price: 8.00, quantity: 100, unit: "kg", location: "Pretoria, GP", status: "active", created_at: new Date().toISOString() },
  { id: "4", farmer_id: "f4", farmer_name: "Pieter van Niekerk", title: "Mango Harvest", description: "Sweet Keitt mangoes, freshly harvested. Bulk orders welcome.", category: "Fruits", price: 25.00, quantity: 300, unit: "kg", location: "Limpopo", status: "active", created_at: new Date().toISOString() },
  { id: "5", farmer_id: "f5", farmer_name: "Zanele Khumalo", title: "Yellow Maize", description: "Grade A yellow maize, dried and ready for milling or livestock feed.", category: "Grains", price: 3.50, quantity: 2000, unit: "kg", location: "Free State", status: "active", created_at: new Date().toISOString() },
  { id: "6", farmer_id: "f6", farmer_name: "Johan Botha", title: "Fresh Milk", description: "Raw milk from Jersey cows. Collected daily. Contact for delivery schedule.", category: "Dairy", price: 15.00, quantity: 100, unit: "litre", location: "Western Cape", status: "active", created_at: new Date().toISOString() },
];

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

  const filtered = MOCK_LISTINGS.filter((l) => {
    const matchSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      (l.farmer_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || l.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const canList = user && (profile?.role === "farmer" || profile?.role === "admin");

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topBarRow}>
          <View>
            <Text style={styles.pageTitle}>Marketplace</Text>
            <Text style={styles.pageSubtitle}>{MOCK_LISTINGS.length} products available</Text>
          </View>
          {canList && (
            <Pressable
              style={styles.addButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Feather name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>List</Text>
            </Pressable>
          )}
        </View>
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100, gap: 12 }}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="shopping-bag" size={40} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>Try a different search or category</Text>
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
              <View style={[styles.listingIcon, { backgroundColor: `${C.primary}12` }]}>
                <Feather name={(CATEGORY_ICONS[item.category] ?? "package") as any} size={26} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.listingTop}>
                  <Text style={styles.listingTitle}>{item.title}</Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>R{item.price.toFixed(2)}</Text>
                    <Text style={styles.unitText}>/{item.unit}</Text>
                  </View>
                </View>
                <Text style={styles.listingDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.listingMeta}>
                  <View style={styles.metaChip}>
                    <Feather name="user" size={11} color={C.textSecondary} />
                    <Text style={styles.metaText}>{item.farmer_name}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Feather name="map-pin" size={11} color={C.textSecondary} />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Feather name="package" size={11} color={C.textSecondary} />
                    <Text style={styles.metaText}>{item.quantity} {item.unit}</Text>
                  </View>
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
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  filterTextActive: { color: "#fff" },
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
