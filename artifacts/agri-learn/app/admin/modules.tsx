import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAllModulesAdmin, useCreateModule, useDeleteModule } from "@/hooks/useAdmin";

const C = Colors.light;

const LEVEL_COLORS = {
  beginner:     { bg: "#D1FAE5", text: "#059669" },
  intermediate: { bg: "#FEF3C7", text: "#D97706" },
  advanced:     { bg: "#FCE7F3", text: "#DB2777" },
};

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const CATEGORIES = ["Crops", "Soil", "Irrigation", "Pest Control", "Livestock", "Business", "Weather", "Technology"];
const LANGUAGES = ["English", "isiZulu", "Sesotho", "Afrikaans", "isiXhosa"];

function confirmAction(message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(message)) onConfirm();
  } else {
    Alert.alert("Confirm", message, [
      { text: "Cancel", style: "cancel" },
      { text: "OK", style: "destructive", onPress: onConfirm },
    ]);
  }
}

const EMPTY_FORM = {
  title: "",
  description: "",
  category: CATEGORIES[0],
  level: "beginner" as typeof LEVELS[number],
  duration_minutes: "20",
  content: "",
  language: "English",
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function ModulesScreen() {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const { data: modules = [], isLoading, refetch } = useAllModulesAdmin();
  const deleteModule = useDeleteModule();
  const createModule = useCreateModule();

  const handleDelete = (id: string, title: string) => {
    confirmAction(`Permanently delete "${title}"? This cannot be undone.`, () =>
      deleteModule.mutate(id)
    );
  };

  const handleCreate = () => {
    if (!form.title.trim()) { setFormError("Title is required."); return; }
    if (!form.description.trim()) { setFormError("Description is required."); return; }
    if (!form.content.trim()) { setFormError("Content is required."); return; }
    const duration = parseInt(form.duration_minutes, 10);
    if (isNaN(duration) || duration < 1) { setFormError("Enter a valid duration in minutes."); return; }
    setFormError("");
    createModule.mutate(
      { ...form, duration_minutes: duration },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm(EMPTY_FORM);
        },
        onError: (e: any) => setFormError(e?.message ?? "Failed to create module."),
      }
    );
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.background }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
      >
        <View style={styles.topRow}>
          <Text style={styles.count}>{modules.length} module{modules.length !== 1 ? "s" : ""}</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add Module</Text>
          </Pressable>
        </View>

        {isLoading && <ActivityIndicator color={C.primary} style={{ padding: 32 }} />}

        {!isLoading && modules.length === 0 && (
          <View style={styles.empty}>
            <Feather name="book-open" size={40} color={C.textTertiary} />
            <Text style={styles.emptyText}>No modules yet</Text>
            <Text style={styles.emptySub}>Tap "Add Module" to create your first learning module.</Text>
          </View>
        )}

        <View style={styles.list}>
          {modules.map((mod: any, i: number) => {
            const levelStyle = LEVEL_COLORS[mod.level as keyof typeof LEVEL_COLORS] ?? LEVEL_COLORS.beginner;
            const isExpanded = expandedId === mod.id;

            return (
              <View key={mod.id} style={[styles.card, i < modules.length - 1 && styles.cardBorder]}>
                <Pressable
                  style={styles.cardHeader}
                  onPress={() => setExpandedId(isExpanded ? null : mod.id)}
                >
                  <View style={styles.cardIcon}>
                    <Feather name="book-open" size={18} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{mod.title}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
                        <Text style={[styles.levelText, { color: levelStyle.text }]}>{mod.level}</Text>
                      </View>
                      <Text style={styles.metaText}>{mod.category}</Text>
                      <View style={styles.durationRow}>
                        <Feather name="clock" size={11} color={C.textTertiary} />
                        <Text style={styles.metaText}>{mod.duration_minutes}m</Text>
                      </View>
                    </View>
                  </View>
                  <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={C.textTertiary} />
                </Pressable>

                {isExpanded && (
                  <View style={styles.expanded}>
                    <Text style={styles.expandedDesc}>{mod.description}</Text>
                    <Text style={styles.expandedMeta}>
                      Language: {mod.language ?? "English"} · Published {new Date(mod.created_at).toLocaleDateString("en-ZA")}
                    </Text>
                    <View style={styles.cardActions}>
                      <Pressable style={styles.viewBtn} onPress={() => router.push(`/module/${mod.id}`)}>
                        <Feather name="eye" size={14} color={C.primary} />
                        <Text style={styles.viewBtnText}>Preview</Text>
                      </Pressable>
                      <Pressable
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(mod.id, mod.title)}
                      >
                        <Feather name="trash-2" size={14} color={C.error} />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowForm(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.modalTitle}>New Learning Module</Text>
            <Pressable onPress={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(""); }}>
              <Feather name="x" size={22} color={C.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {formError ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color={C.error} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <FormField label="Title *">
              <TextInput style={styles.input} placeholder="e.g. Intro to Crop Rotation" placeholderTextColor={C.textTertiary} value={form.title} onChangeText={(v) => setForm(f => ({ ...f, title: v }))} />
            </FormField>

            <FormField label="Description *">
              <TextInput style={[styles.input, styles.multiline]} placeholder="Brief summary of what learners will gain…" placeholderTextColor={C.textTertiary} value={form.description} onChangeText={(v) => setForm(f => ({ ...f, description: v }))} multiline numberOfLines={3} />
            </FormField>

            <FormField label="Content *">
              <TextInput style={[styles.input, styles.multiline, { minHeight: 120 }]} placeholder="Full module content / lesson text…" placeholderTextColor={C.textTertiary} value={form.content} onChangeText={(v) => setForm(f => ({ ...f, content: v }))} multiline numberOfLines={6} />
            </FormField>

            <FormField label="Category">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {CATEGORIES.map((cat) => (
                  <Pressable key={cat} style={[styles.chip, form.category === cat && styles.chipActive]} onPress={() => setForm(f => ({ ...f, category: cat }))}>
                    <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </FormField>

            <FormField label="Level">
              <View style={styles.chipRow}>
                {LEVELS.map((lvl) => (
                  <Pressable key={lvl} style={[styles.chip, form.level === lvl && styles.chipActive]} onPress={() => setForm(f => ({ ...f, level: lvl }))}>
                    <Text style={[styles.chipText, form.level === lvl && styles.chipTextActive]}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</Text>
                  </Pressable>
                ))}
              </View>
            </FormField>

            <FormField label="Language">
              <View style={styles.chipRow}>
                {LANGUAGES.map((lang) => (
                  <Pressable key={lang} style={[styles.chip, form.language === lang && styles.chipActive]} onPress={() => setForm(f => ({ ...f, language: lang }))}>
                    <Text style={[styles.chipText, form.language === lang && styles.chipTextActive]}>{lang}</Text>
                  </Pressable>
                ))}
              </View>
            </FormField>

            <FormField label="Duration (minutes)">
              <TextInput style={styles.input} placeholder="e.g. 20" placeholderTextColor={C.textTertiary} value={form.duration_minutes} onChangeText={(v) => setForm(f => ({ ...f, duration_minutes: v }))} keyboardType="number-pad" />
            </FormField>

            <Pressable
              style={({ pressed }) => [styles.submitBtn, { opacity: pressed || createModule.isPending ? 0.85 : 1 }]}
              onPress={handleCreate}
              disabled={createModule.isPending}
            >
              {createModule.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Publish Module</Text>
                </>
              )}
            </Pressable>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  count: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  empty: { alignItems: "center", paddingTop: 60, gap: 10, paddingHorizontal: 32 },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center" },
  list: { marginHorizontal: 16, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  card: { padding: 14 },
  cardBorder: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 6 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  expanded: { paddingTop: 12, paddingLeft: 52, gap: 8 },
  expandedDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 18 },
  expandedMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textTertiary },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  viewBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 10, paddingVertical: 8, backgroundColor: `${C.primary}10`,
    borderWidth: 1, borderColor: `${C.primary}20`,
  },
  viewBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.primary },
  deleteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 10, paddingVertical: 8, backgroundColor: `${C.error}08`,
    borderWidth: 1, borderColor: `${C.error}20`,
  },
  deleteBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.error },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text },
  modalBody: { padding: 20, gap: 18 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: `${C.error}12`, borderRadius: 10, padding: 12,
  },
  errorText: { fontSize: 13, color: C.error, fontFamily: "Inter_500Medium", flex: 1 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  input: {
    backgroundColor: C.surface, borderRadius: 12, borderWidth: 1.5,
    borderColor: C.border, padding: 14, fontSize: 15,
    fontFamily: "Inter_400Regular", color: C.text,
  },
  multiline: { textAlignVertical: "top", minHeight: 80 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  chipTextActive: { color: "#fff" },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: C.primary, borderRadius: 14, padding: 16, marginTop: 4,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
