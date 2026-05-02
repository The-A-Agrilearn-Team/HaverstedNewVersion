import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { supabase, LearningModule } from "@/lib/supabase";
import { useMarkComplete, useToggleBookmark, useBookmarks } from "@/hooks/useProgress";
import { useAuth } from "@/context/AuthContext";

const C = Colors.light;

const MOCK_MODULES: Record<string, LearningModule> = {
  "1": { id: "1", title: "Intro to Crop Rotation", description: "Improve soil health through strategic crop rotation techniques.", category: "Crops", level: "beginner", duration_minutes: 15, language: "en", created_at: new Date().toISOString(), content: "Crop rotation is the practice of growing different types of crops in the same area across a sequence of growing seasons.\n\nBENEFITS\n• Reduces soil erosion\n• Increases soil fertility\n• Controls pests and diseases\n• Improves water retention\n\nBASIC 4-YEAR ROTATION\n1. Year 1: Legumes (nitrogen fixers)\n2. Year 2: Brassicas (heavy feeders)\n3. Year 3: Root vegetables\n4. Year 4: Fallow or cover crops\n\nGETTING STARTED\nStart by mapping your land into equal sections and assigning each section a different crop family. Keep detailed records of what grew where each year.\n\nLEGUME CROPS\nLegumes fix atmospheric nitrogen into the soil through symbiotic bacteria in their root nodules. This reduces the need for synthetic nitrogen fertilizers.\n\nExamples: Beans, peas, soybeans, cowpeas, groundnuts\n\nPRACTICAL TIPS\n• Start small — rotate just 2 or 3 crops before adding complexity\n• Keep a farm diary recording crop varieties, yields, and observations\n• Test soil before and after each cycle to track improvement\n• Join a local farming cooperative to share knowledge" },
  "2": { id: "2", title: "Water Management Basics", description: "Efficient irrigation strategies for small-scale farms.", category: "Irrigation", level: "beginner", duration_minutes: 20, language: "en", created_at: new Date().toISOString(), content: "Efficient water use is critical for profitable, sustainable farming.\n\nDRIP IRRIGATION\nDelivers water directly to the plant root zone, reducing evaporation by up to 60%.\n\nRAINWATER HARVESTING\nCollect and store rainwater during rainy seasons. A 100m² roof can collect ~50,000 litres annually.\n\nSCHEDULING\nWater early morning (4–8 AM) or evening to minimize evaporation.\n\nSOIL MOISTURE MANAGEMENT\n• Sandy soils: Water frequently but in small amounts\n• Clay soils: Water less frequently but more deeply\n• Loamy soils: Ideal, moderate watering schedule\n\nWATER CONSERVATION TIPS\n• Mulch around plants to retain moisture\n• Use raised beds to improve drainage\n• Plant windbreaks to reduce evaporation" },
  "3": { id: "3", title: "Soil Testing & pH", description: "Understanding soil composition and optimizing for better yields.", category: "Soil", level: "intermediate", duration_minutes: 25, language: "en", created_at: new Date().toISOString(), content: "Knowing your soil composition is the foundation of successful farming.\n\nWHAT TO TEST\n• pH level (ideal: 6.0–7.0 for most crops)\n• Nitrogen (N), Phosphorus (P), Potassium (K)\n• Organic matter content\n• Micronutrients: Iron, Zinc, Manganese\n\nHOW TO TEST\n1. Collect samples from 8–10 spots in your field\n2. Take samples from 15–20cm depth\n3. Mix samples and take a 500g subsample\n4. Use a home test kit or send to an accredited lab\n\nADJUSTING pH\n• Too acidic (below 6.0): Add agricultural lime\n• Too alkaline (above 7.5): Add sulfur or organic matter\n• Retest after 3 months\n\nNPK EXPLAINED\n• Nitrogen (N): Promotes leafy green growth\n• Phosphorus (P): Encourages root development\n• Potassium (K): Improves disease resistance" },
  "4": { id: "4", title: "Pest Identification Guide", description: "Identify and manage common crop pests in South Africa.", category: "Pest Control", level: "beginner", duration_minutes: 18, language: "en", created_at: new Date().toISOString(), content: "Early identification is key to controlling pest damage.\n\nCOMMON PESTS\n• Aphids: Small, soft-bodied insects clustered on new growth\n• Whiteflies: Tiny white insects on leaf undersides\n• Cutworms: Larvae that cut seedlings at soil level at night\n• Bollworms: Bore into maize ears and cotton bolls\n• Red Spider Mite: Causes yellow stippling in hot, dry conditions\n\nINTEGRATED PEST MANAGEMENT (IPM)\n1. Monitor regularly — walk fields weekly\n2. Set action thresholds — not every pest needs treatment\n3. Use biological controls first\n4. Apply pesticides only as last resort\n\nBIOLOGICAL CONTROLS\n• Ladybirds eat 50–60 aphids per day\n• Ground beetles eat soil-dwelling pests\n• Parasitic wasps attack caterpillars\n• Bt spray targets caterpillars, safe for beneficial insects\n\nSAFE PESTICIDE USE\n• Read and follow label instructions\n• Wear gloves, goggles, and mask\n• Never spray on windy days\n• Respect pre-harvest intervals" },
  "5": { id: "5", title: "Selling at Farmers Markets", description: "Price and present your produce for maximum sales.", category: "Business", level: "beginner", duration_minutes: 22, language: "en", created_at: new Date().toISOString(), content: "Farmers markets offer better margins than wholesale — but success requires preparation.\n\nPRICING STRATEGY\n• Research competitor prices at the same market\n• Calculate full cost: seeds, water, fertilizer, labor, transport, stall fee\n• Add 25–40% profit margin\n• Price in round numbers for easy change\n\nDISPLAY TIPS\n• Use height variation — raised items at back\n• Keep produce clean, sorted by size\n• Clear, large handwritten price signs\n• Include your farm name and story\n\nCUSTOMER SERVICE\n• Smile and greet every customer\n• Know your produce — storage, cooking tips\n• Offer samples when permitted\n• Build relationships with regulars\n\nRECORD KEEPING\n• Track what sells well each week\n• Record expenses and income for tax\n• Keep records 5 years (SARS requirement)" },
  "6": { id: "6", title: "Livestock Health Basics", description: "Essential health management for small-scale livestock.", category: "Livestock", level: "beginner", duration_minutes: 30, language: "en", created_at: new Date().toISOString(), content: "Healthy livestock is the foundation of a profitable operation. Prevention is cheaper than treatment.\n\nDAILY CHECKS\n• Fresh, clean water always available\n• Observe for illness: lethargy, isolation, poor appetite\n• Monitor feed consumption\n• Check for injuries and wounds\n\nVACCINATION SCHEDULE\nWork with a local vet to establish a vaccination program:\n• Cattle: Brucellosis, Lumpy Skin Disease, Foot and Mouth\n• Goats/Sheep: Pasteurella, Pulpy Kidney, Anthrax\n• Poultry: Newcastle Disease (monthly for layers), Marek's Disease\n\nSIGNS OF ILLNESS\n• Dull, sunken eyes or discharge\n• Dry, cracked nose (cattle)\n• Rough or dull coat/feathers\n• Isolation from herd\n• Abnormal droppings\n• Labored breathing\n\nPREVENTIVE MEASURES\n• Quarantine new animals 2–3 weeks\n• Clean housing and remove manure regularly\n• Rotate grazing pastures to break parasite cycles\n• Deworm on veterinary schedule" },
};

