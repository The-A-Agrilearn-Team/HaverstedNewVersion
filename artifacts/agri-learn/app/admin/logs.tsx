import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useActivityLog } from "@/hooks/useAdmin";

const C = Colors.light;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-ZA");
}

export default function LogsScreen() {
  const { data: logs = [], isLoading, refetch } = useActivityLog();

  const grouped: Record<string, typeof logs> = {};
  logs.forEach((log) => {
    const day = new Date(log.time).toLocaleDateString("en-ZA", {
      weekday: "long", day: "numeric", month: "long",
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(log);
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
    >
      {isLoading && <ActivityIndicator color={C.primary} style={{ padding: 32 }} />}

      {!isLoading && logs.length === 0 && (
        <View style={styles.empty}>
          <Feather name="inbox" size={40} color={C.textTertiary} />
          <Text style={styles.emptyText}>No activity yet</Text>
        </View>
      )}

      {Object.entries(grouped).map(([day, dayLogs]) => (
        <View key={day} style={styles.group}>
          <Text style={styles.dayLabel}>{day}</Text>
          <View style={styles.logList}>
            {dayLogs.map((log, i) => (
              <View
                key={`${log.time}-${i}`}
                style={[styles.logRow, i < dayLogs.length - 1 && styles.logRowBorder]}
              >
                <View style={[styles.logIcon, { backgroundColor: `${log.color}15` }]}>
                  <Feather name={log.icon as any} size={16} color={log.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logMessage}>{log.message}</Text>
                  <View style={styles.logMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: `${log.color}12` }]}>
                      <Text style={[styles.typeText, { color: log.color }]}>{log.type}</Text>
                    </View>
                    <Text style={styles.logTime}>{timeAgo(log.time)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.textTertiary },
  group: { marginHorizontal: 16, marginTop: 20 },
  dayLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
  },
  logList: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  logRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  logRowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  logIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  logMessage: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.text, lineHeight: 20 },
  logMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  typeBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  typeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  logTime: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary },
});
