import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { useFlaggedFarmers, useSuspendUser, useUnsuspendUser } from "@/hooks/useAdmin";

const C = Colors.light;

function StarRow({ count }: { count: number }) {
  return (
    <View style={s.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[s.star, i <= 2 ? s.starBad : s.starEmpty]}>★</Text>
      ))}
      <Text style={s.starLabel}>≤ 2 stars</Text>
    </View>
  );
}

export default function AlertsScreen() {
  const { data: flagged = [], isLoading, refetch } = useFlaggedFarmers();
  const suspend   = useSuspendUser();
  const unsuspend = useUnsuspendUser();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleToggle = async (userId: string, isSuspended: boolean) => {
    if (!isSuspended && confirmId !== userId) {
      setConfirmId(userId);
      return;
    }
    setConfirmId(null);
    if (isSuspended) {
      await unsuspend.mutateAsync(userId);
    } else {
      await suspend.mutateAsync(userId);
    }
    refetch();
  };

  const suspended = flagged.filter((f: any) => f.suspended);
  const pending   = flagged.filter((f: any) => !f.suspended);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#DC2626" />}
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 60 }}
    >
      <View style={s.pageHeader}>
        <View style={s.pageHeaderIcon}>
          <Feather name="alert-triangle" size={22} color="#DC2626" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.pageTitle}>Review Alerts</Text>
          <Text style={s.pageSub}>
            Farmers flagged for 3 or more low-star reviews (1–2 stars)
          </Text>
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={[s.statCard, { borderColor: "#FCA5A5" }]}>
          <Text style={[s.statNum, { color: "#DC2626" }]}>{pending.length}</Text>
          <Text style={s.statLbl}>Needs Review</Text>
        </View>
        <View style={[s.statCard, { borderColor: "#D1D5DB" }]}>
          <Text style={[s.statNum, { color: "#6B7280" }]}>{suspended.length}</Text>
          <Text style={s.statLbl}>Suspended</Text>
        </View>
        <View style={[s.statCard, { borderColor: C.border }]}>
          <Text style={[s.statNum, { color: C.text }]}>{flagged.length}</Text>
          <Text style={s.statLbl}>Total Flagged</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#DC2626" style={{ paddingTop: 40 }} />
      ) : flagged.length === 0 ? (
        <View style={s.emptyState}>
          <View style={s.emptyIcon}>
            <Feather name="check-circle" size={36} color="#059669" />
          </View>
          <Text style={s.emptyTitle}>No alerts</Text>
          <Text style={s.emptySub}>
            No farmers have received 3 or more low-star reviews. All good!
          </Text>
        </View>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <View style={s.sectionRow}>
                <View style={s.sectionDot} />
                <Text style={s.sectionLabel}>NEEDS ACTION ({pending.length})</Text>
              </View>
              {pending.map((farmer: any) => (
                <FarmerCard
                  key={farmer.id}
                  farmer={farmer}
                  confirmId={confirmId}
                  onToggle={handleToggle}
                  onCancelConfirm={() => setConfirmId(null)}
                  isPending={suspend.isPending || unsuspend.isPending}
                />
              ))}
            </>
          )}

          {suspended.length > 0 && (
            <>
              <View style={[s.sectionRow, { marginTop: 8 }]}>
                <View style={[s.sectionDot, { backgroundColor: "#9CA3AF" }]} />
                <Text style={[s.sectionLabel, { color: "#9CA3AF" }]}>
                  SUSPENDED ({suspended.length})
                </Text>
              </View>
              {suspended.map((farmer: any) => (
                <FarmerCard
                  key={farmer.id}
                  farmer={farmer}
                  confirmId={confirmId}
                  onToggle={handleToggle}
                  onCancelConfirm={() => setConfirmId(null)}
                  isPending={suspend.isPending || unsuspend.isPending}
                />
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function FarmerCard({
  farmer,
  confirmId,
  onToggle,
  onCancelConfirm,
  isPending,
}: {
  farmer: any;
  confirmId: string | null;
  onToggle: (id: string, suspended: boolean) => void;
  onCancelConfirm: () => void;
  isPending: boolean;
}) {
  const isSuspended = !!farmer.suspended;
  const isConfirming = confirmId === farmer.id;
  const initials = (farmer.full_name ?? farmer.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[s.card, isSuspended && s.cardSuspended]}>
      <View style={s.cardTop}>
        <View style={[s.avatar, isSuspended ? s.avatarSuspended : s.avatarFlagged]}>
          <Text style={[s.avatarText, isSuspended ? s.avatarTextSuspended : s.avatarTextFlagged]}>
            {initials}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <View style={s.nameRow}>
            <Text style={[s.name, isSuspended && s.nameSuspended]}>{farmer.full_name ?? "—"}</Text>
            {isSuspended && (
              <View style={s.suspendedBadge}>
                <Feather name="slash" size={10} color="#6B7280" />
                <Text style={s.suspendedBadgeText}>Suspended</Text>
              </View>
            )}
          </View>
          <Text style={s.email}>{farmer.email}</Text>
          {farmer.location && (
            <View style={s.locationRow}>
              <Feather name="map-pin" size={11} color={C.textTertiary} />
              <Text style={s.locationText}>{farmer.location}</Text>
            </View>
          )}
        </View>

        <View style={s.badgeCol}>
          <View style={[s.reviewBadge, isSuspended && s.reviewBadgeMuted]}>
            <Feather name="star" size={12} color={isSuspended ? "#9CA3AF" : "#DC2626"} />
            <Text style={[s.reviewBadgeText, isSuspended && { color: "#9CA3AF" }]}>
              {farmer.bad_review_count} bad
            </Text>
          </View>
        </View>
      </View>

      <View style={s.cardDivider} />

      <View style={s.cardBottom}>
        <View style={s.reviewInfo}>
          <Feather name="info" size={12} color={C.textTertiary} />
          <Text style={s.reviewInfoText}>
            {farmer.bad_review_count} review{farmer.bad_review_count !== 1 ? "s" : ""} rated 1–2 stars
            {isSuspended ? " · Listing creation blocked" : " · Can still create listings"}
          </Text>
        </View>

        {isConfirming ? (
          <View style={s.confirmRow}>
            <Text style={s.confirmText}>Suspend and block listings?</Text>
            <View style={s.confirmBtns}>
              <Pressable style={s.confirmNo} onPress={onCancelConfirm}>
                <Text style={s.confirmNoText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[s.confirmYes, { opacity: isPending ? 0.7 : 1 }]}
                onPress={() => onToggle(farmer.id, false)}
                disabled={isPending}
              >
                {isPending
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.confirmYesText}>Suspend</Text>
                }
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              isSuspended ? s.unsuspendBtn : s.suspendBtn,
              { opacity: pressed || isPending ? 0.7 : 1 },
            ]}
            onPress={() => onToggle(farmer.id, isSuspended)}
            disabled={isPending}
          >
            <Feather
              name={isSuspended ? "user-check" : "user-x"}
              size={14}
              color={isSuspended ? "#059669" : "#fff"}
            />
            <Text style={isSuspended ? s.unsuspendBtnText : s.suspendBtnText}>
              {isSuspended ? "Lift Suspension" : "Suspend User"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  pageHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#991B1B" },
  pageSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#B91C1C", lineHeight: 18, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, alignItems: "center", paddingVertical: 14,
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1.5,
  },
  statNum: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#DC2626" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#DC2626", letterSpacing: 0.5 },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 21, paddingHorizontal: 20 },
  card: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: "#FCA5A5",
    overflow: "hidden",
  },
  cardSuspended: { borderColor: C.border, backgroundColor: "#FAFAFA" },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  avatarFlagged: { backgroundColor: "#FEE2E2" },
  avatarSuspended: { backgroundColor: "#F3F4F6" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  avatarTextFlagged: { color: "#DC2626" },
  avatarTextSuspended: { color: "#9CA3AF" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  nameSuspended: { color: C.textSecondary },
  suspendedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#F3F4F6", borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  suspendedBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#6B7280" },
  email: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textTertiary },
  badgeCol: { alignItems: "flex-end" },
  reviewBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FEE2E2", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  reviewBadgeMuted: { backgroundColor: "#F3F4F6" },
  reviewBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#DC2626" },
  starRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  star: { fontSize: 13 },
  starBad: { color: "#DC2626" },
  starEmpty: { color: "#E5E7EB" },
  starLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary, marginLeft: 4 },
  cardDivider: { height: 1, backgroundColor: C.borderLight },
  cardBottom: { padding: 14, gap: 10 },
  reviewInfo: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  reviewInfoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 17 },
  confirmRow: { gap: 8 },
  confirmText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#DC2626" },
  confirmBtns: { flexDirection: "row", gap: 8 },
  confirmNo: {
    flex: 1, height: 36, borderRadius: 9,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  confirmNoText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  confirmYes: {
    flex: 2, height: 36, borderRadius: 9,
    backgroundColor: "#DC2626",
    alignItems: "center", justifyContent: "center",
  },
  confirmYesText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  suspendBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, height: 38, borderRadius: 10,
    backgroundColor: "#DC2626",
  },
  suspendBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  unsuspendBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, height: 38, borderRadius: 10,
    backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0",
  },
  unsuspendBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#059669" },
});
