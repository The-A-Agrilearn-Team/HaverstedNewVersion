import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useBookmarks } from "@/hooks/useProgress";
import { useModules } from "@/hooks/useModules";

const C = Colors.light;

export default function OfflineContentScreen() {
  const insets = useSafeAreaInsets();
  const { data: bookmarkIds = [] } = useBookmarks();
  const { data: allModules = [] } = useModules();

  const savedModules = allModules.filter((m) => bookmarkIds.includes(m.id));

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>Offline Content</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 60 }}
      >
        <View style={styles.infoBanner}>
          <Feather name="wifi-off" size={20} color={C.primary} />
          <Text style={styles.infoText}>
            Bookmarked modules are cached for offline reading. You can access them without an internet connection once opened.
          </Text>
        </View>

        <View style={styles.storageCard}>
          <View style={styles.storageRow}>
            <View style={styles.storageIcon}>
              <Feather name="hard-drive" size={20} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storageTitle}>Cached Modules</Text>
              <Text style={styles.storageSub}>{savedModules.length} module{savedModules.length !== 1 ? "s" : ""} available offline</Text>
            </View>
            <Text style={styles.storageSize}>{savedModules.length * 12} KB</Text>
          </View>
          <View style={styles.storageTrack}>
            <View style={[styles.storageFill, { width: savedModules.length > 0 ? "30%" : "2%" }]} />
          </View>
        </View>

        {savedModules.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="download" size={44} color={C.textTertiary} />
            <Text style={styles.emptyTitle}>No offline content</Text>
            <Text style={styles.emptySub}>
              Bookmark modules to make them available offline. Your bookmarked modules will appear here.
            </Text>
            <Pressable style={styles.browseBtn} onPress={() => router.replace("/(tabs)/learn")}>
              <Text style={styles.browseBtnText}>Browse & Bookmark Modules</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Available Offline</Text>
            {savedModules.map((mod) => (
              <Pressable
                key={mod.id}
                style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
                onPress={() => router.push(`/module/${mod.id}`)}
              >
                <View style={styles.cardIcon}>
                  <Feather name="book-open" size={20} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{mod.title}</Text>
                  <Text style={styles.cardMeta}>{mod.category} · {mod.duration_minutes}m</Text>
                </View>
                <View style={styles.offlineBadge}>
                  <Feather name="check-circle" size={14} color={C.success} />
                  <Text style={styles.offlineBadgeText}>Ready</Text>
                </View>
              </Pressable>
            ))}
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
  infoBanner: { flexDirection: "row", gap: 10, backgroundColor: `${C.primary}10`, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${C.primary}20`, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 20 },
  storageCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 12 },
  storageRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  storageIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center" },
  storageTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  storageSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  storageSize: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  storageTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: "hidden" },
  storageFill: { height: 6, backgroundColor: C.primary, borderRadius: 3 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  empty: { alignItems: "center", paddingTop: 40, gap: 12, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 21 },
  browseBtn: { marginTop: 8, backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  browseBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  cardMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  offlineBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${C.success}12`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  offlineBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.success },
});
