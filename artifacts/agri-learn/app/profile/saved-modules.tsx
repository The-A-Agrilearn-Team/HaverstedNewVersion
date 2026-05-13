import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useAuth } from "@/context/AuthContext";
import { useBookmarks, useToggleBookmark } from "@/hooks/useProgress";
import { useModules } from "@/hooks/useModules";

const C = Colors.light;

const LEVEL_COLORS = {
  beginner:     { bg: "#D1FAE5", text: "#059669" },
  intermediate: { bg: "#FEF3C7", text: "#D97706" },
  advanced:     { bg: "#FCE7F3", text: "#DB2777" },
};

export default function SavedModulesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: bookmarkIds = [], isLoading: bLoading, refetch: refetchBookmarks } = useBookmarks();
  const { data: allModules = [], isLoading: mLoading } = useModules();
  const toggleBookmark = useToggleBookmark();

  const isLoading = bLoading || mLoading;
  const saved = allModules.filter((m) => bookmarkIds.includes(m.id));

  const handleRemove = (moduleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark.mutate({ moduleId, isBookmarked: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>Saved Modules</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetchBookmarks} tintColor={C.primary} />}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 60 }}
      >
        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ paddingTop: 60 }} />
        ) : saved.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="bookmark" size={44} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>No saved modules</Text>
            <Text style={styles.emptySub}>
              Bookmark modules while learning to find them here quickly.
            </Text>
            <Pressable style={styles.browseBtn} onPress={() => router.replace("/(tabs)/learn")}>
              <Text style={styles.browseBtnText}>Browse Modules</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>{saved.length} saved module{saved.length !== 1 ? "s" : ""}</Text>
            {saved.map((mod) => {
              const lvl = LEVEL_COLORS[mod.level as keyof typeof LEVEL_COLORS] ?? LEVEL_COLORS.beginner;
              return (
                <Pressable
                  key={mod.id}
                  style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/module/${mod.id}`);
                  }}
                >
                  <View style={styles.cardIcon}>
                    <Feather name="book-open" size={22} color={C.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.cardTitle}>{mod.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{mod.description}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.lvlBadge, { backgroundColor: lvl.bg }]}>
                        <Text style={[styles.lvlText, { color: lvl.text }]}>{mod.level}</Text>
                      </View>
                      <Text style={styles.metaText}>{mod.category}</Text>
                      <View style={styles.metaRow}>
                        <Feather name="clock" size={11} color={C.textTertiary} />
                        <Text style={styles.metaText}>{mod.duration_minutes}m</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => handleRemove(mod.id)}
                    hitSlop={8}
                  >
                    <Feather name="bookmark" size={18} color={C.primary} />
                  </Pressable>
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
  countText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 14, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  cardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 18 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  lvlBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  lvlText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  removeBtn: { padding: 4, alignSelf: "flex-start" },
});
