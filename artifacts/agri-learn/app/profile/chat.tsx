import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { useAuth } from "@/context/AuthContext";
import {
  useConversationMessages,
  useSendChatMessage,
  useSendRawMessage,
  useUpdateOfferStatus,
  ChatMessage,
} from "@/hooks/useNotifications";
import { useCreateOrder } from "@/hooks/useOrders";

const C = Colors.light;

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

function formatDateSeparator(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function parseOffer(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function OfferCard({
  msg,
  isMe,
  isFarmer,
  onAccept,
  onDecline,
  accepting,
  declining,
}: {
  msg: ChatMessage;
  isMe: boolean;
  isFarmer: boolean;
  onAccept: () => void;
  onDecline: () => void;
  accepting: boolean;
  declining: boolean;
}) {
  const offer = parseOffer(msg.content);
  if (!offer) return null;

  const total = (Number(offer.quantity || 0) * Number(offer.price_per_unit || 0)).toFixed(2);
  const status: "pending" | "accepted" | "declined" = offer.status ?? "pending";

  const statusConfig = {
    pending:  { label: "Pending",  color: "#D97706", bg: "#FFFBEB" },
    accepted: { label: "Accepted", color: "#059669", bg: "#F0FDF4" },
    declined: { label: "Declined", color: "#DC2626", bg: "#FEF2F2" },
  }[status];

  const canRespond = isFarmer && !isMe && status === "pending";

  return (
    <View style={[styles.offerCard, isMe && styles.offerCardMe]}>
      <View style={styles.offerHeader}>
        <View style={styles.offerBadge}>
          <Feather name="tag" size={11} color={C.primary} />
          <Text style={styles.offerBadgeText}>OFFER</Text>
        </View>
        <View style={[styles.offerStatus, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.offerStatusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      {!!offer.listing_title && (
        <View style={styles.offerListingRow}>
          <Feather name="package" size={11} color={C.textSecondary} />
          <Text style={styles.offerListingText} numberOfLines={1}>{offer.listing_title}</Text>
        </View>
      )}

      <View style={styles.offerDetails}>
        <View style={styles.offerDetailItem}>
          <Text style={styles.offerDetailLabel}>Quantity</Text>
          <Text style={styles.offerDetailValue}>{offer.quantity} {offer.unit}</Text>
        </View>
        <View style={styles.offerDetailItem}>
          <Text style={styles.offerDetailLabel}>Price / unit</Text>
          <Text style={styles.offerDetailValue}>R{Number(offer.price_per_unit).toFixed(2)}</Text>
        </View>
        <View style={[styles.offerDetailItem, styles.offerTotalRow]}>
          <Text style={styles.offerDetailLabel}>Total</Text>
          <Text style={[styles.offerDetailValue, styles.offerTotal]}>R{total}</Text>
        </View>
      </View>

      {canRespond && (
        <View style={styles.offerActions}>
          <Pressable
            style={({ pressed }) => [styles.declineBtn, { opacity: pressed || declining ? 0.7 : 1 }]}
            onPress={onDecline}
            disabled={declining || accepting}
          >
            {declining ? <ActivityIndicator size="small" color="#DC2626" /> : <Feather name="x" size={14} color="#DC2626" />}
            <Text style={styles.declineBtnText}>Decline</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.acceptBtn, { opacity: pressed || accepting ? 0.7 : 1 }]}
            onPress={onAccept}
            disabled={accepting || declining}
          >
            {accepting ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={14} color="#fff" />}
            <Text style={styles.acceptBtnText}>Accept</Text>
          </Pressable>
        </View>
      )}

      <Text style={[styles.offerTime, isMe && styles.offerTimeMe]}>{formatTime(msg.created_at)}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const params = useLocalSearchParams<{
    listingId?: string;
    otherId?: string;
    otherName?: string;
    listingTitle?: string;
    listingPrice?: string;
    listingUnit?: string;
  }>();

  const listingId    = params.listingId    && params.listingId    !== "" ? params.listingId    : null;
  const otherId      = params.otherId      && params.otherId      !== "" ? params.otherId      : null;
  const otherName    = params.otherName    && params.otherName    !== "" ? params.otherName    : "Unknown";
  const listingTitle = params.listingTitle && params.listingTitle !== "" ? params.listingTitle : "";
  const listingPrice = params.listingPrice && params.listingPrice !== "" ? params.listingPrice : "";
  const listingUnit  = params.listingUnit  && params.listingUnit  !== "" ? params.listingUnit  : "unit";

  const isFarmer = profile?.role === "farmer" || profile?.role === "admin";
  const farmerId = isFarmer ? user?.id ?? "" : otherId ?? "";
  const buyerId  = isFarmer ? otherId ?? "" : user?.id ?? "";

  const [text,           setText]           = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerQty,       setOfferQty]       = useState("");
  const [offerPrice,     setOfferPrice]     = useState(listingPrice);
  const [acceptingId,    setAcceptingId]    = useState<string | null>(null);
  const [decliningId,    setDecliningId]    = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const { data: messages = [], isLoading } = useConversationMessages(listingId, otherId);
  const sendMessage       = useSendChatMessage();
  const sendRawMessage    = useSendRawMessage();
  const updateOfferStatus = useUpdateOfferStatus();
  const createOrder       = useCreateOrder();

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!otherId) {
      Alert.alert("Cannot Send", "Could not identify the recipient. Please go back and reopen this conversation.");
      return;
    }

    setText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await sendMessage.mutateAsync({ receiverId: otherId, listingId, text: trimmed });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (err: any) {
      setText(trimmed);
      Alert.alert("Send Failed", err?.message ?? "Could not send message. Please try again.");
    }
  };

  const handleSendOffer = async () => {
    const qty   = parseFloat(offerQty);
    const price = parseFloat(offerPrice);
    if (!qty || qty <= 0 || !price || price <= 0) {
      Alert.alert("Invalid Offer", "Please enter a valid quantity and price.");
      return;
    }

    if (!otherId) {
      Alert.alert("Cannot Send", "Could not identify the recipient. Please go back and reopen this conversation.");
      return;
    }

    setShowOfferModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const rawContent = JSON.stringify({
        type: "offer",
        quantity: qty,
        price_per_unit: price,
        unit: listingUnit,
        listing_title: listingTitle,
        status: "pending",
        buyer_name: profile?.full_name ?? user?.email ?? "A buyer",
      });
      await sendRawMessage.mutateAsync({ receiverId: otherId, listingId, rawContent });
      setOfferQty("");
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (err: any) {
      Alert.alert("Offer Failed", err?.message ?? "Could not send offer. Please try again.");
    }
  };

  const handleAcceptOffer = async (msg: ChatMessage) => {
    if (!otherId) return;
    setAcceptingId(msg.id);
    try {
      const originalOffer = parseOffer(msg.content);
      await updateOfferStatus.mutateAsync({ messageId: msg.id, status: "accepted" });
      await createOrder.mutateAsync({
        buyerId,
        farmerId,
        listingId,
        offerMessageId: msg.id,
        quantity: originalOffer?.quantity ?? 0,
        pricePerUnit: originalOffer?.price_per_unit ?? 0,
        unit: originalOffer?.unit ?? listingUnit,
      });
      await sendMessage.mutateAsync({
        receiverId: otherId,
        listingId,
        text: `Offer accepted! ✓ Your order for ${originalOffer?.quantity} ${originalOffer?.unit} has been confirmed. I'll let you know when it's ready for pickup.`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not accept the offer. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineOffer = async (msg: ChatMessage) => {
    if (!otherId) return;
    setDecliningId(msg.id);
    try {
      await updateOfferStatus.mutateAsync({ messageId: msg.id, status: "declined" });
      await sendMessage.mutateAsync({
        receiverId: otherId,
        listingId,
        text: "I'm unable to accept this offer at the moment. Feel free to send a revised offer.",
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not decline the offer. Please try again.");
    } finally {
      setDecliningId(null);
    }
  };

  const initials = otherName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{otherName}</Text>
          {!!listingTitle && (
            <View style={styles.listingBadge}>
              <Feather name="package" size={10} color={C.primary} />
              <Text style={styles.listingBadgeText} numberOfLines={1}>{listingTitle}</Text>
            </View>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [styles.ordersBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push("/profile/orders" as any)}
        >
          <Feather name="shopping-bag" size={18} color={C.primary} />
        </Pressable>
      </View>

      {/* Missing recipient warning */}
      {!otherId && (
        <View style={styles.missingBanner}>
          <Feather name="alert-triangle" size={14} color="#92400E" />
          <Text style={styles.missingBannerText}>
            Conversation could not be loaded. Please go back and reopen it.
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.messageList, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ paddingTop: 60 }} />
        ) : messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="message-circle" size={32} color={C.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Start the conversation</Text>
            <Text style={styles.emptySub}>
              Send a message or make an offer to discuss details, pricing, or arrange pickup.
            </Text>
          </View>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const showDateSep = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);
            const isOffer   = msg.msgType === "offer";
            const isInquiry = msg.msgType === "purchase_interest";

            return (
              <React.Fragment key={msg.id}>
                {showDateSep && (
                  <View style={styles.dateSep}>
                    <View style={styles.dateSepLine} />
                    <Text style={styles.dateSepText}>{formatDateSeparator(msg.created_at)}</Text>
                    <View style={styles.dateSepLine} />
                  </View>
                )}

                {isOffer ? (
                  <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
                    {!isMe && (
                      <View style={styles.smallAvatar}>
                        <Text style={styles.smallAvatarText}>{initials}</Text>
                      </View>
                    )}
                    <OfferCard
                      msg={msg}
                      isMe={isMe}
                      isFarmer={isFarmer}
                      onAccept={() => handleAcceptOffer(msg)}
                      onDecline={() => handleDeclineOffer(msg)}
                      accepting={acceptingId === msg.id}
                      declining={decliningId === msg.id}
                    />
                  </View>
                ) : (
                  <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
                    {!isMe && (
                      <View style={styles.smallAvatar}>
                        <Text style={styles.smallAvatarText}>{initials}</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        isMe ? styles.bubbleMe : styles.bubbleThem,
                        isInquiry && styles.bubbleInquiry,
                      ]}
                    >
                      {isInquiry && (
                        <View style={styles.inquiryBadge}>
                          <Feather name="bell" size={10} color={C.primary} />
                          <Text style={styles.inquiryBadgeText}>Initial inquiry</Text>
                        </View>
                      )}
                      <Text style={[styles.bubbleText, isMe && !isInquiry && styles.bubbleTextMe]}>
                        {msg.text}
                      </Text>
                      <View style={styles.bubbleMeta}>
                        <Text style={[styles.bubbleTime, isMe && !isInquiry && styles.bubbleTimeMe]}>
                          {formatTime(msg.created_at)}
                        </Text>
                        {isMe && !isInquiry && (
                          <Feather
                            name={msg.read_at ? "check-circle" : "check"}
                            size={11}
                            color={msg.read_at ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)"}
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </React.Fragment>
            );
          })
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {!isFarmer && (
          <Pressable
            style={({ pressed }) => [styles.offerTriggerBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => {
              setOfferPrice(listingPrice);
              setShowOfferModal(true);
            }}
          >
            <Feather name="tag" size={18} color={C.primary} />
          </Pressable>
        )}
        <TextInput
          style={[styles.input, !isFarmer && { borderRadius: 18 }]}
          placeholder="Type a message..."
          placeholderTextColor={C.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            { opacity: pressed || !text.trim() ? 0.6 : 1 },
            !text.trim() && styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={!text.trim() || sendMessage.isPending}
        >
          {sendMessage.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="send" size={18} color="#fff" />
          )}
        </Pressable>
      </View>

      {/* Offer Modal */}
      <Modal
        visible={showOfferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOfferModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowOfferModal(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 24) }]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Make an Offer</Text>

            {!!listingTitle && (
              <View style={styles.modalListingTag}>
                <Feather name="package" size={12} color={C.primary} />
                <Text style={styles.modalListingText} numberOfLines={1}>{listingTitle}</Text>
              </View>
            )}

            <Text style={styles.modalLabel}>Quantity ({listingUnit})</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 20"
              placeholderTextColor={C.textTertiary}
              value={offerQty}
              onChangeText={setOfferQty}
              keyboardType="decimal-pad"
            />

            <Text style={styles.modalLabel}>Price per {listingUnit} (ZAR)</Text>
            <View style={styles.modalPriceRow}>
              <Text style={styles.modalCurrency}>R</Text>
              <TextInput
                style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                placeholder={listingPrice ? listingPrice : "0.00"}
                placeholderTextColor={C.textTertiary}
                value={offerPrice}
                onChangeText={setOfferPrice}
                keyboardType="decimal-pad"
              />
            </View>

            {!!offerQty && !!offerPrice && (
              <View style={styles.totalPreview}>
                <Text style={styles.totalPreviewLabel}>Estimated Total</Text>
                <Text style={styles.totalPreviewValue}>
                  R{(parseFloat(offerQty || "0") * parseFloat(offerPrice || "0")).toFixed(2)}
                </Text>
              </View>
            )}

            <Text style={styles.modalHint}>
              The farmer will review your offer and can accept or decline it.
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.modalCancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => setShowOfferModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalSendBtn,
                  { opacity: pressed || sendRawMessage.isPending ? 0.7 : 1 },
                ]}
                onPress={handleSendOffer}
                disabled={sendRawMessage.isPending}
              >
                {sendRawMessage.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="tag" size={16} color="#fff" />
                )}
                <Text style={styles.modalSendText}>Send Offer</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingBottom: 12,
    backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${C.primary}20`, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: C.primary },
  headerInfo: { flex: 1, gap: 3 },
  headerName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.text },
  listingBadge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: `${C.primary}10`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  listingBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.primary, maxWidth: 200 },
  ordersBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: `${C.primary}10`, alignItems: "center", justifyContent: "center" },
  missingBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF3C7", borderBottomWidth: 1, borderBottomColor: "#FCD34D",
    paddingHorizontal: 16, paddingVertical: 10,
  },
  missingBannerText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#92400E", flex: 1 },
  messageList: { padding: 16, gap: 4 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 24 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 20 },
  dateSep: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 16 },
  dateSepLine: { flex: 1, height: 1, backgroundColor: C.border },
  dateSepText: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.textTertiary },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 2 },
  bubbleRowMe: { justifyContent: "flex-end" },
  bubbleRowThem: { justifyContent: "flex-start" },
  smallAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${C.primary}20`, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  smallAvatarText: { fontSize: 10, fontFamily: "Inter_700Bold", color: C.primary },
  bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleMe: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: C.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border },
  bubbleInquiry: { borderWidth: 1, borderColor: `${C.primary}30`, backgroundColor: `${C.primary}08`, borderBottomLeftRadius: 4 },
  inquiryBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  inquiryBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: C.primary, textTransform: "uppercase", letterSpacing: 0.5 },
  bubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 21 },
  bubbleTextMe: { color: "#fff" },
  bubbleMeta: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textTertiary },
  bubbleTimeMe: { color: "rgba(255,255,255,0.65)" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border,
  },
  offerTriggerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center", marginBottom: 2, flexShrink: 0 },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120,
    backgroundColor: C.surfaceSecondary, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, fontFamily: "Inter_400Regular", color: C.text,
    borderWidth: 1, borderColor: C.border,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginBottom: 2, flexShrink: 0 },
  sendBtnDisabled: { backgroundColor: C.textTertiary },
  offerCard: {
    borderRadius: 16, borderWidth: 1.5, borderColor: `${C.primary}30`,
    backgroundColor: C.surface, padding: 16,
    minWidth: 260, maxWidth: 300, gap: 10,
    alignSelf: "flex-start",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  offerCardMe: { alignSelf: "flex-end" },
  offerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  offerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: `${C.primary}12`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  offerBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: C.primary, letterSpacing: 0.8 },
  offerStatus: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  offerStatusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  offerListingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  offerListingText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary, flex: 1 },
  offerDetails: { gap: 8, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 },
  offerDetailItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  offerTotalRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, marginTop: 2 },
  offerDetailLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  offerDetailValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },
  offerTotal: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.primary },
  offerActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  declineBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderColor: "#DC2626", borderRadius: 10, paddingVertical: 9 },
  declineBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#DC2626" },
  acceptBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#059669", borderRadius: 10, paddingVertical: 9 },
  acceptBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  offerTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textTertiary, textAlign: "left" },
  offerTimeMe: { textAlign: "right" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20, gap: 14 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 8 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.text },
  modalListingTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: `${C.primary}10`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  modalListingText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primary, maxWidth: 240 },
  modalLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary, marginBottom: -8 },
  modalInput: { height: 50, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, fontFamily: "Inter_400Regular", color: C.text, backgroundColor: C.surfaceSecondary, marginBottom: 4 },
  modalPriceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalCurrency: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  totalPreview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.surfaceSecondary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: C.border },
  totalPreviewLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  totalPreviewValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.primary },
  modalHint: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textTertiary, textAlign: "center", lineHeight: 17 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 4 },
  modalCancelBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  modalSendBtn: { flex: 2, height: 50, borderRadius: 14, backgroundColor: C.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  modalSendText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
