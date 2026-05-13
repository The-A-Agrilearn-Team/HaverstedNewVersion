import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
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
import Colors from "@/constants/colors";
import { supabase, LearningModule } from "@/lib/supabase";
import {
  useMarkComplete,
  useToggleBookmark,
  useBookmarks,
  useLessonProgress,
  useMarkLessonComplete,
} from "@/hooks/useProgress";
import { useAuth } from "@/context/AuthContext";
import { askModuleAssistant } from "@/lib/aiSearch";
import { getModuleCourse, Lesson, LessonSection, QuizQuestion } from "@/constants/moduleContent";

const C = Colors.light;

const MOCK_MODULES: Record<string, LearningModule> = {
  "1": { id: "1", title: "Growing Tomatoes: Complete Guide", description: "Step-by-step guide to planting, watering, nurturing, and harvesting tomatoes in South African conditions.", category: "Crops", level: "beginner", duration_minutes: 45, language: "en", created_at: new Date().toISOString(), content: "" },
  "2": { id: "2", title: "Growing Spinach: Complete Guide", description: "How to plant, water, feed, and harvest spinach for a continuous supply throughout the year.", category: "Crops", level: "beginner", duration_minutes: 30, language: "en", created_at: new Date().toISOString(), content: "" },
  "3": { id: "3", title: "Growing Potatoes: Complete Guide", description: "Step-by-step instructions for planting, hilling, watering, and harvesting potatoes in South Africa.", category: "Crops", level: "beginner", duration_minutes: 50, language: "en", created_at: new Date().toISOString(), content: "" },
  "4": { id: "4", title: "Growing Carrots: Complete Guide", description: "Learn to plant, thin, water, and harvest carrots for crisp, sweet results.", category: "Crops", level: "beginner", duration_minutes: 40, language: "en", created_at: new Date().toISOString(), content: "" },
  "5": { id: "5", title: "Growing Onions: Complete Guide", description: "Complete instructions for raising, transplanting, watering, and curing onions in South Africa.", category: "Crops", level: "intermediate", duration_minutes: 55, language: "en", created_at: new Date().toISOString(), content: "" },
  "6": { id: "6", title: "Growing Butternut Squash: Complete Guide", description: "How to plant, train, water, and harvest butternut squash for excellent yield.", category: "Crops", level: "beginner", duration_minutes: 40, language: "en", created_at: new Date().toISOString(), content: "" },
  "7": { id: "7", title: "Growing Mangoes: Complete Guide", description: "From young tree establishment to first harvest — a complete mango guide for SA farmers.", category: "Crops", level: "intermediate", duration_minutes: 60, language: "en", created_at: new Date().toISOString(), content: "" },
  "8": { id: "8", title: "Growing Cabbage: Complete Guide", description: "Step-by-step guide to raising, transplanting, feeding, and harvesting quality cabbage heads.", category: "Crops", level: "beginner", duration_minutes: 42, language: "en", created_at: new Date().toISOString(), content: "" },
};

interface ChatMessage { role: "user" | "assistant"; text: string; }

