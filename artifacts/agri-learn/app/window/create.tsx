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
import { SERVICE_CATEGORIES, ServiceCategory, useCreateService } from "@/hooks/useServices";

const C = Colors.light;

export default function CreateServiceScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const createService = useCreateService();

  const [providerName, setProviderName] = useState(profile?.full_name ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("Fertilisers");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("per unit");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAdmin = profile?.role === "admin";

  if (!user || !isAdmin) {
    return (
      <View style={[styles.gate, { paddingTop: insets.top + 60 }]}>
        <Feather name="lock" size={40} color={C.textTertiary} />
        <Text style={styles.gateTitle}>Admin Only</Text>
        <Text style={styles.gateText}>Only admin users can list new services.</Text>
        <Pressable style={styles.gateBtn} onPress={() => router.back()}>
          <Text style={styles.gateBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!providerName.trim() || providerName.trim().length < 2) e.providerName = "Provider name required";
    if (!title.trim() || title.trim().length < 5) e.title = "Title must be at least 5 characters";
    if (!description.trim() || description.trim().length < 20) e.description = "Description must be at least 20 characters";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = "Enter a valid starting price";
    if (!location.trim()) e.location = "Location is required";
    if (!phone.trim() && !whatsapp.trim()) e.contact = "Provide at least one contact method";
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
      await createService.mutateAsync({
        provider_id: user.id,
        provider_name: providerName.trim(),
        title: title.trim(),
        description: description.trim(),
        category,
        price_from: parseFloat(price),
        price_unit: priceUnit.trim(),
        location: location.trim(),
        contact_phone: phone.trim() || undefined,
        contact_whatsapp: whatsapp.trim() || undefined,
        status: "active",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Service Listed!", `"${title.trim()}" is now visible to farmers.`, [
        { text: "View Services", onPress: () => router.replace("/(tabs)/windows") },
      ]);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Could not list service", err?.message ?? "Please try again.");
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
        <Text style={styles.navTitle}>List a Service</Text>
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
            Farmers will discover this service in the Service Window and contact you directly via phone or WhatsApp.
          </Text>
        </View>

        <Label>Provider</Label>
        <View style={styles.card}>
          <Field label="Business / Provider name" placeholder="e.g. GreenGrow Fertilisers" value={providerName} onChangeText={setProviderName} error={errors.providerName} />
        </View>

        <Label>Service</Label>
        <View style={styles.card}>
          <Field label="Service title" placeholder='e.g. "Drip Irrigation Installation"' value={title} onChangeText={setTitle} error={errors.title} maxLength={100} />
          <View style={styles.divider} />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textArea, !!errors.description && styles.inputError]}
              placeholder="What you offer, what's included, coverage area, delivery terms..."
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
            {SERVICE_CATEGORIES.map((cat) => (
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

        <Label>Pricing</Label>
        <View style={styles.card}>
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Starting price (R)</Text>
              <View style={[styles.inputWrapper, !!errors.price && styles.inputError]}>
                <Text style={styles.prefix}>R</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 450"
                  placeholderTextColor={C.textTertiary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. per hour, per hectare"
                  placeholderTextColor={C.textTertiary}
                  value={priceUnit}
                  onChangeText={setPriceUnit}
                />
              </View>
            </View>
          </View>
        </View>

        <Label>Location & Contact</Label>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Service area / location</Text>
            <View style={[styles.inputWrapper, !!errors.location && styles.inputError]}>
              <Feather name="map-pin" size={16} color={C.textSecondary} style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Pietermaritzburg, KZN"
                placeholderTextColor={C.textTertiary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone (optional)</Text>
            <View style={styles.inputWrapper}>
              <Feather name="phone" size={16} color={C.textSecondary} style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. +27 33 555 0101"
                placeholderTextColor={C.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <View style={[styles.fieldGroup, { marginTop: 10 }]}>
            <Text style={styles.fieldLabel}>WhatsApp (optional)</Text>
            <View style={styles.inputWrapper}>
              <Feather name="message-circle" size={16} color={C.textSecondary} style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. +27 82 555 0101"
                placeholderTextColor={C.textTertiary}
                value={whatsapp}
                onChangeText={setWhatsapp}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          {errors.contact && <Text style={[styles.errorText, { marginTop: 8 }]}>{errors.contact}</Text>}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.postBtn,
            { opacity: pressed || createService.isPending ? 0.85 : 1 },
          ]}
          onPress={handlePost}
          disabled={createService.isPending}
        >
          {createService.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="send" size={20} color="#fff" />
              <Text style={styles.postBtnText}>List Service</Text>
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
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 4 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: C.surfaceSecondary, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, minHeight: 46 },
  inputError: { borderColor: C.error },
  prefix: { paddingLeft: 14, fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.primary },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text },
  textArea: { backgroundColor: C.surfaceSecondary, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, minHeight: 110, lineHeight: 22 },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.error },
  divider: { height: 1, backgroundColor: C.borderLight, marginVertical: 14 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surfaceSecondary },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  chipTextActive: { color: "#fff" },
  rowFields: { flexDirection: "row", gap: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 14, backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border },
  postBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.accent, borderRadius: 14, padding: 16 },
  postBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
