import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { supabase } from "@/lib/supabase";
import { useCreateModule, useUpdateModule } from "@/hooks/useAdmin";

const C = Colors.light;
const GREEN = "#2D6A4F";
const BORDER = "#E5E7EB";
const BG = "#F0F4F2";

// ─── Types ───────────────────────────────────────────────────────────────────

type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "body"; text: string }
  | { type: "numbered_list"; items: string[] }
  | { type: "warning"; text: string }
  | { type: "video"; url: string; title: string };

interface QuizQuestion {
  text: string;
  options: string[];
  correct: number;
}

interface ModuleTab {
  id: string;
  title: string;
  subtitle: string;
  read_minutes: string;
  blocks: ContentBlock[];
  quiz: QuizQuestion[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ["Crops", "Soil", "Irrigation", "Pest Control", "Livestock", "Business", "Weather", "Technology"];
const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const LANGUAGES = ["English", "isiZulu", "Sesotho", "Afrikaans", "isiXhosa"];

function uid() { return Math.random().toString(36).slice(2, 9); }
function makeTab(): ModuleTab { return { id: uid(), title: "", subtitle: "", read_minutes: "5", blocks: [], quiz: [] }; }
function makeQuestion(): QuizQuestion { return { text: "", options: ["", "", "", ""], correct: 0 }; }

function contentToTabs(content: string): ModuleTab[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed?.tabs) && parsed.tabs.length > 0) {
      return parsed.tabs.map((t: any) => ({
        id: t.id ?? uid(),
        title: t.title ?? "",
        subtitle: t.subtitle ?? "",
        read_minutes: String(t.read_minutes ?? "5"),
        blocks: Array.isArray(t.blocks) ? t.blocks : [],
        quiz: Array.isArray(t.quiz) ? t.quiz : [],
      }));
    }
  } catch {}
  // Plain text → single tab with a body block
  return [{
    id: uid(),
    title: "Main Content",
    subtitle: "",
    read_minutes: "5",
    blocks: content.trim() ? [{ type: "body" as const, text: content }] : [],
    quiz: [],
  }];
}

// ─── Small Helpers ────────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return <Text style={s.sectionTitle}>{label}</Text>;
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={s.fieldLabel}>{label}</Text>;
}

