import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useMyListings, useMarkAsSold } from "@/hooks/useListings";

const C = Colors.light;

const CATEGORY_ICONS: Record<string, string> = {
  Vegetables: "layers", Fruits: "sun", Grains: "wind",
  Livestock: "heart", Poultry: "feather", Dairy: "droplet",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:   { bg: "#D1FAE5", text: "#059669" },
  inactive: { bg: "#FEF3C7", text: "#D97706" },
  sold:     { bg: "#E5E7EB", text: "#6B7280" },
};

export default function MyListingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: listings = [], isLoading, refetch } = useMyListings(user?.id);
  const markAsSold = useMarkAsSold();

  const activeCount = listings.filter((l) => l.status === "active").length;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>My Listings</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/listing/create");
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 60 }}
      >
        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ paddingTop: 60 }} />
        ) : listings.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="package" size={44} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptySub}>Create your first listing to start selling on the marketplace.</Text>
            <Pressable
              style={styles.createBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/listing/create");
              }}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.createBtnText}>Create Listing</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNum}>{listings.length}</Text>
                <Text style={styles.summaryLbl}>Total</Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryBorder]}>
                <Text style={[styles.summaryNum, { color: C.success }]}>{activeCount}</Text>
                <Text style={styles.summaryLbl}>Active</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNum, { color: C.textSecondary }]}>{listings.length - activeCount}</Text>
                <Text style={styles.summaryLbl}>Inactive</Text>
              </View>
            </View>

            {listings.map((item) => {
              const status = STATUS_COLORS[item.status ?? "active"] ?? STATUS_COLORS.active;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/product/${item.id}`);
                  }}
                >
                  {item.image_url ? (
                    <View style={styles.thumb}>
                      <Image source={{ uri: item.image_url }} style={styles.thumbImg} contentFit="cover" transition={200} />
                    </View>
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                      <Feather name={(CATEGORY_ICONS[item.category] ?? "package") as any} size={24} color={C.primary} />
                    </View>
                  )}

                  <View style={{ flex: 1, gap: 5 }}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.text }]}>{item.status ?? "active"}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.price}>R{Number(item.price).toFixed(2)}<Text style={styles.unit}>/{item.unit}</Text></Text>
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
                    {item.status === "active" && (
                      <Pressable
                        style={({ pressed }) => [styles.soldBtn, { opacity: pressed ? 0.8 : 1 }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          Alert.alert(
                            "Mark as Sold?",
                            `This will remove "${item.title}" from the marketplace. It will still appear in your listings as sold.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Mark as Sold",
                                style: "destructive",
                                onPress: () => {
                                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                  markAsSold.mutate(item.id, { onSuccess: () => refetch() });
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Feather name="check-circle" size={13} color="#6B7280" />
                        <Text style={styles.soldBtnText}>Mark as Sold</Text>
                      </Pressable>
                    )}
                    {item.status === "sold" && (
                      <View style={styles.soldStamp}>
                        <Feather name="check-circle" size={13} color="#6B7280" />
                        <Text style={styles.soldStampText}>Sold</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 21 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  createBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  summaryRow: { flexDirection: "row", backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  summaryCard: { flex: 1, alignItems: "center", paddingVertical: 14 },
  summaryBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.border },
  summaryNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  summaryLbl: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 14, backgroundColor: C.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  thumb: { width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0 },
  thumbImg: { width: 64, height: 64 },
  thumbPlaceholder: { backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center" },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  cardMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  price: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.primary },
  unit: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  soldBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
    backgroundColor: C.surfaceSecondary,
  },
  soldBtnText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#6B7280" },
  soldStamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
  },
  soldStampText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#6B7280" },
});
