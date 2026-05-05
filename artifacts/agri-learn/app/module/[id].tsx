import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { supabase, LearningModule } from "@/lib/supabase";
import { useMarkComplete, useToggleBookmark, useBookmarks } from "@/hooks/useProgress";
import { useAuth } from "@/context/AuthContext";
import { askModuleAssistant } from "@/lib/aiSearch";

const C = Colors.light;

const MOCK_MODULES: Record<string, LearningModule> = {
  "1": { id: "1", title: "Intro to Crop Rotation", description: "Improve soil health through strategic crop rotation techniques.", category: "Crops", level: "beginner", duration_minutes: 15, language: "en", created_at: new Date().toISOString(), content: "Crop rotation is the practice of growing different types of crops in the same area across a sequence of growing seasons.\n\nBENEFITS\n• Reduces soil erosion\n• Increases soil fertility\n• Controls pests and diseases\n• Improves water retention\n\nBASIC 4-YEAR ROTATION\n1. Year 1: Legumes (nitrogen fixers)\n2. Year 2: Brassicas (heavy feeders)\n3. Year 3: Root vegetables\n4. Year 4: Fallow or cover crops\n\nGETTING STARTED\nStart by mapping your land into equal sections and assigning each section a different crop family. Keep detailed records of what grew where each year.\n\nLEGUME CROPS\nLegumes fix atmospheric nitrogen into the soil through symbiotic bacteria in their root nodules. This reduces the need for synthetic nitrogen fertilizers.\n\nExamples: Beans, peas, soybeans, cowpeas, groundnuts\n\nPRACTICAL TIPS\n• Start small — rotate just 2 or 3 crops before adding complexity\n• Keep a farm diary recording crop varieties, yields, and observations\n• Test soil before and after each cycle to track improvement\n• Join a local farming cooperative to share knowledge" },
  "2": { id: "2", title: "Water Management Basics", description: "Efficient irrigation strategies for small-scale farms.", category: "Irrigation", level: "beginner", duration_minutes: 20, language: "en", created_at: new Date().toISOString(), content: "Efficient water use is critical for profitable, sustainable farming.\n\nDRIP IRRIGATION\nDelivers water directly to the plant root zone, reducing evaporation by up to 60%.\n\nRAINWATER HARVESTING\nCollect and store rainwater during rainy seasons. A 100m² roof can collect ~50,000 litres annually.\n\nSCHEDULING\nWater early morning (4–8 AM) or evening to minimize evaporation.\n\nSOIL MOISTURE MANAGEMENT\n• Sandy soils: Water frequently but in small amounts\n• Clay soils: Water less frequently but more deeply\n• Loamy soils: Ideal, moderate watering schedule\n\nWATER CONSERVATION TIPS\n• Mulch around plants to retain moisture\n• Use raised beds to improve drainage\n• Plant windbreaks to reduce evaporation" },
  "3": { id: "3", title: "Soil Testing & pH", description: "Understanding soil composition and optimizing for better yields.", category: "Soil", level: "intermediate", duration_minutes: 25, language: "en", created_at: new Date().toISOString(), content: "Knowing your soil composition is the foundation of successful farming.\n\nWHAT TO TEST\n• pH level (ideal: 6.0–7.0 for most crops)\n• Nitrogen (N), Phosphorus (P), Potassium (K)\n• Organic matter content\n• Micronutrients: Iron, Zinc, Manganese\n\nHOW TO TEST\n1. Collect samples from 8–10 spots in your field\n2. Take samples from 15–20cm depth\n3. Mix samples and take a 500g subsample\n4. Use a home test kit or send to an accredited lab\n\nADJUSTING pH\n• Too acidic (below 6.0): Add agricultural lime\n• Too alkaline (above 7.5): Add sulfur or organic matter\n• Retest after 3 months\n\nNPK EXPLAINED\n• Nitrogen (N): Promotes leafy green growth\n• Phosphorus (P): Encourages root development\n• Potassium (K): Improves disease resistance" },
  "4": { id: "4", title: "Pest Identification Guide", description: "Identify and manage common crop pests in South Africa.", category: "Pest Control", level: "beginner", duration_minutes: 18, language: "en", created_at: new Date().toISOString(), content: "Early identification is key to controlling pest damage.\n\nCOMMON PESTS\n• Aphids: Small, soft-bodied insects clustered on new growth\n• Whiteflies: Tiny white insects on leaf undersides\n• Cutworms: Larvae that cut seedlings at soil level at night\n• Bollworms: Bore into maize ears and cotton bolls\n• Red Spider Mite: Causes yellow stippling in hot, dry conditions\n\nINTEGRATED PEST MANAGEMENT (IPM)\n1. Monitor regularly — walk fields weekly\n2. Set action thresholds — not every pest needs treatment\n3. Use biological controls first\n4. Apply pesticides only as last resort\n\nBIOLOGICAL CONTROLS\n• Ladybirds eat 50–60 aphids per day\n• Ground beetles eat soil-dwelling pests\n• Parasitic wasps attack caterpillars\n• Bt spray targets caterpillars, safe for beneficial insects\n\nSAFE PESTICIDE USE\n• Read and follow label instructions\n• Wear gloves, goggles, and mask\n• Never spray on windy days\n• Respect pre-harvest intervals" },
  "5": { id: "5", title: "Selling at Farmers Markets", description: "Price and present your produce for maximum sales.", category: "Business", level: "beginner", duration_minutes: 22, language: "en", created_at: new Date().toISOString(), content: "Farmers markets offer better margins than wholesale — but success requires preparation.\n\nPRICING STRATEGY\n• Research competitor prices at the same market\n• Calculate full cost: seeds, water, fertilizer, labor, transport, stall fee\n• Add 25–40% profit margin\n• Price in round numbers for easy change\n\nDISPLAY TIPS\n• Use height variation — raised items at back\n• Keep produce clean, sorted by size\n• Clear, large handwritten price signs\n• Include your farm name and story\n\nCUSTOMER SERVICE\n• Smile and greet every customer\n• Know your produce — storage, cooking tips\n• Offer samples when permitted\n• Build relationships with regulars\n\nRECORD KEEPING\n• Track what sells well each week\n• Record expenses and income for tax\n• Keep records 5 years (SARS requirement)" },
  "6": { id: "6", title: "Livestock Health Basics", description: "Essential health management for small-scale livestock.", category: "Livestock", level: "beginner", duration_minutes: 30, language: "en", created_at: new Date().toISOString(), content: "Healthy livestock is the foundation of a profitable operation. Prevention is cheaper than treatment.\n\nDAILY CHECKS\n• Fresh, clean water always available\n• Observe for illness: lethargy, isolation, poor appetite\n• Monitor feed consumption\n• Check for injuries and wounds\n\nVACCINATION SCHEDULE\nWork with a local vet to establish a vaccination program:\n• Cattle: Brucellosis, Lumpy Skin Disease, Foot and Mouth\n• Goats/Sheep: Pasteurella, Pulpy Kidney, Anthrax\n• Poultry: Newcastle Disease (monthly for layers), Marek's Disease\n\nSIGNS OF ILLNESS\n• Dull, sunken eyes or discharge\n• Dry, cracked nose (cattle)\n• Rough or dull coat/feathers\n• Isolation from herd\n• Abnormal droppings\n• Labored breathing\n\nPREVENTIVE MEASURES\n• Quarantine new animals 2–3 weeks\n• Clean housing and remove manure regularly\n• Rotate grazing pastures to break parasite cycles\n• Deworm on veterinary schedule" },
};

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

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
  const canAccess = user && (role === "farmer" || role === "admin");

  const { data: mod, isLoading } = useSingleModule(id ?? "1");
  const { data: bookmarkedIds = [] } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const markComplete = useMarkComplete();

  const [completed, setCompleted] = useState(false);
  const isBookmarked = mod ? bookmarkedIds.includes(mod.id) : false;

  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<ScrollView>(null);

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

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !mod) return;
    const question = aiQuestion.trim();
    setAiQuestion("");
    setAiLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setChatHistory((prev) => [...prev, { role: "user", text: question }]);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);

    const answer = await askModuleAssistant(question, mod.title, mod.content ?? "");
    setChatHistory((prev) => [...prev, { role: "assistant", text: answer }]);
    setAiLoading(false);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Feather name="book-open" size={32} color="#2D6A4F" />
        </View>
        <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 10, textAlign: "center" }}>Farmers Only</Text>
        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
          You need to be registered as a farmer to view learning content.
        </Text>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, backgroundColor: "#2D6A4F", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 })}
          onPress={() => router.push("/(auth)/register")}
        >
          <Feather name="user-plus" size={16} color="#fff" />
          <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" }}>Register as a Farmer</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13, flexDirection: "row", alignItems: "center", gap: 8 })}
          onPress={() => router.push("/(auth)/login")}
        >
          <Feather name="log-in" size={16} color="#2D6A4F" />
          <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#2D6A4F" }}>Already have an account? Sign In</Text>
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
        <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 8, textAlign: "center" }}>Access Restricted</Text>
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color={C.text} />
          </Pressable>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              style={({ pressed }) => [
                styles.navBtn,
                { opacity: pressed ? 0.6 : 1, backgroundColor: aiOpen ? `${C.primary}18` : C.surfaceSecondary },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setAiOpen((v) => !v);
              }}
            >
              <Feather name="message-circle" size={20} color={aiOpen ? C.primary : C.text} />
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

          {aiOpen && (
            <View style={styles.aiPanel}>
              <View style={styles.aiPanelHeader}>
                <View style={styles.aiPanelHeaderLeft}>
                  <Feather name="message-circle" size={16} color={C.primary} />
                  <Text style={styles.aiPanelTitle}>AI Learning Assistant</Text>
                </View>
                <Pressable onPress={() => setAiOpen(false)} hitSlop={8}>
                  <Feather name="x" size={18} color={C.textSecondary} />
                </Pressable>
              </View>

              {chatHistory.length === 0 ? (
                <View style={styles.aiEmptyState}>
                  <Text style={styles.aiEmptyText}>
                    Stuck on something? Ask the AI assistant a question about this module and it will help you understand.
                  </Text>
                  <View style={styles.aiSuggestions}>
                    {[
                      "How do I get started?",
                      "Give me a practical example",
                      "What is the most important tip?",
                    ].map((hint) => (
                      <Pressable
                        key={hint}
                        style={styles.aiSuggestionChip}
                        onPress={() => setAiQuestion(hint)}
                      >
                        <Text style={styles.aiSuggestionText}>{hint}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                <ScrollView
                  ref={chatScrollRef}
                  style={styles.chatScroll}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
                >
                  {chatHistory.map((msg, i) => (
                    <View
                      key={i}
                      style={[
                        styles.chatBubble,
                        msg.role === "user" ? styles.chatBubbleUser : styles.chatBubbleAI,
                      ]}
                    >
                      {msg.role === "assistant" && (
                        <View style={styles.aiBubbleIcon}>
                          <Feather name="cpu" size={12} color={C.primary} />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.chatBubbleText,
                          msg.role === "user" ? styles.chatBubbleTextUser : styles.chatBubbleTextAI,
                        ]}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  ))}
                  {aiLoading && (
                    <View style={[styles.chatBubble, styles.chatBubbleAI]}>
                      <ActivityIndicator size="small" color={C.primary} />
                    </View>
                  )}
                </ScrollView>
              )}

              <View style={styles.aiInputRow}>
                <TextInput
                  style={styles.aiInput}
                  placeholder="Ask something about this module…"
                  placeholderTextColor={C.textTertiary}
                  value={aiQuestion}
                  onChangeText={setAiQuestion}
                  onSubmitEditing={handleAskAI}
                  returnKeyType="send"
                  multiline={false}
                  editable={!aiLoading}
                />
                <Pressable
                  style={[styles.aiSendBtn, (!aiQuestion.trim() || aiLoading) && styles.aiSendBtnDisabled]}
                  onPress={handleAskAI}
                  disabled={!aiQuestion.trim() || aiLoading}
                >
                  <Feather name="send" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>
          )}

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

          {!aiOpen && (
            <Pressable
              style={styles.aiPromptBanner}
              onPress={() => {
                Haptics.selectionAsync();
                setAiOpen(true);
              }}
            >
              <Feather name="message-circle" size={18} color={C.primary} />
              <Text style={styles.aiPromptText}>Have a question about this module? Ask the AI assistant</Text>
              <Feather name="chevron-right" size={16} color={C.primary} />
            </Pressable>
          )}
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
    </KeyboardAvoidingView>
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

  aiPanel: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: `${C.primary}06`,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${C.primary}25`,
    overflow: "hidden",
  },
  aiPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${C.primary}15`,
  },
  aiPanelHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiPanelTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: C.primary },
  aiEmptyState: { padding: 14, gap: 12 },
  aiEmptyText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 20 },
  aiSuggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  aiSuggestionChip: {
    backgroundColor: `${C.primary}12`,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${C.primary}25`,
  },
  aiSuggestionText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primary },
  chatScroll: { maxHeight: 220, paddingHorizontal: 12, paddingTop: 10 },
  chatBubble: { marginBottom: 8, maxWidth: "85%" },
  chatBubbleUser: { alignSelf: "flex-end", backgroundColor: C.primary, borderRadius: 14, borderBottomRightRadius: 4, paddingHorizontal: 12, paddingVertical: 8 },
  chatBubbleAI: { alignSelf: "flex-start", backgroundColor: C.surface, borderRadius: 14, borderBottomLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "flex-start", gap: 6 },
  aiBubbleIcon: { marginTop: 2 },
  chatBubbleText: { fontSize: 14, lineHeight: 21 },
  chatBubbleTextUser: { fontFamily: "Inter_400Regular", color: "#fff" },
  chatBubbleTextAI: { fontFamily: "Inter_400Regular", color: C.text, flex: 1 },
  aiInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: `${C.primary}15`,
  },
  aiInput: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.text,
  },
  aiSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  aiSendBtnDisabled: { opacity: 0.4 },

  aiPromptBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: `${C.primary}08`,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: `${C.primary}20`,
  },
  aiPromptText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: C.primary },

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
