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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useModules } from "@/hooks/useModules";

const C = Colors.light;

const FILTERS = ["All", "Crops", "Livestock", "Irrigation", "Soil", "Pest Control", "Business"];

const ROLE_LABELS: Record<string, string> = {
  buyer: "Buyer",
  retailer: "Retailer",
};

function AccessDenied({ role }: { role: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.deniedContainer, { paddingTop: insets.top + 40 }]}>
      <View style={styles.deniedIconBox}>
        <Feather name="lock" size={36} color="#2D6A4F" />
      </View>
      <Text style={styles.deniedTitle}>Learning Hub</Text>
      <Text style={styles.deniedSubtitle}>Not available for {ROLE_LABELS[role] ?? role} accounts</Text>
      <Text style={styles.deniedBody}>
        The AgriLearn Learning Hub is designed for farmers and farm workers. It provides
        practical training on crops, soil, irrigation, pest control, and more.
      </Text>
      <View style={styles.deniedDivider} />
      <Text style={styles.deniedHint}>
        If you are a farmer, please contact support to update your account type.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.marketBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={() => router.replace("/(tabs)/market")}
      >
        <Feather name="shopping-bag" size={16} color="#fff" />
        <Text style={styles.marketBtnText}>Browse the Marketplace</Text>
      </Pressable>
    </View>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: allModules = [], isLoading, refetch } = useModules();

  const role = profile?.role ?? "";
  const canAccess = role === "farmer" || role === "admin";

  if (!canAccess && role) {
    return <AccessDenied role={role} />;
  }

  const filtered = allModules.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || m.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.pageTitle}>Learning Hub</Text>
        <Text style={styles.pageSubtitle}>
          {isLoading ? "Loading..." : `${allModules.length} module${allModules.length !== 1 ? "s" : ""} available`}
        </Text>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={C.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
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
        {FILTERS.map((f) => (
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
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={C.primary} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100, gap: 12 }}
      >
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingText}>Loading modules...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={40} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>No modules found</Text>
            <Text style={styles.emptyText}>Try a different search or filter</Text>
          </View>
        ) : (
          filtered.map((mod) => (
            <Pressable
              key={mod.id}
              style={({ pressed }) => [styles.moduleCard, { opacity: pressed ? 0.95 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/module/${mod.id}`);
              }}
            >
              <View style={styles.moduleLeft}>
                <View style={styles.moduleIconBox}>
                  <Feather name="book" size={22} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.moduleMetaRow}>
                    <View style={[styles.levelPill, {
                      backgroundColor: mod.level === "beginner" ? "#D1FAE5" : mod.level === "intermediate" ? "#FEF3C7" : "#FCE7F3"
                    }]}>
                      <Text style={[styles.levelText, {
                        color: mod.level === "beginner" ? "#059669" : mod.level === "intermediate" ? "#D97706" : "#DB2777"
                      }]}>
                        {mod.level}
                      </Text>
                    </View>
                    <View style={styles.durationRow}>
                      <Feather name="clock" size={11} color={C.textSecondary} />
                      <Text style={styles.durationText}>{mod.duration_minutes} min</Text>
                    </View>
                  </View>
                  <Text style={styles.moduleTitle}>{mod.title}</Text>
                  <Text style={styles.moduleDesc} numberOfLines={2}>{mod.description}</Text>
                  <Text style={styles.moduleCat}>{mod.category}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={C.textTertiary} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: C.background },
  pageTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: C.text },
  pageSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, marginBottom: 14 },
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
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  moduleLeft: { flexDirection: "row", gap: 12, flex: 1 },
  moduleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${C.primary}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  levelPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  durationText: { fontSize: 12, color: C.textSecondary, fontFamily: "Inter_400Regular" },
  moduleTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 3 },
  moduleDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 18, marginBottom: 4 },
  moduleCat: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primaryLight },
  deniedContainer: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  deniedIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  deniedTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: C.text,
    marginBottom: 6,
    textAlign: "center",
  },
  deniedSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#D97706",
    marginBottom: 20,
    textAlign: "center",
  },
  deniedBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  deniedDivider: {
    width: 48,
    height: 2,
    backgroundColor: C.border,
    borderRadius: 2,
    marginVertical: 24,
  },
  deniedHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.textTertiary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  marketBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2D6A4F",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  marketBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
