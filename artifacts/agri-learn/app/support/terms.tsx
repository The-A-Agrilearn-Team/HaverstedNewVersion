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
    title: "1. Acceptance of Terms",
    body: "By registering for or using AgriLearn you agree to be bound by these Terms of Service (\u201cTerms\u201d). If you do not agree, please do not use the platform. These Terms are governed by the laws of the Republic of South Africa.",
  },
  {
    title: "2. Eligibility",
    body: "You must be at least 18 years old to register. By creating an account you confirm that the information you provide is accurate and that you have the legal capacity to enter into binding agreements under South African law.",
  },
  {
    title: "3. Account Responsibilities",
    body: "You are responsible for:\n\n• Keeping your password confidential and not sharing your account.\n• All activity that occurs under your account.\n• Notifying us immediately at [support@yourdomain.com] if you suspect unauthorised access.\n\nWe reserve the right to suspend or terminate accounts that violate these Terms.",
  },
  {
    title: "4. Acceptable Use",
    body: "You agree not to:\n\n• Post false, misleading, or fraudulent listings or information.\n• Harass, intimidate, or harm other users.\n• Upload or transmit malicious code or attempt to disrupt the platform.\n• Use the platform for any unlawful purpose under South African law.\n• Impersonate another person or entity.\n• Scrape, reproduce, or redistribute content without written permission.",
  },
  {
    title: "5. Learning Content",
    body: "All learning modules and materials on AgriLearn are provided for informational and educational purposes only. They do not constitute professional agricultural, financial, or legal advice. Always consult a qualified professional before acting on information obtained through the platform. Content is made available free of charge and may be updated or removed at any time.",
  },
  {
    title: "6. Marketplace Listings",
    body: "6.1 Farmers and approved users may create produce listings. By submitting a listing you confirm that:\n\n• You are the lawful owner of or authorised to sell the listed goods.\n• The listing is accurate and not misleading.\n• The goods comply with all applicable South African agricultural regulations.\n\n6.2 AgriLearn acts as a platform only and is not a party to any transaction between users. We do not guarantee the quality, safety, or legality of goods listed.\n\n6.3 All prices must be quoted in South African Rand (ZAR). AgriLearn does not process payments between users.\n\n6.4 We reserve the right to remove any listing at our discretion.",
  },
  {
    title: "7. Intellectual Property",
    body: "All content, trademarks, logos, and software on AgriLearn are owned by or licensed to AgriLearn (Pty) Ltd. You may not copy, modify, distribute, or create derivative works without our prior written consent. You retain ownership of content you upload but grant us a non-exclusive, royalty-free licence to display it on the platform for the purpose of providing our services.",
  },
  {
    title: "8. Privacy",
    body: "Your use of AgriLearn is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please read the Privacy Policy carefully before using the platform.",
  },
  {
    title: "9. Disclaimers",
    body: "AgriLearn is provided on an 'as is' and 'as available' basis. To the fullest extent permitted by South African law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the platform will be uninterrupted or error-free.",
  },
  {
    title: "10. Limitation of Liability",
    body: "To the extent permitted by the Consumer Protection Act 68 of 2008 and other applicable South African legislation, AgriLearn will not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including loss of income, loss of data, or loss of produce.",
  },
  {
    title: "11. Termination",
    body: "We may suspend or terminate your access at any time for breach of these Terms, prolonged inactivity, or at our discretion with reasonable notice. You may close your account at any time by contacting [support@yourdomain.com]. Clauses relating to intellectual property, disclaimers, and limitation of liability survive termination.",
  },
  {
    title: "12. Changes to Terms",
    body: "We may update these Terms from time to time. Material changes will be communicated via in-app notification or email at least 7 days before taking effect. Continued use after that date constitutes acceptance.",
  },
  {
    title: "13. Governing Law & Disputes",
    body: "These Terms are governed by the laws of the Republic of South Africa. Any dispute that cannot be resolved amicably shall be subject to the jurisdiction of the Gauteng Division of the High Court of South Africa, or the relevant Magistrate's Court depending on the value of the claim.",
  },
  {
    title: "14. Contact",
    body: "AgriLearn (Pty) Ltd\nEmail: [legal@yourdomain.com]\nPostal address: PO Box 12345, Pretoria, 0001, South Africa",
  },
];

export default function TermsScreen() {
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
        <Text style={styles.title}>Terms of Service</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.heroBox}>
        <View style={styles.heroIcon}>
          <Feather name="file-text" size={28} color={C.primary} />
        </View>
        <Text style={styles.heroTitle}>Terms of Service</Text>
        <Text style={styles.heroSub}>
          Please read these terms carefully before using AgriLearn.
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
            Questions about these Terms? Contact{" "}
            <Text style={styles.footerEmail}>[legal@yourdomain.com]</Text>
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
