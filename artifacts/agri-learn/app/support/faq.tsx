import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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

const FAQS = [
  {
    section: "Getting Started",
    items: [
      {
        q: "What is AgriLearn?",
        a: "AgriLearn is a South African agricultural learning platform that helps farmers, buyers, and retailers access learning modules, trade produce, and connect with one another. It is available in all 11 official South African languages.",
      },
      {
        q: "How do I create an account?",
        a: "Tap 'Create Account' on the Profile tab, choose your role (Farmer, Buyer, or Retailer), fill in your details, agree to the Terms of Service, and submit. You will receive a confirmation email before your account is fully activated.",
      },
      {
        q: "Which roles are available?",
        a: "Farmer — post and manage produce listings, access all learning modules.\nBuyer — browse and enquire about listings, access the marketplace.\nRetailer — browse listings and access learning content.\nAdmin — manage the platform (by invitation only).",
      },
    ],
  },
  {
    section: "Learning Modules",
    items: [
      {
        q: "How do I access learning modules?",
        a: "Tap the Learn tab at the bottom of the screen. You can browse by category, filter by difficulty level, or search for a specific topic. Tap any module to begin.",
      },
      {
        q: "Are modules available offline?",
        a: "Offline access is coming soon. Modules you have started will be cached on your device so you can continue reading even with a poor connection.",
      },
      {
        q: "Are the modules free?",
        a: "Yes — all learning content on AgriLearn is free for registered users.",
      },
    ],
  },
  {
    section: "Marketplace",
    items: [
      {
        q: "How do I list my produce?",
        a: "You must be registered as a Farmer. Go to Profile → Marketplace → Create New Listing, fill in the details (title, category, price in Rands, quantity, unit, and location), then submit for review. Listings are published once approved.",
      },
      {
        q: "How does pricing work?",
        a: "All prices are in South African Rand (ZAR). You set your own price per unit. Buyers contact you directly to negotiate or arrange delivery.",
      },
      {
        q: "What categories can I list under?",
        a: "Grains & Cereals, Fruits, Vegetables, Dairy, Livestock, Poultry, Herbs & Spices, and Other.",
      },
    ],
  },
  {
    section: "Account & Privacy",
    items: [
      {
        q: "How do I update my profile?",
        a: "Go to Profile → Personal Information. You can change your name, South African phone number, province, and preferred language.",
      },
      {
        q: "How do I change my password?",
        a: "On the Login screen tap 'Forgot Password'. Enter your email address and we will send you a reset link.",
      },
      {
        q: "Who can see my information?",
        a: "Your name and location are visible to other logged-in users on listings you post. Your email address and phone number are never shown publicly. See the Privacy Policy for full details.",
      },
      {
        q: "How do I delete my account?",
        a: "To request account deletion and removal of your personal data as required by POPIA, please contact us at [privacy@yourdomain.com]. We will process your request within 15 business days.",
      },
    ],
  },
  {
    section: "Technical",
    items: [
      {
        q: "The app is not loading. What should I do?",
        a: "Check your internet connection. If the problem persists, force-close the app and reopen it. You can also try signing out and back in.",
      },
      {
        q: "Which languages are supported?",
        a: "AgriLearn supports all 11 official South African languages: English, isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, Xitsonga, Sepedi, Tshivenda, isiNdebele, and siSwati.",
      },
    ],
  },
];

export default function FaqScreen() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

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
        <Text style={styles.title}>Help & FAQ</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.heroBox}>
        <Feather name="help-circle" size={32} color={C.primary} />
        <Text style={styles.heroTitle}>How can we help?</Text>
        <Text style={styles.heroSub}>
          Find answers to common questions about AgriLearn below.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {FAQS.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.section}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => {
                const key = `${section.section}-${idx}`;
                const isOpen = open[key];
                return (
                  <Pressable
                    key={key}
                    onPress={() => toggle(key)}
                    style={[
                      styles.faqRow,
                      idx < section.items.length - 1 && styles.faqRowBorder,
                    ]}
                  >
                    <View style={styles.faqTop}>
                      <Text style={styles.question}>{item.q}</Text>
                      <Feather
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={C.textSecondary}
                      />
                    </View>
                    {isOpen && (
                      <Text style={styles.answer}>{item.a}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.contactBox}>
          <Feather name="mail" size={20} color={C.primary} />
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Email us at{" "}
            <Text style={styles.contactEmail}>[support@yourdomain.com]</Text>
            {"\n"}We respond within 2 business days.
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
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  faqRow: { padding: 16 },
  faqRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  faqTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  question: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: C.text,
    flex: 1,
    lineHeight: 21,
  },
  answer: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    lineHeight: 21,
    marginTop: 10,
  },
  contactBox: {
    alignItems: "center",
    backgroundColor: `${C.primary}0D`,
    borderRadius: 16,
    padding: 24,
    gap: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${C.primary}20`,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  contactEmail: {
    color: C.primary,
    fontFamily: "Inter_600SemiBold",
  },
});
