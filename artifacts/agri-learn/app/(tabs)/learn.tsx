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
import Colors from "@/constants/colors";
import { LearningModule } from "@/lib/supabase";

const C = Colors.light;

const FILTERS = ["All", "Crops", "Livestock", "Irrigation", "Soil", "Pest Control", "Business"];

const MODULES: LearningModule[] = [
  { id: "1", title: "Intro to Crop Rotation", description: "Improve soil health through strategic crop rotation.", category: "Crops", level: "beginner", content: `# Crop Rotation\n\nCrop rotation is the practice of growing different types of crops in the same area across a sequence of growing seasons.\n\n## Benefits\n- Reduces soil erosion\n- Increases soil fertility\n- Controls pests and diseases\n- Improves water retention\n\n## Basic 4-Year Rotation\n1. **Year 1**: Legumes (nitrogen fixers)\n2. **Year 2**: Brassicas (heavy feeders)\n3. **Year 3**: Root vegetables\n4. **Year 4**: Fallow or cover crops\n\n## Getting Started\nStart by mapping your land into equal sections and assigning each section a different crop family. Keep detailed records of what grew where each year.`, image_url: undefined, duration_minutes: 15, language: "en", created_at: new Date().toISOString() },
  { id: "2", title: "Water Management Basics", description: "Efficient irrigation strategies for small-scale farms.", category: "Irrigation", level: "beginner", content: `# Water Management\n\nEfficient water use is critical for profitable, sustainable farming.\n\n## Drip Irrigation\nDelivers water directly to the plant root zone, reducing evaporation by up to 60%.\n\n## Rainwater Harvesting\nCollect and store rainwater during rainy seasons for use during dry periods.\n\n## Scheduling\nWater early morning or evening to minimize evaporation. Use soil moisture sensors when possible.`, duration_minutes: 20, language: "en", created_at: new Date().toISOString() },
  { id: "3", title: "Soil Testing & pH", description: "Understanding soil composition and optimizing for better yields.", category: "Soil", level: "intermediate", content: `# Soil Testing\n\nKnowing your soil composition is the foundation of successful farming.\n\n## What to Test\n- pH level (ideal: 6.0–7.0 for most crops)\n- Nitrogen (N), Phosphorus (P), Potassium (K)\n- Organic matter content\n\n## How to Test\n1. Collect samples from multiple spots\n2. Mix samples together\n3. Use a home test kit or send to a lab\n\n## Adjusting pH\n- Too acidic: Add agricultural lime\n- Too alkaline: Add sulfur or organic matter`, duration_minutes: 25, language: "en", created_at: new Date().toISOString() },
  { id: "4", title: "Pest Identification Guide", description: "Learn to identify and manage common crop pests.", category: "Pest Control", level: "beginner", content: `# Pest Identification\n\nEarly identification is key to controlling pest damage.\n\n## Common Pests\n- **Aphids**: Small, soft-bodied insects on new growth\n- **Whiteflies**: Tiny white insects on leaf undersides\n- **Cutworms**: Larvae that cut seedlings at soil level\n\n## Integrated Pest Management (IPM)\n1. Monitor regularly\n2. Set action thresholds\n3. Use biological controls first\n4. Apply pesticides as last resort`, duration_minutes: 18, language: "en", created_at: new Date().toISOString() },
  { id: "5", title: "Selling at Farmers Markets", description: "How to price and present your produce for maximum sales.", category: "Business", level: "beginner", content: `# Selling at Farmers Markets\n\n## Pricing Strategy\n- Research competitor prices\n- Factor in all costs (seeds, water, labor, transport)\n- Add 20-30% profit margin\n\n## Display Tips\n- Use height variation for visual interest\n- Keep produce clean and sorted by size\n- Use clear, handwritten price signs\n\n## Customer Service\n- Smile and greet every customer\n- Know your produce and how to cook it\n- Offer samples when permitted`, duration_minutes: 22, language: "en", created_at: new Date().toISOString() },
  { id: "6", title: "Livestock Health Basics", description: "Essential health management for small-scale livestock.", category: "Livestock", level: "beginner", content: `# Livestock Health\n\n## Daily Checks\n- Fresh water always available\n- Check for signs of illness (lethargy, loss of appetite)\n- Monitor feed consumption\n\n## Vaccination Schedule\nWork with a local vet to establish a vaccination program for your region and species.\n\n## Common Signs of Illness\n- Dull eyes and dry nose\n- Rough or dull coat\n- Isolation from herd\n- Abnormal droppings`, duration_minutes: 30, language: "en", created_at: new Date().toISOString() },
];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = MODULES.filter((m) => {
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
        <Text style={styles.pageSubtitle}>{MODULES.length} modules available</Text>
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
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
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
                    <View style={[styles.levelPill, { backgroundColor: mod.level === "beginner" ? "#D1FAE5" : mod.level === "intermediate" ? "#FEF3C7" : "#FCE7F3" }]}>
                      <Text style={[styles.levelText, { color: mod.level === "beginner" ? "#059669" : mod.level === "intermediate" ? "#D97706" : "#DB2777" }]}>
                        {mod.level}
                      </Text>
                    </View>
                    <Text style={styles.durationText}>
                      <Feather name="clock" size={11} color={C.textSecondary} /> {mod.duration_minutes} min
                    </Text>
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
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: C.background,
  },
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
  durationText: { fontSize: 12, color: C.textSecondary, fontFamily: "Inter_400Regular" },
  moduleTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 3 },
  moduleDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 18, marginBottom: 4 },
  moduleCat: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primaryLight },
});
