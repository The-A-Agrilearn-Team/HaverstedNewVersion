import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
import {
  AgriService,
  SERVICE_CATEGORIES,
  ServiceCategory,
  useAgriServices,
} from "@/hooks/useServices";
import { aiSearchServices, AiSearchResult } from "@/lib/aiSearch";

const C = Colors.light;

const CAT_ICONS: Record<ServiceCategory, string> = {
  Fertilisers: "droplet",
  "Pest Control": "shield",
  "Soil Testing": "layers",
  "Equipment Rental": "truck",
  Veterinary: "heart",
  Irrigation: "cloud-rain",
  Transport: "navigation",
  "Seeds & Seedlings": "feather",
  Other: "package",
};

export default function ServiceWindowScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "All">("All");
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiSearchResult | null>(null);

  const { data: allServices = [], isLoading, refetch } = useAgriServices();
  const isAdmin = profile?.role === "admin";

  const filteredServices = useMemo(() => {
    if (aiResult) return aiResult.matches;
    if (activeCategory === "All") return allServices;
    return allServices.filter((s) => s.category === activeCategory);
  }, [allServices, activeCategory, aiResult]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const runAiSearch = async () => {
    if (!aiQuery.trim()) {
      setAiResult(null);
      return;
    }
    setAiLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await aiSearchServices(aiQuery, allServices);
      setAiResult(result);
    } finally {
      setAiLoading(false);
    }
  };

  const clearAi = () => {
    setAiQuery("");
    setAiResult(null);
  };

  if (!user) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 60 }]}>
        <Feather name="lock" size={40} color={C.textTertiary} />
        <Text style={styles.gateTitle}>Sign In Required</Text>
        <Text style={styles.gateText}>Create an account to access the Service Window.</Text>
        <Pressable style={styles.gateBtn} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.gateBtnText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topBarRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Service Window</Text>
            <Text style={styles.pageSubtitle}>
              Find fertilisers, pest control, soil testing, equipment & more
            </Text>
          </View>
          {isAdmin && (
            <Pressable
              style={styles.newBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/window/create");
              }}
            >
              <Feather name="plus" size={20} color="#fff" />
            </Pressable>
          )}
        </View>

        <View style={styles.aiBar}>
          <Feather name="cpu" size={16} color={C.primary} />
          <TextInput
            style={styles.aiInput}
            placeholder="Ask the AI: e.g. cheap soil testing in KZN…"
            placeholderTextColor={C.textTertiary}
            value={aiQuery}
            onChangeText={setAiQuery}
            onSubmitEditing={runAiSearch}
            returnKeyType="search"
          />
          {aiQuery.length > 0 && (
            <Pressable onPress={clearAi} hitSlop={8}>
              <Feather name="x-circle" size={18} color={C.textTertiary} />
            </Pressable>
          )}
          <Pressable
            style={styles.aiBtn}
            onPress={runAiSearch}
            disabled={aiLoading || !aiQuery.trim()}
          >
            {aiLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="search" size={16} color="#fff" />
            )}
          </Pressable>
        </View>

        {!aiResult && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            <CatChip
              label="All"
              icon="grid"
              active={activeCategory === "All"}
              onPress={() => setActiveCategory("All")}
            />
            {SERVICE_CATEGORIES.map((cat) => (
              <CatChip
                key={cat}
                label={cat}
                icon={CAT_ICONS[cat]}
                active={activeCategory === cat}
                onPress={() => setActiveCategory(cat)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {aiResult && (
          <View style={styles.aiSummaryCard}>
            <View style={styles.aiSummaryHeader}>
              <Feather name="cpu" size={16} color={C.primary} />
              <Text style={styles.aiSummaryTitle}>AI Assistant{aiResult.fromCache ? " (offline)" : ""}</Text>
              <Pressable onPress={clearAi} hitSlop={8}>
                <Text style={styles.aiClear}>Clear</Text>
              </Pressable>
            </View>
            <Text style={styles.aiSummaryText}>{aiResult.summary}</Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 60 }} />
        ) : filteredServices.length === 0 && !aiResult ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>No services in this category yet</Text>
          </View>
        ) : (
          filteredServices.map((s) => <ServiceCard key={s.id} service={s} />)
        )}

        {aiResult?.externalSuggestions && aiResult.externalSuggestions.length > 0 && (
          <View style={styles.externalSection}>
            <View style={styles.externalHeader}>
              <Feather name="external-link" size={16} color={C.textSecondary} />
              <Text style={styles.externalTitle}>External suggestions</Text>
            </View>
            <Text style={styles.externalSubtitle}>
              These services aren&apos;t in the app yet, but you can find them here:
            </Text>
            {aiResult.externalSuggestions.map((ext, i) => (
              <View key={i} style={styles.externalCard}>
                <Text style={styles.externalName}>{ext.name}</Text>
                <Text style={styles.externalDesc}>{ext.description}</Text>
                <View style={styles.externalWhere}>
                  <Feather name="map-pin" size={12} color={C.primary} />
                  <Text style={styles.externalWhereText}>{ext.where_to_find}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function CatChip({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.catChip, active && styles.catChipActive]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
    >
      <Feather name={icon as any} size={13} color={active ? "#fff" : C.textSecondary} />
      <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ServiceCard({ service: s }: { service: AgriService }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.93 : 1 }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/window/${s.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.catIcon, { backgroundColor: `${C.primary}12` }]}>
          <Feather name={(CAT_ICONS[s.category] ?? "package") as any} size={20} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={2}>{s.title}</Text>
          <Text style={styles.cardProvider}>{s.provider_name}</Text>
        </View>
        <View style={styles.ratingPill}>
          <Feather name="star" size={11} color={C.warning} />
          <Text style={styles.ratingText}>{s.rating.toFixed(1)}</Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{s.description}</Text>

      <View style={styles.cardMeta}>
        <MetaBit icon="tag" label={`From R${s.price_from.toLocaleString("en-ZA")} ${s.price_unit}`} />
        <MetaBit icon="map-pin" label={s.location} />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{s.category}</Text>
        </View>
        <View style={styles.contactRow}>
          {s.contact_whatsapp && (
            <Pressable
              hitSlop={6}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.selectionAsync();
                Linking.openURL(`https://wa.me/${s.contact_whatsapp!.replace(/[^\d]/g, "")}`);
              }}
              style={styles.iconBtn}
            >
              <Feather name="message-circle" size={15} color={C.success} />
            </Pressable>
          )}
          {s.contact_phone && (
            <Pressable
              hitSlop={6}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.selectionAsync();
                Linking.openURL(`tel:${s.contact_phone!.replace(/\s/g, "")}`);
              }}
              style={styles.iconBtn}
            >
              <Feather name="phone" size={15} color={C.primary} />
            </Pressable>
          )}
          <Feather name="chevron-right" size={18} color={C.textTertiary} />
        </View>
      </View>
    </Pressable>
  );
}

function MetaBit({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.metaBit}>
      <Feather name={icon as any} size={12} color={C.textSecondary} />
      <Text style={styles.metaBitText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: C.background, alignItems: "center", paddingHorizontal: 32, gap: 16 },
  gateTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  gateText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22 },
  gateBtn: { backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  gateBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  topBar: { backgroundColor: C.background, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  topBarRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: C.text },
  pageSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  newBtn: { backgroundColor: C.primary, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  aiBar: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.surfaceSecondary, borderRadius: 14, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, borderWidth: 1.5, borderColor: `${C.primary}30` },
  aiInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, paddingVertical: 6 },
  aiBtn: { backgroundColor: C.primary, width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  catRow: { gap: 8, paddingVertical: 4 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface },
  catChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  catChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary },
  catChipTextActive: { color: "#fff" },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: "center", gap: 12, paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  aiSummaryCard: { backgroundColor: `${C.primary}08`, borderWidth: 1, borderColor: `${C.primary}30`, borderRadius: 14, padding: 14, gap: 6 },
  aiSummaryHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  aiSummaryTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.primary },
  aiClear: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary },
  aiSummaryText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 21 },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  catIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text, flex: 1 },
  cardProvider: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: `${C.warning}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  ratingText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.warning },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 20 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaBit: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.surfaceSecondary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  metaBitText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: 10 },
  categoryTag: { backgroundColor: `${C.primary}10`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  categoryTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.primary },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceSecondary },
  externalSection: { marginTop: 8, gap: 10 },
  externalHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  externalTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: C.text },
  externalSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginBottom: 4 },
  externalCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, gap: 6 },
  externalName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  externalDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 18 },
  externalWhere: { flexDirection: "row", alignItems: "center", gap: 4 },
  externalWhereText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primary },
});
