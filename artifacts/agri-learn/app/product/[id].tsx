import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

    setContacted(true);

    router.push({
      pathname: "/profile/chat" as any,
      params: chatParams,
    });
  };

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
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>

        <Text style={styles.navTitle}>Product Details</Text>

        <Pressable style={styles.navBtn}>
          <Feather name="share-2" size={20} color={C.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={styles.imageBox}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="package" size={48} color={`${C.primary}40`} />
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.price}>
            R{Number(item.price).toFixed(2)} per {item.unit}
          </Text>

          <Text style={styles.descLabel}>About this product</Text>
          <Text style={styles.descText}>{item.description}</Text>
        </View>
      </ScrollView>

      {!isFarmer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={styles.contactBtn}
            onPress={handleContact}
          >
            <Feather name="message-circle" size={20} color="#fff" />

            <Text style={styles.contactBtnText}>
              {contacted ? "Open Chat" : "Message Seller"}
            </Text>
          </Pressable>
        </View>
      )}
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
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  imageBox: {
    height: 220,
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: `${C.primary}10`,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 20,
  },
  category: {
    fontSize: 13,
    color: C.primaryLight,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  price: {
    fontSize: 20,
    color: C.primary,
    marginVertical: 10,
  },
  descLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginTop: 10,
  },
  descText: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  contactBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});