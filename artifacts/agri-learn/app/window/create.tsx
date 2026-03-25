import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { useCreateWindow } from "@/hooks/useWindows";

const C = Colors.light;

const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Livestock", "Poultry", "Dairy", "Other"];
const UNITS = ["kg", "ton", "litre", "dozen", "unit", "bag", "crate"];

const SA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

export default function CreateWindowScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const createWindow = useCreateWindow();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Vegetables");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isRetailer = profile?.role === "retailer" || profile?.role === "admin";

  if (!user || !isRetailer) {
    return (
      <View style={[styles.gate, { paddingTop: insets.top + 60 }]}>
        <Feather name="lock" size={40} color={C.textTertiary} />
        <Text style={styles.gateTitle}>Retailers Only</Text>
        <Text style={styles.gateText}>Only retailers can post supply windows.</Text>
        <Pressable style={styles.gateBtn} onPress={() => router.back()}>
          <Text style={styles.gateBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) e.title = "Title must be at least 5 characters";
    if (!description.trim() || description.trim().length < 10) e.description = "Description must be at least 10 characters";
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) e.quantity = "Enter a valid quantity";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = "Enter a valid price per unit";
    if (!location.trim()) e.location = "Location is required";
    if (!deadline.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) e.deadline = "Enter a date as YYYY-MM-DD";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePost = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createWindow.mutateAsync({
        retailer_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        quantity_needed: parseInt(quantity, 10),
        unit,
        price_offered: parseFloat(price),
        location: location.trim(),
        deadline,
        status: "open",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Window Posted!", `"${title.trim()}" is now open for farmer applications.`, [
        { text: "View Windows", onPress: () => router.replace("/(tabs)/windows") },
      ]);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Could not post window", err?.message ?? "Please try again.");
    }
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
        <Text style={styles.navTitle}>Post Supply Window</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.infoBanner}>
          <Feather name="info" size={16} color={C.primary} />
          <Text style={styles.infoText}>
            Farmers will see this window and apply with their available quantity and message. You review and accept the best match.
          </Text>
        </View>

        <Label>What do you need?</Label>
        <View style={styles.card}>
          <Field label="Window Title" placeholder='e.g. "500kg Potatoes Required"' value={title} onChangeText={setTitle} error={errors.title} maxLength={100} />
          <View style={styles.divider} />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textArea, !!errors.description && styles.inputError]}
              placeholder="Describe quality requirements, delivery terms, contract length..."
              placeholderTextColor={C.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>
        </View>

        <Label>Category</Label>
        <View style={styles.card}>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => { setCategory(cat); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Label>Quantity & Price</Label>
        <View style={styles.card}>
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Quantity Needed</Text>
              <View style={[styles.inputWrapper, !!errors.quantity && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 500"
                  placeholderTextColor={C.textTertiary}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
              {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Price Offered (R)</Text>
              <View style={[styles.inputWrapper, !!errors.price && styles.inputError]}>
                <Text style={styles.prefix}>R</Text>
                <TextInput
                  style={styles.input}
                  placeholder="per unit"
                  placeholderTextColor={C.textTertiary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitRow}>
            {UNITS.map((u) => (
              <Pressable
                key={u}
                style={[styles.unitChip, unit === u && styles.unitChipActive]}
                onPress={() => { setUnit(u); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={[styles.priceSummary, { marginTop: 12 }]}>
            <Text style={styles.summaryLabel}>Total value</Text>
            <Text style={styles.summaryValue}>
              R{price && quantity ? (parseFloat(price) * parseInt(quantity, 10)).toLocaleString("en-ZA", { minimumFractionDigits: 2 }) : "—"}
            </Text>
          </View>
        </View>

        <Label>Delivery Location</Label>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Delivery Address / Area</Text>
            <View style={[styles.inputWrapper, !!errors.location && styles.inputError]}>
              <Feather name="map-pin" size={16} color={C.textSecondary} style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Pinetown, KwaZulu-Natal"
                placeholderTextColor={C.textTertiary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>
          <View style={styles.divider} />
          <Text style={[styles.fieldLabel, { marginBottom: 10 }]}>Or select a province</Text>
          <View style={styles.chipGrid}>
            {SA_PROVINCES.map((p) => (
              <Pressable
                key={p}
                style={[styles.chip, styles.chipSmall, location === p && styles.chipActive]}
                onPress={() => { setLocation(p); setErrors((e) => ({ ...e, location: "" })); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.chipText, location === p && styles.chipTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Label>Application Deadline</Label>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Closing Date (YYYY-MM-DD)</Text>
            <View style={[styles.inputWrapper, !!errors.deadline && styles.inputError]}>
              <Feather name="calendar" size={16} color={C.textSecondary} style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 2026-04-30"
                placeholderTextColor={C.textTertiary}
                value={deadline}
                onChangeText={setDeadline}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.postBtn,
            { opacity: pressed || createWindow.isPending ? 0.85 : 1 },
          ]}
          onPress={handlePost}
          disabled={createWindow.isPending}
        >
          {createWindow.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="send" size={20} color="#fff" />
              <Text style={styles.postBtnText}>Post Supply Window</Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function Field({ label, placeholder, value, onChangeText, error, maxLength }: {
  label: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; error?: string; maxLength?: number;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrapper, !!error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={C.textTertiary}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { flex: 1, backgroundColor: C.background, alignItems: "center", paddingHorizontal: 32, gap: 16 },
  gateTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  gateText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center" },
  gateBtn: { backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  gateBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  scroll: { padding: 20, gap: 8 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: `${C.primary}10`, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: `${C.primary}20`, marginBottom: 8 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 20 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 12, marginBottom: 8 },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 4, gap: 0 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: C.surfaceSecondary, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, minHeight: 46 },
  inputError: { borderColor: C.error },
  prefix: { paddingLeft: 14, fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.primary },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text },
  textArea: { backgroundColor: C.surfaceSecondary, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, minHeight: 100, lineHeight: 22 },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.error },
  divider: { height: 1, backgroundColor: C.borderLight, marginVertical: 14 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surfaceSecondary },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  chipTextActive: { color: "#fff" },
  rowFields: { flexDirection: "row", gap: 12 },
  unitRow: { gap: 8, paddingVertical: 8 },
  unitChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surfaceSecondary },
  unitChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  unitChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  unitChipTextActive: { color: "#fff" },
  priceSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: `${C.primary}08`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  summaryValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.primary },
  footer: { paddingHorizontal: 20, paddingTop: 14, backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border },
  postBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.accent, borderRadius: 14, padding: 16 },
  postBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