function StyledInput({ value, onChangeText, placeholder, multiline, style }: {
  value: string; onChangeText: (v: string) => void; placeholder?: string; multiline?: boolean; style?: any;
}) {
  return (
    <TextInput
      style={[s.input, multiline && s.multiline, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
}

function ChipRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {options.map((opt) => (
        <Pressable key={opt} style={[s.chip, value === opt && s.chipActive]} onPress={() => onChange(opt)}>
          <Text style={[s.chipText, value === opt && s.chipTextActive]}>{opt}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Block Editor ─────────────────────────────────────────────────────────────

function BlockEditor({ block, idx, total, onChange, onDelete, onMove }: {
  block: ContentBlock; idx: number; total: number;
  onChange: (b: ContentBlock) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const BLOCK_META: Record<string, { icon: string; label: string; color: string }> = {
    heading: { icon: "type", label: "Heading", color: "#3B82F6" },
    body: { icon: "align-left", label: "Body Text", color: "#6B7280" },
    numbered_list: { icon: "list", label: "Numbered List", color: GREEN },
    warning: { icon: "alert-triangle", label: "Warning Box", color: "#DC2626" },
    video: { icon: "video", label: "Video", color: "#7C3AED" },
  };
  const meta = BLOCK_META[block.type];

  return (
    <View style={s.blockCard}>
      <View style={s.blockHeader}>
        <View style={[s.blockIcon, { backgroundColor: `${meta.color}15` }]}>
          <Feather name={meta.icon as any} size={14} color={meta.color} />
        </View>
        <Text style={[s.blockLabel, { color: meta.color }]}>{meta.label}</Text>
        <View style={s.blockActions}>
          {idx > 0 && (
            <Pressable onPress={() => onMove(-1)} style={s.blockActionBtn} hitSlop={8}>
              <Feather name="chevron-up" size={14} color="#9CA3AF" />
            </Pressable>
          )}
          {idx < total - 1 && (
            <Pressable onPress={() => onMove(1)} style={s.blockActionBtn} hitSlop={8}>
              <Feather name="chevron-down" size={14} color="#9CA3AF" />
            </Pressable>
          )}
          <Pressable onPress={onDelete} style={s.blockActionBtn} hitSlop={8}>
            <Feather name="trash-2" size={14} color="#DC2626" />
          </Pressable>
        </View>
      </View>

      {(block.type === "heading" || block.type === "body" || block.type === "warning") && (
        <StyledInput
          value={block.text}
          onChangeText={(v) => onChange({ ...block, text: v } as ContentBlock)}
          placeholder={
            block.type === "heading" ? "Section heading…" :
            block.type === "warning" ? "Warning message…" :
            "Body text…"
          }
          multiline={block.type !== "heading"}
        />
      )}

      {block.type === "numbered_list" && (
        <View style={{ gap: 6 }}>
          {block.items.map((item, i) => (
            <View key={i} style={s.listItemRow}>
              <View style={s.listNum}><Text style={s.listNumText}>{i + 1}</Text></View>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={item}
                onChangeText={(v) => {
                  const items = [...block.items];
                  items[i] = v;
                  onChange({ ...block, items } as ContentBlock);
                }}
                placeholder={`Item ${i + 1}…`}
                placeholderTextColor="#9CA3AF"
              />
              {block.items.length > 1 && (
                <Pressable onPress={() => {
                  const items = block.items.filter((_, idx) => idx !== i);
                  onChange({ ...block, items } as ContentBlock);
                }} hitSlop={8}>
                  <Feather name="x" size={14} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          ))}
          <Pressable
            style={s.addItemBtn}
            onPress={() => onChange({ ...block, items: [...block.items, ""] } as ContentBlock)}
          >
            <Feather name="plus" size={13} color={GREEN} />
            <Text style={s.addItemBtnText}>Add Item</Text>
          </Pressable>
        </View>
      )}

      {block.type === "video" && (
        <View style={{ gap: 8 }}>
          <StyledInput
            value={block.title}
            onChangeText={(v) => onChange({ ...block, title: v } as ContentBlock)}
            placeholder="Video title…"
          />
          <StyledInput
            value={block.url}
            onChangeText={(v) => onChange({ ...block, url: v } as ContentBlock)}
            placeholder="YouTube or direct video URL…"
          />
        </View>
      )}
    </View>
  );
}

// ─── Quiz Question Editor ─────────────────────────────────────────────────────

function QuizEditor({ question, qIdx, onChange, onDelete }: {
  question: QuizQuestion; qIdx: number;
  onChange: (q: QuizQuestion) => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.quizCard}>
      <View style={s.quizCardHeader}>
        <Text style={s.quizCardLabel}>Question {qIdx + 1}</Text>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Feather name="trash-2" size={14} color="#DC2626" />
        </Pressable>
      </View>
      <StyledInput
        value={question.text}
        onChangeText={(v) => onChange({ ...question, text: v })}
        placeholder="e.g. Why should you never plant supermarket potatoes as seed?"
        multiline
      />
      <Text style={s.quizOptionsLabel}>Answer Options (tap circle for correct answer)</Text>
      {question.options.map((opt, i) => (
        <View key={i} style={s.quizOptionRow}>
          <Pressable
            onPress={() => onChange({ ...question, correct: i })}
            style={[s.quizRadio, question.correct === i && s.quizRadioActive]}
            hitSlop={8}
          >
            {question.correct === i && <View style={s.quizRadioDot} />}
          </Pressable>
          <TextInput
            style={[s.input, { flex: 1 }]}
            value={opt}
            onChangeText={(v) => {
              const options = [...question.options];
              options[i] = v;
              onChange({ ...question, options });
            }}
            placeholder={`Option ${i + 1}…`}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      ))}
    </View>
  );
}

// ─── Tab Card ─────────────────────────────────────────────────────────────────

function TabCard({ tab, tabIdx, expanded, onToggle, onChange, onDelete }: {
  tab: ModuleTab; tabIdx: number; expanded: boolean;
  onToggle: () => void;
  onChange: (t: ModuleTab) => void;
  onDelete: () => void;
}) {
  const addBlock = (block: ContentBlock) => onChange({ ...tab, blocks: [...tab.blocks, block] });

  const ADD_BLOCKS: { label: string; icon: string; block: ContentBlock }[] = [
    { label: "Heading", icon: "type", block: { type: "heading", text: "" } },
    { label: "Body", icon: "align-left", block: { type: "body", text: "" } },
    { label: "List", icon: "list", block: { type: "numbered_list", items: [""] } },
    { label: "Warning", icon: "alert-triangle", block: { type: "warning", text: "" } },
    { label: "Video", icon: "video", block: { type: "video", url: "", title: "" } },
  ];

  return (
    <View style={s.tabCard}>
      <Pressable style={s.tabCardHeader} onPress={onToggle}>
        <View style={s.tabNum}><Text style={s.tabNumText}>{tabIdx + 1}</Text></View>
        <Text style={s.tabCardTitle} numberOfLines={1}>
          {tab.title || `Tab ${tabIdx + 1}`}
        </Text>
        <Pressable onPress={onDelete} hitSlop={8} style={{ marginRight: 8 }}>
          <Feather name="trash-2" size={15} color="#9CA3AF" />
        </Pressable>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" />
      </Pressable>

      {expanded && (
        <View style={s.tabCardBody}>
          <View style={s.tabMeta}>
            <View style={{ flex: 2, gap: 4 }}>
              <FieldLabel label="Tab Title *" />
              <StyledInput value={tab.title} onChangeText={(v) => onChange({ ...tab, title: v })} placeholder="e.g. Seed Potatoes & Soil Prep" />
            </View>
            <View style={{ width: 72, gap: 4 }}>
              <FieldLabel label="Min read" />
              <StyledInput value={tab.read_minutes} onChangeText={(v) => onChange({ ...tab, read_minutes: v })} placeholder="5" />
            </View>
          </View>

          <View style={{ gap: 4 }}>
            <FieldLabel label="Subtitle" />
            <StyledInput value={tab.subtitle} onChangeText={(v) => onChange({ ...tab, subtitle: v })} placeholder="Brief description of this section…" multiline />
          </View>

          {tab.blocks.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={s.subSectionLabel}>CONTENT BLOCKS</Text>
              {tab.blocks.map((block, bIdx) => (
                <BlockEditor
                  key={bIdx}
                  block={block}
                  idx={bIdx}
                  total={tab.blocks.length}
                  onChange={(b) => {
                    const blocks = [...tab.blocks];
                    blocks[bIdx] = b;
                    onChange({ ...tab, blocks });
                  }}
                  onDelete={() => {
                    const blocks = tab.blocks.filter((_, i) => i !== bIdx);
                    onChange({ ...tab, blocks });
                  }}
                  onMove={(dir) => {
                    const blocks = [...tab.blocks];
                    const target = bIdx + dir;
                    [blocks[bIdx], blocks[target]] = [blocks[target], blocks[bIdx]];
                    onChange({ ...tab, blocks });
                  }}
                />
              ))}
            </View>
          )}

          <View style={{ gap: 6 }}>
            <Text style={s.subSectionLabel}>ADD BLOCK</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ADD_BLOCKS.map(({ label, icon, block }) => (
                <Pressable key={label} style={s.addBlockBtn} onPress={() => addBlock(block)}>
                  <Feather name={icon as any} size={13} color={GREEN} />
                  <Text style={s.addBlockBtnText}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={s.subSectionLabel}>KNOWLEDGE CHECK (QUIZ)</Text>
            {tab.quiz.map((q, qIdx) => (
              <QuizEditor
                key={qIdx}
                question={q}
                qIdx={qIdx}
                onChange={(updated) => {
                  const quiz = [...tab.quiz];
                  quiz[qIdx] = updated;
                  onChange({ ...tab, quiz });
                }}
                onDelete={() => {
                  const quiz = tab.quiz.filter((_, i) => i !== qIdx);
                  onChange({ ...tab, quiz });
                }}
              />
            ))}
            <Pressable
              style={s.addQuestionBtn}
              onPress={() => onChange({ ...tab, quiz: [...tab.quiz, makeQuestion()] })}
            >
              <Feather name="plus" size={14} color={GREEN} />
              <Text style={s.addQuestionBtnText}>Add Question</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ModuleBuilderScreen() {
  const insets = useSafeAreaInsets();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = Boolean(editId);

  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const isPending = createModule.isPending || updateModule.isPending;

  const [initialised, setInitialised] = useState(!isEditMode);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState<typeof LEVELS[number]>("beginner");
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState("20");
  const firstTab = makeTab();
  const [tabs, setTabs] = useState<ModuleTab[]>([firstTab]);
  const [expandedTabId, setExpandedTabId] = useState<string | null>(firstTab.id);

  // Fetch existing module when in edit mode
  const { data: existingModule, isLoading: loadingModule } = useQuery({
    queryKey: ["admin", "module-edit", editId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("id", editId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
    staleTime: 0,
  });

  // Populate form once module is loaded
  useEffect(() => {
    if (!existingModule || initialised) return;
    setTitle(existingModule.title ?? "");
    setDescription(existingModule.description ?? "");
    setCategory(existingModule.category ?? CATEGORIES[0]);
    setLevel((existingModule.level ?? "beginner") as typeof LEVELS[number]);
    setLanguage(existingModule.language ?? "English");
    setDuration(String(existingModule.duration_minutes ?? 20));
    const parsedTabs = contentToTabs(existingModule.content ?? "");
    setTabs(parsedTabs);
    setExpandedTabId(parsedTabs[0]?.id ?? null);
    setInitialised(true);
  }, [existingModule, initialised]);

  const handleSave = () => {
    if (!title.trim()) { Alert.alert("Missing title", "Please enter a module title."); return; }
    if (!description.trim()) { Alert.alert("Missing description", "Please enter a description."); return; }
    if (tabs.some(t => !t.title.trim())) { Alert.alert("Incomplete tab", "Each tab must have a title."); return; }

    const richContent = JSON.stringify({ tabs });
    const dur = parseInt(duration, 10) || 20;
    const payload = { title, description, category, level, language, duration_minutes: dur, content: richContent };

    if (isEditMode) {
      updateModule.mutate(
        { id: editId!, ...payload },
        {
          onSuccess: () => {
            Alert.alert("Saved!", `"${title}" has been updated.`, [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
          onError: (e: any) => Alert.alert("Error", e?.message ?? "Failed to save module."),
        }
      );
    } else {
      createModule.mutate(payload, {
        onSuccess: () => {
          Alert.alert("Published!", `"${title}" is now live.`, [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (e: any) => Alert.alert("Error", e?.message ?? "Failed to publish module."),
      });
    }
  };

  const updateTab = (id: string, updated: ModuleTab) =>
    setTabs((prev) => prev.map((t) => (t.id === id ? updated : t)));

  const deleteTab = (id: string) => {
    if (tabs.length === 1) { Alert.alert("Cannot delete", "A module must have at least one tab."); return; }
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (expandedTabId === id) setExpandedTabId(null);
  };

  if (isEditMode && loadingModule && !initialised) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={{ marginTop: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: "#6B7280" }}>
          Loading module…
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: BG }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color="#1A1A1A" />
        </Pressable>
        <Text style={s.headerTitle}>{isEditMode ? "Edit Module" : "New Module"}</Text>
        <Pressable
          style={[s.publishBtn, isPending && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isPending}
        >
          {isPending
            ? <ActivityIndicator color="#fff" size="small" />
            : <><Feather name={isEditMode ? "save" : "upload"} size={14} color="#fff" /><Text style={s.publishBtnText}>{isEditMode ? "Save" : "Publish"}</Text></>
          }
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>
          <SectionTitle label="Module Info" />

          <View style={{ gap: 4 }}>
            <FieldLabel label="Title *" />
            <StyledInput value={title} onChangeText={setTitle} placeholder="e.g. Growing Potatoes: Complete Guide" />
          </View>

          <View style={{ gap: 4 }}>
            <FieldLabel label="Description *" />
            <StyledInput value={description} onChangeText={setDescription} placeholder="What will farmers learn from this module?" multiline />
          </View>

          <View style={{ gap: 4 }}>
            <FieldLabel label="Category" />
            <ChipRow options={CATEGORIES} value={category} onChange={setCategory} />
          </View>

          <View style={{ gap: 4 }}>
            <FieldLabel label="Level" />
            <ChipRow options={[...LEVELS]} value={level} onChange={setLevel as any} />
          </View>

          <View style={{ gap: 4 }}>
            <FieldLabel label="Language" />
            <ChipRow options={LANGUAGES} value={language} onChange={setLanguage} />
          </View>

          <View style={{ gap: 4 }}>
            <FieldLabel label="Total Duration (minutes)" />
            <StyledInput value={duration} onChangeText={setDuration} placeholder="20" style={{ width: 100 }} />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <View style={s.tabsHeader}>
            <Text style={s.tabsSectionTitle}>Tabs</Text>
            <Text style={s.tabsHint}>Each tab is a lesson section</Text>
          </View>

          {tabs.map((tab, tabIdx) => (
            <TabCard
              key={tab.id}
              tab={tab}
              tabIdx={tabIdx}
              expanded={expandedTabId === tab.id}
              onToggle={() => setExpandedTabId(expandedTabId === tab.id ? null : tab.id)}
              onChange={(updated) => updateTab(tab.id, updated)}
              onDelete={() => deleteTab(tab.id)}
            />
          ))}

          <Pressable
            style={s.addTabBtn}
            onPress={() => {
              const tab = makeTab();
              setTabs((prev) => [...prev, tab]);
              setExpandedTabId(tab.id);
            }}
          >
            <Feather name="plus" size={16} color={GREEN} />
            <Text style={s.addTabBtnText}>Add Tab</Text>
          </Pressable>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1A1A1A", flex: 1, textAlign: "center" },
  publishBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  publishBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },

  content: { padding: 16, gap: 16 },

  card: {
    backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: BORDER,
    padding: 16, gap: 14,
  },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#374151" },
  input: {
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#111827",
  },
  multiline: { minHeight: 72, textAlignVertical: "top" },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: BORDER,
  },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#6B7280" },
  chipTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },

  tabsHeader: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  tabsSectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  tabsHint: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#9CA3AF" },

  tabCard: {
    backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: "hidden",
  },
  tabCardHeader: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 14,
  },
  tabNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: GREEN,
    alignItems: "center", justifyContent: "center",
  },
  tabNumText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  tabCardTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#111827" },
  tabCardBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 14, borderTopWidth: 1, borderTopColor: BORDER },

  tabMeta: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
  subSectionLabel: {
    fontSize: 10, fontFamily: "Inter_700Bold", color: "#9CA3AF",
    letterSpacing: 0.8, marginTop: 4,
  },

  blockCard: {
    backgroundColor: "#F9FAFB", borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 8,
  },
  blockHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  blockIcon: { width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  blockLabel: { fontSize: 12, fontFamily: "Inter_700Bold", flex: 1 },
  blockActions: { flexDirection: "row", gap: 4 },
  blockActionBtn: { padding: 4 },

  listItemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  listNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: GREEN,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  listNumText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },

  addItemBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
  addItemBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: GREEN },

  addBlockBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: `${GREEN}12`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: `${GREEN}25`,
  },
  addBlockBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: GREEN },

  quizCard: {
    backgroundColor: "#F9FAFB", borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 8,
  },
  quizCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quizCardLabel: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#111827" },
  quizOptionsLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#6B7280" },
  quizOptionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  quizRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: BORDER,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  quizRadioActive: { borderColor: GREEN },
  quizRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },

  addQuestionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, paddingVertical: 10,
    borderWidth: 1.5, borderColor: `${GREEN}30`, backgroundColor: `${GREEN}08`,
    justifyContent: "center",
  },
  addQuestionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: GREEN },

  addTabBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5, borderColor: `${GREEN}40`,
    paddingVertical: 14,
  },
  addTabBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: GREEN },
});
