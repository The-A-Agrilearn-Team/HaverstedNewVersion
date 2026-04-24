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

const C = Colors.light;

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>Messages</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 60 }}
      >
        <View style={styles.infoBanner}>
          <Feather name="message-circle" size={20} color={C.primary} />
          <Text style={styles.infoText}>
            When buyers express interest in your listings, their enquiries will appear here.
          </Text>
        </View>

        <View style={styles.tabs}>
          <View style={[styles.tab, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Inbox</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>Sent</Text>
          </View>
        </View>

        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Feather name="inbox" size={36} color={C.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySub}>
            Buyer enquiries about your listings will show up here. Make sure your listings are active to receive messages.
          </Text>
          <Pressable style={styles.marketBtn} onPress={() => router.replace("/(tabs)/market")}>
            <Feather name="shopping-bag" size={16} color={C.primary} />
            <Text style={styles.marketBtnText}>View Marketplace</Text>
          </Pressable>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips to get more enquiries</Text>
          {[
            { icon: "camera", tip: "Add a clear harvest photo to your listing" },
            { icon: "file-text", tip: "Write a detailed product description" },
            { icon: "map-pin", tip: "Include your exact location for local buyers" },
            { icon: "tag", tip: "Price your produce competitively" },
          ].map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Feather name={t.icon as any} size={14} color={C.primary} />
              </View>
              <Text style={styles.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>
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
  tabs: { flexDirection: "row", backgroundColor: C.surfaceSecondary, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: C.border },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 9 },
  tabActive: { backgroundColor: C.surface, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.textSecondary },
  tabTextActive: { color: C.text, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", gap: 12, paddingVertical: 32, paddingHorizontal: 16 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 21 },
  marketBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: C.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  marketBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.primary },
  tipsCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 12 },
  tipsTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 19 },
});
