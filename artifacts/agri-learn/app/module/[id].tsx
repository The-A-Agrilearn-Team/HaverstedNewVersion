import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const C = Colors.light;

const MODULES: Record<string, { id: string; title: string; description: string; category: string; level: string; content: string; duration_minutes: number }> = {
  "1": { id: "1", title: "Intro to Crop Rotation", description: "Improve soil health through strategic crop rotation.", category: "Crops", level: "beginner", duration_minutes: 15, content: `Crop rotation is the practice of growing different types of crops in the same area across a sequence of growing seasons.\n\nBENEFITS\n• Reduces soil erosion\n• Increases soil fertility\n• Controls pests and diseases\n• Improves water retention\n\nBASIC 4-YEAR ROTATION\n1. Year 1: Legumes (nitrogen fixers)\n2. Year 2: Brassicas (heavy feeders)\n3. Year 3: Root vegetables\n4. Year 4: Fallow or cover crops\n\nGETTING STARTED\nStart by mapping your land into equal sections and assigning each section a different crop family. Keep detailed records of what grew where each year.\n\nLEGUME CROPS\nLegumes are particularly valuable in rotation because they fix atmospheric nitrogen into the soil through symbiotic bacteria in their root nodules. This natural fertilization can reduce or eliminate the need for synthetic nitrogen fertilizers.\n\nExamples: Beans, peas, soybeans, cowpeas, groundnuts\n\nPRACTICAL TIPS\n• Start small - rotate just 2 or 3 crops before adding complexity\n• Keep a farm diary recording crop varieties, yields, and observations\n• Test soil before and after each cycle to track improvement\n• Join a local farming cooperative to share knowledge` },
  "2": { id: "2", title: "Water Management Basics", description: "Efficient irrigation for small-scale farms.", category: "Irrigation", level: "beginner", duration_minutes: 20, content: `Efficient water use is critical for profitable, sustainable farming.\n\nDRIP IRRIGATION\nDelivers water directly to the plant root zone, reducing evaporation by up to 60%. This method is ideal for row crops, orchards, and vegetables.\n\nRAINWATER HARVESTING\nCollect and store rainwater during rainy seasons for use during dry periods. A 100m² roof can collect approximately 50,000 liters annually.\n\nSCHEDULING\nWater early morning (4-8 AM) or evening to minimize evaporation. Avoid watering during peak heat (10 AM - 4 PM) when evaporation rates are highest.\n\nSOIL MOISTURE MANAGEMENT\n• Sandy soils: Water frequently but in small amounts\n• Clay soils: Water less frequently but more deeply\n• Loamy soils: Ideal for most crops, moderate watering schedule\n\nWATER CONSERVATION TIPS\n• Mulch around plants to retain moisture\n• Use raised beds to improve drainage and reduce water needs\n• Plant windbreaks to reduce evaporation from wind` },
  "3": { id: "3", title: "Soil Testing & pH", description: "Understand and optimize your soil composition.", category: "Soil", level: "intermediate", duration_minutes: 25, content: `Knowing your soil composition is the foundation of successful farming.\n\nWHAT TO TEST\n• pH level (ideal: 6.0–7.0 for most crops)\n• Nitrogen (N), Phosphorus (P), Potassium (K) — the NPK values\n• Organic matter content\n• Micronutrients: Iron, Zinc, Manganese\n\nHOW TO TEST\n1. Collect samples from multiple spots in your field\n2. Take samples from 15-20cm depth\n3. Mix samples together and take a 500g subsample\n4. Use a home test kit or send to an accredited laboratory\n\nADJUSTING pH\n• Too acidic (below 6.0): Add agricultural lime at 1-2 tons/hectare\n• Too alkaline (above 7.5): Add sulfur or organic matter\n• Always retest after 3 months to see the effect\n\nNPK EXPLAINED\n• Nitrogen (N): Promotes leafy green growth\n• Phosphorus (P): Encourages root development and flowering\n• Potassium (K): Improves overall plant health and disease resistance\n\nORGANIC MATTER\nAim for 3-5% organic matter content. Increase it by adding compost, manure, or incorporating crop residues.` },
  "4": { id: "4", title: "Pest Identification Guide", description: "Identify and manage common crop pests.", category: "Pest Control", level: "beginner", duration_minutes: 18, content: `Early identification is key to controlling pest damage.\n\nCOMMON PESTS\n• Aphids: Small, soft-bodied insects on new growth. Cluster under leaves.\n• Whiteflies: Tiny white insects on leaf undersides. Spread viral diseases.\n• Cutworms: Larvae that cut seedlings at soil level at night.\n• Bollworms: Damage crops by boring into fruit and grain heads.\n\nINTEGRATED PEST MANAGEMENT (IPM)\n1. Monitor regularly — walk your fields weekly\n2. Set action thresholds — not every pest requires treatment\n3. Use biological controls first (beneficial insects, birds)\n4. Apply pesticides as last resort, following safety guidelines\n\nBIOLOGICAL CONTROLS\n• Ladybirds eat aphids\n• Ground beetles eat soil-dwelling pests\n• Parasitic wasps attack caterpillars\n• Birds eat a wide variety of insects\n\nSAFE PESTICIDE USE\n• Always read and follow label instructions\n• Wear appropriate protective equipment\n• Never spray on windy days\n• Respect pre-harvest intervals` },
  "5": { id: "5", title: "Selling at Farmers Markets", description: "Price and present your produce for maximum sales.", category: "Business", level: "beginner", duration_minutes: 22, content: `Farmers markets offer direct access to customers and better margins than wholesale.\n\nPRICING STRATEGY\n• Research what competitors charge at the same market\n• Calculate your full cost: seeds, water, fertilizer, labor, transport, stall fee\n• Add a 25-40% profit margin to cover risks and growth\n• Price in round numbers ending in .50 or .00 for easy change\n\nDISPLAY TIPS\n• Use height variation — raised items at back, short items in front\n• Keep produce clean, polished, and sorted by size\n• Use clear, handwritten price signs in large font\n• Include your farm name and a brief story about your farming practices\n\nCUSTOMER SERVICE\n• Smile and greet every customer who approaches\n• Know your produce — how to store it, how to cook it\n• Offer samples when permitted by market rules\n• Build relationships — repeat customers are your most valuable\n\nRECORD KEEPING\n• Track what sells well and what doesn't\n• Note which products need price adjustments\n• Keep records for tax purposes` },
  "6": { id: "6", title: "Livestock Health Basics", description: "Essential health management for small-scale livestock.", category: "Livestock", level: "beginner", duration_minutes: 30, content: `Healthy livestock is the foundation of a profitable livestock operation.\n\nDAILY CHECKS\n• Fresh, clean water always available\n• Observe animals for signs of illness (lethargy, loss of appetite)\n• Monitor feed consumption — changes can indicate health issues\n• Check for injuries or wounds that need treatment\n\nVACCINATION SCHEDULE\nWork with a local veterinarian to establish a vaccination program specific to your region and species. Common vaccinations in South Africa include:\n• Cattle: Brucellosis, Lumpy Skin Disease, Foot and Mouth\n• Goats/Sheep: Pasteurella, Pulpy Kidney, Anthrax\n• Poultry: Newcastle Disease, Marek's Disease\n\nSIGNS OF ILLNESS\n• Dull, sunken eyes\n• Dry, cracked nose (in ruminants)\n• Rough or dull coat/feathers\n• Isolation from the herd/flock\n• Abnormal droppings\n• Labored breathing\n\nPREVENTIVE MEASURES\n• Quarantine new animals for 2-3 weeks before introducing to herd\n• Maintain clean housing and remove manure regularly\n• Rotate grazing pastures to break parasite cycles\n• Deworm regularly according to a veterinary schedule` },
};

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);

  const mod = MODULES[id ?? "1"] ?? MODULES["1"];
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
        <View style={styles.navActions}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => {
              setBookmarked(!bookmarked);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Feather
              name={bookmarked ? "bookmark" : "bookmark"}
              size={22}
              color={bookmarked ? C.primary : C.text}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
          {mod.content.split("\n\n").map((block, i) => {
            const isHeading = block === block.toUpperCase() && block.length < 60 && !block.startsWith("•") && !block.match(/^\d/);
            if (isHeading) {
              return (
                <Text key={i} style={styles.contentHeading}>{block}</Text>
              );
            }
            const lines = block.split("\n");
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
        {completed ? (
          <View style={styles.completedBadge}>
            <Feather name="check-circle" size={20} color={C.success} />
            <Text style={styles.completedText}>Module Completed!</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.completeBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => {
              setCompleted(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
          >
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>Mark as Complete</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  navActions: { flexDirection: "row", gap: 10 },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: `${C.primary}14`,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  levelPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaChipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  heroTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 32 },
  heroDesc: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 22 },
  contentCard: {
    backgroundColor: C.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  contentHeading: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: C.primary,
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
  },
  contentBlock: { gap: 4, marginBottom: 4 },
  contentText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 24 },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginLeft: 4 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginTop: 9 },
  bulletNum: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.primary, width: 20 },
  bulletText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 24, flex: 1 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: C.background,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
  },
  completeBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: `${C.success}12`,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: `${C.success}20`,
  },
  completedText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.success },
});
