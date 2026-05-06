import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useOrder, useUpdateOrderStatus, useMyReview, useSubmitReview, useReviews, Order } from "@/hooks/useOrders";
import { useMarkAsSold } from "@/hooks/useListings";

const C = Colors.light;

const STATUS_STEPS: { key: Order["status"]; label: string; icon: string }[] = [
  { key: "confirmed",        label: "Order Confirmed",   icon: "check-circle" },
  { key: "ready_for_pickup", label: "Ready for Pickup",  icon: "package" },
  { key: "completed",        label: "Completed",         icon: "star" },
];

const STATUS_COLOR: Record<Order["status"], string> = {
  confirmed:        "#2563EB",
  ready_for_pickup: "#D97706",
  completed:        "#059669",
  cancelled:        "#DC2626",
};

function StepTimeline({ status }: { status: Order["status"] }) {
  const steps = STATUS_STEPS;
  const currentIndex = status === "cancelled" ? -1 : steps.findIndex((s) => s.key === status);

  return (
    <View style={styles.timeline}>
      {steps.map((step, i) => {
        const done = currentIndex >= i;
        const active = currentIndex === i;
        return (
          <View key={step.key} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[
                styles.timelineDot,
                done && { backgroundColor: STATUS_COLOR[step.key] },
                active && { borderColor: STATUS_COLOR[step.key] },
              ]}>
                {done && <Feather name={step.icon as any} size={12} color="#fff" />}
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.timelineLine, done && i < currentIndex && { backgroundColor: C.primary }]} />
              )}
            </View>
            <Text style={[styles.timelineLabel, done && { color: C.text, fontFamily: "Inter_600SemiBold" }]}>
              {step.label}
            </Text>
          </View>
        );
      })}
      {status === "cancelled" && (
        <View style={styles.timelineRow}>
          <View style={styles.timelineLeft}>
            <View style={[styles.timelineDot, { backgroundColor: "#DC2626" }]}>
              <Feather name="x" size={12} color="#fff" />
            </View>
          </View>
          <Text style={[styles.timelineLabel, { color: "#DC2626", fontFamily: "Inter_600SemiBold" }]}>Cancelled</Text>
        </View>
      )}
    </View>
  );
}

