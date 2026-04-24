import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useProgress } from "@/hooks/useProgress";
import { useModules } from "@/hooks/useModules";

const C = Colors.light;

const LEVEL_COLORS = {
  beginner:     { bg: "#D1FAE5", text: "#059669" },
  intermediate: { bg: "#FEF3C7", text: "#D97706" },
  advanced:     { bg: "#FCE7F3", text: "#DB2777" },
};

export default function MyProgressScreen() {
  const insets = useSafeAreaInsets();
  const { data: progressRecords, isLoading: pLoading, refetch } = useProgress();
  const { data: allModules = [], isLoading: mLoading } = useModules();

  const isLoading = pLoading || mLoading;

  const records: any[] = Array.isArray(progressRecords) ? progressRecords : [];
  const completedCount = records.filter((r) => r.completed).length;
  const inProgressCount = records.filter((r) => !r.completed && r.progress_pct > 0).length;

  const enriched = records
    .map((r) => ({
      ...r,
      module: allModules.find((m) => m.id === r.module_id),
    }))
    .filter((r) => r.module)
    .sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime());

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>My Progress</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 60 }}
      >
        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ paddingTop: 60 }} />
        ) : enriched.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="award" size={44} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>No progress yet</Text>
            <Text style={styles.emptySub}>Start a learning module to track your progress here.</Text>
            <Pressable style={styles.browseBtn} onPress={() => router.replace("/(tabs)/learn")}>
              <Text style={styles.browseBtnText}>Start Learning</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNum}>{completedCount}</Text>
                <Text style={styles.summaryLbl}>Completed</Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardBorder]}>
                <Text style={styles.summaryNum}>{inProgressCount}</Text>
                <Text style={styles.summaryLbl}>In Progress</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNum}>{records.length}</Text>
                <Text style={styles.summaryLbl}>Started</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Recent Activity</Text>

            {enriched.map((item) => {
              const mod = item.module;
              const lvl = LEVEL_COLORS[mod.level as keyof typeof LEVEL_COLORS] ?? LEVEL_COLORS.beginner;
              const pct = item.completed ? 100 : (item.progress_pct ?? 0);
              const lastDate = new Date(item.last_accessed).toLocaleDateString("en-ZA");
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
                  onPress={() => router.push(`/module/${mod.id}`)}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardIcon}>
                      {item.completed
                        ? <Feather name="check-circle" size={20} color={C.success} />
                        : <Feather name="book-open" size={20} color={C.primary} />
                      }
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.cardTitle}>{mod.title}</Text>
                      <View style={styles.cardMeta}>
                        <View style={[styles.lvlBadge, { backgroundColor: lvl.bg }]}>
                          <Text style={[styles.lvlText, { color: lvl.text }]}>{mod.level}</Text>
                        </View>
                        <Text style={styles.metaText}>{mod.category}</Text>
                        <Text style={styles.metaText}>Last: {lastDate}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusPill, item.completed ? styles.statusDone : styles.statusProgress]}>
                      <Text style={[styles.statusText, { color: item.completed ? C.success : C.primary }]}>
                        {item.completed ? "Done" : `${pct}%`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: item.completed ? C.success : C.primary }]} />
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  empty: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 21 },
  browseBtn: { marginTop: 8, backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  browseBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  summaryRow: { flexDirection: "row", backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  summaryCard: { flex: 1, alignItems: "center", paddingVertical: 16 },
  summaryCardBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.border },
  summaryNum: { fontSize: 24, fontFamily: "Inter_700Bold", color: C.text },
  summaryLbl: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: `${C.primary}10`, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  lvlBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  lvlText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDone: { backgroundColor: `${C.success}15` },
  statusProgress: { backgroundColor: `${C.primary}12` },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  progressTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
});