function useSingleModule(id: string) {
  return useQuery({
    queryKey: ["module", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("learning_modules").select("*").eq("id", id).eq("is_active", true).single();
        if (!error && data) return data as LearningModule;
      } catch {}
      return MOCK_MODULES[id] ?? MOCK_MODULES["1"];
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}


function ContentBlock({ section }: { section: LessonSection }) {
  const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
    tip: { icon: "zap", color: "#D97706", bg: "#FFFBEB" },
    warning: { icon: "alert-triangle", color: "#DC2626", bg: "#FEF2F2" },
    highlight: { icon: "star", color: "#2D6A4F", bg: "#ECFDF5" },
  };
  switch (section.type) {
    case "heading":
      return <Text style={styles.sectionHeading}>{section.text}</Text>;
    case "paragraph":
      return <Text style={styles.sectionParagraph}>{section.text}</Text>;
    case "tip":
    case "warning":
    case "highlight": {
      const meta = iconMap[section.type];
      return (
        <View style={[styles.calloutBox, { backgroundColor: meta.bg, borderLeftColor: meta.color }]}>
          <Feather name={meta.icon as any} size={15} color={meta.color} style={{ marginTop: 2 }} />
          <Text style={[styles.calloutText, { color: meta.color === "#DC2626" ? "#7F1D1D" : meta.color === "#D97706" ? "#78350F" : "#166534" }]}>{section.text}</Text>
        </View>
      );
    }
    case "steps":
      return (
        <View style={styles.listContainer}>
          {(section.items ?? []).map((item, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case "bullets":
      return (
        <View style={styles.listContainer}>
          {(section.items ?? []).map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    default:
      return null;
  }
}

function QuizSection({
  questions,
  onAllCorrect,
}: {
  questions: QuizQuestion[];
  onAllCorrect: () => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers((prev) => { const n = [...prev]; n[qi] = oi; return n; });
  };

  const handleSubmit = () => {
    if (answers.some((a) => a === null)) return;
    setSubmitted(true);
    setShowResult(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const allCorrect = questions.every((q, i) => answers[i] === q.correct);
    if (allCorrect) {
      setTimeout(onAllCorrect, 600);
    }
  };

  const handleRetry = () => {
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(false);
    setShowResult(false);
  };

  const allAnswered = answers.every((a) => a !== null);
  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;
  const passed = score === questions.length;

  return (
    <View style={styles.quizContainer}>
      <View style={styles.quizHeader}>
        <Feather name="help-circle" size={18} color={C.primary} />
        <Text style={styles.quizTitle}>Knowledge Check</Text>
        <Text style={styles.quizSubtitle}>{questions.length} questions</Text>
      </View>

      {questions.map((q, qi) => {
        const selected = answers[qi];
        const isCorrect = selected === q.correct;
        return (
          <View key={qi} style={styles.questionBlock}>
            <Text style={styles.questionText}>{qi + 1}. {q.question}</Text>
            {q.options.map((opt, oi) => {
              let borderColor = C.border;
              let bg = C.surface;
              let textColor = C.text;
              if (submitted) {
                if (oi === q.correct) { borderColor = "#059669"; bg = "#ECFDF5"; textColor = "#166534"; }
                else if (oi === selected && !isCorrect) { borderColor = "#DC2626"; bg = "#FEF2F2"; textColor = "#7F1D1D"; }
              } else if (selected === oi) {
                borderColor = C.primary; bg = `${C.primary}10`;
              }
              return (
                <Pressable
                  key={oi}
                  style={[styles.optionRow, { borderColor, backgroundColor: bg }]}
                  onPress={() => handleSelect(qi, oi)}
                >
                  <View style={[styles.radioOuter, { borderColor }]}>
                    {selected === oi && <View style={[styles.radioInner, { backgroundColor: submitted ? (oi === q.correct ? "#059669" : "#DC2626") : C.primary }]} />}
                  </View>
                  <Text style={[styles.optionText, { color: textColor, flex: 1 }]}>{opt}</Text>
                  {submitted && oi === q.correct && <Feather name="check" size={16} color="#059669" />}
                  {submitted && oi === selected && !isCorrect && <Feather name="x" size={16} color="#DC2626" />}
                </Pressable>
              );
            })}
            {submitted && (
              <View style={styles.explanationBox}>
                <Feather name="info" size={13} color={C.textSecondary} />
                <Text style={styles.explanationText}>{q.explanation}</Text>
              </View>
            )}
          </View>
        );
      })}

      {showResult && (
        <View style={[styles.resultBanner, { backgroundColor: passed ? "#ECFDF5" : "#FEF2F2", borderColor: passed ? "#059669" : "#DC2626" }]}>
          <Feather name={passed ? "award" : "refresh-cw"} size={20} color={passed ? "#059669" : "#DC2626"} />
          <Text style={[styles.resultText, { color: passed ? "#166534" : "#7F1D1D" }]}>
            {passed ? `Perfect score! ${score}/${questions.length} — Lesson unlocked` : `${score}/${questions.length} correct — Review the lesson and try again`}
          </Text>
        </View>
      )}

      {!submitted ? (
        <Pressable
          style={[styles.submitBtn, !allAnswered && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered}
        >
          <Text style={styles.submitBtnText}>Submit Answers</Text>
        </Pressable>
      ) : !passed ? (
        <Pressable style={styles.retryBtn} onPress={handleRetry}>
          <Feather name="refresh-cw" size={15} color={C.primary} />
          <Text style={styles.retryBtnText}>Try Again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const role = profile?.role ?? "";
  const canAccess = user && (role === "farmer" || role === "admin");

  const { data: mod, isLoading } = useSingleModule(id ?? "1");
  const { data: bookmarkedIds = [] } = useBookmarks();
  const { data: lessonStore = {} } = useLessonProgress(id ?? "1");
  const toggleBookmark = useToggleBookmark();
  const markModuleComplete = useMarkComplete();
  const markLessonComplete = useMarkLessonComplete();

  const course = getModuleCourse(id ?? "1");
  const lessons = course?.lessons ?? [];
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const activeLesson: Lesson | undefined = lessons[activeLessonIndex];

  const [quizPassed, setQuizPassed] = useState<Record<string, boolean>>({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<ScrollView>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const lessonTabsRef = useRef<ScrollView>(null);

  const isBookmarked = mod ? bookmarkedIds.includes(mod.id) : false;

  const isLessonCompleted = (lessonId: string) => {
    return lessonStore[`${id}:${lessonId}`]?.completed ?? false;
  };

  const completedCount = lessons.filter((l) => isLessonCompleted(l.id)).length;
  const overallPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const allDone = completedCount === lessons.length && lessons.length > 0;

  useEffect(() => {
    const firstIncomplete = lessons.findIndex((l) => !isLessonCompleted(l.id));
    if (firstIncomplete >= 0) setActiveLessonIndex(firstIncomplete);
  }, [lessonStore]);

  const handleCompleteLesson = () => {
    if (!activeLesson || !user) return;
    const lessonId = activeLesson.id;
    const hasQuiz = (activeLesson.quiz?.length ?? 0) > 0;
    if (hasQuiz && !quizPassed[lessonId]) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markLessonComplete.mutate({ moduleId: id ?? "1", lessonId, totalLessons: lessons.length });
    if (completedCount + 1 >= lessons.length && mod) {
      markModuleComplete.mutate(mod.id);
    }
    const nextIdx = activeLessonIndex + 1;
    if (nextIdx < lessons.length) {
      setTimeout(() => {
        setActiveLessonIndex(nextIdx);
        contentScrollRef.current?.scrollTo({ y: 0, animated: true });
        lessonTabsRef.current?.scrollTo({ x: nextIdx * 100, animated: true });
      }, 400);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !mod) return;
    const question = aiQuestion.trim();
    setAiQuestion("");
    setAiLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChatHistory((prev) => [...prev, { role: "user", text: question }]);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    const context = activeLesson
      ? `Lesson: ${activeLesson.title}\n${activeLesson.sections.map(s => s.text ?? s.items?.join(", ") ?? "").join("\n")}`
      : mod.content ?? "";
    const answer = await askModuleAssistant(question, mod.title, context);
    setChatHistory((prev) => [...prev, { role: "assistant", text: answer }]);
    setAiLoading(false);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!user) {
    return (
      <View style={styles.gatePage}>
        <View style={styles.gateIcon}><Feather name="book-open" size={32} color="#2D6A4F" /></View>
        <Text style={styles.gateTitle}>Farmers Only</Text>
        <Text style={styles.gateBody}>You need to be registered as a farmer to view learning content.</Text>
        <Pressable style={styles.gatePrimaryBtn} onPress={() => router.push("/(auth)/register")}>
          <Feather name="user-plus" size={16} color="#fff" />
          <Text style={styles.gatePrimaryBtnText}>Register as a Farmer</Text>
        </Pressable>
        <Pressable style={styles.gateSecondaryBtn} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.gateSecondaryBtnText}>Already have an account? Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (!canAccess) {
    return (
      <View style={styles.gatePage}>
        <View style={styles.gateIcon}><Feather name="lock" size={32} color="#2D6A4F" /></View>
        <Text style={styles.gateTitle}>Access Restricted</Text>
        <Text style={styles.gateBody}>Learning modules are only available to farmers and admins.</Text>
        <Pressable style={styles.gatePrimaryBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color="#fff" />
          <Text style={styles.gatePrimaryBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading || !mod) {
    return <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  const levelColor = mod.level === "beginner" ? "#059669" : mod.level === "intermediate" ? "#D97706" : "#DB2777";
  const levelBg = mod.level === "beginner" ? "#D1FAE5" : mod.level === "intermediate" ? "#FEF3C7" : "#FCE7F3";
  const lessonAlreadyComplete = activeLesson ? isLessonCompleted(activeLesson.id) : false;
  const hasQuiz = (activeLesson?.quiz?.length ?? 0) > 0;
  const canComplete = lessonAlreadyComplete || (!hasQuiz || quizPassed[activeLesson?.id ?? ""]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={{ flex: 1 }}>
        <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
          <Pressable style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={C.text} />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navCatText}>{mod.category}</Text>
            <View style={[styles.levelPill, { backgroundColor: levelBg }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>{mod.level}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable style={({ pressed }) => [styles.navBtn, aiOpen && { backgroundColor: `${C.primary}18` }, { opacity: pressed ? 0.6 : 1 }]} onPress={() => { Haptics.selectionAsync(); setAiOpen((v) => !v); }}>
              <Feather name="message-circle" size={20} color={aiOpen ? C.primary : C.text} />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.navBtn, isBookmarked && { backgroundColor: `${C.primary}18` }, { opacity: pressed ? 0.6 : 1 }]} onPress={() => { if (!mod) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleBookmark.mutate({ moduleId: mod.id, isBookmarked }); }}>
              <Feather name="bookmark" size={22} color={isBookmarked ? C.primary : C.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.moduleHeader}>
          <Text style={styles.moduleTitle} numberOfLines={2}>{mod.title}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrackWide}>
              <View style={[styles.progressFillWide, { width: `${overallPct}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>{overallPct}% complete</Text>
          </View>
          {allDone && (
            <View style={styles.completedBanner}>
              <Feather name="award" size={14} color="#059669" />
              <Text style={styles.completedBannerText}>Module Complete!</Text>
            </View>
          )}
        </View>

        {lessons.length > 0 && (
          <ScrollView
            ref={lessonTabsRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lessonTabsRow}
            style={styles.lessonTabsScroll}
          >
            {lessons.map((lesson, idx) => {
              const done = isLessonCompleted(lesson.id);
              const active = idx === activeLessonIndex;
              return (
                <Pressable
                  key={lesson.id}
                  style={[
                    styles.lessonTab,
                    active && styles.lessonTabActive,
                    done && !active && styles.lessonTabDone,
                  ]}
                  onPress={() => {
                    setActiveLessonIndex(idx);
                    Haptics.selectionAsync();
                    contentScrollRef.current?.scrollTo({ y: 0, animated: false });
                  }}
                >
                  {done ? (
                    <Feather name="check-circle" size={14} color={active ? "#fff" : "#059669"} />
                  ) : (
                    <View style={[styles.lessonNum, active && styles.lessonNumActive]}>
                      <Text style={[styles.lessonNumText, active && { color: "#fff" }]}>{idx + 1}</Text>
                    </View>
                  )}
                  <Text style={[styles.lessonTabText, active && styles.lessonTabTextActive, done && !active && styles.lessonTabTextDone]} numberOfLines={2}>
                    {lesson.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <ScrollView
          ref={contentScrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        >
          {aiOpen && (
            <View style={styles.aiPanel}>
              <View style={styles.aiPanelHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="message-circle" size={16} color={C.primary} />
                  <Text style={styles.aiPanelTitle}>AI Learning Assistant</Text>
                </View>
                <Pressable onPress={() => setAiOpen(false)} hitSlop={8}>
                  <Feather name="x" size={18} color={C.textSecondary} />
                </Pressable>
              </View>
              {chatHistory.length === 0 ? (
                <View style={styles.aiEmptyState}>
                  <Text style={styles.aiEmptyText}>Ask anything about this lesson — I'll give you a practical answer.</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {["How do I get started?", "Give a practical example", "What's the most important tip?"].map((hint) => (
                      <Pressable key={hint} style={styles.aiChip} onPress={() => setAiQuestion(hint)}>
                        <Text style={styles.aiChipText}>{hint}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                <ScrollView ref={chatScrollRef} style={styles.chatScroll} showsVerticalScrollIndicator={false}>
                  {chatHistory.map((msg, i) => (
                    <View key={i} style={[styles.chatBubble, msg.role === "user" ? styles.chatBubbleUser : styles.chatBubbleAI]}>
                      {msg.role === "assistant" && <View style={styles.aiBubbleIcon}><Feather name="cpu" size={12} color={C.primary} /></View>}
                      <Text style={[styles.chatBubbleText, msg.role === "user" ? styles.chatBubbleTextUser : styles.chatBubbleTextAI]}>{msg.text}</Text>
                    </View>
                  ))}
                  {aiLoading && <View style={[styles.chatBubble, styles.chatBubbleAI]}><ActivityIndicator size="small" color={C.primary} /></View>}
                </ScrollView>
              )}
              <View style={styles.aiInputRow}>
                <TextInput
                  style={styles.aiInput}
                  placeholder="Ask about this lesson…"
                  placeholderTextColor={C.textTertiary}
                  value={aiQuestion}
                  onChangeText={setAiQuestion}
                  onSubmitEditing={handleAskAI}
                  returnKeyType="send"
                  editable={!aiLoading}
                />
                <Pressable style={[styles.aiSendBtn, (!aiQuestion.trim() || aiLoading) && styles.aiSendBtnDisabled]} onPress={handleAskAI} disabled={!aiQuestion.trim() || aiLoading}>
                  <Feather name="send" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>
          )}

          {activeLesson ? (
            <View>
              <View style={styles.lessonInfoBox}>
                <Text style={styles.lessonInfoTitle}>{activeLesson.title}</Text>
                <Text style={styles.lessonInfoDesc}>{activeLesson.description}</Text>
                <View style={styles.lessonDurationRow}>
                  <Feather name="clock" size={13} color={C.textSecondary} />
                  <Text style={styles.lessonDurationText}>{Math.ceil(activeLesson.duration_seconds / 60)} min read</Text>
                  {lessonAlreadyComplete && (
                    <View style={styles.donePill}>
                      <Feather name="check" size={11} color="#059669" />
                      <Text style={styles.donePillText}>Completed</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.contentArea}>
                {activeLesson.sections.map((section, i) => (
                  <ContentBlock key={i} section={section} />
                ))}
              </View>

              {activeLesson.quiz && activeLesson.quiz.length > 0 && !lessonAlreadyComplete && (
                <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
                  <QuizSection
                    questions={activeLesson.quiz}
                    onAllCorrect={() => {
                      setQuizPassed((prev) => ({ ...prev, [activeLesson.id]: true }));
                    }}
                  />
                </View>
              )}

              {lessonAlreadyComplete && (
                <View style={styles.alreadyDoneBox}>
                  <Feather name="check-circle" size={20} color="#059669" />
                  <Text style={styles.alreadyDoneText}>You've completed this lesson</Text>
                </View>
              )}

              {!aiOpen && (
                <Pressable style={styles.aiPromptBanner} onPress={() => { Haptics.selectionAsync(); setAiOpen(true); }}>
                  <Feather name="message-circle" size={16} color={C.primary} />
                  <Text style={styles.aiPromptText}>Have a question? Ask the AI assistant</Text>
                  <Feather name="chevron-right" size={15} color={C.primary} />
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <Feather name="book-open" size={40} color={C.textTertiary} />
              <Text style={{ fontSize: 16, fontFamily: "Inter_500Medium", color: C.textSecondary }}>No lessons available yet</Text>
            </View>
          )}
        </ScrollView>

        {activeLesson && !lessonAlreadyComplete && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            {hasQuiz && !quizPassed[activeLesson.id] ? (
              <View style={styles.footerHint}>
                <Feather name="lock" size={14} color={C.textSecondary} />
                <Text style={styles.footerHintText}>Complete the knowledge check above to unlock this lesson</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.completeBtn, !canComplete && styles.completeBtnDisabled]}
                onPress={handleCompleteLesson}
                disabled={!canComplete}
              >
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.completeBtnText}>
                  {activeLessonIndex + 1 < lessons.length ? "Complete Lesson & Continue" : "Complete Final Lesson"}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {allDone && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.moduleCompleteBadge}>
              <Feather name="award" size={18} color="#059669" />
              <Text style={styles.moduleCompleteBadgeText}>Module Complete! Well done</Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gatePage: { flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 32 },
  gateIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  gateTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 10, textAlign: "center" },
  gateBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 28 },
  gatePrimaryBtn: { backgroundColor: "#2D6A4F", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  gatePrimaryBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  gateSecondaryBtn: { paddingVertical: 8 },
  gateSecondaryBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.primary },

  navBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10, backgroundColor: C.background, borderBottomWidth: 1, borderBottomColor: C.border, justifyContent: "space-between" },
  navBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navCenter: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" },
  navCatText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  levelPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  moduleHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: C.background },
  moduleTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 10 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrackWide: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: "hidden" },
  progressFillWide: { height: 6, backgroundColor: C.primary, borderRadius: 3 },
  progressLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.primary, minWidth: 80, textAlign: "right" },
  completedBanner: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, backgroundColor: "#ECFDF5", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  completedBannerText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#059669" },

  lessonTabsScroll: { borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.background, maxHeight: 72 },
  lessonTabsRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: "center" },
  lessonTab: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, maxWidth: 160 },
  lessonTabActive: { backgroundColor: C.primary, borderColor: C.primary },
  lessonTabDone: { borderColor: "#059669", backgroundColor: "#ECFDF5" },
  lessonNum: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: C.textTertiary, alignItems: "center", justifyContent: "center" },
  lessonNumActive: { borderColor: "#fff" },
  lessonNumText: { fontSize: 11, fontFamily: "Inter_700Bold", color: C.textSecondary },
  lessonTabText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.textSecondary, flexShrink: 1 },
  lessonTabTextActive: { color: "#fff" },
  lessonTabTextDone: { color: "#059669" },

  lessonInfoBox: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  lessonInfoTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 4 },
  lessonInfoDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 20, marginBottom: 8 },
  lessonDurationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  lessonDurationText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  donePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  donePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#059669" },

  contentArea: { paddingHorizontal: 16, paddingTop: 16, gap: 6 },
  sectionHeading: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.text, marginTop: 16, marginBottom: 4 },
  sectionParagraph: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 22 },
  calloutBox: { flexDirection: "row", gap: 10, borderLeftWidth: 3, borderRadius: 8, padding: 12, alignItems: "flex-start" },
  calloutText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, flex: 1 },
  listContainer: { gap: 8, marginTop: 4 },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  stepNumText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginTop: 8, flexShrink: 0 },
  listItemText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 22, flex: 1 },

  quizContainer: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 16 },
  quizHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  quizTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.text, flex: 1 },
  quizSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  questionBlock: { gap: 8 },
  questionText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text, lineHeight: 20 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 10, padding: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  explanationBox: { flexDirection: "row", gap: 8, alignItems: "flex-start", backgroundColor: C.surfaceSecondary, borderRadius: 8, padding: 10 },
  explanationText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 18, flex: 1 },
  resultBanner: { flexDirection: "row", gap: 10, alignItems: "center", borderWidth: 1, borderRadius: 10, padding: 12 },
  resultText: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  submitBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  submitBtnDisabled: { backgroundColor: C.border },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  retryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: C.primary, borderRadius: 12, paddingVertical: 12 },
  retryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.primary },

  alreadyDoneBox: { flexDirection: "row", alignItems: "center", gap: 10, margin: 16, backgroundColor: "#ECFDF5", borderRadius: 12, padding: 14 },
  alreadyDoneText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#059669" },

  aiPanel: { margin: 16, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  aiPanelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  aiPanelTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text },
  aiEmptyState: { padding: 14 },
  aiEmptyText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 20 },
  aiChip: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: `${C.primary}12`, borderRadius: 8 },
  aiChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.primary },
  chatScroll: { maxHeight: 240, padding: 14 },
  chatBubble: { marginBottom: 10, maxWidth: "85%" },
  chatBubbleUser: { alignSelf: "flex-end", backgroundColor: C.primary, borderRadius: 14, padding: 10 },
  chatBubbleAI: { alignSelf: "flex-start", flexDirection: "row", gap: 8, alignItems: "flex-start" },
  aiBubbleIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: `${C.primary}15`, alignItems: "center", justifyContent: "center", marginTop: 2 },
  chatBubbleText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  chatBubbleTextUser: { color: "#fff" },
  chatBubbleTextAI: { color: C.text, flex: 1 },
  aiInputRow: { flexDirection: "row", gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: C.border },
  aiInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: C.text, backgroundColor: C.surfaceSecondary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  aiSendBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  aiSendBtnDisabled: { backgroundColor: C.border },

  aiPromptBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 16, padding: 12, backgroundColor: `${C.primary}0A`, borderRadius: 12, borderWidth: 1, borderColor: `${C.primary}25` },
  aiPromptText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: C.primary },

  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border, padding: 16 },
  completeBtn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  completeBtnDisabled: { backgroundColor: C.border },
  completeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  footerHint: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" },
  footerHintText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, flex: 1, textAlign: "center" },
  moduleCompleteBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#ECFDF5", borderRadius: 14, paddingVertical: 15 },
  moduleCompleteBadgeText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#059669" },
});
