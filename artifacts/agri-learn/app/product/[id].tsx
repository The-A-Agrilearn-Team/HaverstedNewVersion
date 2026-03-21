import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const C = Colors.light;

const LISTINGS: Record<string, {
  id: string; farmer_id: string; farmer_name: string; title: string; description: string;
  category: string; price: number; quantity: number; unit: string; location: string; status: string; phone: string;
}> = {
  "1": { id: "1", farmer_id: "f1", farmer_name: "Sipho Ndlovu", title: "Fresh Tomatoes", description: "Ripe, juicy farm-fresh tomatoes. Grown without pesticides using organic methods. Available for pickup from the farm or delivery within Durban area. Minimum order 5kg. Bulk discounts available for orders over 20kg.", category: "Vegetables", price: 12.50, quantity: 50, unit: "kg", location: "Durban, KZN", status: "active", phone: "+27 82 123 4567" },
  "2": { id: "2", farmer_id: "f2", farmer_name: "Thabo Molefe", title: "Free-Range Eggs", description: "Organic free-range eggs from happy hens. Fresh daily. Our hens roam freely on natural pasture and are fed a supplementary diet of organic grain. No hormones or antibiotics used. Collection or delivery available.", category: "Poultry", price: 4.00, quantity: 200, unit: "dozen", location: "Johannesburg, GP", status: "active", phone: "+27 71 234 5678" },
  "3": { id: "3", farmer_id: "f3", farmer_name: "Nomvula Dlamini", title: "Butternut Squash", description: "Large, sweet butternut squash. Perfect for soups and roasting. Harvested at peak ripeness. These butternuts are grown in nutrient-rich soil without synthetic fertilizers.", category: "Vegetables", price: 8.00, quantity: 100, unit: "kg", location: "Pretoria, GP", status: "active", phone: "+27 83 345 6789" },
  "4": { id: "4", farmer_id: "f4", farmer_name: "Pieter van Niekerk", title: "Mango Harvest", description: "Sweet Keitt mangoes, freshly harvested. Bulk orders welcome. These mangoes are grown in our Limpopo orchard using sustainable practices. Ideal for export quality standards.", category: "Fruits", price: 25.00, quantity: 300, unit: "kg", location: "Limpopo", status: "active", phone: "+27 72 456 7890" },
  "5": { id: "5", farmer_id: "f5", farmer_name: "Zanele Khumalo", title: "Yellow Maize", description: "Grade A yellow maize, dried and ready for milling or livestock feed. Moisture content below 14%. Stored in clean, pest-free conditions.", category: "Grains", price: 3.50, quantity: 2000, unit: "kg", location: "Free State", status: "active", phone: "+27 79 567 8901" },
  "6": { id: "6", farmer_id: "f6", farmer_name: "Johan Botha", title: "Fresh Milk", description: "Raw milk from Jersey cows. Collected daily. Contact for delivery schedule. Our cows are grass-fed and tested regularly for quality and safety.", category: "Dairy", price: 15.00, quantity: 100, unit: "litre", location: "Western Cape", status: "active", phone: "+27 84 678 9012" },
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [contacted, setContacted] = useState(false);

  const item = LISTINGS[id ?? "1"] ?? LISTINGS["1"];

  const handleContact = () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to contact the seller.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setContacted(true);
    Alert.alert(
      "Request Sent",
      `Your interest in "${item.title}" has been sent to ${item.farmer_name}. They will contact you shortly.`,
      [{ text: "OK" }]
    );
  };

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
          <Feather name="package" size={52} color={C.primary} />
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: C.success }]} />
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
              <Text style={styles.price}>R{item.price.toFixed(2)}</Text>
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
              <Text style={styles.farmerAvatarText}>
                {item.farmer_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerLabel}>Sold by</Text>
              <Text style={styles.farmerName}>{item.farmer_name}</Text>
              <View style={styles.farmerMeta}>
                <Feather name="map-pin" size={12} color={C.textSecondary} />
                <Text style={styles.farmerLocation}>{item.location}</Text>
              </View>
            </View>
            <View style={[styles.verifiedBadge]}>
              <Feather name="check-circle" size={14} color={C.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descLabel}>About this product</Text>
          <Text style={styles.descText}>{item.description}</Text>

          <View style={styles.divider} />

          <View style={styles.tags}>
            <View style={styles.tag}>
              <Feather name="shield" size={13} color={C.primaryLight} />
              <Text style={styles.tagText}>Quality Checked</Text>
            </View>
            <View style={styles.tag}>
              <Feather name="truck" size={13} color={C.primaryLight} />
              <Text style={styles.tagText}>Delivery Available</Text>
            </View>
            <View style={styles.tag}>
              <Feather name="refresh-cw" size={13} color={C.primaryLight} />
              <Text style={styles.tagText}>Fresh Stock</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.contactBtn,
            contacted && styles.contactedBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleContact}
          disabled={contacted}
        >
          <Feather name={contacted ? "check" : "message-circle"} size={20} color="#fff" />
          <Text style={styles.contactBtnText}>
            {contacted ? "Request Sent" : "Contact Seller"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.background,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.text },
  imageBox: {
    height: 200,
    backgroundColor: `${C.primary}10`,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
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
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
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
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${C.primary}10`,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primaryLight },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: C.background,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
  },
  contactedBtn: { backgroundColor: C.success },
  contactBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
