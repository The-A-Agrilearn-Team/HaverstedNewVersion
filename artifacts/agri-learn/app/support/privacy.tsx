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
import Colors from "../../constants/colors";

const C = Colors.light;

const SECTIONS = [
  {
    title: "1. Introduction",
    body: "AgriLearn (Pty) Ltd (\u201cwe\u201d, \u201cour\u201d, \u201cus\u201d) is committed to protecting your personal information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and all applicable South African data-protection legislation. This Privacy Policy explains what information we collect, how we use it, and your rights as a data subject.",
  },
  {
    title: "2. Information We Collect",
    body: "We collect and process the following personal information:\n\n• Registration data: full name, email address, role (farmer / buyer / retailer), and optionally your South African phone number, province, and language preference.\n• Usage data: modules accessed, progress completed, listings viewed and created.\n• Device data: device type, operating system, and app version for technical support purposes.\n\nWe do not collect sensitive personal information (as defined by POPIA) without your explicit, informed consent.",
  },
  {
    title: "3. Purpose of Processing",
    body: "Your personal information is processed only for the following specific, explicit, and legitimate purposes:\n\n• Creating and maintaining your account.\n• Delivering learning modules and tracking your progress.\n• Enabling marketplace listings and facilitating communication between users.\n• Improving and securing the platform.\n• Complying with legal obligations.\n\nWe will not process your information for any purpose incompatible with those listed above.",
  },
  {
    title: "4. Lawful Basis for Processing",
    body: "We process your personal information on the following grounds:\n\n• Consent — you agreed to this Privacy Policy when registering.\n• Contract — processing is necessary to provide the services you requested.\n• Legal obligation — where required by South African law.\n• Legitimate interest — to protect the security and integrity of the platform.",
  },
  {
    title: "5. Sharing of Information",
    body: "We do not sell your personal information. We may share it with:\n\n• Service providers who process data on our behalf (e.g. cloud hosting, email delivery) under binding data-processing agreements.\n• Regulatory or law-enforcement authorities where required by law.\n• Other users only to the extent necessary: your display name and province may be visible on listings you post. Your email and phone number are never shown publicly.",
  },
  {
    title: "6. Data Retention",
    body: "We retain your personal information for as long as your account is active or as needed to provide services. Inactive accounts are deleted after 24 months of inactivity. On request, we will delete your data within 15 business days, subject to legal retention requirements.",
  },
  {
    title: "7. Security",
    body: "We implement appropriate technical and organisational measures to safeguard your personal information against unauthorised access, loss, alteration, or disclosure. These include encrypted communications (HTTPS/TLS), row-level security on our database, and restricted access controls. No system is completely secure; in the event of a data breach we will notify affected users and the Information Regulator as required by POPIA.",
  },
  {
    title: "8. Your Rights as a Data Subject",
    body: "Under POPIA you have the right to:\n\n• Access — request a copy of the personal information we hold about you.\n• Correction — request correction of inaccurate or incomplete information.\n• Deletion — request that your personal information be deleted.\n• Objection — object to the processing of your information.\n• Complaint — lodge a complaint with the Information Regulator of South Africa.\n\nTo exercise any of these rights, contact our Information Officer at [privacy@yourdomain.com].",
  },
  {
    title: "9. Information Regulator",
    body: "If you believe your privacy rights have been violated, you may contact the Information Regulator (South Africa):\n\nWebsite: www.inforegulator.org.za\nEmail: inforeg@justice.gov.za\nTel: 012 406 4818",
  },
  {
    title: "10. Cookies & Tracking",
    body: "The web version of AgriLearn may use session cookies strictly necessary for authentication. We do not use tracking or advertising cookies. No third-party analytics that collect personal information are embedded in the app.",
  },
  {
    title: "11. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be notified via in-app notification or email at least 7 days before they take effect. Continued use of AgriLearn after that date constitutes acceptance of the updated policy.",
  },
  {
    title: "12. Contact Us",
    body: "Information Officer\nAgriLearn (Pty) Ltd\nEmail: [privacy@yourdomain.com]\nPostal address: PO Box 12345, Pretoria, 0001, South Africa",
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.heroBox}>
        <View style={styles.heroIcon}>
          <Feather name="shield" size={28} color={C.primary} />
        </View>
        <Text style={styles.heroTitle}>Your Privacy Matters</Text>
        <Text style={styles.heroSub}>
          This policy is compliant with the Protection of Personal Information Act (POPIA) of South Africa.
        </Text>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>Effective date: 1 January 2025</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.card}>
          {SECTIONS.map((s, idx) => (
            <View
              key={s.title}
              style={[styles.policySection, idx < SECTIONS.length - 1 && styles.policySectionBorder]}
            >
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Text style={styles.sectionBody}>{s.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerBox}>
          <Feather name="mail" size={16} color={C.primary} />
          <Text style={styles.footerText}>
            Questions? Contact us at{" "}
            <Text style={styles.footerEmail}>[privacy@yourdomain.com]</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  heroBox: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${C.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: C.text,
    marginTop: 4,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  dateBox: {
    backgroundColor: `${C.primary}10`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: C.primary,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    marginBottom: 16,
  },
  policySection: { padding: 16 },
  policySectionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    lineHeight: 22,
  },
  footerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${C.primary}0D`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${C.primary}20`,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    flex: 1,
  },
  footerEmail: {
    color: C.primary,
    fontFamily: "Inter_600SemiBold",
  },
});
