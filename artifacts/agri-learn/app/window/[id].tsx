import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useServiceDetail } from "@/hooks/useServices";

const C = Colors.light;

export default function ServiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: service, isLoading } = useServiceDetail(id);

  if (isLoading || !service) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 80 }]}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  const callPhone = () => {
    if (!service.contact_phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${service.contact_phone.replace(/\s/g, "")}`);
  };

  const messageWhatsApp = () => {
    if (!service.contact_whatsapp) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phone = service.contact_whatsapp.replace(/[^\d]/g, "");
    const text = encodeURIComponent(
      `Hi ${service.provider_name}, I found your service "${service.title}" on AgriLearn and I'd like to enquire.`,
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`);
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
        <Text style={styles.navTitle} numberOfLines={1}>Service Details</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.category}>{service.category}</Text>
            <View style={styles.ratingPill}>
              <Feather name="star" size={12} color={C.warning} />
              <Text style={styles.ratingText}>{service.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({service.review_count})</Text>
            </View>
          </View>

          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.providerName}>by {service.provider_name}</Text>
          <Text style={styles.description}>{service.description}</Text>

          <View style={styles.statsGrid}>
            <StatBox label="Starting price" value={`R${service.price_from.toLocaleString("en-ZA")}`} sub={service.price_unit} icon="tag" />
            <StatBox label="Location" value={service.location} icon="map-pin" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact the provider</Text>

          {service.contact_whatsapp && (
            <Pressable style={styles.contactBtn} onPress={messageWhatsApp}>
              <View style={[styles.contactIconBox, { backgroundColor: `${C.success}15` }]}>
                <Feather name="message-circle" size={20} color={C.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>{service.contact_whatsapp}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={C.textTertiary} />
            </Pressable>
          )}

          {service.contact_phone && (
            <Pressable style={styles.contactBtn} onPress={callPhone}>
              <View style={[styles.contactIconBox, { backgroundColor: `${C.primary}15` }]}>
                <Feather name="phone" size={20} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>Call</Text>
                <Text style={styles.contactValue}>{service.contact_phone}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={C.textTertiary} />
            </Pressable>
          )}
        </View>

        <View style={styles.tipCard}>
          <Feather name="info" size={16} color={C.primary} />
          <Text style={styles.tipText}>
            Always confirm pricing, availability, and delivery terms with the provider before paying. AgriLearn does not handle payments for services.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <View style={styles.statBox}>
      <Feather name={icon as any} size={15} color={C.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: C.background, alignItems: "center" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text, flex: 1, textAlign: "center", marginHorizontal: 8 },
  scroll: { padding: 16, gap: 16 },
  headerCard: { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20, gap: 10 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  category: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.primary, backgroundColor: `${C.primary}12`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: `${C.warning}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  ratingText: { fontSize: 13, fontFamily: "Inter_700Bold", color: C.warning },
  reviewCount: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.textSecondary, marginLeft: 2 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 30 },
  providerName: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 22, borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: 12 },
  statsGrid: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, backgroundColor: C.surfaceSecondary, borderRadius: 12, padding: 12, gap: 4 },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.textSecondary },
  statValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  statSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 4 },
  contactBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14 },
  contactIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary },
  contactValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text, marginTop: 1 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: `${C.primary}08`, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: `${C.primary}20` },
  tipText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 18 },
});
