import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { useAllListingsAdmin, useRemoveListing } from "@/hooks/useAdmin";

 

const C = Colors.light;

 

const STATUS_COLORS: Record<string, string> = {
  active: "#059669",
  pending: "#D97706",
  sold: "#6B7280",
  removed: "#DC2626",
};

 

const FILTERS = ["all", "active", "pending", "sold", "removed"] as const;

 

export default function ListingsScreen() {
  const [filter, setFilter] = useState<string>("all");
  const { data: listings = [], isLoading, refetch } = useAllListingsAdmin();
  const removeListing = useRemoveListing();

 

  const filtered = filter === "all"
    ? listings
    : listings.filter((l: any) => l.status === filter);

 

  const handleRemove = (id: string, title: string) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Remove "${title}" from the marketplace?`)) {
        removeListing.mutate(id);
      }
      return;
    }
    Alert.alert(
      "Remove Listing",
      `Remove "${title}" from the marketplace?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeListing.mutate(id) },
      ]
    );
  };

 

  return (
<ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
>
<ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={{ marginTop: 16 }}
>
        {FILTERS.map((f) => (
<Pressable
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
>
<Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
</Text>
</Pressable>
        ))}
</ScrollView>

 

      <Text style={styles.count}>
        {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
</Text>

 

      {isLoading && <ActivityIndicator color={C.primary} style={{ padding: 32 }} />}

 

      <View style={styles.list}>
        {filtered.map((listing: any, i: number) => {
          const statusColor = STATUS_COLORS[listing.status] ?? C.textSecondary;
          const farmer = (listing.profiles as any)?.full_name ?? "Unknown";

 

          return (
<View
              key={listing.id}
              style={[styles.card, i < filtered.length - 1 && styles.cardBorder]}
>
<View style={styles.cardHeader}>
<View style={styles.cardIcon}>
<Feather name="package" size={18} color={C.primary} />
</View>
<View style={{ flex: 1 }}>
<Text style={styles.cardTitle} numberOfLines={1}>{listing.title}</Text>
<Text style={styles.cardSub}>{farmer} · {listing.location}</Text>
</View>
<View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
<Text style={[styles.statusText, { color: statusColor }]}>{listing.status}</Text>
</View>
</View>

 

              <View style={styles.cardMeta}>
<Text style={styles.metaItem}>
<Feather name="tag" size={11} color={C.textTertiary} /> {listing.category}
</Text>
<Text style={styles.metaItem}>
<Feather name="dollar-sign" size={11} color={C.textTertiary} /> R{Number(listing.price).toFixed(2)} / {listing.unit}
</Text>
<Text style={styles.metaItem}>
<Feather name="calendar" size={11} color={C.textTertiary} /> {new Date(listing.created_at).toLocaleDateString("en-ZA")}
</Text>
</View>

 

              {listing.status !== "removed" && (
<View style={styles.cardActions}>
<Pressable
                    style={styles.viewBtn}
                    onPress={() => router.push(`/product/${listing.id}`)}
>
<Feather name="eye" size={14} color={C.primary} />
<Text style={styles.viewBtnText}>View</Text>
</Pressable>
<Pressable
                    style={styles.removeBtn}
                    onPress={() => handleRemove(listing.id, listing.title)}
>
<Feather name="trash-2" size={14} color={C.error} />
<Text style={styles.removeBtnText}>Remove</Text>
</Pressable>
</View>
              )}
</View>
          );
        })}
</View>

 

      <View style={{ height: 60 }} />
</ScrollView>
  );
}

 

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  filterTextActive: { color: "#fff" },
  count: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginHorizontal: 20, marginVertical: 10 },
  list: { marginHorizontal: 16, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  card: { padding: 14 },
  cardBorder: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  cardIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  metaItem: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary },
  cardActions: { flexDirection: "row", gap: 10 },
  viewBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 10, paddingVertical: 8, backgroundColor: `${C.primary}10`,
    borderWidth: 1, borderColor: `${C.primary}20`,
  },
  viewBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.primary },
  removeBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 10, paddingVertical: 8, backgroundColor: `${C.error}08`,
    borderWidth: 1, borderColor: `${C.error}20`,
  },
  removeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.error },
});