import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { useCreateListing } from "@/hooks/useListings";

async function uploadPhoto(uri: string, userId: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = blob.type === "image/png" ? "png" : "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("listing-photos")
      .upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) return null;
    const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch {
    return null;
  }
}

const C = Colors.light;

const CATEGORIES = [
  { key: "Vegetables", icon: "layers" },
  { key: "Fruits",     icon: "sun" },
  { key: "Grains",     icon: "wind" },
  { key: "Livestock",  icon: "heart" },
  { key: "Poultry",    icon: "feather" },
  { key: "Dairy",      icon: "droplet" },
  { key: "Other",      icon: "package" },
];

const UNITS = ["kg", "litre", "dozen", "unit", "bag", "ton", "crate"];

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

export default function CreateListingScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const createListing = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Vegetables");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [checklist, setChecklist] = useState({
    noRot: false,
    clean: false,
    packed: false,
    noChemicals: false,
  });
  const [declared, setDeclared] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library to upload harvest photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      Haptics.selectionAsync();
    }
  };

  if (!user || (profile?.role !== "farmer" && profile?.role !== "admin")) {
    return (
      <View style={[styles.accessDenied, { paddingTop: insets.top + 60 }]}>
        <Feather name="lock" size={40} color={C.textTertiary} />
        <Text style={styles.accessTitle}>Farmers Only</Text>
        <Text style={styles.accessText}>
          Only registered farmers can list produce on the marketplace.
        </Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) e.title = "Title must be at least 3 characters";
    if (!description.trim() || description.trim().length < 10) e.description = "Description must be at least 10 characters";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = "Enter a valid price greater than 0";
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) e.quantity = "Enter a whole number greater than 0";
    if (!location.trim()) e.location = "Location is required";
    if (!checklist.noRot || !checklist.clean || !checklist.packed || !checklist.noChemicals)
      e.checklist = "You must confirm all quality checks before listing.";
    if (!declared)
      e.declaration = "You must accept the regulatory self-declaration before listing.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let imageUrl: string | undefined;
    if (photoUri && user) {
      setPhotoUploading(true);
      const uploaded = await uploadPhoto(photoUri, user.id);
      setPhotoUploading(false);
      if (uploaded) imageUrl = uploaded;
    }

    try {
      await createListing.mutateAsync({
        farmer_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        unit,
        location: location.trim(),
        status: "active",
        ...(imageUrl ? { image_url: imageUrl } : {}),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Listing Published!",
        `"${title.trim()}" is now live on the marketplace.`,
        [{ text: "View Marketplace", onPress: () => router.replace("/(tabs)/market") }]
      );
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Failed to publish", err?.message ?? "Please try again.");
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
        <Text style={styles.navTitle}>New Listing</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <Text style={styles.sectionLabel}>Product Details</Text>
        <View style={styles.card}>
          <Field
            label="Product Name"
            placeholder="e.g. Fresh Tomatoes, Grade A Maize"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            maxLength={100}
          />
          <View style={styles.fieldDivider} />
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe your product — freshness, farming method, pickup/delivery options..."
              placeholderTextColor={C.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <View style={styles.charCount}>
              <Text style={[styles.charCountText, description.length > 450 && { color: C.warning }]}>
                {description.length}/500
              </Text>
            </View>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.card}>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                style={({ pressed }) => [
                  styles.categoryChip,
                  category === cat.key && styles.categoryChipActive,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                onPress={() => {
                  setCategory(cat.key);
                  Haptics.selectionAsync();
                }}
              >
                <Feather
                  name={cat.icon as any}
                  size={16}
                  color={category === cat.key ? "#fff" : C.textSecondary}
                />
                <Text style={[
                  styles.categoryChipText,
                  category === cat.key && styles.categoryChipTextActive,
                ]}>
                  {cat.key}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Pricing & Quantity</Text>
        <View style={styles.card}>
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Price (R)</Text>
              <View style={[styles.inputWrapper, errors.price && styles.inputError]}>
                <Text style={styles.currencyPrefix}>R</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={C.textTertiary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <View style={[styles.inputWrapper, errors.quantity && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={C.textTertiary}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
              {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
            </View>
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Unit of Measure</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.unitRow}
            >
              {UNITS.map((u) => (
                <Pressable
                  key={u}
                  style={[styles.unitChip, unit === u && styles.unitChipActive]}
                  onPress={() => {
                    setUnit(u);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.priceSummary}>
            <Text style={styles.priceSummaryLabel}>Price per {unit}</Text>
            <Text style={styles.priceSummaryValue}>
              R{price ? parseFloat(price || "0").toFixed(2) : "0.00"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Farm / City Location</Text>
            <View style={[styles.inputWrapper, errors.location && styles.inputError]}>
              <Feather name="map-pin" size={16} color={C.textSecondary} style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Durban, KZN"
                placeholderTextColor={C.textTertiary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.fieldDivider} />

          <Text style={[styles.fieldLabel, { marginBottom: 10 }]}>Or select a province</Text>
          <View style={styles.provincesGrid}>
            {SA_PROVINCES.map((prov) => (
              <Pressable
                key={prov}
                style={({ pressed }) => [
                  styles.provinceChip,
                  location === prov && styles.provinceChipActive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  setLocation(prov);
                  setErrors((e) => ({ ...e, location: "" }));
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.provinceChipText,
                  location === prov && styles.provinceChipTextActive,
                ]}>
                  {prov}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Harvest Photos ── */}
        <Text style={styles.sectionLabel}>Harvest Photos <Text style={styles.optionalTag}>(Optional)</Text></Text>
        <View style={styles.card}>
          {photoUri ? (
            <View style={styles.photoPreviewBox}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
              <View style={styles.photoOverlay}>
                <Pressable
                  style={styles.removePhotoBtn}
                  onPress={() => { setPhotoUri(null); Haptics.selectionAsync(); }}
                >
                  <Feather name="x" size={16} color="#fff" />
                </Pressable>
              </View>
              <Pressable style={styles.changePhotoBtn} onPress={handlePickPhoto}>
                <Feather name="camera" size={14} color={C.primary} />
                <Text style={styles.changePhotoBtnText}>Change Photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.photoPickerEmpty} onPress={handlePickPhoto}>
              <View style={styles.photoPickerIcon}>
                <Feather name="camera" size={28} color={C.primary} />
              </View>
              <Text style={styles.photoPickerTitle}>Add Harvest Photo</Text>
              <Text style={styles.photoPickerSub}>
                Show buyers what your produce looks like. Tap to choose from your gallery.
              </Text>
            </Pressable>
          )}
        </View>

        {/* ── Quality Checklist ── */}
        <Text style={styles.sectionLabel}>Pre-Listing Quality Checklist</Text>
        <View style={styles.card}>
          <View style={styles.checklistHeader}>
            <Feather name="clipboard" size={16} color={C.primary} />
            <Text style={styles.checklistHeaderText}>
              Confirm each item below before publishing your listing.
            </Text>
          </View>
          <View style={styles.fieldDivider} />
          {[
            { key: "noRot",       label: "No visible rot or pest damage" },
            { key: "clean",       label: "Clean and free from foreign matter" },
            { key: "packed",      label: "Properly packed and labelled" },
            { key: "noChemicals", label: "No prohibited chemicals used" },
          ].map((item) => (
            <Pressable
              key={item.key}
              style={styles.checkRow}
              onPress={() => {
                setChecklist((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof checklist] }));
                Haptics.selectionAsync();
              }}
            >
              <View style={[styles.checkbox, checklist[item.key as keyof typeof checklist] && styles.checkboxChecked]}>
                {checklist[item.key as keyof typeof checklist] && (
                  <Feather name="check" size={13} color="#fff" />
                )}
              </View>
              <Text style={styles.checkLabel}>{item.label}</Text>
            </Pressable>
          ))}
          {errors.checklist ? (
            <View style={styles.checkError}>
              <Feather name="alert-circle" size={13} color={C.error} />
              <Text style={styles.checkErrorText}>{errors.checklist}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Regulatory Declaration ── */}
        <Text style={styles.sectionLabel}>Regulatory Self-Declaration</Text>
        <View style={[styles.card, styles.declarationCard]}>
          <View style={styles.checklistHeader}>
            <Feather name="shield" size={16} color="#7C3AED" />
            <Text style={[styles.checklistHeaderText, { color: "#5B21B6" }]}>
              Mandatory compliance confirmation required by South African law.
            </Text>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.actList}>
            <View style={styles.actRow}>
              <Feather name="book-open" size={13} color="#7C3AED" />
              <Text style={styles.actText}>Agricultural Product Standards Act, 1990</Text>
            </View>
            <View style={styles.actRow}>
              <Feather name="book-open" size={13} color="#7C3AED" />
              <Text style={styles.actText}>Foodstuffs, Cosmetics and Disinfectants Act, 1972</Text>
            </View>
          </View>
          <View style={styles.fieldDivider} />
          <Pressable
            style={styles.checkRow}
            onPress={() => {
              setDeclared((v) => !v);
              Haptics.selectionAsync();
            }}
          >
            <View style={[styles.checkbox, styles.checkboxPurple, declared && styles.checkboxPurpleChecked]}>
              {declared && <Feather name="check" size={13} color="#fff" />}
            </View>
            <Text style={styles.checkLabel}>
              I confirm that my products fully comply with the above Acts and that this declaration is true and accurate.
            </Text>
          </Pressable>
          {errors.declaration ? (
            <View style={styles.checkError}>
              <Feather name="alert-circle" size={13} color={C.error} />
              <Text style={styles.checkErrorText}>{errors.declaration}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={styles.previewContent}>
            <View style={styles.previewIconBox}>
              <Feather
                name={(CATEGORIES.find((c) => c.key === category)?.icon ?? "package") as any}
                size={24}
                color={C.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle}>{title || "Product name"}</Text>
              <Text style={styles.previewMeta}>
                {location || "Location"} · {profile?.full_name ?? "You"}
              </Text>
            </View>
            <Text style={styles.previewPrice}>
              R{price ? parseFloat(price).toFixed(2) : "—"}
              {"\n"}
              <Text style={styles.previewUnit}>per {unit}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            { opacity: pressed || createListing.isPending ? 0.85 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={createListing.isPending || photoUploading}
        >
          {photoUploading ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.submitBtnText}>Uploading photo…</Text>
            </>
          ) : createListing.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="upload" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Publish Listing</Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, placeholder, value, onChangeText, error, maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  maxLength?: number;
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
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  accessDenied: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  accessTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  accessText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  backBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  backBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.background,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.text },
  scrollContent: { padding: 20, gap: 8 },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 0,
    marginBottom: 4,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    minHeight: 46,
  },
  inputError: { borderColor: C.error },
  currencyPrefix: {
    paddingLeft: 14,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: C.primary,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.text,
  },
  textArea: {
    backgroundColor: C.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.text,
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: { alignItems: "flex-end" },
  charCountText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textTertiary },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.error },
  fieldDivider: { height: 1, backgroundColor: C.borderLight, marginVertical: 14 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surfaceSecondary,
  },
  categoryChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  categoryChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  categoryChipTextActive: { color: "#fff" },
  rowFields: { flexDirection: "row", gap: 12 },
  unitRow: { gap: 8, paddingVertical: 2 },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surfaceSecondary,
  },
  unitChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  unitChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  unitChipTextActive: { color: "#fff" },
  priceSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: `${C.primary}08`,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  priceSummaryLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  priceSummaryValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.primary },
  provincesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  provinceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surfaceSecondary,
  },
  provinceChipActive: { backgroundColor: `${C.primary}14`, borderColor: C.primary },
  provinceChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary },
  provinceChipTextActive: { color: C.primary },
  previewCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.primary,
    padding: 16,
    marginTop: 8,
    gap: 10,
  },
  previewLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  previewContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${C.primary}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  previewTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  previewMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  previewPrice: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.primary, textAlign: "right" },
  previewUnit: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: C.background,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 16,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },

  optionalTag: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textTertiary, textTransform: "none" },
  photoPickerEmpty: {
    alignItems: "center", justifyContent: "center", gap: 10,
    borderWidth: 2, borderColor: C.border, borderStyle: "dashed",
    borderRadius: 14, paddingVertical: 32, paddingHorizontal: 16,
    backgroundColor: C.surfaceSecondary,
  },
  photoPickerIcon: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: `${C.primary}12`, alignItems: "center", justifyContent: "center",
  },
  photoPickerTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  photoPickerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 19 },
  photoPreviewBox: { borderRadius: 12, overflow: "hidden", position: "relative" },
  photoPreview: { width: "100%", height: 200, borderRadius: 12 },
  photoOverlay: { position: "absolute", top: 8, right: 8 },
  removePhotoBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center",
  },
  changePhotoBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 10, paddingVertical: 8, borderRadius: 10,
    backgroundColor: `${C.primary}10`, borderWidth: 1, borderColor: `${C.primary}20`,
  },
  changePhotoBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.primary },

  checklistHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  checklistHeaderText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary, lineHeight: 19 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: C.border, backgroundColor: C.surfaceSecondary,
    alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: C.primary, borderColor: C.primary },
  checkboxPurple: { borderColor: "#7C3AED" },
  checkboxPurpleChecked: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  checkLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 21 },
  checkError: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, backgroundColor: `${C.error}10`, borderRadius: 8, padding: 10 },
  checkErrorText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.error, flex: 1 },
  declarationCard: { borderColor: "#DDD6FE", backgroundColor: "#FAFAF8" },
  actList: { gap: 10 },
  actRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  actText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: "#5B21B6", lineHeight: 19 },
});