function useSingleModule(id: string) {
  return useQuery({
    queryKey: ["module", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        return MOCK_MODULES[id] ?? MOCK_MODULES["1"];
      }
      return data as LearningModule;
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const role = profile?.role ?? "";
  const canAccess = role === "farmer" || role === "admin";

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Feather name="book-open" size={36} color="#2D6A4F" />
        </View>
        <Text style={{ fontSize: 24, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 10, textAlign: "center" }}>
          Farmers Only
        </Text>
        <Text style={{ fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 23, marginBottom: 32 }}>
          Learning modules are exclusively available to registered farmers. Create a farmer account to access this content.
        </Text>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, backgroundColor: "#2D6A4F", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, width: "100%", alignItems: "center" })}
          onPress={() => router.replace("/(auth)/register")}
        >
          <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" }}>Register as a Farmer</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginTop: 14, paddingVertical: 10 })}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: C.primary }}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    );
  }

  if (!canAccess) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Feather name="lock" size={32} color="#2D6A4F" />
        </View>
        <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 8, textAlign: "center" }}>
          Access Restricted
        </Text>
        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
          Learning modules are only available to farmers and admins. Your account type ({role}) does not have access.
        </Text>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, backgroundColor: "#2D6A4F", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13, flexDirection: "row", alignItems: "center", gap: 8 })}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={16} color="#fff" />
          <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const { data: mod, isLoading } = useSingleModule(id ?? "1");
  const { data: bookmarkedIds = [] } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const markComplete = useMarkComplete();

  const [completed, setCompleted] = useState(false);
  const isBookmarked = mod ? bookmarkedIds.includes(mod.id) : false;

  const handleMarkComplete = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    setCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (mod) {
      markComplete.mutate(mod.id);
    }
  };

  const handleBookmark = () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    if (!mod) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark.mutate({ moduleId: mod.id, isBookmarked });
  };

  if (isLoading || !mod) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const levelColor = mod.level === "beginner" ? "#059669" : mod.level === "intermediate" ? "#D97706" : "#DB2777";
  const levelBg = mod.level === "beginner" ? "#D1FAE5" : mod.level === "intermediate" ? "#FEF3C7" : "#FCE7F3";

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            isBookmarked && { backgroundColor: `${C.primary}18` },
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={handleBookmark}
        >
          <Feather name="bookmark" size={22} color={isBookmarked ? C.primary : C.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Feather name="book-open" size={36} color={C.primary} />
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.levelPill, { backgroundColor: levelBg }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>{mod.level}</Text>
            </View>
            <View style={styles.metaChip}>
              <Feather name="clock" size={12} color={C.textSecondary} />
              <Text style={styles.metaChipText}>{mod.duration_minutes} min read</Text>
            </View>
            <View style={styles.metaChip}>
              <Feather name="tag" size={12} color={C.textSecondary} />
              <Text style={styles.metaChipText}>{mod.category}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{mod.title}</Text>
          <Text style={styles.heroDesc}>{mod.description}</Text>
        </View>

        <View style={styles.contentCard}>
          {(mod.content || "").split("\n\n").map((block, i) => {
            const trimmed = block.trim();
            if (!trimmed) return null;
            const isHeading = trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.startsWith("•") && !trimmed.match(/^\d/);
            if (isHeading) {
              return <Text key={i} style={styles.contentHeading}>{trimmed}</Text>;
            }
            const lines = trimmed.split("\n");
            return (
              <View key={i} style={styles.contentBlock}>
                {lines.map((line, j) => {
                  if (line.startsWith("•")) {
                    return (
                      <View key={j} style={styles.bulletRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>{line.slice(2)}</Text>
                      </View>
                    );
                  }
                  if (line.match(/^\d+\./)) {
                    return (
                      <View key={j} style={styles.bulletRow}>
                        <Text style={styles.bulletNum}>{line.match(/^\d+/)?.[0]}.</Text>
                        <Text style={styles.bulletText}>{line.replace(/^\d+\.\s*/, "")}</Text>
                      </View>
                    );
                  }
                  return <Text key={j} style={styles.contentText}>{line}</Text>;
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {completed || markComplete.isSuccess ? (
          <View style={styles.completedBadge}>
            <Feather name="check-circle" size={20} color={C.success} />
            <Text style={styles.completedText}>Module Completed!</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.completeBtn, { opacity: pressed || markComplete.isPending ? 0.85 : 1 }]}
            onPress={handleMarkComplete}
            disabled={markComplete.isPending}
          >
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>
              {markComplete.isPending ? "Saving..." : "Mark as Complete"}
            </Text>
          </Pressable>
        )}
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
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center",
  },
  heroSection: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  heroIcon: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: `${C.primary}14`, alignItems: "center", justifyContent: "center",
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  levelPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaChipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  heroTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 32 },
  heroDesc: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 22 },
  contentCard: {
    backgroundColor: C.surface, marginHorizontal: 20, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border, gap: 4,
  },
  contentHeading: {
    fontSize: 12, fontFamily: "Inter_700Bold", color: C.primary, letterSpacing: 0.8, marginTop: 16, marginBottom: 6,
  },
  contentBlock: { gap: 4, marginBottom: 4 },
  contentText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 24 },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginLeft: 4 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginTop: 9 },
  bulletNum: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.primary, width: 20 },
  bulletText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 24, flex: 1 },
  footer: {
    paddingHorizontal: 20, paddingTop: 16, backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border,
  },
  completeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.primary, borderRadius: 14, padding: 16,
  },
  completeBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  completedBadge: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: `${C.success}12`, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: `${C.success}20`,
  },
  completedText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.success },
});
