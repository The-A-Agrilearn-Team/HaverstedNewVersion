import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { supabase, ProductListing } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useSendNotification } from "@/hooks/useNotifications";

const C = Colors.light;

const MOCK_LISTINGS: Record<string, ProductListing & { farmer_name: string; phone: string }> = {
  "1": { id: "1", farmer_id: "f1", farmer_name: "Sipho Ndlovu", phone: "+27 82 123 4567", title: "Fresh Tomatoes", description: "Ripe, juicy farm-fresh tomatoes. Grown without pesticides using organic methods. Available for pickup from the farm or delivery within Durban area. Minimum order 5kg. Bulk discounts available for orders over 20kg.", category: "Vegetables", price: 12.50, quantity: 50, unit: "kg", location: "Durban, KZN", status: "active", created_at: new Date().toISOString() },
  "2": { id: "2", farmer_id: "f2", farmer_name: "Thabo Molefe", phone: "+27 71 234 5678", title: "Free-Range Eggs", description: "Organic free-range eggs from happy hens. Fresh daily. Our hens roam freely on natural pasture and are fed supplementary organic grain. No hormones or antibiotics.", category: "Poultry", price: 4.00, quantity: 200, unit: "dozen", location: "Johannesburg, GP", status: "active", created_at: new Date().toISOString() },
  "3": { id: "3", farmer_id: "f3", farmer_name: "Nomvula Dlamini", phone: "+27 83 345 6789", title: "Butternut Squash", description: "Large, sweet butternut squash. Perfect for soups and roasting. Harvested at peak ripeness. Grown in nutrient-rich soil without synthetic fertilizers.", category: "Vegetables", price: 8.00, quantity: 100, unit: "kg", location: "Pretoria, GP", status: "active", created_at: new Date().toISOString() },
  "4": { id: "4", farmer_id: "f4", farmer_name: "Pieter van Niekerk", phone: "+27 72 456 7890", title: "Mango Harvest", description: "Sweet Keitt mangoes, freshly harvested. Bulk orders welcome. Grown in our Limpopo orchard using sustainable practices.", category: "Fruits", price: 25.00, quantity: 300, unit: "kg", location: "Limpopo", status: "active", created_at: new Date().toISOString() },
  "5": { id: "5", farmer_id: "f5", farmer_name: "Zanele Khumalo", phone: "+27 79 567 8901", title: "Yellow Maize", description: "Grade A yellow maize, dried and ready for milling or livestock feed. Moisture content below 14%. Stored in clean, pest-free conditions.", category: "Grains", price: 3.50, quantity: 2000, unit: "kg", location: "Free State", status: "active", created_at: new Date().toISOString() },
  "6": { id: "6", farmer_id: "f6", farmer_name: "Johan Botha", phone: "+27 84 678 9012", title: "Fresh Milk", description: "Raw milk from Jersey cows. Collected daily. Cows are grass-fed and tested regularly for quality and safety.", category: "Dairy", price: 15.00, quantity: 100, unit: "litre", location: "Western Cape", status: "active", created_at: new Date().toISOString() },
};

function useSingleListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_listings")
        .select(`*, profiles:farmer_id (full_name, phone)`)
        .eq("id", id)
        .single();

      if (error || !data) {
        return MOCK_LISTINGS[id] ?? MOCK_LISTINGS["1"];
      }
      return {
        ...data,
        farmer_name: (data as any).profiles?.full_name ?? "Unknown Farmer",
        phone: (data as any).profiles?.phone ?? "",
      } as ProductListing & { farmer_name: string; phone: string };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const isFarmer = profile?.role === "farmer" || profile?.role === "admin";
  const [contacted, setContacted] = useState(false);
  const sendNotification = useSendNotification();

  const { data: item, isLoading } = useSingleListing(id ?? "1");

  const handleContact = async () => {
    if (!user || !item) return;

    const chatParams = {
      listingId: item.id,
      otherId: item.farmer_id,
      otherName: item.farmer_name ?? "Farmer",
      listingTitle: item.title,
      listingPrice: String(item.price),
      listingUnit: item.unit,
    };

    if (contacted) {
      router.push({ pathname: "/profile/chat" as any, params: chatParams });
      return;
    }

    try {
      await sendNotification.mutateAsync({
        farmerId: item.farmer_id,
        listingId: item.id,
        listingTitle: item.title,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setContacted(true);
      router.push({ pathname: "/profile/chat" as any, params: chatParams });
    } catch {
      Alert.alert("Error", "Could not open chat. Please try again.");
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Feather name="lock" size={48} color={C.primary} style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: C.text, textAlign: "center", marginBottom: 10 }}>
          Sign in to view details
        </Text>
        <Text style={{ fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", marginBottom: 32, lineHeight: 22 }}>
          Create a free account or sign in to view product details and contact sellers.
        </Text>
        <Pressable
          style={{ backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12 }}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: C.textSecondary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading || !item) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const farmerInitials = (item.farmer_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>Product Details</Text>
        <Pressable style={styles.navBtn}>
          <Feather name="share-2" size={20} color={C.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View style={styles.imageBox}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.productImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="package" size={48} color={`${C.primary}40`} />
            </View>
          )}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>R{Number(item.price).toFixed(2)}</Text>
              <Text style={styles.unit}>per {item.unit}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Feather name="package" size={16} color={C.primary} />
              <View>
                <Text style={styles.infoLabel}>Available</Text>
                <Text style={styles.infoValue}>{item.quantity} {item.unit}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Feather name="map-pin" size={16} color={C.primary} />
              <View>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{item.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.farmerCard}>
            <View style={styles.farmerAvatar}>
              <Text style={styles.farmerAvatarText}>{farmerInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerLabel}>Listed by</Text>
              <Text style={styles.farmerName}>{item.farmer_name}</Text>
              <View style={styles.farmerMeta}>
                <Feather name="map-pin" size={11} color={C.textSecondary} />
                <Text style={styles.farmerLocation}>{item.location}</Text>
                <View style={styles.verifiedBadge}>
                  <Feather name="check-circle" size={11} color={C.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descLabel}>About this product</Text>
          <Text style={styles.descText}>{item.description}</Text>

          <View style={styles.divider} />

          <View style={styles.tags}>
            {[item.category, item.unit, item.location.split(",")[0]].map((tag) => (
              <View key={tag} style={styles.tag}>
                <Feather name="tag" size={11} color={C.primaryLight} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {!isFarmer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.contactBtn,
              contacted && styles.contactedBtn,
              sendNotification.isPending && { opacity: 0.7 },
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleContact}
            disabled={sendNotification.isPending}
          >
            {sendNotification.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="message-circle" size={20} color="#fff" />
            )}
            <Text style={styles.contactBtnText}>
              {sendNotification.isPending ? "Opening chat..." : contacted ? "Open Chat" : "Message Seller"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.background,
  },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.text },
  imageBox: { height: 220, marginHorizontal: 20, borderRadius: 20, marginBottom: 20, position: "relative", overflow: "hidden" },
  productImage: { width: "100%", height: "100%", borderRadius: 20 },
  imagePlaceholder: { flex: 1, backgroundColor: `${C.primary}10`, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  statusBadge: { position: "absolute", top: 14, right: 14, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.success },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.success },
  body: { paddingHorizontal: 20, gap: 0 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16, gap: 12 },
  category: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.primaryLight, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 28 },
  priceBox: { alignItems: "flex-end" },
  price: { fontSize: 24, fontFamily: "Inter_700Bold", color: C.primary },
  unit: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  infoGrid: { flexDirection: "row", gap: 20, marginBottom: 20 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  farmerCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  farmerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  farmerAvatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  farmerLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  farmerName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  farmerMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  farmerLocation: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.success },
  descLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 8 },
  descText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 22 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: `${C.primary}10`, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primaryLight },
  footer: { paddingHorizontal: 20, paddingTop: 16, backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border },
  contactBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.primary, borderRadius: 14, padding: 16 },
  contactedBtn: { backgroundColor: C.success },
  contactBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