function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => {
            Haptics.selectionAsync();
            onRate(star);
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.star, star <= rating && styles.starFilled]}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const { data: order, isLoading, refetch } = useOrder(orderId ?? null);
  const { data: myReview } = useMyReview(orderId ?? null);
  const { data: allReviews = [] } = useReviews(order ? (order.farmer_id === user?.id ? order.buyer_id : order.farmer_id) : null);
  const updateStatus = useUpdateOrderStatus();
  const submitReview = useSubmitReview();
  const markAsSold  = useMarkAsSold();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | "advance" | "cancel">(null);

  useEffect(() => {
    if (order?.listing_id && order.status !== "cancelled") {
      markAsSold.mutate(order.listing_id);
    }
  }, [order?.id, order?.listing_id, order?.status]);

  if (isLoading || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const isFarmer = user?.id === order.farmer_id;
  const isBuyer  = user?.id === order.buyer_id;
  const total    = (order.quantity * order.price_per_unit).toFixed(2);
  const revieweeId = isFarmer ? order.buyer_id : order.farmer_id;

  const nextStatus = (): Order["status"] | null => {
    if (!isFarmer) return null;
    if (order.status === "confirmed")        return "ready_for_pickup";
    if (order.status === "ready_for_pickup") return "completed";
    return null;
  };

  const nextStatusLabel = (): string => {
    const ns = nextStatus();
    if (ns === "ready_for_pickup") return "Mark Ready for Pickup";
    if (ns === "completed")        return "Mark as Completed";
    return "";
  };

  const handleAdvance = async () => {
    const ns = nextStatus();
    if (!ns) return;
    if (confirmAction !== "advance") { setConfirmAction("advance"); return; }
    setConfirmAction(null);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await updateStatus.mutateAsync({ orderId: order.id, status: ns, listingId: order.listing_id });
      refetch();
    } catch (err: any) {
      Alert.alert("Update Failed", err?.message ?? "Could not update order status. Please try again.");
    }
  };

  const handleCancel = async () => {
    if (confirmAction !== "cancel") { setConfirmAction("cancel"); return; }
    setConfirmAction(null);
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: "cancelled" });
      refetch();
    } catch (err: any) {
      Alert.alert("Cancel Failed", err?.message ?? "Could not cancel order. Please try again.");
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Please select a star rating before submitting.");
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview.mutateAsync({ revieweeId, orderId: order.id, rating, comment });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Review submitted!", "Thank you for your feedback.");
    } catch {
      Alert.alert("Error", "Could not submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.navTitle}>Order Details</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 80 }}
      >
        {/* Order summary card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[order.status]}15` }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[order.status] }]}>
                {order.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
            </View>
            <Text style={styles.orderDate}>
              {new Date(order.created_at).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>

          <Text style={styles.listingTitle}>{order.listing_title}</Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Quantity</Text>
              <Text style={styles.summaryValue}>{order.quantity} {order.unit}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Price / unit</Text>
              <Text style={styles.summaryValue}>R{Number(order.price_per_unit).toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryItem, styles.summaryItemFull]}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={[styles.summaryValue, { color: C.primary, fontSize: 20 }]}>R{total}</Text>
            </View>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.participantRow}>
            <View style={styles.participantAvatar}>
              <Feather name="user" size={16} color={C.primary} />
            </View>
            <View>
              <Text style={styles.participantRole}>Buyer</Text>
              <Text style={styles.participantName}>{order.buyer_name}</Text>
            </View>
            {isBuyer && <View style={styles.youBadge}><Text style={styles.youBadgeText}>You</Text></View>}
          </View>
          <View style={[styles.participantRow, { marginTop: 12 }]}>
            <View style={[styles.participantAvatar, { backgroundColor: `${C.success}15` }]}>
              <Feather name="sun" size={16} color={C.success} />
            </View>
            <View>
              <Text style={styles.participantRole}>Farmer</Text>
              <Text style={styles.participantName}>{order.farmer_name}</Text>
            </View>
            {isFarmer && <View style={styles.youBadge}><Text style={styles.youBadgeText}>You</Text></View>}
          </View>
        </View>

        {/* Status timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <StepTimeline status={order.status} />
        </View>

        {/* Farmer actions */}
        {isFarmer && order.status !== "completed" && order.status !== "cancelled" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Update Status</Text>

            {nextStatus() && (
              confirmAction === "advance" ? (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmText}>
                    Confirm: mark as "{nextStatus() === "ready_for_pickup" ? "Ready for Pickup" : "Completed"}"?
                  </Text>
                  <View style={styles.confirmBtns}>
                    <Pressable
                      style={({ pressed }) => [styles.confirmNo, { opacity: pressed ? 0.7 : 1 }]}
                      onPress={() => setConfirmAction(null)}
                    >
                      <Text style={styles.confirmNoText}>No</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.confirmYes, { opacity: pressed || updateStatus.isPending ? 0.7 : 1 }]}
                      onPress={handleAdvance}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.confirmYesText}>Yes, confirm</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.advanceBtn, { opacity: pressed || updateStatus.isPending ? 0.7 : 1 }]}
                  onPress={handleAdvance}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="arrow-right-circle" size={18} color="#fff" />
                  )}
                  <Text style={styles.advanceBtnText}>{nextStatusLabel()}</Text>
                </Pressable>
              )
            )}

            {confirmAction === "cancel" ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmText}>Are you sure you want to cancel this order?</Text>
                <View style={styles.confirmBtns}>
                  <Pressable
                    style={({ pressed }) => [styles.confirmNo, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => setConfirmAction(null)}
                  >
                    <Text style={styles.confirmNoText}>No</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.confirmYesDanger, { opacity: pressed || updateStatus.isPending ? 0.7 : 1 }]}
                    onPress={handleCancel}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.confirmYesText}>Yes, cancel</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={handleCancel}
              >
                <Feather name="x-circle" size={16} color="#DC2626" />
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Review section */}
        {order.status === "completed" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Review</Text>
            {myReview ? (
              <View style={styles.reviewDone}>
                <View style={styles.starRowDisplay}>
                  {[1,2,3,4,5].map((s) => (
                    <Text key={s} style={[styles.star, s <= myReview.rating && styles.starFilled]}>★</Text>
                  ))}
                </View>
                {myReview.comment ? (
                  <Text style={styles.reviewComment}>"{myReview.comment}"</Text>
                ) : null}
                <Text style={styles.reviewDoneText}>You've already reviewed this order.</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                <Text style={styles.reviewPrompt}>
                  How was your experience with {isBuyer ? order.farmer_name : order.buyer_name}?
                </Text>
                <StarRating rating={rating} onRate={setRating} />
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Leave a comment (optional)..."
                  placeholderTextColor={C.textTertiary}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  maxLength={500}
                />
                <Pressable
                  style={({ pressed }) => [styles.submitBtn, { opacity: pressed || submittingReview || rating === 0 ? 0.7 : 1 }]}
                  onPress={handleSubmitReview}
                  disabled={submittingReview || rating === 0}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="send" size={16} color="#fff" />
                  )}
                  <Text style={styles.submitBtnText}>Submit Review</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  orderDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  listingTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryItem: { flex: 1, minWidth: "40%", gap: 3 },
  summaryItemFull: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textTertiary, textTransform: "uppercase" },
  summaryValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.text },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  participantRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  participantAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: `${C.primary}15`, alignItems: "center", justifyContent: "center" },
  participantRole: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  participantName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  youBadge: { marginLeft: "auto", backgroundColor: `${C.primary}15`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  youBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.primary },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  timelineLeft: { alignItems: "center", width: 24 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.border, borderWidth: 2, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  timelineLine: { width: 2, height: 28, backgroundColor: C.border, marginTop: 2 },
  timelineLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, paddingTop: 3, paddingBottom: 20 },
  advanceBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primary, borderRadius: 12, padding: 14,
  },
  advanceBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  cancelBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#FCA5A5", borderRadius: 12, padding: 12,
    backgroundColor: "#FEF2F2",
  },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#DC2626" },
  reviewPrompt: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 20 },
  starRow: { flexDirection: "row", gap: 4 },
  starRowDisplay: { flexDirection: "row", gap: 4 },
  star: { fontSize: 32, color: C.border },
  starFilled: { color: "#F59E0B" },
  reviewInput: {
    backgroundColor: C.background, borderRadius: 12, borderWidth: 1.5, borderColor: C.border,
    padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: C.text,
    minHeight: 80, textAlignVertical: "top",
  },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primary, borderRadius: 12, padding: 14,
  },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  reviewDone: { gap: 8, alignItems: "flex-start" },
  reviewComment: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, fontStyle: "italic", lineHeight: 20 },
  reviewDoneText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  confirmRow: {
    borderRadius: 12, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.surfaceSecondary, padding: 14, gap: 12,
  },
  confirmText: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.text, lineHeight: 20 },
  confirmBtns: { flexDirection: "row", gap: 10 },
  confirmNo: {
    flex: 1, height: 42, borderRadius: 10, borderWidth: 1.5, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  confirmNoText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  confirmYes: {
    flex: 2, height: 42, borderRadius: 10, backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center",
  },
  confirmYesDanger: {
    flex: 2, height: 42, borderRadius: 10, backgroundColor: "#DC2626",
    alignItems: "center", justifyContent: "center",
  },
  confirmYesText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
