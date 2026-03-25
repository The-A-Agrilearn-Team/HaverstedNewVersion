import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";
import {
  useWindowDetail,
  useWindowApplications,
  useApplyToWindow,
  useUpdateApplicationStatus,
  WindowApplication,
} from "@/hooks/useWindows";

const C = Colors.light;

const STATUS_COLOR: Record<string, string> = {
  open: C.success,
  filled: C.primary,
  closed: C.textTertiary,
  pending: C.warning,
  accepted: C.success,
  rejected: C.error,
};

export default function WindowDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();

  const { data: window, isLoading } = useWindowDetail(id);
  const { data: applications = [], refetch: refetchApps } = useWindowApplications(id);
  const applyMutation = useApplyToWindow();
  const updateStatus = useUpdateApplicationStatus();

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyQty, setApplyQty] = useState("");

  const isRetailer = profile?.role === "retailer" || profile?.role === "admin";
  const isFarmer = profile?.role === "farmer" || profile?.role === "admin";
  const isOwner = window?.retailer_id === user?.id;

  const hasApplied = applications.some((a) => a.farmer_id === user?.id);

  if (isLoading || !window) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 80 }]}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  const daysLeft = Math.ceil((new Date(window.deadline).getTime() - Date.now()) / 86400000);
  const statusColor = STATUS_COLOR[window.status] ?? C.textTertiary;

  const handleApply = async () => {
    if (!applyMessage.trim() || applyMessage.trim().length < 10) {
      Alert.alert("Add a message", "Please write at least 10 characters describing your offer.");
      return;
    }
    if (!applyQty || isNaN(Number(applyQty)) || Number(applyQty) <= 0) {
      Alert.alert("Invalid quantity", "Enter the quantity you can supply.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await applyMutation.mutateAsync({
        window_id: id,
        farmer_id: user!.id,
        message: applyMessage.trim(),
        quantity_available: parseInt(applyQty, 10),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowApplyForm(false);
      setApplyMessage("");
      setApplyQty("");
      Alert.alert("Application Sent!", "The retailer will review your application and get in touch.");
    } catch (err: any) {
      Alert.alert("Failed to apply", err?.message ?? "Please try again.");
    }
  };

  const handleUpdateStatus = (app: WindowApplication, newStatus: "accepted" | "rejected") => {
    Alert.alert(
      newStatus === "accepted" ? "Accept Application?" : "Reject Application?",
      `${newStatus === "accepted" ? "Accept" : "Reject"} ${app.farmer_name ?? "this farmer"}'s application?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: newStatus === "accepted" ? "Accept" : "Reject",
          style: newStatus === "rejected" ? "destructive" : "default",
          onPress: async () => {
            await updateStatus.mutateAsync({ id: app.id, status: newStatus, windowId: id });
            refetchApps();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>Supply Window</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {window.status.charAt(0).toUpperCase() + window.status.slice(1)}
              </Text>
            </View>
            <Text style={styles.category}>{window.category}</Text>
          </View>

          <Text style={styles.windowTitle}>{window.title}</Text>
          <Text style={styles.retailerName}>Posted by {window.retailer_name}</Text>
          <Text style={styles.windowDesc}>{window.description}</Text>

          <View style={styles.statsGrid}>
            <StatBox label="Needed" value={`${window.quantity_needed.toLocaleString()} ${window.unit}`} icon="package" />
            <StatBox label="Price" value={`R${window.price_offered.toFixed(2)}/${window.unit}`} icon="tag" />
            <StatBox label="Location" value={window.location} icon="map-pin" />
            <StatBox
              label="Deadline"
              value={daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left` : "Expired"}
              icon="clock"
              highlight={daysLeft < 3}
            />
          </View>
        </View>

        {isFarmer && !isOwner && window.status === "open" && (
          <View style={styles.applySection}>
            {hasApplied ? (
              <View style={styles.appliedBanner}>
                <Feather name="check-circle" size={18} color={C.success} />
                <Text style={styles.appliedText}>You have already applied to this window.</Text>
              </View>
            ) : !showApplyForm ? (
              <Pressable
                style={({ pressed }) => [styles.applyBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => {
                  setShowApplyForm(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Feather name="send" size={20} color="#fff" />
                <Text style={styles.applyBtnText}>Apply to this Window</Text>
              </Pressable>
            ) : (
              <View style={styles.applyForm}>
                <Text style={styles.applyFormTitle}>Your Application</Text>
                <Text style={styles.formLabel}>Quantity you can supply ({window.unit})</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.formInput}
                    placeholder={`e.g. ${Math.floor(window.quantity_needed * 0.5)}`}
                    placeholderTextColor={C.textTertiary}
                    value={applyQty}
                    onChangeText={setApplyQty}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={[styles.formLabel, { marginTop: 12 }]}>Message to retailer</Text>
                <TextInput
                  style={styles.formTextArea}
                  placeholder="Describe your produce quality, availability, and delivery terms..."
                  placeholderTextColor={C.textTertiary}
                  value={applyMessage}
                  onChangeText={setApplyMessage}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <View style={styles.formActions}>
                  <Pressable
                    style={[styles.formBtn, styles.formBtnCancel]}
                    onPress={() => setShowApplyForm(false)}
                  >
                    <Text style={styles.formBtnCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.formBtn, styles.formBtnSubmit, { opacity: pressed || applyMutation.isPending ? 0.8 : 1 }]}
                    onPress={handleApply}
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.formBtnSubmitText}>Submit Application</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {isOwner && (
          <View style={styles.applicationsSection}>
            <Text style={styles.appSectionTitle}>
              Applications ({applications.length})
            </Text>
            {applications.length === 0 ? (
              <View style={styles.noApps}>
                <Text style={styles.noAppsText}>No applications yet. Farmers will apply once they see your window.</Text>
              </View>
            ) : (
              applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  unit={window.unit}
                  onAccept={() => handleUpdateStatus(app, "accepted")}
                  onReject={() => handleUpdateStatus(app, "rejected")}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StatBox({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Feather name={icon as any} size={15} color={highlight ? C.error : C.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: C.error }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ApplicationCard({ app, unit, onAccept, onReject }: {
  app: WindowApplication; unit: string; onAccept: () => void; onReject: () => void;
}) {
  const sc = STATUS_COLOR[app.status] ?? C.textTertiary;
  return (
    <View style={styles.appCard}>
      <View style={styles.appCardHeader}>
        <View style={styles.farmerAvatar}>
          <Text style={styles.farmerAvatarText}>
            {(app.farmer_name ?? "?")[0].toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.farmerName}>{app.farmer_name ?? "Farmer"}</Text>
          <Text style={styles.appQty}>{app.quantity_available.toLocaleString()} {unit} available</Text>
        </View>
        <View style={[styles.appStatus, { backgroundColor: `${sc}18` }]}>
          <Text style={[styles.appStatusText, { color: sc }]}>
            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.appMessage}>{app.message}</Text>
      {app.status === "pending" && (
        <View style={styles.appActions}>
          <Pressable
            style={[styles.appActionBtn, styles.appActionReject]}
            onPress={onReject}
          >
            <Feather name="x" size={15} color={C.error} />
            <Text style={[styles.appActionText, { color: C.error }]}>Reject</Text>
          </Pressable>
          <Pressable
            style={[styles.appActionBtn, styles.appActionAccept]}
            onPress={onAccept}
          >
            <Feather name="check" size={15} color="#fff" />
            <Text style={[styles.appActionText, { color: "#fff" }]}>Accept</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: C.background, alignItems: "center" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text, flex: 1, textAlign: "center", marginHorizontal: 8 },
  scroll: { padding: 16, gap: 16 },
  headerCard: { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20, gap: 10 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  category: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary, backgroundColor: C.surfaceSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  windowTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 28 },
  retailerName: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  windowDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 22, borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statBox: { flex: 1, minWidth: "45%", backgroundColor: C.surfaceSecondary, borderRadius: 12, padding: 12, gap: 4 },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.textSecondary },
  statValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  applySection: { gap: 8 },
  appliedBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: `${C.success}12`, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: `${C.success}30` },
  appliedText: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.success, flex: 1 },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.primary, borderRadius: 14, padding: 16 },
  applyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  applyForm: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 6 },
  applyFormTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 4 },
  formLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },
  inputWrapper: { backgroundColor: C.surfaceSecondary, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
  formInput: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text },
  formTextArea: { backgroundColor: C.surfaceSecondary, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, minHeight: 100, lineHeight: 22 },
  formActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  formBtn: { flex: 1, borderRadius: 12, padding: 13, alignItems: "center" },
  formBtnCancel: { backgroundColor: C.surfaceSecondary, borderWidth: 1, borderColor: C.border },
  formBtnCancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  formBtnSubmit: { backgroundColor: C.primary },
  formBtnSubmitText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  applicationsSection: { gap: 10 },
  appSectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text },
  noApps: { backgroundColor: C.surface, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: C.border },
  noAppsText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 22 },
  appCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, gap: 10 },
  appCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  farmerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  farmerAvatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  farmerName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  appQty: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 1 },
  appStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  appStatusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  appMessage: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 20, backgroundColor: C.surfaceSecondary, borderRadius: 10, padding: 12 },
  appActions: { flexDirection: "row", gap: 8 },
  appActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, padding: 10 },
  appActionReject: { backgroundColor: `${C.error}10`, borderWidth: 1, borderColor: `${C.error}30` },
  appActionAccept: { backgroundColor: C.success },
  appActionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
