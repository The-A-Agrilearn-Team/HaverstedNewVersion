import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";

const BG = "#F0F4F2";
const CARD = "#FFFFFF";
const GREEN = "#2D6A4F";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const MUTED = "#6B7280";
const INPUT_BG = "#FFFFFF";

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

function CardHeader({
  iconName,
  iconBg,
  iconColor,
  title,
  subtitle,
}: {
  iconName: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <>
      <View style={s.cardHeader}>
        <View style={[s.headerIcon, { backgroundColor: iconBg }]}>
          <Feather name={iconName as any} size={20} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{title}</Text>
          <Text style={s.cardSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={s.divider} />
    </>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={s.fieldLabel}>{label}</Text>;
}

function StyledInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
}) {
  return (
    <TextInput
      style={s.input}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={s.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.toggleLabel}>{label}</Text>
        <Text style={s.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: GREEN }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoCell}>
      <Text style={s.infoCellLabel}>{label}</Text>
      <Text style={s.infoCellValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [notifNewUsers, setNotifNewUsers] = useState(true);
  const [notifListings, setNotifListings] = useState(true);
  const [notifHealth, setNotifHealth] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Too short", "Password must be at least 8 characters.");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSavePreferences = () => {
    Alert.alert("Saved", "Notification preferences have been saved.");
  };

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.pageTitle}>Settings</Text>

      <SectionCard>
        <CardHeader
          iconName="lock"
          iconBg="#FFF7ED"
          iconColor="#F59E0B"
          title="Change Password"
          subtitle="Use a strong password with at least 8 characters."
        />

        <View style={s.cardBody}>
          <View style={s.fieldGroup}>
            <FieldLabel label="Current Password" />
            <StyledInput
              placeholder="Enter your current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>

          <View style={s.twoCol}>
            <View style={{ flex: 1 }}>
              <FieldLabel label="New Password" />
              <StyledInput
                placeholder="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel label="Confirm New Password" />
              <StyledInput
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.primaryBtn, changingPassword && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              <Text style={s.primaryBtnText}>
                {changingPassword ? "Updating…" : "Change Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <CardHeader
          iconName="bell"
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          title="Notification Preferences"
          subtitle="Control what alerts you receive."
        />

        <View style={s.cardBody}>
          <ToggleRow
            label="New user registrations"
            description="Get notified when a new user joins the platform"
            value={notifNewUsers}
            onValueChange={setNotifNewUsers}
          />
          <View style={s.toggleDivider} />
          <ToggleRow
            label="Listing reports"
            description="Alerts when a listing is flagged for review"
            value={notifListings}
            onValueChange={setNotifListings}
          />
          <View style={s.toggleDivider} />
          <ToggleRow
            label="System health alerts"
            description="Notifications about platform uptime and errors"
            value={notifHealth}
            onValueChange={setNotifHealth}
          />

          <View style={s.btnRow}>
            <TouchableOpacity style={s.outlineBtn} onPress={handleSavePreferences}>
              <Text style={s.outlineBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <View style={s.cardBody}>
          <Text style={s.platformTitle}>Platform Information</Text>
          <View style={s.infoGrid}>
            <InfoCell label="Platform" value="AgriLearn Admin" />
            <InfoCell label="Version" value="1.0.0" />
            <InfoCell label="Region" value="South Africa (ZAR)" />
            <InfoCell label="Supported Languages" value="6 languages" />
          </View>
        </View>
      </SectionCard>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: BG },
  content: { padding: 20, gap: 16 },
  pageTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: TEXT,
    marginBottom: 4,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: TEXT,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: MUTED,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
  },
  cardBody: {
    padding: 18,
    gap: 16,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: TEXT,
    marginBottom: 2,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: TEXT,
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  btnRow: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 10,
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  outlineBtn: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  outlineBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: TEXT,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: TEXT,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: BORDER,
  },
  platformTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: TEXT,
    marginBottom: 4,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoCell: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  infoCellLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },
  infoCellValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: TEXT,
  },
});
